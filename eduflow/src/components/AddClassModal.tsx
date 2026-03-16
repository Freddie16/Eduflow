/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Users, GraduationCap, User, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (cls: any) => void;
}

export function AddClassModal({ isOpen, onClose, onCreated }: AddClassModalProps) {
  const [name, setName]           = useState('');
  const [grade, setGrade]         = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.get('/users/teachers')
      .then((d: any) => setTeachers(d.data))
      .catch(() => {});
  }, [isOpen]);

  const reset = () => {
    setName(''); setGrade(''); setTeacherId('');
    setError(''); setSuccess(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Class name is required.'); return; }
    if (!grade.trim()) { setError('Grade is required.'); return; }

    setLoading(true);
    try {
      const data: any = await api.post('/classes', {
        name: name.trim(),
        grade: grade.trim(),
        teacherId: teacherId || null,
      });
      setSuccess(true);
      onCreated(data.data);
      setTimeout(() => { setSuccess(false); handleClose(); }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to create class.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Add New Class</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Create a class and assign a teacher</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm">
                    <CheckCircle2 size={16} /> Class created successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Class Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Class Name</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grade 10A" className={inputCls} required />
                </div>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Grade Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. 10" className={inputCls} required />
                </div>
              </div>

              {/* Class Teacher */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Class Teacher <span className="normal-case font-normal text-zinc-400">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}
                    className={`${inputCls} appearance-none`}>
                    <option value="">Select a teacher</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.firstName} {t.lastName} {t.isClassTeacher ? '(already assigned)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button type="button" onClick={handleClose}
                  className="flex-1 py-4 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest">
                  Cancel
                </button>
                <button type="submit" disabled={loading || success}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-orange-200 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                  <Plus size={16} />
                  {loading ? 'Creating...' : success ? '✓ Created!' : 'Add Class'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}