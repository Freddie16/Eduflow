/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';

// Import views (we'll create these next)
import { DashboardView } from '../views/DashboardView';
import { LessonsView } from '../views/LessonsView';
import { ExamsView } from '../views/ExamsView';
import { AttendanceView } from '../views/AttendanceView';
import { FinanceView } from '../views/FinanceView';
import { ClassesView } from '../views/ClassesView';
import { StudentsView } from '../views/StudentsView';
import { StaffView } from '../views/StaffView';
import { ParentsView } from '../views/ParentsView';
import { ScheduleView } from '../views/ScheduleView';
import { SettingsView } from '../views/SettingsView';
import { AnalysisView } from '../views/AnalysisView';

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'lessons':
        return <LessonsView />;
      case 'exams':
        return <ExamsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'finance':
        return <FinanceView />;
      case 'classes':
        return <ClassesView />;
      case 'students':
        return <StudentsView />;
      case 'staff':
        return <StaffView />;
      case 'parents':
        return <ParentsView />;
      case 'schedule':
        return <ScheduleView />;
      case 'analysis':
        return <AnalysisView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p>The {activeTab} module is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-20 border-b border-zinc-200 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h1 className="text-xl font-bold capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-6">
            <div className="text-xs font-medium text-zinc-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
