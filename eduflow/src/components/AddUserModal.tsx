/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, GraduationCap, Users, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role } from '../types';
import api from '../api';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: any) => void;
  defaultRole?: Role;
}

const ROLE_CONFIG: Record<string, { label: string; emoji: string; description: string }> = {
  deputy:  { label: 'Deputy Principal', emoji: '📋', description: 'Operational admin access' },
  teacher: { label: 'Teacher',          emoji: '📚', description: 'Lesson & class management' },
  student: { label: 'Student',          emoji: '🎓', description: 'Access lessons & exams' },
  parent:  { label: 'Parent/Guardian',  emoji: '👨‍👩‍👧', description: 'View child progress' },
};

export function AddUserModal({ isOpen, onClose, onCreated, defaultRole = 'student' }: AddUserModalProps) {
  const [role, setRole]               = useState<Role>(defaultRole);
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [assignedClass, setAssignedClass]   = useState('');
  const [parentId, setParentId]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  // Lookup data
  const [classes, setClasses]   = useState<any[]>([]);
  const [parents, setParents]   = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    // Load classes for teacher/student assignment
    api.get('/classes').then((d: any) => setClasses(d.data)).catch(() => {});
    // Load parents for linking to students
    api.get('/users?role=parent').then((d: any) => setParents(d.data)).catch(() => {});
  }, [isOpen]);

  // Reset form when role changes
  useEffect(() => {
    setIsClassTeacher(false);
    setAssignedClass('');
    setParentId('');
    setError('');
  }, [role]);

  const reset = () => {
    setRole(defaultRole);
    setFirstName(''); setLastName(''); setEmail(''); setPassword('');
    setIsClassTeacher(false); setAssignedClass(''); setParentId('');
    setError(''); setSuccess(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        role, firstName, lastName, email,
        password: password || 'EduFlow@123',
      };

      if (role === 'teacher') {
        payload.isClassTeacher = isClassTeacher;
        if (isClassTeacher && assignedClass) payload.assignedClass = assignedClass;
      }

      if (role === 'student') {
        if (assignedClass) payload.assignedClass = assignedClass;
        if (parentId)      payload.parentId = parentId;
      }

      const data: any = await api.post('/users', payload);
      setSuccess(true);
      onCreated(data.data);
      setTimeout(() => { setSuccess(false); handleClose(); }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all';
  const selectCls = 'w-full bg-zinc-50 border border-zinc-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Add New User</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Create an account for a staff or student</p>
                </div>
              </div>
              <button onClick={handleClose}
                className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-8 space-y-6">

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 text-sm">
                      <CheckCircle2 size={16} />
                      User created successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Role selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ROLE_CONFIG).map(([r, cfg]) => (
                      <button key={r} type="button" onClick={() => setRole(r as Role)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                          role === r
                            ? 'border-orange-500 bg-orange-50 text-orange-600'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300'
                        }`}>
                        <span className="text-2xl leading-none">{cfg.emoji}</span>
                        <div>
                          <p className="text-xs font-black leading-tight">{cfg.label}</p>
                          <p className="text-[10px] opacity-70">{cfg.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        placeholder="James" className={inputCls} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                        placeholder="Mwangi" className={inputCls} required />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@school.edu" className={inputCls} required />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Password <span className="normal-case font-normal text-zinc-400">(leave blank to use default: EduFlow@123)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Default: EduFlow@123" className={inputCls} />
                  </div>
                </div>

                {/* Teacher-specific: class teacher toggle + class assignment */}
                {role === 'teacher' && (
                  <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setIsClassTeacher(!isClassTeacher)}
                        className={`w-10 h-6 rounded-full transition-all relative ${isClassTeacher ? 'bg-orange-500' : 'bg-zinc-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isClassTeacher ? 'left-5' : 'left-1'}`} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-700">Class Teacher</p>
                        <p className="text-[10px] text-zinc-400">Assign this teacher as the homeroom teacher of a class</p>
                      </div>
                    </label>

                    {isClassTeacher && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Assign to Class</label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                          <select value={assignedClass} onChange={(e) => setAssignedClass(e.target.value)} className={selectCls}>
                            <option value="">Select class</option>
                            {classes.map((c) => <option key={c._id} value={c._id}>{c.name} (Grade {c.grade})</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Student-specific: class + parent */}
                {role === 'student' && (
                  <div className="space-y-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Enrol in Class</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <select value={assignedClass} onChange={(e) => setAssignedClass(e.target.value)} className={selectCls}>
                          <option value="">Select class</option>
                          {classes.map((c) => <option key={c._id} value={c._id}>{c.name} (Grade {c.grade})</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Link to Parent (optional)</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={selectCls}>
                          <option value="">Select parent</option>
                          {parents.map((p) => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.email})</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default password note */}
                <div className="px-4 py-3 bg-orange-50 border border-orange-100 rounded-2xl text-[11px] text-orange-700">
                  <strong>Note:</strong> Share the login credentials with the user. They can change their password from Settings after first login.
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <button type="button" onClick={handleClose}
                  className="flex-1 py-4 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading || success}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-orange-200 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Creating...' : success ? '✓ Created!' : `Add ${ROLE_CONFIG[role]?.label || 'User'}`}
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
