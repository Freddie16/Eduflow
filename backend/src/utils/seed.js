require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const School = require('../models/School');
const User = require('../models/User');
const Class = require('../models/Class');
const Lesson = require('../models/Lesson');
const { Exam, ExamResult } = require('../models/Exam');
const Attendance = require('../models/Attendance');
const FeeRecord = require('../models/FeeRecord');
const Reminder = require('../models/Reminder');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflow';

async function seed() {
  try {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe
    await Promise.all([
      School.deleteMany({}),
      User.deleteMany({}),
      Class.deleteMany({}),
      Lesson.deleteMany({}),
      Exam.deleteMany({}),
      ExamResult.deleteMany({}),
      Attendance.deleteMany({}),
      FeeRecord.deleteMany({}),
      Reminder.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Schools ──────────────────────────────────────────────────────────────
    const nairobiAcademy = await School.create({
      name: 'Nairobi Academy',
      subdomain: 'nairobi-academy',
      settings: { currency: 'KES', timeZone: 'Africa/Nairobi' },
      subscriptionStatus: 'active',
    });

    const greenwood = await School.create({
      name: 'Greenwood International',
      subdomain: 'greenwood',
      settings: { currency: 'USD', timeZone: 'America/New_York' },
      subscriptionStatus: 'active',
    });
    console.log('🏫 Created schools');

    // ── Classes ───────────────────────────────────────────────────────────────
    const grade10A = await Class.create({ schoolId: nairobiAcademy._id, name: 'Grade 10A', grade: '10' });
    const grade9B  = await Class.create({ schoolId: nairobiAcademy._id, name: 'Grade 9B',  grade: '9'  });
    const grade11A = await Class.create({ schoolId: nairobiAcademy._id, name: 'Grade 11A', grade: '11' });
    console.log('📚 Created classes');

    // ── Users ─────────────────────────────────────────────────────────────────
    const principal = await User.create({
      schoolId: nairobiAcademy._id, role: 'principal',
      email: 'principal@nairobi.edu', password: 'password123',
      firstName: 'James', lastName: 'Mwangi',
    });

    const deputy = await User.create({
      schoolId: nairobiAcademy._id, role: 'deputy',
      email: 'deputy@nairobi.edu', password: 'password123',
      firstName: 'Grace', lastName: 'Njoroge',
    });

    const teacher = await User.create({
      schoolId: nairobiAcademy._id, role: 'teacher',
      email: 'teacher@nairobi.edu', password: 'password123',
      firstName: 'Sarah', lastName: 'Otieno',
      isClassTeacher: true, assignedClass: grade10A._id,
    });

    const teacher2 = await User.create({
      schoolId: nairobiAcademy._id, role: 'teacher',
      email: 'mr.kimani@nairobi.edu', password: 'password123',
      firstName: 'David', lastName: 'Kimani',
      isClassTeacher: true, assignedClass: grade9B._id,
    });

    await Class.findByIdAndUpdate(grade10A._id, { teacherId: teacher._id });
    await Class.findByIdAndUpdate(grade9B._id,  { teacherId: teacher2._id });

    const parent = await User.create({
      schoolId: nairobiAcademy._id, role: 'parent',
      email: 'parent@nairobi.edu', password: 'password123',
      firstName: 'Peter', lastName: 'Kamau',
    });

    const student1 = await User.create({
      schoolId: nairobiAcademy._id, role: 'student',
      email: 'student@nairobi.edu', password: 'password123',
      firstName: 'Kevin', lastName: 'Kamau',
      parentId: parent._id, assignedClass: grade10A._id,
    });

    const student2 = await User.create({
      schoolId: nairobiAcademy._id, role: 'student',
      email: 'alice@nairobi.edu', password: 'password123',
      firstName: 'Alice', lastName: 'Wanjiku',
      parentId: parent._id, assignedClass: grade10A._id,
    });

    const student3 = await User.create({
      schoolId: nairobiAcademy._id, role: 'student',
      email: 'john@nairobi.edu', password: 'password123',
      firstName: 'John', lastName: 'Doe',
      parentId: parent._id, assignedClass: grade9B._id,
    });

    await User.findByIdAndUpdate(parent._id, {
      studentIds: [student1._id, student2._id, student3._id],
    });
    console.log('👥 Created users');

    // ── Lessons ───────────────────────────────────────────────────────────────
    const lesson1 = await Lesson.create({
      schoolId: nairobiAcademy._id, teacherId: teacher._id, classId: grade10A._id,
      title: 'Introduction to Calculus',
      content: { body: 'Calculus is the mathematical study of continuous change. In this lesson we explore limits, derivatives, and the fundamental theorem.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      updates: [{ timestamp: new Date(), note: 'Initial lesson created' }],
      completedBy: [student1._id],
    });

    await Lesson.create({
      schoolId: nairobiAcademy._id, teacherId: teacher._id, classId: grade10A._id,
      title: 'Trigonometry Basics',
      content: { body: 'In this lesson we cover the sine, cosine, and tangent functions and their applications in right triangles.' },
      updates: [{ timestamp: new Date(), note: 'Added diagram resources' }],
    });

    await Lesson.create({
      schoolId: nairobiAcademy._id, teacherId: teacher2._id, classId: grade9B._id,
      title: 'Introduction to Algebra',
      content: { body: 'Algebra is the branch of mathematics dealing with symbols and the rules for manipulating those symbols.' },
      updates: [{ timestamp: new Date(), note: 'Lesson created' }],
    });
    console.log('📖 Created lessons');

    // ── Exams ──────────────────────────────────────────────────────────────────
    const exam1 = await Exam.create({
      schoolId: nairobiAcademy._id, classId: grade10A._id,
      subject: 'Mathematics', date: '2026-04-15',
      startTime: '09:00', duration: '2h', location: 'Main Hall',
      createdBy: teacher._id,
    });

    const exam2 = await Exam.create({
      schoolId: nairobiAcademy._id, classId: grade10A._id,
      subject: 'English Literature', date: '2026-04-17',
      startTime: '10:30', duration: '1.5h', location: 'Room 204',
      createdBy: teacher._id,
    });

    await ExamResult.create({ examId: exam1._id, studentId: student1._id, score: 85, totalMarks: 100, grade: 'A', remarks: 'Excellent performance.' });
    await ExamResult.create({ examId: exam1._id, studentId: student2._id, score: 72, totalMarks: 100, grade: 'B', remarks: 'Good understanding.' });
    await ExamResult.create({ examId: exam2._id, studentId: student1._id, score: 91, totalMarks: 100, grade: 'A', remarks: 'Outstanding.' });
    await ExamResult.create({ examId: exam2._id, studentId: student3._id, score: 45, totalMarks: 100, grade: 'D', remarks: 'Needs improvement.' });
    console.log('📝 Created exams & results');

    // ── Attendance ─────────────────────────────────────────────────────────────
    const dates = ['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13'];
    for (const date of dates) {
      await Attendance.create({ schoolId: nairobiAcademy._id, classId: grade10A._id, studentId: student1._id, date, status: 'present', markedBy: teacher._id });
      await Attendance.create({ schoolId: nairobiAcademy._id, classId: grade10A._id, studentId: student2._id, date, status: date === '2026-03-12' ? 'absent' : 'present', markedBy: teacher._id });
      await Attendance.create({ schoolId: nairobiAcademy._id, classId: grade9B._id,  studentId: student3._id, date, status: date === '2026-03-11' ? 'late' : 'present', markedBy: teacher2._id });
    }
    console.log('📅 Created attendance');

    // ── Fees ───────────────────────────────────────────────────────────────────
    await FeeRecord.create({ schoolId: nairobiAcademy._id, studentId: student1._id, totalAmount: 45000, paidAmount: 30000, lastPaymentDate: '2026-02-15', status: 'partial', term: 'Term 1', academicYear: '2026' });
    await FeeRecord.create({ schoolId: nairobiAcademy._id, studentId: student2._id, totalAmount: 45000, paidAmount: 45000, lastPaymentDate: '2026-01-10', status: 'paid',    term: 'Term 1', academicYear: '2026' });
    await FeeRecord.create({ schoolId: nairobiAcademy._id, studentId: student3._id, totalAmount: 45000, paidAmount: 0,     status: 'unpaid', term: 'Term 1', academicYear: '2026' });
    console.log('💰 Created fee records');

    // ── Reminders ──────────────────────────────────────────────────────────────
    await Reminder.create({ userId: student1._id, schoolId: nairobiAcademy._id, title: 'Math Exam Reminder', description: "Don't forget your calculator!", date: new Date(), isRead: false, type: 'exam' });
    await Reminder.create({ userId: student1._id, schoolId: nairobiAcademy._id, title: 'Fee Balance Due', description: 'Outstanding balance of KES 15,000.', date: new Date(), isRead: false, type: 'fee' });
    await Reminder.create({ userId: student2._id, schoolId: nairobiAcademy._id, title: 'English Exam Tomorrow', description: 'Prepare your essay notes.', date: new Date(), isRead: false, type: 'exam' });
    console.log('🔔 Created reminders');

    // ── Greenwood demo principal ───────────────────────────────────────────────
    await User.create({
      schoolId: greenwood._id, role: 'principal',
      email: 'principal@greenwood.edu', password: 'password123',
      firstName: 'Jane', lastName: 'Smith',
    });

    console.log('\n✅ Seed complete!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  DEMO LOGIN CREDENTIALS  (password: password123)');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Subdomain : nairobi-academy');
    console.log('  principal@nairobi.edu   → role: principal');
    console.log('  deputy@nairobi.edu      → role: deputy');
    console.log('  teacher@nairobi.edu     → role: teacher');
    console.log('  student@nairobi.edu     → role: student');
    console.log('  parent@nairobi.edu      → role: parent');
    console.log('═══════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
