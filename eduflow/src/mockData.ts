/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { School, User, Lesson, Class, Exam, ExamResult, Reminder, Attendance, FeeRecord } from './types';

export const MOCK_SCHOOLS: School[] = [
  {
    id: 'school-1',
    name: 'Nairobi Academy',
    subdomain: 'nairobi-academy',
    settings: { currency: 'KES', timeZone: 'Africa/Nairobi' },
    subscriptionStatus: 'active',
  },
  {
    id: 'school-2',
    name: 'Greenwood International',
    subdomain: 'greenwood',
    settings: { currency: 'USD', timeZone: 'America/New_York' },
    subscriptionStatus: 'active',
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    schoolId: 'school-1',
    role: 'principal',
    email: 'principal@nairobi.edu',
    firstName: 'James',
    lastName: 'Mwangi',
  },
  {
    id: 'user-2',
    schoolId: 'school-1',
    role: 'teacher',
    isClassTeacher: true,
    assignedClass: 'class-1',
    email: 'teacher@nairobi.edu',
    firstName: 'Sarah',
    lastName: 'Otieno',
  },
  {
    id: 'user-3',
    schoolId: 'school-1',
    role: 'student',
    email: 'student@nairobi.edu',
    firstName: 'Kevin',
    lastName: 'Kamau',
    parentId: 'user-4',
  },
  {
    id: 'user-5',
    schoolId: 'school-1',
    role: 'student',
    email: 'alice@nairobi.edu',
    firstName: 'Alice',
    lastName: 'Wanjiku',
    parentId: 'user-4',
  },
  {
    id: 'user-6',
    schoolId: 'school-1',
    role: 'student',
    email: 'john@nairobi.edu',
    firstName: 'John',
    lastName: 'Doe',
    parentId: 'user-4',
  },
  {
    id: 'user-4',
    schoolId: 'school-1',
    role: 'parent',
    email: 'parent@nairobi.edu',
    firstName: 'Peter',
    lastName: 'Kamau',
    studentIds: ['user-3'],
  },
];

export const MOCK_CLASSES: Class[] = [
  {
    id: 'class-1',
    schoolId: 'school-1',
    name: 'Grade 10A',
    grade: '10',
    teacherId: 'user-2',
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    schoolId: 'school-1',
    teacherId: 'user-2',
    classId: 'class-1',
    title: 'Introduction to Calculus',
    content: {
      body: 'Calculus is the mathematical study of continuous change...',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    updates: [
      { timestamp: new Date().toISOString(), note: 'Initial lesson created' },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    schoolId: 'school-1',
    classId: 'class-1',
    subject: 'Mathematics',
    date: '2026-04-15',
    startTime: '09:00',
    duration: '2h',
    location: 'Main Hall',
    createdBy: 'user-2',
  },
  {
    id: 'exam-2',
    schoolId: 'school-1',
    classId: 'class-1',
    subject: 'English Literature',
    date: '2026-04-17',
    startTime: '10:30',
    duration: '1.5h',
    location: 'Room 204',
    createdBy: 'user-2',
  },
];

export const MOCK_EXAM_RESULTS: ExamResult[] = [
  {
    id: 'res-1',
    examId: 'exam-1',
    studentId: 'user-3',
    score: 85,
    totalMarks: 100,
    grade: 'A',
    remarks: 'Excellent performance in calculus.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-2',
    examId: 'exam-1',
    studentId: 'user-5',
    score: 72,
    totalMarks: 100,
    grade: 'B',
    remarks: 'Good understanding of concepts.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-3',
    examId: 'exam-2',
    studentId: 'user-6',
    score: 45,
    totalMarks: 100,
    grade: 'D',
    remarks: 'Needs to focus more on literature analysis.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'res-4',
    examId: 'exam-2',
    studentId: 'user-3',
    score: 91,
    totalMarks: 100,
    grade: 'A',
    remarks: 'Outstanding performance.',
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    userId: 'user-3',
    title: 'Math Exam Reminder',
    description: 'Don\'t forget your calculator for tomorrow\'s exam!',
    date: new Date().toISOString(),
    isRead: false,
    type: 'exam',
  },
];

export const MOCK_ATTENDANCE: Attendance[] = [
  {
    id: 'att-1',
    schoolId: 'school-1',
    classId: 'class-1',
    studentId: 'user-3',
    date: '2024-03-14',
    status: 'present',
    markedBy: 'user-2'
  }
];

export const MOCK_FEES: FeeRecord[] = [
  {
    id: 'fee-1',
    schoolId: 'school-1',
    studentId: 'user-3',
    totalAmount: 45000,
    paidAmount: 30000,
    lastPaymentDate: '2024-02-15',
    status: 'partial'
  }
];
