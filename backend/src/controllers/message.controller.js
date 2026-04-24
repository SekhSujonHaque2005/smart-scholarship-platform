const prisma = require('../lib/prisma');

exports.sendMessage = async (req, res) => {
  try {
    const { applicationId, receiverId, content } = req.body;
    const senderId = req.user.userId;

    // Validate required fields
    if (!applicationId || !content) {
      return res.status(400).json({ message: 'applicationId and content are required.' });
    }

    // If receiverId is missing, look it up from the application's student
    let resolvedReceiverId = receiverId;
    if (!resolvedReceiverId) {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { student: { select: { userId: true } } }
      });
      if (application?.student?.userId) {
        resolvedReceiverId = application.student.userId;
      } else {
        return res.status(400).json({ message: 'Could not determine recipient.' });
      }
    }

    // Check if Message model exists
    if (!prisma.message) {
      return res.status(200).json({ 
        message: { id: 'mock-id', content, senderId, receiverId: resolvedReceiverId, createdAt: new Date() }
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: resolvedReceiverId } },
        application: { connect: { id: applicationId } },
      }
    });

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!prisma.message) {
      return res.status(200).json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, email: true, role: true } },
        receiver: { select: { id: true } }
      }
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
