const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
  },
  grade: {
    type: String,
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

classSchema.index({ schoolId: 1 });

module.exports = mongoose.model('Class', classSchema);
