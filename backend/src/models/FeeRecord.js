const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  lastPaymentDate: {
    type: String,
  },
  status: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid',
  },
  term: {
    type: String,
  },
  academicYear: {
    type: String,
  },
}, { timestamps: true });

feeRecordSchema.index({ schoolId: 1 });
feeRecordSchema.index({ studentId: 1 });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);
