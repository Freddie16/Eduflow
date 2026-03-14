/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Role } from '../types';
import { GraduationCap, ArrowRight, ShieldCheck, Globe, Lock, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ROLES: { value: Role; label: string; emoji: string }[] = [
  { value: 'principal', label: 'Principal', emoji: '🏛️' },
  { value: 'deputy', label: 'Deputy Principal', emoji: '📋' },
  { value: 'teacher', label: 'Teacher', emoji: '📚' },
  { value: 'student', label: 'Student', emoji: '🎓' },
  { value: 'parent', label: 'Parent / Guardian', emoji: '👨‍👩‍👧' },
];

const DEMO_ACCOUNTS = [
  { label: 'Principal', email: 'principal@nairobi.edu', role: 'principal' as Role, subdomain: 'nairobi-academy' },
  { label: 'Deputy', email: 'deputy@nairobi.edu', role: 'deputy' as Role, subdomain: 'nairobi-academy' },
  { label: 'Teacher', email: 'teacher@nairobi.edu', role: 'teacher' as Role, subdomain: 'nairobi-academy' },
  { label: 'Student', email: 'student@nairobi.edu', role: 'student' as Role, subdomain: 'nairobi-academy' },
  { label: 'Parent', email: 'parent@nairobi.edu', role: 'parent' as Role, subdomain: 'nairobi-academy' },
];

interface LoginViewProps {
  onRegister?: () => void;
}

export function LoginView({ onRegister }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('nairobi-academy');
  const [role, setRole] = useState<Role>('student');
  const [localError, setLocalError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password, subdomain, role);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword('password123');
    setRole(account.role);
    setSubdomain(account.subdomain);
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-xl shadow-orange-500/20">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">EduFlow SaaS</h1>
          <p className="text-zinc-500">Multi-tenant School Management System</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence>
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                {localError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* School Subdomain */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Globe size={14} />
                School Subdomain
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="your-school"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">
                  .eduflow.com
                </span>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} />
                I am a...
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-center transition-all ${
                      role === r.value
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-lg leading-none">{r.emoji}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide leading-tight">{r.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-8 border-t border-zinc-100">
            <p className="text-center text-xs text-zinc-500 mb-3">Quick demo login (password: password123):</p>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="text-[10px] bg-zinc-50 hover:bg-orange-50 hover:border-orange-200 border border-zinc-200 py-2 px-3 rounded-lg text-zinc-500 hover:text-orange-600 transition-colors text-left flex items-center justify-between"
                >
                  <span className="font-bold">{acc.label}</span>
                  <span className="opacity-70">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-zinc-500 text-xs">
          Don't have a school account?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="text-orange-500 hover:underline font-semibold"
          >
            Register your school
          </button>
        </p>
      </motion.div>
    </div>
  );
}
