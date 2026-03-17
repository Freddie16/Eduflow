/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Play, FileText, Clock, User, CheckCircle2, Upload } from 'lucide-react';
import { Lesson, Class } from '../types';
import { useAuth } from '../AuthContext';
import { CreateLessonModal } from '../components/CreateLessonModal';
import { CSVImportModal } from '../components/CSVImportModal';
import { ActionMenu } from '../components/ActionMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import api from '../api';

export function LessonsView() {
  const { user } = useAuth();
  const [lessons, setLessons]   = useState<any[]>([]);
  const [classes, setClasses]   = useState<Class[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [isImportOpen, setIsImportOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<any>(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    Promise.all([api.get('/lessons'), api.get('/classes')])
      .then(([l, c]: any) => { setLessons(l.data.map(mapLesson)); setClasses(c.data.map(mapClass)); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res: any = await api.post('/lessons', { classId: data.classId, title: data.title, content: data.content });
      setLessons((p) => [mapLesson(res.data), ...p]);
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/lessons/${deleteTarget.id}`);
      setLessons((p) => p.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(false); }
  };

  const toggleComplete = async (lessonId: string) => {
    if (!user || user.role !== 'student') return;
    try {
      const data: any = await api.patch(`/lessons/${lessonId}/complete`);
      setLessons((p) => p.map((l) => l.id === lessonId ? mapLesson(data.data) : l));
    } catch (err: any) { console.error(err); }
  };

  const canEdit = ['principal', 'deputy', 'teacher'].includes(user?.role || '');
  const filtered = lessons.filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input type="text" placeholder="Search lessons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 shadow-sm">
            <Upload size={18} /> Import
          </button>
          {canEdit && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200">
              <Plus size={18} /> New Lesson
            </button>
          )}
        </div>
      </div>

      <CSVImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImport={() => { api.get("/lessons").then((d:any) => setLessons(d.data.map(mapLesson))).catch(console.error); }} title="Lessons" />
      <CreateLessonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} classes={classes.filter((c) => c.schoolId === user?.schoolId)} />
      <ConfirmDialog
        isOpen={!!deleteTarget} loading={deleting}
        title="Delete Lesson"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <FileText size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium text-sm">No lessons found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((lesson) => {
            const cls = classes.find((c) => c.id === lesson.classId);
            const isCompleted = user ? lesson.completedBy?.includes(user.id) : false;
            return (
              <div key={lesson.id} className={`bg-white border ${isCompleted ? 'border-orange-500/30' : 'border-zinc-200'} rounded-[32px] overflow-hidden hover:border-orange-200 transition-all group relative shadow-sm`}>
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-20 bg-orange-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 size={16} />
                  </div>
                )}
                <div className="aspect-video bg-zinc-100 relative flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/${lesson.id}/640/360`} alt={lesson.title}
                    className={`w-full h-full object-cover ${isCompleted ? 'opacity-30 grayscale' : 'opacity-80'} group-hover:scale-105 transition-transform duration-700`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent opacity-60" />
                  <button className="absolute w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-xl">
                    <Play size={28} fill="white" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1 mr-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{cls?.name || 'General'}</span>
                      <h4 className={`text-base font-bold ${isCompleted ? 'text-zinc-400' : 'text-zinc-900'} line-clamp-1`}>{lesson.title}</h4>
                    </div>
                    <ActionMenu
                      disabled={!canEdit}
                      onEdit={() => alert('Edit lesson coming soon')}
                      onDelete={() => setDeleteTarget(lesson)}
                      deleteLabel="Delete Lesson"
                    />
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2">{lesson.content.body}</p>
                  {user?.role === 'student' && (
                    <button onClick={() => toggleComplete(lesson.id)}
                      className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isCompleted ? 'bg-zinc-100 text-zinc-400' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20 hover:bg-orange-500 hover:text-white'
                      }`}>
                      {isCompleted ? <><CheckCircle2 size={14} />Completed</> : 'Mark as Complete'}
                    </button>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100"><User size={14} className="text-zinc-400" /></div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{lesson.teacherName || 'Teacher'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase">
                      <Clock size={12} />{new Date(lesson.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function mapLesson(l: any): any {
  return {
    id: l._id || l.id, schoolId: l.schoolId,
    teacherId: l.teacherId?._id || l.teacherId,
    teacherName: l.teacherId ? `${l.teacherId.firstName} ${l.teacherId.lastName}` : '',
    classId: l.classId?._id || l.classId,
    title: l.title, content: l.content, updates: l.updates || [],
    createdAt: l.createdAt, completedBy: l.completedBy || [],
  };
}

function mapClass(c: any): Class {
  return { id: c._id || c.id, schoolId: c.schoolId, name: c.name, grade: c.grade, teacherId: c.teacherId?._id || c.teacherId };
}