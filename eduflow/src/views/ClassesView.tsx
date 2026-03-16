/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, MoreVertical, GraduationCap, User, BookOpen, Upload, Pencil } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { CSVImportModal } from '../components/CSVImportModal';
import { UpdateClassModal } from '../components/UpdateClassModal';
import { AddClassModal } from '../components/AddClassModal';
import { Class } from '../types';
import api from '../api';

export function ClassesView() {
  const { user } = useAuth();
  const [classes, setClasses]               = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [isImportModalOpen, setIsImportModalOpen]   = useState(false);
  const [isAddModalOpen, setIsAddModalOpen]         = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen]   = useState(false);
  const [selectedClass, setSelectedClass]           = useState<Class | null>(null);
  const [teachers, setTeachers]             = useState<any[]>([]);

  const fetchClasses = () => {
    api.get('/classes')
      .then((data: any) => setClasses(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    // Load teachers for UpdateClassModal
    api.get('/users/teachers')
      .then((d: any) => setTeachers(d.data))
      .catch(() => {});
  }, []);

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreated = (newClass: any) => {
    setClasses((prev) => [...prev, newClass]);
  };

  const openUpdate = (cls: any) => {
    setSelectedClass({
      id: cls._id,
      schoolId: cls.schoolId,
      name: cls.name,
      grade: cls.grade,
      teacherId: cls.teacherId?._id || cls.teacherId || '',
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async (updatedClass: Class) => {
    try {
      await api.put(`/classes/${updatedClass.id}`, {
        name: updatedClass.name,
        grade: updatedClass.grade,
        teacherId: updatedClass.teacherId || null,
      });
      fetchClasses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const canManage = ['principal', 'deputy'].includes(user?.role || '');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Classes</h2>
          <p className="text-sm text-zinc-500 font-medium">{classes.length} classes total</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search classes..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm" />
          </div>
          <button onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Upload size={18} /> Import
          </button>
          {canManage && (
            <button onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              <Plus size={18} /> Add Class
            </button>
          )}
        </div>
      </div>

      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={() => {}} title="Classes" />
      <AddClassModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreated={handleCreated} />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No classes found</p>
          {canManage && (
            <button onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all">
              Add First Class
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((cls) => (
            <div key={cls._id} className="bg-white border border-zinc-200 rounded-[32px] p-8 hover:border-orange-200 transition-all shadow-sm group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl shadow-sm">
                  {cls.grade}
                </div>
                <div className="flex items-center gap-2">
                  {(canManage || user?.role === 'teacher') && (
                    <button onClick={() => openUpdate(cls)} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                      <Pencil size={16} className="text-zinc-400" />
                    </button>
                  )}
                  <button className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                    <MoreVertical size={18} className="text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{cls.name}</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Grade {cls.grade}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-8 h-8 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                    <User size={16} className="text-zinc-400" />
                  </div>
                  <span className="font-medium text-xs">
                    {cls.teacherId
                      ? `${cls.teacherId.firstName} ${cls.teacherId.lastName}`
                      : 'No teacher assigned'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-8 h-8 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                    <Users size={16} className="text-zinc-400" />
                  </div>
                  <span className="font-medium text-xs">{cls.studentCount || 0} students enrolled</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedClass && (
        <UpdateClassModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={handleUpdate}
          classData={selectedClass}
          teachers={teachers.map((t) => ({
            id: t._id,
            schoolId: t.schoolId,
            role: t.role,
            email: t.email,
            firstName: t.firstName,
            lastName: t.lastName,
          }))}
        />
      )}
    </div>
  );
}