/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { NotificationProvider } from './NotificationContext';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';

type Screen = 'login' | 'register';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <DashboardLayout />;

  if (screen === 'register') {
    return (
      <RegisterView
        onBackToLogin={() => setScreen('login')}
        onRegistered={() => {
          // AuthContext will pick up the token set by RegisterView and re-render
          window.location.reload();
        }}
      />
    );
  }

  return <LoginView onRegister={() => setScreen('register')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
