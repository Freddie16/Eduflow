const Attendance = require('../models/Attendance');
const User = require('../models/User');

/**
 * @desc   Get attendance records (filterable by classId, date, studentId)
 * @route  GET /api/attendance
 * @access Private
 */
exports.getAttendance = async (req, res) => {
  try {
    const filter = { schoolId: req.schoolId };

    if (req.query.classId)   filter.classId   = req.query.classId;
    if (req.query.date)      filter.date       = req.query.date;
    if (req.query.studentId) filter.studentId  = req.query.studentId;

    // Students only ever see their own attendance
    if (req.user.role === 'student') {
      filter.studentId = req.user._id;
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'firstName lastName')
      .populate('classId',   'name')
      .populate('markedBy',  'firstName lastName')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Save (upsert) attendance for an entire class in one shot
 * @route  POST /api/attendance/bulk
 * @access Principal, Deputy, Teacher
 */
exports.saveBulkAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'classId, date, and a non-empty records[] array are required.',
      });
    }

    // Build MongoDB bulkWrite upsert operations
    const operations = records.map(({ studentId, status }) => ({
      updateOne: {
        filter: { schoolId: req.schoolId, classId, studentId, date },
        update: {
          $set: {
            schoolId: req.schoolId,
            classId,
            studentId,
            date,
            status,
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    // Return the saved records for the given class + date
    const saved = await Attendance.find({ schoolId: req.schoolId, classId, date })
      .populate('studentId', 'firstName lastName')
      .populate('markedBy',  'firstName lastName');

    res.json({ success: true, count: saved.length, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc   Get attendance summary per student for a class
 * @route  GET /api/attendance/summary/:classId
 * @access Private
 */
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await User.find({
      schoolId: req.schoolId,
      role: 'student',
      assignedClass: classId,
      isActive: true,
    }).select('_id firstName lastName');

    const summary = await Promise.all(
      students.map(async (student) => {
        const [total, present, absent, late] = await Promise.all([
          Attendance.countDocuments({ schoolId: req.schoolId, studentId: student._id }),
          Attendance.countDocuments({ schoolId: req.schoolId, studentId: student._id, status: 'present' }),
          Attendance.countDocuments({ schoolId: req.schoolId, studentId: student._id, status: 'absent' }),
          Attendance.countDocuments({ schoolId: req.schoolId, studentId: student._id, status: 'late' }),
        ]);

        return {
          student: {
            id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
          },
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      })
    );

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
