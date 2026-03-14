/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'principal' | 'deputy' | 'teacher' | 'student' | 'parent';

export interface School {
  id: string;
  name: string;
  subdomain: string;
  settings: {
    currency: string;
    timeZone: string;
    logoUrl?: string;
  };
  subscriptionStatus: 'active' | 'inactive' | 'trial';
}

export interface User {
  id: string;
  schoolId: string;
  role: Role;
  isClassTeacher?: boolean;
  assignedClass?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  parentId?: string; // If role is student
  studentIds?: string[]; // If role is parent
}

export interface Lesson {
  id: string;
  schoolId: string;
  teacherId: string;
  classId: string;
  title: string;
  content: {
    videoUrl?: string;
    body: string;
  };
  updates: {
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
  completedBy?: string[]; // Array of student IDs who completed this lesson
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  teacherId: string;
}

export interface Exam {
  id: string;
  schoolId: string;
  classId: string;
  subject: string;
  date: string;
  startTime: string;
  duration: string;
  location: string;
  createdBy: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  grade: string;
  remarks?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  schoolId: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
}

export interface FeeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  lastPaymentDate?: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  type: 'exam' | 'lesson' | 'fee' | 'general';
}
