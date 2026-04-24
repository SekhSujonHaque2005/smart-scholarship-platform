const prisma = require('../lib/prisma');

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      // Even if already exists, return success to prevent email enumeration or just tell them
      return res.status(200).json({ success: true, message: 'Already subscribed!' });
    }

    // Save to database
    await prisma.newsletterSubscriber.create({
      data: {
        email,
      },
    });

    res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  subscribeNewsletter,
};
