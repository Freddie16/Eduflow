/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, Users
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import api from '../api';

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={14} /> },
  absent:  { label: 'Absent',  color: 'bg-red-100 text-red-700 border-red-200',         icon: <XCircle size={14} /> },
  late:    { label: 'Late',    color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock size={14} /> },
};

export function AttendanceView() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load classes on mount
  useEffect(() => {
    api.get('/classes').then((data: any) => {
      const cls = data.data;
      setClasses(cls);
      if (cls.length > 0) {
        // Default: class teacher sees their own class, others see first
        const defaultClass =
          user?.isClassTeacher && user.assignedClass
            ? cls.find((c: any) => c._id === user.assignedClass) || cls[0]
            : cls[0];
        setSelectedClassId(defaultClass._id);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Load students + existing attendance when class or date changes
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);

    Promise.all([
      api.get(`/classes/${selectedClassId}/students`),
      api.get(`/attendance?classId=${selectedClassId}&date=${selectedDate}`),
    ]).then(([studentsData, attendanceData]: any) => {
      const studs = studentsData.data;
      setStudents(studs);
      setExistingRecords(attendanceData.data);

      // Pre-fill attendance map from existing records
      const map: Record<string, 'present' | 'absent' | 'late'> = {};
      studs.forEach((s: any) => { map[s._id] = 'present'; }); // default present
      attendanceData.data.forEach((rec: any) => {
        map[rec.studentId?._id || rec.studentId] = rec.status;
      });
      setAttendance(map);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedClassId, selectedDate]);

  const setStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        status: attendance[s._id] || 'present',
      }));
      await api.post('/attendance/bulk', { classId: selectedClassId, date: selectedDate, records });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentClass = classes.find((c) => c._id === selectedClassId);
  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;
  const lateCount = Object.values(attendance).filter((s) => s === 'late').length;
  const total = students.length;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const canEdit = ['principal', 'deputy', 'teacher'].includes(user?.role || '');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Attendance Tracking</h2>
          <p className="text-sm text-zinc-500 font-medium">Monitor and record student daily presence.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl shadow-sm">
            <CalendarIcon size={18} className="text-orange-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-bold text-zinc-900 focus:outline-none bg-transparent"
            />
          </div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">
              {currentClass?.name || 'Summary'}
            </h3>

            {/* Rate ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f4f4f5" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#f97316" strokeWidth="3"
                    strokeDasharray={`${rate} ${100 - rate}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-zinc-900">{rate}%</span>
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Attendance Rate</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Present', count: presentCount, color: 'bg-emerald-100 text-emerald-700' },
                { label: 'Absent',  count: absentCount,  color: 'bg-red-100 text-red-700' },
                { label: 'Late',    count: lateCount,    color: 'bg-orange-100 text-orange-700' },
                { label: 'Total',   count: total,        color: 'bg-zinc-100 text-zinc-600' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <span className="text-xs font-bold text-zinc-600">{stat.label}</span>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>

            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving || students.length === 0}
                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200'
                } disabled:opacity-50`}
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Attendance'}
              </button>
            )}
          </div>
        </div>

        {/* Student list */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-[32px] p-12 text-center shadow-sm">
              <Users size={32} className="mx-auto mb-3 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-400">No students in this class</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Student</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {students.map((student, idx) => {
                  const status = attendance[student._id] || 'present';
                  return (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-center justify-between px-8 py-4 hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-zinc-400">{student.email}</p>
                        </div>
                      </div>

                      {canEdit ? (
                        <div className="flex gap-2">
                          {(['present', 'absent', 'late'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => setStatus(student._id, s)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                                status === s
                                  ? STATUS_CONFIG[s].color
                                  : 'border-zinc-200 text-zinc-400 hover:border-zinc-300 bg-white'
                              }`}
                            >
                              {STATUS_CONFIG[s].icon}
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase border ${STATUS_CONFIG[status].color}`}>
                          {STATUS_CONFIG[status].icon}
                          {STATUS_CONFIG[status].label}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
