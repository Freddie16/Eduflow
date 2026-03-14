/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Users, BookOpen, TrendingUp, AlertCircle, Clock, CheckCircle2,
  DollarSign, Bell, Check, GraduationCap, Calendar
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../NotificationContext';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

export function DashboardView() {
  const { user } = useAuth();
  const { reminders, markAsRead } = useNotifications();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((data: any) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const examReminders = reminders.filter((r) => r.type === 'exam' && !r.isRead);

  const renderStats = () => {
    if (loading || !stats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 p-8 rounded-[32px] animate-pulse">
              <div className="w-10 h-10 bg-zinc-100 rounded-2xl mb-6" />
              <div className="space-y-2">
                <div className="h-3 bg-zinc-100 rounded w-24" />
                <div className="h-8 bg-zinc-100 rounded w-16" />
                <div className="h-2.5 bg-zinc-100 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (user.role === 'principal' || user.role === 'deputy') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <StatCard title="Total Students"  value={stats.studentCount?.toLocaleString() ?? '—'} icon={<Users size={20} />}        color="orange" trend="Active enrollments" />
          <StatCard title="Total Teachers"  value={stats.teacherCount?.toLocaleString() ?? '—'} icon={<Users size={20} />}        color="zinc"   trend="Teaching staff" />
          <StatCard title="Revenue (Term)"  value={stats.totalRevenue ? `KES ${(stats.totalRevenue / 1000).toFixed(1)}K` : '—'} icon={<DollarSign size={20} />}  color="orange" trend={stats.totalExpected ? `of KES ${(stats.totalExpected / 1000).toFixed(1)}K target` : ''} />
          <StatCard title="Attendance Today" value={stats.attendanceRate != null ? `${stats.attendanceRate}%` : 'N/A'} icon={<CheckCircle2 size={20} />} color="blue" trend={`${stats.studentCount ?? 0} students` } />
        </div>
      );
    }

    if (user.role === 'teacher') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <StatCard title="My Lessons"       value={stats.myLessons?.toString() ?? '—'} icon={<BookOpen size={20} />}    color="orange" trend="Created lessons" />
          <StatCard title="Class Students"   value={stats.studentCount?.toString() ?? '—'} icon={<Users size={20} />}    color="blue"   trend={user.isClassTeacher ? 'In your class' : 'N/A'} />
          <StatCard title="Avg. Performance" value={stats.avgPerformance != null ? `${stats.avgPerformance}%` : 'N/A'} icon={<TrendingUp size={20} />} color="orange" trend="Across all exams" />
        </div>
      );
    }

    if (user.role === 'student') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <StatCard title="Lessons Completed" value={`${stats.completedLessons ?? 0}/${stats.totalLessons ?? 0}`} icon={<CheckCircle2 size={20} />} color="orange" trend={stats.totalLessons > 0 ? `${Math.round((stats.completedLessons / stats.totalLessons) * 100)}% of total` : 'No lessons yet'} />
          <StatCard title="Upcoming Exams"    value={stats.upcomingExams?.toString() ?? '0'}    icon={<Clock size={20} />}      color="orange" trend="Scheduled ahead" />
          <StatCard title="Current GPA"       value={stats.gpa ?? 'N/A'}                        icon={<TrendingUp size={20} />} color="blue"   trend="Based on results" />
        </div>
      );
    }

    if (user.role === 'parent') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <StatCard title="Children"     value={stats.childCount?.toString() ?? '0'} icon={<GraduationCap size={20} />} color="orange" trend="Enrolled" />
          <StatCard title="Fee Balance"  value={stats.totalOwed ? `KES ${stats.totalOwed.toLocaleString()}` : 'KES 0'} icon={<DollarSign size={20} />} color={stats.totalOwed > 0 ? 'red' : 'blue'} trend={stats.totalOwed > 0 ? 'Outstanding balance' : 'All fees paid'} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome back, {user.firstName}!</h2>
        <p className="text-zinc-500 text-sm">Here's a summary of what's happening in your school today.</p>
      </div>

      {renderStats()}

      {/* Exam reminders banner */}
      <AnimatePresence>
        {examReminders.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-orange-500 text-white rounded-[32px] p-8 shadow-xl shadow-orange-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-widest">
                  <Bell size={24} className="animate-bounce" />
                  Upcoming Exam Reminders
                </h3>
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                  {examReminders.length} New
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examReminders.map((reminder) => (
                  <div key={reminder.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col justify-between group hover:bg-white/20 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-100">
                        <Clock size={12} />
                        {new Date(reminder.date).toLocaleDateString()}
                      </div>
                      <h4 className="text-sm font-black leading-tight">{reminder.title}</h4>
                      <p className="text-xs text-orange-50 font-medium leading-relaxed opacity-80">{reminder.description}</p>
                    </div>
                    <button
                      onClick={() => markAsRead(reminder.id)}
                      className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white text-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all"
                    >
                      <Check size={14} /> Mark as Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <section className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <Clock size={20} />
              </div>
              Recent Activity
            </h3>
            <div className="space-y-8">
              <ActivityItem title="Lesson Updated"    desc="Sarah Otieno updated 'Introduction to Calculus'" time="2 hours ago" type="lesson" />
              <ActivityItem title="Fee Payment"       desc="Payment received for Kevin Kamau"                time="4 hours ago" type="finance" />
              <ActivityItem title="New Registration"  desc="New student 'Alice Wanjiku' joined Grade 10A"   time="Yesterday"   type="user" />
            </div>
          </section>
        </div>

        <div>
          <section className="bg-white border border-zinc-200 text-zinc-900 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <AlertCircle size={20} />
              </div>
              Notifications
            </h3>
            <div className="space-y-5">
              <NotificationItem message="Staff meeting at 4:00 PM today" type="info" />
              <NotificationItem message="Term 2 report cards are due in 3 days" type="warning" />
              <NotificationItem message="System maintenance scheduled for Sunday" type="info" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string; value: string; icon: React.ReactNode; trend: string; color: string }) {
  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600',
    blue:   'bg-blue-100 text-blue-600',
    zinc:   'bg-zinc-100 text-zinc-600',
    red:    'bg-red-100 text-red-500',
  };
  return (
    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] hover:border-orange-200 transition-all shadow-sm group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl transition-all group-hover:scale-110 ${colorClasses[color] || colorClasses.zinc}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{title}</h4>
        <div className="text-3xl font-black text-zinc-900 tracking-tight">{value}</div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{trend}</p>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, time, type }: { title: string; desc: string; time: string; type: string }) {
  const icons: Record<string, React.ReactNode> = {
    lesson:  <BookOpen size={18} className="text-orange-500" />,
    finance: <DollarSign size={18} className="text-orange-500" />,
    user:    <Users size={18} className="text-blue-500" />,
  };
  return (
    <div className="flex gap-6 group">
      <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-md transition-all">
        {icons[type]}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <h5 className="text-sm font-bold text-zinc-900 tracking-tight">{title}</h5>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

function NotificationItem({ message, type }: { message: string; type: 'info' | 'warning' }) {
  return (
    <div className={`p-4 rounded-2xl text-xs font-medium flex gap-4 transition-all hover:translate-x-1 ${
      type === 'warning'
        ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
        : 'bg-zinc-50 text-zinc-600 border border-zinc-100'
    }`}>
      <AlertCircle size={16} className="shrink-0" />
      {message}
    </div>
  );
}
