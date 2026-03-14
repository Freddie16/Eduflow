/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, ArrowRight, ArrowLeft, Building2, User, Globe, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

interface RegisterViewProps {
  onBackToLogin: () => void;
  onRegistered: () => void;
}

const CURRENCIES = ['KES', 'USD', 'GBP', 'EUR', 'UGX', 'TZS', 'NGN', 'ZAR'];
const TIMEZONES  = [
  'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg',
  'Africa/Cairo',   'America/New_York', 'America/Los_Angeles',
  'Europe/London',  'Europe/Paris',     'Asia/Dubai',
];

type Step = 'school' | 'principal' | 'done';

export function RegisterView({ onBackToLogin, onRegistered }: RegisterViewProps) {
  const [step, setStep] = useState<Step>('school');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // School fields
  const [schoolName, setSchoolName] = useState('');
  const [subdomain,  setSubdomain]  = useState('');
  const [currency,   setCurrency]   = useState('KES');
  const [timeZone,   setTimeZone]   = useState('Africa/Nairobi');

  // Principal fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');

  // Auto-generate subdomain from school name
  const handleSchoolNameChange = (val: string) => {
    setSchoolName(val);
    setSubdomain(
      val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    );
  };

  const handleSchoolNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!schoolName.trim() || !subdomain.trim()) {
      setError('School name and subdomain are required.');
      return;
    }
    setStep('principal');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const data: any = await api.post('/auth/register-school', {
        schoolName, subdomain, currency, timeZone,
        firstName, lastName, email, password,
      });
      // Store token from registration
      localStorage.setItem('edu_token', data.token);
      setStep('done');
      setTimeout(onRegistered, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%]  w-[40%] h-[40%] bg-blue-500/20  blur-[120px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-5 shadow-xl shadow-orange-500/20">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">Register Your School</h1>
          <p className="text-zinc-500 text-sm">Set up your EduFlow SaaS account in two steps</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(['school', 'principal'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                step === s ? 'text-orange-500' : step === 'done' || (s === 'school' && step === 'principal') ? 'text-emerald-500' : 'text-zinc-300'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black transition-all ${
                  step === s ? 'bg-orange-500' : step === 'done' || (s === 'school' && step === 'principal') ? 'bg-emerald-500' : 'bg-zinc-200'
                }`}>
                  {step === 'done' || (s === 'school' && step === 'principal') ? '✓' : i + 1}
                </div>
                {s === 'school' ? 'School Info' : 'Principal Account'}
              </div>
              {i === 0 && <div className={`flex-1 max-w-[60px] h-0.5 rounded-full transition-all ${step !== 'school' ? 'bg-emerald-400' : 'bg-zinc-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Step 1: School Info ────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {step === 'school' && (
              <motion.form key="school" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSchoolNext} className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Building2 size={20} /></div>
                  <div>
                    <h2 className="font-bold text-zinc-900">School Information</h2>
                    <p className="text-xs text-zinc-400">Tell us about your school</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">School Name</label>
                  <input type="text" value={schoolName} onChange={(e) => handleSchoolNameChange(e.target.value)}
                    placeholder="e.g. Nairobi Academy" className={inputCls} required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subdomain</label>
                  <div className="relative">
                    <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="nairobi-academy" className={`${inputCls} pr-32`} required />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium whitespace-nowrap">.eduflow.com</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Only lowercase letters, numbers, and hyphens.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Time Zone</label>
                    <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className={inputCls}>
                      {TIMEZONES.map((t) => <option key={t} value={t}>{t.split('/')[1].replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group mt-2">
                  Next: Principal Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            )}

            {/* ── Step 2: Principal Account ──────────────────────────────── */}
            {step === 'principal' && (
              <motion.form key="principal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister} className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><User size={20} /></div>
                  <div>
                    <h2 className="font-bold text-zinc-900">Principal Account</h2>
                    <p className="text-xs text-zinc-400">This will be the school admin account</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="James" className={inputCls} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Mwangi" className={inputCls} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="principal@school.edu" className={inputCls} required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className={inputCls} required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                  <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className={inputCls} required />
                </div>

                {/* Review summary */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs space-y-1.5">
                  <p className="font-black text-zinc-500 uppercase tracking-widest mb-2">Review</p>
                  <div className="flex justify-between"><span className="text-zinc-400">School</span><span className="font-bold text-zinc-700">{schoolName}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Subdomain</span><span className="font-bold text-zinc-700">{subdomain}.eduflow.com</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Currency</span><span className="font-bold text-zinc-700">{currency}</span></div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setStep('school'); setError(''); }}
                    className="flex items-center gap-2 px-5 py-3 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-all">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? 'Creating School...' : 'Create School & Account'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Done ─────────────────────────────────────────────────────── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900">School Created!</h2>
                <p className="text-zinc-500 text-sm">
                  <strong>{schoolName}</strong> is ready.<br />
                  Redirecting to your dashboard…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step !== 'done' && (
          <p className="text-center mt-6 text-zinc-500 text-xs">
            Already have an account?{' '}
            <button onClick={onBackToLogin} className="text-orange-500 hover:underline font-semibold">Sign In</button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
