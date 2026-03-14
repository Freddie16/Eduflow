const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

examSchema.index({ schoolId: 1 });

const examResultSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: { type: Number, required: true },
  totalMarks: { type: Number, required: true, default: 100 },
  grade: { type: String, required: true },
  remarks: { type: String },
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
const ExamResult = mongoose.model('ExamResult', examResultSchema);

module.exports = { Exam, ExamResult };
