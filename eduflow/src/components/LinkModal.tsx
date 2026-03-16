/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Search, Link, Unlink, Users, GraduationCap, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, pre-selects that user and only lets you pick the other side */
  seedUser?: any;
  seedType?: 'parent' | 'student';
  onLinked?: () => void;
}

export function LinkModal({ isOpen, onClose, seedUser, seedType, onLinked }: LinkModalProps) {
  const [tab, setTab]             = useState<'link' | 'manage'>('link');
  const [parents, setParents]     = useState<any[]>([]);
  const [students, setStudents]   = useState<any[]>([]);
  const [selectedParent, setSelectedParent]   = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [parentSearch, setParentSearch]       = useState('');
  const [studentSearch, setStudentSearch]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // All existing links for "manage" tab
  const [links, setLinks] = useState<any[]>([]);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setMessage(null);

    Promise.all([
      api.get('/users?role=parent'),
      api.get('/users/students'),
    ]).then(([p, s]: any) => {
      setParents(p.data);
      setStudents(s.data);

      // Build current links list
      const existingLinks: any[] = [];
      s.data.forEach((student: any) => {
        if (student.parentId) {
          const parent = p.data.find((par: any) => par._id === (student.parentId?._id || student.parentId));
          if (parent) {
            existingLinks.push({ parent, student });
          }
        }
      });
      setLinks(existingLinks);
    }).catch(console.error);

    // Pre-seed selections
    if (seedUser && seedType === 'parent') setSelectedParent(seedUser);
    if (seedUser && seedType === 'student') setSelectedStudent(seedUser);
  }, [isOpen, seedUser, seedType]);

  const handleLink = async () => {
    if (!selectedParent || !selectedStudent) {
      setMessage({ type: 'error', text: 'Please select both a parent and a student.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const data: any = await api.post('/users/link', {
        parentId: selectedParent._id,
        studentId: selectedStudent._id,
      });
      setMessage({ type: 'success', text: data.message });

      // Update local links list
      setLinks((prev) => [...prev, { parent: selectedParent, student: selectedStudent }]);

      // Update students list to reflect new parentId
      setStudents((prev) => prev.map((s) =>
        s._id === selectedStudent._id ? { ...s, parentId: selectedParent } : s
      ));

      if (!seedUser) { setSelectedParent(null); setSelectedStudent(null); }
      onLinked?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (parentId: string, studentId: string, linkKey: string) => {
    setUnlinking(linkKey);
    setMessage(null);
    try {
      await api.post('/users/unlink', { parentId, studentId });
      setLinks((prev) => prev.filter((l) => !(l.parent._id === parentId && l.student._id === studentId)));
      setStudents((prev) => prev.map((s) => s._id === studentId ? { ...s, parentId: null } : s));
      setMessage({ type: 'success', text: 'Link removed successfully.' });
      onLinked?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUnlinking(null);
    }
  };

  const filteredParents  = parents.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(parentSearch.toLowerCase())
  );
  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Group links by parent
  const groupedLinks = links.reduce((acc: Record<string, any>, link) => {
    const key = link.parent._id;
    if (!acc[key]) acc[key] = { parent: link.parent, students: [] };
    acc[key].students.push(link.student);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Link size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Parent–Student Links</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Connect parents to their children</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
              {(['link', 'manage'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-zinc-400 hover:text-zinc-700 hover:bg-white'}`}>
                  {t === 'link' ? '+ New Link' : `Manage Links (${links.length})`}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1">
              {/* ── Link Tab ─────────────────────────────────────────── */}
              {tab === 'link' && (
                <div className="p-8 space-y-6">
                  <AnimatePresence>
                    {message && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parent picker */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={12} /> Select Parent
                      </label>
                      {!seedUser || seedType !== 'parent' ? (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                            <input type="text" placeholder="Search parents..." value={parentSearch} onChange={(e) => setParentSearch(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {filteredParents.map((parent) => (
                              <button key={parent._id} type="button" onClick={() => setSelectedParent(parent)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border ${selectedParent?._id === parent._id ? 'border-orange-500 bg-orange-50' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}>
                                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                                  {parent.firstName[0]}{parent.lastName[0]}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-zinc-900 truncate">{parent.firstName} {parent.lastName}</p>
                                  <p className="text-[10px] text-zinc-400 truncate">{parent.email}</p>
                                </div>
                                {selectedParent?._id === parent._id && <CheckCircle2 size={14} className="text-orange-500 shrink-0 ml-auto" />}
                              </button>
                            ))}
                            {filteredParents.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">No parents found</p>}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-orange-500 bg-orange-50">
                          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xs">
                            {seedUser.firstName[0]}{seedUser.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">{seedUser.firstName} {seedUser.lastName}</p>
                            <p className="text-[10px] text-zinc-400">{seedUser.email}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Student picker */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap size={12} /> Select Student
                      </label>
                      {!seedUser || seedType !== 'student' ? (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                            <input type="text" placeholder="Search students..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {filteredStudents.map((student) => (
                              <button key={student._id} type="button" onClick={() => setSelectedStudent(student)}
                                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border ${selectedStudent?._id === student._id ? 'border-orange-500 bg-orange-50' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200'}`}>
                                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div className="overflow-hidden flex-1">
                                  <p className="text-xs font-bold text-zinc-900 truncate">{student.firstName} {student.lastName}</p>
                                  <p className="text-[10px] text-zinc-400 truncate">
                                    {student.assignedClass?.name || 'No class'}
                                    {student.parentId && ' · Already has parent'}
                                  </p>
                                </div>
                                {selectedStudent?._id === student._id && <CheckCircle2 size={14} className="text-orange-500 shrink-0" />}
                              </button>
                            ))}
                            {filteredStudents.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">No students found</p>}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-orange-500 bg-orange-50">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs">
                            {seedUser.firstName[0]}{seedUser.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">{seedUser.firstName} {seedUser.lastName}</p>
                            <p className="text-[10px] text-zinc-400">{seedUser.assignedClass?.name || 'No class'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {selectedParent && selectedStudent && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm">
                          {selectedParent.firstName[0]}{selectedParent.lastName[0]}
                        </div>
                        <span className="text-sm font-bold text-zinc-900">{selectedParent.firstName} {selectedParent.lastName}</span>
                      </div>
                      <ChevronRight size={18} className="text-orange-400 shrink-0" />
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                          {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                        </div>
                        <span className="text-sm font-bold text-zinc-900">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Manage Tab ───────────────────────────────────────── */}
              {tab === 'manage' && (
                <div className="p-8 space-y-4">
                  <AnimatePresence>
                    {message && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {Object.keys(groupedLinks).length === 0 ? (
                    <div className="text-center py-16 text-zinc-400">
                      <Link size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No links yet</p>
                      <button onClick={() => setTab('link')} className="mt-3 text-orange-500 text-xs font-bold hover:underline">Create the first link</button>
                    </div>
                  ) : (
                    Object.values(groupedLinks).map((group: any) => (
                      <div key={group.parent._id} className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-zinc-100">
                          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm">
                            {group.parent.firstName[0]}{group.parent.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-900">{group.parent.firstName} {group.parent.lastName}</p>
                            <p className="text-[10px] text-zinc-400">{group.parent.email}</p>
                          </div>
                          <span className="ml-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-orange-100 text-orange-600 rounded-lg">
                            {group.students.length} child{group.students.length !== 1 ? 'ren' : ''}
                          </span>
                        </div>
                        <div className="divide-y divide-zinc-100">
                          {group.students.map((student: any) => {
                            const key = `${group.parent._id}-${student._id}`;
                            return (
                              <div key={key} className="flex items-center gap-3 px-5 py-3">
                                <ChevronRight size={14} className="text-zinc-300 shrink-0" />
                                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-zinc-900">{student.firstName} {student.lastName}</p>
                                  <p className="text-[10px] text-zinc-400">{student.assignedClass?.name || 'No class'}</p>
                                </div>
                                <button onClick={() => handleUnlink(group.parent._id, student._id, key)}
                                  disabled={unlinking === key}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                                  <Unlink size={11} />
                                  {unlinking === key ? 'Removing...' : 'Unlink'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer — only for link tab */}
            {tab === 'link' && (
              <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 shrink-0 flex gap-4">
                <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button onClick={handleLink} disabled={loading || !selectedParent || !selectedStudent}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-200 disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
                  <Link size={15} />
                  {loading ? 'Linking...' : 'Create Link'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}