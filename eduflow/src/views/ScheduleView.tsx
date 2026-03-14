/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function ScheduleView() {
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    api.get('/exams').then((data: any) => setExams(data.data))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const examsByDate: Record<string, any[]> = {};
  exams.forEach((e) => {
    if (!examsByDate[e.date]) examsByDate[e.date] = [];
    examsByDate[e.date].push(e);
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Upcoming exams list (next 30 days)
  const upcoming = exams
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Schedule</h2>
        <p className="text-sm text-zinc-500 font-medium">View exam and event calendar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-zinc-900">{MONTHS[month]} {year}</h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                <ChevronLeft size={18} className="text-zinc-600" />
              </button>
              <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                <ChevronRight size={18} className="text-zinc-600" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-3">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === today;
              const dayExams = examsByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  className={`min-h-[60px] rounded-2xl p-2 flex flex-col transition-all ${
                    isToday
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : dayExams.length > 0
                      ? 'bg-orange-50 border border-orange-200'
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <span className={`text-xs font-black mb-1 ${isToday ? 'text-white' : 'text-zinc-900'}`}>{day}</span>
                  {dayExams.slice(0, 2).map((e, i) => (
                    <span
                      key={i}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg truncate leading-tight ${
                        isToday ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
                      }`}
                    >
                      {e.subject}
                    </span>
                  ))}
                  {dayExams.length > 2 && (
                    <span className="text-[9px] text-orange-400 font-bold mt-0.5">+{dayExams.length - 2}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming exams sidebar */}
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" /> Upcoming Exams
          </h3>
          {upcoming.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <Calendar size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs font-medium">No upcoming exams</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((exam) => (
                <div key={exam._id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:border-orange-200 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                      {exam.classId?.name || 'Class'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                      exam.date === today ? 'bg-orange-500 text-white' : 'bg-zinc-200 text-zinc-500'
                    }`}>
                      {exam.date === today ? 'Today' : exam.date}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 mb-2">{exam.subject}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <Clock size={11} /> {exam.startTime} · {exam.duration}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <MapPin size={11} /> {exam.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
