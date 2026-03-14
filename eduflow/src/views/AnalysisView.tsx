/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

export function AnalysisView() {
  const { user } = useAuth();
  const [results, setResults]   = useState<any[]>([]);
  const [exams, setExams]       = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/exams/results'),
      api.get('/exams'),
      api.get('/attendance'),
    ]).then(([r, e, a]: any) => {
      setResults(r.data);
      setExams(e.data);
      setAttendance(a.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  // Grade distribution
  const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  results.forEach((r) => { if (gradeCounts[r.grade] !== undefined) gradeCounts[r.grade]++; });
  const totalResults = results.length;

  // Subject averages
  const subjectMap: Record<string, { total: number; count: number }> = {};
  results.forEach((r) => {
    const subject = r.examId?.subject || 'Unknown';
    if (!subjectMap[subject]) subjectMap[subject] = { total: 0, count: 0 };
    subjectMap[subject].total += (r.score / r.totalMarks) * 100;
    subjectMap[subject].count++;
  });
  const subjectAverages = Object.entries(subjectMap).map(([subject, { total, count }]) => ({
    subject,
    avg: Math.round(total / count),
  })).sort((a, b) => b.avg - a.avg);

  // Attendance rate
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  // Overall average
  const overallAvg = totalResults > 0
    ? Math.round(results.reduce((s, r) => s + (r.score / r.totalMarks) * 100, 0) / totalResults)
    : 0;

  const GRADE_COLORS: Record<string, string> = {
    A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-orange-400', D: 'bg-orange-600', F: 'bg-red-500',
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Analysis & Reports</h2>
        <p className="text-sm text-zinc-500 font-medium">School performance insights and trends.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <SummaryCard title="Overall Average" value={`${overallAvg}%`} icon={<TrendingUp size={20} />} color="orange" sub={`${totalResults} results`} />
        <SummaryCard title="Total Exams"     value={exams.length.toString()}   icon={<BookOpen size={20} />}   color="blue"   sub="Across all classes" />
        <SummaryCard title="Attendance Rate" value={`${attendanceRate}%`}      icon={<Users size={20} />}      color="zinc"   sub={`${attendance.length} records`} />
        <SummaryCard title="Top Grade (A)"   value={gradeCounts.A.toString()}  icon={<Award size={20} />}      color="orange" sub={totalResults > 0 ? `${Math.round((gradeCounts.A / totalResults) * 100)}% of results` : ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Distribution */}
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Grade Distribution</h3>
          {totalResults === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No results available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(gradeCounts).map(([grade, count]) => {
                const pct = totalResults > 0 ? Math.round((count / totalResults) * 100) : 0;
                return (
                  <div key={grade} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-zinc-700">Grade {grade}</span>
                      <span className="font-bold text-zinc-500">{count} students ({pct}%)</span>
                    </div>
                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${GRADE_COLORS[grade]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subject Performance */}
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Subject Performance</h3>
          {subjectAverages.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {subjectAverages.map(({ subject, avg }) => (
                <div key={subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-zinc-700 truncate max-w-[60%]">{subject}</span>
                    <span className={`font-black ${avg >= 75 ? 'text-emerald-600' : avg >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{avg}%</span>
                  </div>
                  <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${avg >= 75 ? 'bg-emerald-500' : avg >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance breakdown */}
      <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-6">Attendance Breakdown</h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Present', count: presentCount,                                           color: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Absent',  count: attendance.filter((a) => a.status === 'absent').length, color: 'bg-red-500',     textColor: 'text-red-700',     bg: 'bg-red-50' },
            { label: 'Late',    count: attendance.filter((a) => a.status === 'late').length,   color: 'bg-orange-500',  textColor: 'text-orange-700',  bg: 'bg-orange-50' },
          ].map(({ label, count, color, textColor, bg }) => {
            const pct = attendance.length > 0 ? Math.round((count / attendance.length) * 100) : 0;
            return (
              <div key={label} className={`p-6 rounded-2xl ${bg} text-center`}>
                <p className={`text-3xl font-black ${textColor}`}>{count}</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
                <p className={`text-sm font-black ${textColor} mt-2`}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color, sub }: { title: string; value: string; icon: React.ReactNode; color: string; sub: string }) {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-100 text-orange-600',
    blue:   'bg-blue-100 text-blue-600',
    zinc:   'bg-zinc-100 text-zinc-600',
  };
  return (
    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] hover:border-orange-200 transition-all shadow-sm group">
      <div className={`p-3 rounded-2xl w-fit mb-6 ${colorMap[color] || colorMap.zinc}`}>{icon}</div>
      <div className="space-y-1.5">
        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{title}</h4>
        <div className="text-3xl font-black text-zinc-900 tracking-tight">{value}</div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}
