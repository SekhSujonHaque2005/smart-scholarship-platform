const prisma = require('../lib/prisma');
const cloudinary = require('../lib/cloudinary');

// UPLOAD DOCUMENT (PDF, image, etc.)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, applicationId } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: 'documentType is required' });
    }

    // Find student record for the authenticated user
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const document = await prisma.document.create({
      data: {
        studentId: student.id,
        appId: applicationId || null,
        docType: documentType,
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

    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const documents = await prisma.document.findMany({
      where: {
        studentId: student.id,
        ...(documentType ? { docType: documentType } : {}),
      },
      orderBy: { uploadedAt: 'desc' },
    });

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

    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (document.studentId !== student?.id) return res.status(403).json({ message: 'Not authorized' });

    // Delete from Cloudinary
    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId, { resource_type: 'auto' });
    }

    await prisma.document.delete({ where: { id } });
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
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
