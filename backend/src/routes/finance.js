const express = require('express');
const {
  getFeeRecords,
  createFeeRecord,
  recordPayment,
  deleteFeeRecord,
} = require('../controllers/financeController');
const { protect, authorize, scopeToSchool } = require('../middleware/auth');

const router = express.Router();

router.use(protect, scopeToSchool);

router.route('/')
  .get(getFeeRecords)
  .post(authorize('principal', 'deputy'), createFeeRecord);

router.patch('/:id/payment', authorize('principal', 'deputy'), recordPayment);
router.delete('/:id',        authorize('principal'),           deleteFeeRecord);

module.exports = router;
