const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
  },
  content: {
    videoUrl: { type: String },
    body: { type: String, required: true },
  },
  updates: [{
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  }],
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

lessonSchema.index({ schoolId: 1 });
lessonSchema.index({ classId: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
