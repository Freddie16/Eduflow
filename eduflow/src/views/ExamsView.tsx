/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Plus, Clock, MapPin, Bell, X, Upload } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { CSVImportModal } from '../components/CSVImportModal';
import { ActionMenu } from '../components/ActionMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

export function ExamsView() {
  const { user } = useAuth();
  const { reminders, addReminder } = useNotifications();
  const [activeTab, setActiveTab] = useState<'schedule' | 'results'>('schedule');
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExam, setNewExam] = useState({ classId: '', subject: '', date: '', startTime: '', duration: '2h', location: '' });
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/exams'),
      api.get('/exams/results'),
      api.get('/classes'),
    ]).then(([e, r, c]: any) => {
      setExams(e.data);
      setResults(r.data);
      setClasses(c.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = await api.post('/exams', newExam);
      setExams((prev) => [data.data, ...prev]);
      setShowCreateForm(false);
      setNewExam({ classId: '', subject: '', date: '', startTime: '', duration: '2h', location: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteExam = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/exams/${deleteTarget._id}`);
      setExams((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(false); }
  };

  const handleSetReminder = async (exam: any) => {
    await addReminder({
      userId: user?.id || '',
      title: `${exam.subject} Exam Reminder`,
      description: `Exam on ${exam.date} at ${exam.startTime} in ${exam.location}`,
      date: new Date().toISOString(),
      isRead: false,
      type: 'exam',
    });
  };

  const examReminders = reminders.filter((r) => r.type === 'exam');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Exams & Assessments</h2>
          <p className="text-sm text-zinc-500 font-medium">Manage schedules, track results, and stay updated.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-2xl text-sm font-black hover:bg-zinc-50 transition-all shadow-sm uppercase tracking-widest">
            <Upload size={18} /> Import CSV
          </button>
          {(user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'deputy') && (
            <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl text-sm font-black hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 uppercase tracking-widest">
              <Plus size={18} /> Schedule Exam
            </button>
          )}
        </div>
      </div>

      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={() => {}} title="Exams" />
      <ConfirmDialog
        isOpen={!!deleteTarget} loading={deleting}
        title="Delete Exam"
        message={`Delete the "${deleteTarget?.subject}" exam on ${deleteTarget?.date}?`}
        onConfirm={handleDeleteExam} onCancel={() => setDeleteTarget(null)}
      />

      {/* Create Exam Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-zinc-900">Schedule New Exam</h3>
              <button onClick={() => setShowCreateForm(false)}><X size={20} className="text-zinc-400" /></button>
            </div>
            <form onSubmit={handleCreateExam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={newExam.classId} onChange={(e) => setNewExam({ ...newExam, classId: e.target.value })}
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" required>
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Subject" value={newExam.subject} onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" required />
              <input type="date" value={newExam.date} onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" required />
              <input type="time" value={newExam.startTime} onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" required />
              <input type="text" placeholder="Duration (e.g. 2h)" value={newExam.duration} onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" required />
              <input type="text" placeholder="Location" value={newExam.location} onChange={(e) => setNewExam({ ...newExam, location: e.target.value })}
                className="border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" required />
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-2.5 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600">Create Exam</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-100 p-1.5 rounded-2xl w-fit">
        {(['schedule', 'results'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
            {tab === 'schedule' ? <><Calendar size={14} className="inline mr-2" />Schedule</> : <><Trophy size={14} className="inline mr-2" />Results</>}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-white border border-zinc-200 rounded-[28px] p-6 hover:border-orange-200 transition-all shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  {exam.classId?.name || 'Class'}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSetReminder(exam)}
                    className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-500 rounded-xl transition-colors" title="Set reminder">
                    <Bell size={14} />
                  </button>
                  <ActionMenu
                    disabled={!['principal','deputy','teacher'].includes(user?.role || '')}
                    onEdit={() => alert('Edit exam coming soon')}
                    onDelete={() => setDeleteTarget(exam)}
                    deleteLabel="Delete Exam"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-4">{exam.subject}</h3>
              <div className="space-y-2 text-xs text-zinc-500">
                <div className="flex items-center gap-2"><Calendar size={14} className="text-orange-400" />{exam.date}</div>
                <div className="flex items-center gap-2"><Clock size={14} className="text-orange-400" />{exam.startTime} · {exam.duration}</div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-orange-400" />{exam.location}</div>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="col-span-3 text-center py-16 text-zinc-400">
              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No exams scheduled</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Subject</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Grade</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {results.map((r) => (
                <tr key={r._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm font-medium text-zinc-900">
                    {r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : '—'}
                  </td>
                  <td className="px-8 py-4 text-sm text-zinc-600">{r.examId?.subject || '—'}</td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-zinc-900">{r.score}/{r.totalMarks}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black ${
                      r.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                      r.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                      r.grade === 'C' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>{r.grade}</span>
                  </td>
                  <td className="px-8 py-4 text-xs text-zinc-500">{r.remarks || '—'}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-zinc-400 text-sm">No results yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}