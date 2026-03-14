const User = require('../models/User');
const Class = require('../models/Class');

/**
 * @desc   Get all users for the current school (optional role filter via ?role=)
 * @route  GET /api/users
 * @access Principal, Deputy, Teacher
 */
exports.getAllUsers = async (req, res) => {
  try {
    const filter = { schoolId: req.schoolId };
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter)
      .select('-password')
      .populate('assignedClass', 'name grade')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all students in the school
 * @route  GET /api/users/students
 * @access Principal, Deputy, Teacher
 */
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ schoolId: req.schoolId, role: 'student' })
      .select('-password')
      .populate('assignedClass', 'name grade')
      .populate('parentId', 'firstName lastName email')
      .sort({ lastName: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get all teachers in the school
 * @route  GET /api/users/teachers
 * @access Principal, Deputy
 */
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      schoolId: req.schoolId,
      role: { $in: ['teacher', 'deputy'] },
    })
      .select('-password')
      .populate('assignedClass', 'name grade')
      .sort({ lastName: 1 });

    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get a single user by ID (must belong to same school)
 * @route  GET /api/users/:id
 * @access Private
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, schoolId: req.schoolId })
      .select('-password')
      .populate('assignedClass', 'name grade')
      .populate('parentId', 'firstName lastName email')
      .populate('studentIds', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Create a new user (student, teacher, parent, etc.)
 * @route  POST /api/users
 * @access Principal, Deputy
 */
exports.createUser = async (req, res) => {
  try {
    const {
      role, email, password, firstName, lastName,
      isClassTeacher, assignedClass, parentId,
    } = req.body;

    const newUser = await User.create({
      schoolId: req.schoolId,
      role,
      email,
      password: password || 'EduFlow@123', // default password if none provided
      firstName,
      lastName,
      isClassTeacher: isClassTeacher || false,
      assignedClass: assignedClass || null,
      parentId: parentId || null,
    });

    // If student, link to parent's studentIds array
    if (role === 'student' && parentId) {
      await User.findByIdAndUpdate(parentId, {
        $addToSet: { studentIds: newUser._id },
      });
    }

    // If class teacher, update the class record
    if (isClassTeacher && assignedClass) {
      await Class.findByIdAndUpdate(assignedClass, { teacherId: newUser._id });
    }

    const populated = await User.findById(newUser._id)
      .select('-password')
      .populate('assignedClass', 'name grade');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists in this school.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Update a user's profile fields
 * @route  PUT /api/users/:id
 * @access Principal, Deputy (or the user themselves for profile updates)
 */
exports.updateUser = async (req, res) => {
  try {
    // Strip sensitive / immutable fields from body
    const { password, schoolId, role, ...updates } = req.body;

    // Only principal/deputy can update others; any user can update themselves
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = ['principal', 'deputy'].includes(req.user.role);

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Deactivate a user (soft delete)
 * @route  DELETE /api/users/:id
 * @access Principal
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `User ${user.firstName} ${user.lastName} has been deactivated.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
