/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Reminder } from './types';
import api from './api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchReminders = useCallback(async () => {
    if (!user) return;
    try {
      const data: any = await api.get('/reminders');
      setReminders(
        data.data.map((r: any) => ({
          id: r._id,
          userId: r.userId,
          title: r.title,
          description: r.description,
          date: r.date,
          isRead: r.isRead,
          type: r.type,
        }))
      );
    } catch {
      // Silently fail if reminders endpoint is unavailable
    }
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    try {
      const data: any = await api.post('/reminders', reminder);
      const r = data.data;
      setReminders((prev) => [
        { id: r._id, userId: r.userId, title: r.title, description: r.description, date: r.date, isRead: r.isRead, type: r.type },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/reminders/${id}/read`);
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)));
    } catch (err) {
      console.error('Failed to mark reminder as read:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ reminders, addReminder, markAsRead, refetch: fetchReminders }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
