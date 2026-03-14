/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, School, Role } from './types';
import api from './api';

interface AuthContextType {
  user: User | null;
  school: School | null;
  login: (email: string, password: string, subdomain: string, role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('edu_token');
    if (token) {
      api.get('/auth/me')
        .then((data: any) => {
          setUser(mapUser(data.user));
          setSchool(mapSchool(data.school));
        })
        .catch(() => {
          localStorage.removeItem('edu_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, subdomain: string, role: Role) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: any = await api.post('/auth/login', { email, password, subdomain, role });
      localStorage.setItem('edu_token', data.token);
      setUser(mapUser(data.user));
      setSchool(mapSchool(data.school));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSchool(null);
    localStorage.removeItem('edu_token');
  };

  return (
    <AuthContext.Provider value={{ user, school, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

function mapUser(u: any): User {
  return {
    id: u._id || u.id,
    schoolId: u.schoolId?._id || u.schoolId,
    role: u.role,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    isClassTeacher: u.isClassTeacher,
    assignedClass: u.assignedClass?._id || u.assignedClass,
    parentId: u.parentId?._id || u.parentId,
    studentIds: u.studentIds?.map((s: any) => s._id || s),
  };
}

function mapSchool(s: any): School {
  return {
    id: s._id || s.id,
    name: s.name,
    subdomain: s.subdomain,
    settings: s.settings,
    subscriptionStatus: s.subscriptionStatus,
  };
}
