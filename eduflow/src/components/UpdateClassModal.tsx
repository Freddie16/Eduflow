/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Users, GraduationCap, User, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Class, User as UserType } from '../types';

interface UpdateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedClass: Class) => void;
  classData: Class | null;
  teachers: UserType[];
}

export function UpdateClassModal({ isOpen, onClose, onUpdate, classData, teachers }: UpdateClassModalProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (classData) {
      setName(classData.name);
      setGrade(classData.grade);
      setTeacherId(classData.teacherId);
    }
  }, [classData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Class name is required';
    if (!grade.trim()) newErrors.grade = 'Grade is required';
    if (!teacherId) newErrors.teacherId = 'Class teacher is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && classData) {
      onUpdate({
        ...classData,
        name,
        grade,
        teacherId,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Update Class</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Modify class details and assignment</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Class Name</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Grade 10 Alpha"
                      className={`w-full bg-zinc-50 border ${errors.name ? 'border-red-500' : 'border-zinc-100'} rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Grade Level</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g. 10"
                      className={`w-full bg-zinc-50 border ${errors.grade ? 'border-red-500' : 'border-zinc-100'} rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
                    />
                  </div>
                  {errors.grade && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.grade}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Class Teacher</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <select
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      className={`w-full bg-zinc-50 border ${errors.teacherId ? 'border-red-500' : 'border-zinc-100'} rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none`}
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.teacherId && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.teacherId}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-orange-200 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
