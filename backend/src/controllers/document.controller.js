const prisma = require('../lib/prisma');
const cloudinary = require('../lib/cloudinary');

// UPLOAD DOCUMENT (PDF, image, etc.)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let { docType, applicationId, documentType } = req.body;
    const { userId, role } = req.user;

    // Support both naming conventions
    if (!docType && documentType) {
      docType = documentType;
    }

    if (!docType) {
      return res.status(400).json({ message: 'docType is required' });
    }

    let ownerId = null;
    let ownerField = null;

    // Robust profile lookup
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, provider: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User record not found' });
    }

    if (user.role === 'STUDENT') {
      if (!user.student) {
        console.error('Upload Error: Student profile missing for user', user.id);
        return res.status(401).json({ message: 'Profile mismatch: Student record not found for this account.' });
      }
      ownerId = user.student.id;
      ownerField = 'studentId';
    } else if (user.role === 'PROVIDER') {
      if (!user.provider) {
        console.error('Upload Error: Provider profile missing for user', user.id);
        return res.status(401).json({ message: 'Profile mismatch: Provider record not found for this account.' });
      }
      ownerId = user.provider.id;
      ownerField = 'providerId';
    } else {
      console.error('Upload Error: Unauthorized role', user.role);
      return res.status(403).json({ message: `Access Denied: ${user.role} role cannot access the vault.` });
    }

    const document = await prisma.document.create({
      data: {
        [ownerField]: ownerId,
        appId: applicationId || null,
        docType: docType,
        fileUrl: req.file.path,
        publicId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileHash: req.file.filename,
      },
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Upload document error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET ALL DOCUMENTS FOR CURRENT USER
const getMyDocuments = async (req, res) => {
  try {
    const { documentType } = req.query;
    const { userId, role } = req.user;

    let documents = [];

    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId } });
      if (student) {
        documents = await prisma.document.findMany({
          where: {
            studentId: student.id,
            ...(documentType ? { docType: documentType } : {}),
          },
          orderBy: { uploadedAt: 'desc' },
        });
      }
    } else if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      if (provider) {
        documents = await prisma.document.findMany({
          where: {
            providerId: provider.id,
            ...(documentType ? { docType: documentType } : {}),
          },
          orderBy: { uploadedAt: 'desc' },
        });
      }
    }

    res.status(200).json({ documents });
  } catch (error) {
    console.error('Get documents error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE DOCUMENT
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    let isOwner = false;
    if (role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId } });
      isOwner = document.studentId === student?.id;
    } else if (role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId } });
      isOwner = document.providerId === provider?.id;
    }

    if (!isOwner) return res.status(403).json({ message: 'Not authorized' });

    // Delete from Cloudinary (Attempt only, don't crash on failure)
    if (document.publicId) {
      try {
        await cloudinary.uploader.destroy(document.publicId);
      } catch (cloudinaryError) {
        console.warn('Cloudinary cleanup failed:', cloudinaryError.message);
      }
    }

    await prisma.document.delete({ where: { id } });
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// UPLOAD / UPDATE AVATAR  
const uploadAvatarController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = req.file.path;

    // Remove old avatar from Cloudinary if it exists on the user
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (user?.profilePicture) {
      try {
        // Extract public_id from old URL
        const parts = user.profilePicture.split('/');
        const nameWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const oldPublicId = `scholarhub/avatars/${nameWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (_) { /* ignore */ }
    }

    // Store Cloudinary URL in User model
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { profilePicture: avatarUrl },
    });

    res.status(200).json({ message: 'Avatar uploaded successfully', avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { uploadDocument, getMyDocuments, deleteDocument, uploadAvatarController };
