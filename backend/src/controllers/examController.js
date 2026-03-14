const { Exam, ExamResult } = require('../models/Exam');

// ─── Exams ────────────────────────────────────────────────────────────────────

/**
 * @desc   Get all exams for the school (optional ?classId filter)
 * @route  GET /api/exams
 * @access Private
 */
exports.getAllExams = async (req, res) => {
  try {
    const filter = { schoolId: req.schoolId };
    if (req.query.classId) filter.classId = req.query.classId;

    const exams = await Exam.find(filter)
      .populate('classId', 'name grade')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 });

    res.json({ success: true, count: exams.length, data: exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Schedule a new exam
 * @route  POST /api/exams
 * @access Principal, Deputy, Teacher
 */
exports.createExam = async (req, res) => {
  try {
    const { classId, subject, date, startTime, duration, location } = req.body;

    if (!classId || !subject || !date || !startTime || !duration || !location) {
      return res.status(400).json({
        success: false,
        message: 'classId, subject, date, startTime, duration, and location are all required.',
      });
    }

    const exam = await Exam.create({
      schoolId: req.schoolId,
      classId,
      subject,
      date,
      startTime,
      duration,
      location,
      createdBy: req.user._id,
    });

    const populated = await Exam.findById(exam._id)
      .populate('classId', 'name grade')
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete an exam
 * @route  DELETE /api/exams/:id
 * @access Principal, Deputy, Teacher
 */
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    res.json({ success: true, message: `Exam "${exam.subject}" deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Exam Results ─────────────────────────────────────────────────────────────

/**
 * @desc   Get exam results (students see only their own)
 * @route  GET /api/exams/results
 * @access Private
 */
exports.getAllResults = async (req, res) => {
  try {
    // Restrict to exam IDs that belong to this school
    const schoolExams = await Exam.find({ schoolId: req.schoolId }).select('_id');
    const examIds = schoolExams.map((e) => e._id);

    const filter = { examId: { $in: examIds } };
    if (req.query.examId) filter.examId = req.query.examId;
    if (req.query.studentId) filter.studentId = req.query.studentId;

    // Students can only see their own results
    if (req.user.role === 'student') {
      filter.studentId = req.user._id;
    }

    const results = await ExamResult.find(filter)
      .populate('examId', 'subject date classId')
      .populate('studentId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Post an exam result for a student
 * @route  POST /api/exams/results
 * @access Principal, Deputy, Teacher
 */
exports.createResult = async (req, res) => {
  try {
    const { examId, studentId, score, totalMarks, grade, remarks } = req.body;

    if (!examId || !studentId || score === undefined || !grade) {
      return res.status(400).json({
        success: false,
        message: 'examId, studentId, score, and grade are required.',
      });
    }

    // Ensure the exam belongs to this school
    const exam = await Exam.findOne({ _id: examId, schoolId: req.schoolId });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found in this school.' });
    }

    const result = await ExamResult.create({
      examId,
      studentId,
      score,
      totalMarks: totalMarks || 100,
      grade,
      remarks,
    });

    const populated = await ExamResult.findById(result._id)
      .populate('examId', 'subject date')
      .populate('studentId', 'firstName lastName');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update an existing exam result
 * @route  PUT /api/exams/results/:id
 * @access Principal, Deputy, Teacher
 */
exports.updateResult = async (req, res) => {
  try {
    const result = await ExamResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('examId', 'subject date')
      .populate('studentId', 'firstName lastName');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
