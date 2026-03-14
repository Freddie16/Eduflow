const Lesson = require('../models/Lesson');

/**
 * @desc   Get all lessons (scoped to school, filtered by role)
 * @route  GET /api/lessons
 * @access Private
 */
exports.getAllLessons = async (req, res) => {
  try {
    const filter = { schoolId: req.schoolId };

    // Subject teachers only see lessons they created
    if (req.user.role === 'teacher' && !req.user.isClassTeacher) {
      filter.teacherId = req.user._id;
    }

    // Students only see lessons for their enrolled class
    if (req.user.role === 'student' && req.user.assignedClass) {
      filter.classId = req.user.assignedClass;
    }

    // Optional query filter by class
    if (req.query.classId) filter.classId = req.query.classId;

    const lessons = await Lesson.find(filter)
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name grade')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: lessons.length, data: lessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get a single lesson by ID
 * @route  GET /api/lessons/:id
 * @access Private
 */
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ _id: req.params.id, schoolId: req.schoolId })
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name grade');

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    res.json({ success: true, data: lesson });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new lesson
 * @route  POST /api/lessons
 * @access Principal, Deputy, Teacher
 */
exports.createLesson = async (req, res) => {
  try {
    const { classId, title, content } = req.body;

    if (!classId || !title || !content?.body) {
      return res.status(400).json({
        success: false,
        message: 'classId, title, and content.body are required.',
      });
    }

    const lesson = await Lesson.create({
      schoolId: req.schoolId,
      teacherId: req.user._id,
      classId,
      title,
      content,
      updates: [{ timestamp: new Date(), note: 'Lesson created.' }],
    });

    const populated = await Lesson.findById(lesson._id)
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name grade');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a lesson (only the creator, principal, or deputy)
 * @route  PUT /api/lessons/:id
 * @access Principal, Deputy, Teacher (owner only)
 */
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    // Ownership check: teachers can only edit their own lessons
    const isOwner = lesson.teacherId.toString() === req.user._id.toString();
    const isAdmin = ['principal', 'deputy'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this lesson.',
      });
    }

    const { title, content, updateNote } = req.body;

    if (title) lesson.title = title;
    if (content) lesson.content = content;
    if (updateNote) {
      lesson.updates.push({ timestamp: new Date(), note: updateNote });
    }

    await lesson.save();

    const populated = await Lesson.findById(lesson._id)
      .populate('teacherId', 'firstName lastName')
      .populate('classId', 'name grade');

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Toggle lesson completion for the logged-in student
 * @route  PATCH /api/lessons/:id/complete
 * @access Student
 */
exports.toggleComplete = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    const userId = req.user._id;
    const alreadyCompleted = lesson.completedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyCompleted) {
      lesson.completedBy = lesson.completedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      lesson.completedBy.push(userId);
    }

    await lesson.save();

    res.json({
      success: true,
      completed: !alreadyCompleted,
      data: lesson,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a lesson
 * @route  DELETE /api/lessons/:id
 * @access Principal, Deputy, Teacher (owner only)
 */
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    const isOwner = lesson.teacherId.toString() === req.user._id.toString();
    const isAdmin = ['principal', 'deputy'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lesson.' });
    }

    await lesson.deleteOne();

    res.json({ success: true, message: 'Lesson deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
