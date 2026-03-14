const FeeRecord = require('../models/FeeRecord');

/**
 * @desc   Get fee records (role-scoped: students/parents see only their own)
 * @route  GET /api/finance
 * @access Private
 */
exports.getFeeRecords = async (req, res) => {
  try {
    const filter = { schoolId: req.schoolId };

    if (req.user.role === 'student') {
      filter.studentId = req.user._id;
    }

    if (req.user.role === 'parent') {
      filter.studentId = { $in: req.user.studentIds || [] };
    }

    const fees = await FeeRecord.find(filter)
      .populate('studentId', 'firstName lastName assignedClass')
      .sort({ createdAt: -1 });

    // Aggregate summary stats for principal / deputy
    let summary = null;
    if (['principal', 'deputy'].includes(req.user.role)) {
      const allFees = await FeeRecord.find({ schoolId: req.schoolId });
      const totalExpected  = allFees.reduce((s, f) => s + f.totalAmount,  0);
      const totalCollected = allFees.reduce((s, f) => s + f.paidAmount,   0);
      summary = {
        totalExpected,
        totalCollected,
        outstanding:  totalExpected - totalCollected,
        paidCount:    allFees.filter((f) => f.status === 'paid').length,
        partialCount: allFees.filter((f) => f.status === 'partial').length,
        unpaidCount:  allFees.filter((f) => f.status === 'unpaid').length,
      };
    }

    res.json({ success: true, count: fees.length, data: fees, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new fee record for a student
 * @route  POST /api/finance
 * @access Principal, Deputy
 */
exports.createFeeRecord = async (req, res) => {
  try {
    const { studentId, totalAmount, paidAmount, term, academicYear } = req.body;

    if (!studentId || !totalAmount) {
      return res.status(400).json({ success: false, message: 'studentId and totalAmount are required.' });
    }

    const paid = paidAmount || 0;
    const status = paid >= totalAmount ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const fee = await FeeRecord.create({
      schoolId: req.schoolId,
      studentId,
      totalAmount,
      paidAmount: paid,
      lastPaymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : undefined,
      status,
      term,
      academicYear,
    });

    const populated = await FeeRecord.findById(fee._id)
      .populate('studentId', 'firstName lastName');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Record a payment against an existing fee record
 * @route  PATCH /api/finance/:id/payment
 * @access Principal, Deputy
 */
exports.recordPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'A positive payment amount is required.' });
    }

    const fee = await FeeRecord.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found.' });
    }

    // Prevent overpayment
    fee.paidAmount = Math.min(fee.paidAmount + amount, fee.totalAmount);
    fee.lastPaymentDate = new Date().toISOString().split('T')[0];
    fee.status = fee.paidAmount >= fee.totalAmount ? 'paid' : 'partial';

    await fee.save();

    const populated = await FeeRecord.findById(fee._id)
      .populate('studentId', 'firstName lastName');

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a fee record
 * @route  DELETE /api/finance/:id
 * @access Principal
 */
exports.deleteFeeRecord = async (req, res) => {
  try {
    const fee = await FeeRecord.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found.' });
    }
    res.json({ success: true, message: 'Fee record deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
