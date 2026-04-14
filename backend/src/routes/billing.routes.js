const express = require('express');
const router = express.Router();
const { depositFunds, getTransactions } = require('../controllers/billing.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/deposit', authenticate, authorize('PROVIDER'), depositFunds);
router.get('/transactions', authenticate, authorize('PROVIDER'), getTransactions);

module.exports = router;
