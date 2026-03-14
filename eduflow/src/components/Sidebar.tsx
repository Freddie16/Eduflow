/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  GraduationCap, 
  CreditCard,
  ClipboardList,
  UserCircle,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Role } from '../types';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  roles: Role[];
  id: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', title: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['principal', 'deputy', 'teacher', 'student', 'parent'] },
  { id: 'lessons', title: 'Lessons', icon: <BookOpen size={20} />, roles: ['teacher', 'student', 'parent'] },
  { id: 'exams', title: 'Exams', icon: <Trophy size={20} />, roles: ['principal', 'deputy', 'teacher', 'student', 'parent'] },
  { id: 'classes', title: 'Classes', icon: <Users size={20} />, roles: ['principal', 'deputy', 'teacher'] },
  { id: 'students', title: 'Students', icon: <GraduationCap size={20} />, roles: ['principal', 'deputy', 'teacher'] },
  { id: 'staff',    title: 'Staff',    icon: <Users size={20} />,          roles: ['principal', 'deputy'] },
  { id: 'parents',  title: 'Parents',  icon: <UserCircle size={20} />,     roles: ['principal', 'deputy'] },
  { id: 'attendance', title: 'Attendance', icon: <ClipboardList size={20} />, roles: ['teacher'] },
  { id: 'schedule', title: 'Schedule', icon: <Calendar size={20} />, roles: ['principal', 'deputy', 'teacher', 'student'] },
  { id: 'finance', title: 'Finance', icon: <CreditCard size={20} />, roles: ['principal', 'parent'] },
  { id: 'analysis', title: 'Analysis', icon: <TrendingUp size={20} />, roles: ['principal', 'deputy', 'teacher'] },
  { id: 'settings', title: 'Settings', icon: <Settings size={20} />, roles: ['principal', 'deputy'] },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, school, logout } = useAuth();

  if (!user) return null;

  const filteredItems = sidebarItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-72 bg-white text-zinc-500 h-screen flex flex-col border-r border-zinc-200">
      <div className="p-8 flex items-center gap-4 border-b border-zinc-100">
        <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
          {school?.name.charAt(0)}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-zinc-900 font-bold text-sm truncate w-40 tracking-tight">{school?.name}</span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500">{user.role}</span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === item.id 
                ? 'bg-orange-50 text-orange-600 shadow-sm' 
                : 'hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <span className={activeTab === item.id ? 'text-orange-500' : 'text-zinc-400'}>
              {item.icon}
            </span>
            {item.title}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-4 py-4 mb-4 bg-zinc-50 rounded-2xl border border-zinc-100">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-zinc-400 shadow-sm border border-zinc-100">
            <UserCircle size={22} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-zinc-900 text-xs font-bold truncate tracking-tight">{user.firstName} {user.lastName}</span>
            <span className="text-zinc-400 text-[10px] truncate font-medium">{user.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
