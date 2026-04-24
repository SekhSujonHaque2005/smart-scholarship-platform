const prisma = require('../lib/prisma');

exports.depositFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    // We expect the provider profile to exist
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.userId } });
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (!prisma.transaction) {
      return res.status(200).json({
        message: 'DEPOSIT_SUCCESS_MOCKED',
        data: { amount, status: 'COMPLETED', type: 'DEPOSIT' }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        providerId: provider.id,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'COMPLETED',
        reference: `MOCK_STRIPE_${Date.now()}`
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.userId } });
    if (!provider) return res.status(404).json({ message: 'Provider not found '});

    if (!prisma.transaction) {
      return res.status(200).json({ transactions: [], balance: 0 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' }
    });

    const balance = transactions.reduce((sum, t) => {
      if (t.status === 'COMPLETED') {
        if (t.type === 'DEPOSIT') return sum + t.amount;
        if (t.type === 'DISBURSEMENT') return sum - t.amount;
      }
      return sum;
    }, 0);

    res.status(200).json({ transactions, balance });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
