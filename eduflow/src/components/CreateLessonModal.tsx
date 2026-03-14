/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Video, AlignLeft, Type, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Class } from '../types';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lessonData: any) => void;
  classes: Class[];
}

export function CreateLessonModal({ isOpen, onClose, onSubmit, classes }: CreateLessonModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [classId, setClassId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!body.trim()) newErrors.body = 'Lesson content is required';
    if (!classId) newErrors.classId = 'Please assign a class';
    if (videoUrl && !isValidUrl(videoUrl)) newErrors.videoUrl = 'Please enter a valid URL';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        title,
        content: { body, videoUrl },
        classId,
      });
      // Reset form
      setTitle('');
      setBody('');
      setVideoUrl('');
      setClassId('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <PlusIcon size={24} />
                </div>
                Create New Lesson
              </h2>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Title */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Type size={14} className="text-orange-500" />
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to Calculus"
                    className={`w-full bg-zinc-50 border ${errors.title ? 'border-red-500' : 'border-zinc-200'} rounded-2xl py-4 px-5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all`}
                  />
                  {errors.title && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12} /> {errors.title}</p>}
                </div>

                {/* Class Assignment */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Users size={14} className="text-orange-500" />
                    Assign to Class
                  </label>
                  <div className="relative">
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className={`w-full bg-zinc-50 border ${errors.classId ? 'border-red-500' : 'border-zinc-200'} rounded-2xl py-4 px-5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all appearance-none cursor-pointer`}
                    >
                      <option value="">Select a class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.grade})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  {errors.classId && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12} /> {errors.classId}</p>}
                </div>

                {/* Video URL */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Video size={14} className="text-orange-500" />
                    Video URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className={`w-full bg-zinc-50 border ${errors.videoUrl ? 'border-red-500' : 'border-zinc-200'} rounded-2xl py-4 px-5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all`}
                  />
                  {errors.videoUrl && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12} /> {errors.videoUrl}</p>}
                </div>

                {/* Body Content */}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <AlignLeft size={14} className="text-orange-500" />
                    Lesson Content
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Describe the lesson objectives and content..."
                    rows={4}
                    className={`w-full bg-zinc-50 border ${errors.body ? 'border-red-500' : 'border-zinc-200'} rounded-2xl py-4 px-5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none`}
                  />
                  {errors.body && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider"><AlertCircle size={12} /> {errors.body}</p>}
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3.5 rounded-2xl text-sm font-bold text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-orange-200 uppercase tracking-widest"
                >
                  Create Lesson
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PlusIcon({ size, className }: { size: number; className?: string }) {
  return (
    <div className={`w-${size/4} h-${size/4} flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </div>
  );
}
