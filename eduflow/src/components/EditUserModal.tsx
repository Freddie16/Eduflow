/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, User, Mail, GraduationCap, Users, BookOpen, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (user: any) => void;
  user: any;
}

export function EditUserModal({ isOpen, onClose, onUpdated, user }: EditUserModalProps) {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [assignedClass, setAssignedClass]   = useState('');
  const [parentId, setParentId]     = useState('');
  const [classes, setClasses]       = useState<any[]>([]);
  const [parents, setParents]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setEmail(user.email || '');
    setIsClassTeacher(user.isClassTeacher || false);
    setAssignedClass(user.assignedClass?._id || user.assignedClass || '');
    setParentId(user.parentId?._id || user.parentId || '');
    setError('');

    api.get('/classes').then((d: any) => setClasses(d.data)).catch(() => {});
    if (user.role === 'student') {
      api.get('/users?role=parent').then((d: any) => setParents(d.data)).catch(() => {});
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = { firstName, lastName, email };
      if (user.role === 'teacher') {
        payload.isClassTeacher = isClassTeacher;
        payload.assignedClass = isClassTeacher && assignedClass ? assignedClass : null;
      }
      if (user.role === 'student') {
        payload.assignedClass = assignedClass || null;
        payload.parentId = parentId || null;
      }

      const data: any = await api.put(`/users/${user._id}`, payload);
      onUpdated(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update.');
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
            onClick={onClose} className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Edit {user?.role === 'student' ? 'Student' : user?.role === 'teacher' ? 'Teacher' : 'User'}</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Update account details</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
                  </div>
                </div>

                {user?.role === 'teacher' && (
                  <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setIsClassTeacher(!isClassTeacher)}
                        className={`w-10 h-6 rounded-full transition-all relative ${isClassTeacher ? 'bg-orange-500' : 'bg-zinc-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isClassTeacher ? 'left-5' : 'left-1'}`} />
                      </div>
                      <span className="text-xs font-black text-zinc-700">Class Teacher</span>
                    </label>
                    {isClassTeacher && (
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <select value={assignedClass} onChange={(e) => setAssignedClass(e.target.value)} className={`${inputCls} appearance-none`}>
                          <option value="">Select class</option>
                          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {user?.role === 'student' && (
                  <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Class</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <select value={assignedClass} onChange={(e) => setAssignedClass(e.target.value)} className={`${inputCls} appearance-none`}>
                          <option value="">Select class</option>
                          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Parent</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={`${inputCls} appearance-none`}>
                          <option value="">No parent linked</option>
                          {parents.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 shrink-0 flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}