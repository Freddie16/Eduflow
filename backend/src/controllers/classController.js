const Class = require('../models/Class');
const User = require('../models/User');

/**
 * @desc   Get all classes for the current school (with student counts)
 * @route  GET /api/classes
 * @access Private
 */
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find({ schoolId: req.schoolId })
      .populate('teacherId', 'firstName lastName email')
      .sort({ grade: 1, name: 1 });

    // Attach live student count to each class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await User.countDocuments({
          schoolId: req.schoolId,
          role: 'student',
          assignedClass: cls._id,
          isActive: true,
        });
        return { ...cls.toObject(), studentCount };
      })
    );

    res.json({ success: true, count: classesWithCount.length, data: classesWithCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new class
 * @route  POST /api/classes
 * @access Principal, Deputy
 */
exports.createClass = async (req, res) => {
  try {
    const { name, grade, teacherId } = req.body;

    const cls = await Class.create({
      schoolId: req.schoolId,
      name,
      grade,
      teacherId: teacherId || null,
    });

    // Mark the assigned teacher as a class teacher
    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, {
        isClassTeacher: true,
        assignedClass: cls._id,
      });
    }

    const populated = await Class.findById(cls._id)
      .populate('teacherId', 'firstName lastName email');

    res.status(201).json({ success: true, data: { ...populated.toObject(), studentCount: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a class (name, grade, or class teacher)
 * @route  PUT /api/classes/:id
 * @access Principal, Deputy, Teacher
 */
exports.updateClass = async (req, res) => {
  try {
    const { name, grade, teacherId } = req.body;

    // If changing the teacher, un-mark the old teacher and mark the new one
    const existing = await Class.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    if (teacherId && existing.teacherId?.toString() !== teacherId) {
      // Remove class teacher flag from previous teacher
      if (existing.teacherId) {
        await User.findByIdAndUpdate(existing.teacherId, {
          isClassTeacher: false,
          assignedClass: null,
        });
      }
      // Assign new class teacher
      await User.findByIdAndUpdate(teacherId, {
        isClassTeacher: true,
        assignedClass: existing._id,
      });
    }

    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      { name, grade, teacherId: teacherId || null },
      { new: true, runValidators: true }
    ).populate('teacherId', 'firstName lastName email');

    const studentCount = await User.countDocuments({
      schoolId: req.schoolId,
      role: 'student',
      assignedClass: cls._id,
      isActive: true,
    });

    res.json({ success: true, data: { ...cls.toObject(), studentCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Delete a class
 * @route  DELETE /api/classes/:id
 * @access Principal
 */
exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    // Clear teacher's class assignment
    if (cls.teacherId) {
      await User.findByIdAndUpdate(cls.teacherId, {
        isClassTeacher: false,
        assignedClass: null,
      });
    }

    res.json({ success: true, message: `Class "${cls.name}" deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all students enrolled in a specific class
 * @route  GET /api/classes/:id/students
 * @access Private
 */
exports.getClassStudents = async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    const students = await User.find({
      schoolId: req.schoolId,
      role: 'student',
      assignedClass: req.params.id,
      isActive: true,
    }).select('-password').sort({ lastName: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
