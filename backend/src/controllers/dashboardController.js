const User = require('../models/User');
const Class = require('../models/Class');
const Lesson = require('../models/Lesson');
const { Exam, ExamResult } = require('../models/Exam');
const Attendance = require('../models/Attendance');
const FeeRecord = require('../models/FeeRecord');

/**
 * @desc   Return role-specific dashboard statistics
 * @route  GET /api/dashboard
 * @access Private
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];

    let stats = {};

    // ── Principal / Deputy ───────────────────────────────────────────────────
    if (user.role === 'principal' || user.role === 'deputy') {
      const [studentCount, teacherCount, classCount, lessonCount] = await Promise.all([
        User.countDocuments({ schoolId, role: 'student', isActive: true }),
        User.countDocuments({ schoolId, role: { $in: ['teacher', 'deputy'] }, isActive: true }),
        Class.countDocuments({ schoolId }),
        Lesson.countDocuments({ schoolId }),
      ]);

      const allFees = await FeeRecord.find({ schoolId });
      const totalRevenue  = allFees.reduce((s, f) => s + f.paidAmount,  0);
      const totalExpected = allFees.reduce((s, f) => s + f.totalAmount, 0);

      const todayAttendance = await Attendance.find({ schoolId, date: today });
      const presentToday = todayAttendance.filter((a) => a.status === 'present').length;
      const attendanceRate =
        todayAttendance.length > 0
          ? Math.round((presentToday / todayAttendance.length) * 100)
          : null;

      stats = {
        studentCount,
        teacherCount,
        classCount,
        lessonCount,
        totalRevenue,
        totalExpected,
        attendanceRate,
      };
    }

    // ── Teacher ──────────────────────────────────────────────────────────────
    else if (user.role === 'teacher') {
      const myLessons = await Lesson.countDocuments({ schoolId, teacherId: user._id });

      let studentCount = 0;
      if (user.isClassTeacher && user.assignedClass) {
        studentCount = await User.countDocuments({
          schoolId,
          role: 'student',
          assignedClass: user.assignedClass,
          isActive: true,
        });
      }

      const myExams = await Exam.find({ schoolId, createdBy: user._id }).select('_id');
      const myExamIds = myExams.map((e) => e._id);
      const results = await ExamResult.find({ examId: { $in: myExamIds } });
      const avgPerformance =
        results.length > 0
          ? Math.round(
              results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / results.length
            )
          : null;

      stats = { myLessons, studentCount, avgPerformance };
    }

    // ── Student ──────────────────────────────────────────────────────────────
    else if (user.role === 'student') {
      const lessonsInClass = await Lesson.find({
        schoolId,
        classId: user.assignedClass,
      }).select('_id completedBy');

      const totalLessons = lessonsInClass.length;
      const completedLessons = lessonsInClass.filter((l) =>
        l.completedBy.some((id) => id.toString() === user._id.toString())
      ).length;

      const upcomingExams = await Exam.countDocuments({
        schoolId,
        classId: user.assignedClass,
        date: { $gte: today },
      });

      const myResults = await ExamResult.find({ studentId: user._id });
      const gpa =
        myResults.length > 0
          ? (
              myResults.reduce((s, r) => s + (r.score / r.totalMarks) * 4, 0) /
              myResults.length
            ).toFixed(1)
          : null;

      stats = { totalLessons, completedLessons, upcomingExams, gpa };
    }

    // ── Parent ───────────────────────────────────────────────────────────────
    else if (user.role === 'parent') {
      const childIds = user.studentIds || [];
      const fees = await FeeRecord.find({ schoolId, studentId: { $in: childIds } });
      const totalOwed = fees.reduce((s, f) => s + (f.totalAmount - f.paidAmount), 0);

      stats = { childCount: childIds.length, totalOwed };
    }

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
