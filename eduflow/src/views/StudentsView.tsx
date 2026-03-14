/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Mail, User, GraduationCap, Upload, UserX } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { CSVImportModal } from '../components/CSVImportModal';
import { AddUserModal } from '../components/AddUserModal';
import api from '../api';

export function StudentsView() {
  const { user: currentUser } = useAuth();
  const [students, setStudents]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen]       = useState(false);

  const fetchStudents = () => {
    api.get('/users/students')
      .then((data: any) => setStudents(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleCreated = (newUser: any) => {
    setStudents((prev) => [newUser, ...prev]);
  };

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canAdd = ['principal', 'deputy'].includes(currentUser?.role || '');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Students</h2>
          <p className="text-sm text-zinc-500 font-medium">{students.length} enrolled students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search students..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm" />
          </div>
          <button onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Upload size={18} /> Import
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Filter size={18} /> Filter
          </button>
          {canAdd && (
            <button onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              <Plus size={18} /> Add Student
            </button>
          )}
        </div>
      </div>

      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={() => {}} title="Students" />
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreated={handleCreated} defaultRole="student" />

      <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Class</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Parent</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((student) => {
                const cls    = student.assignedClass;
                const parent = student.parentId;
                return (
                  <tr key={student._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm shadow-sm">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-zinc-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {cls ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-xl">
                          <GraduationCap size={12} /> {cls.name}
                        </span>
                      ) : <span className="text-xs text-zinc-300">—</span>}
                    </td>
                    <td className="px-8 py-5">
                      {parent
                        ? <span className="text-xs text-zinc-600 font-medium">{parent.firstName} {parent.lastName}</span>
                        : <span className="text-xs text-zinc-300">—</span>}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Mail size={14} /> {student.email}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl ${student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                        <MoreVertical size={18} className="text-zinc-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <UserX size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No students found</p>
              {canAdd && (
                <button onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all">
                  Add First Student
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
