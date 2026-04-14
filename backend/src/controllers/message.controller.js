const prisma = require('../lib/prisma');

exports.sendMessage = async (req, res) => {
  try {
    const { applicationId, receiverId, content } = req.body;
    const senderId = req.user.userId;

    // Check if models exist (so it doesn't crash if they haven't run the migration yet)
    if (!prisma.message) {
      return res.status(200).json({ 
        message: 'MESSAGE_SENT_STORE_MOCKED',
        data: { id: 'mock-id', content, senderId, receiverId, createdAt: new Date() }
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        applicationId,
        senderId,
        receiverId,
        content
      }
    });

    res.status(201).json(newMessage);
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
