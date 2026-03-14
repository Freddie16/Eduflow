/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Globe, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

export function SettingsView() {
  const { user, school } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'school'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${user?.id}`, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (passwords.newPass !== passwords.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      // In a real app you'd have a dedicated /auth/change-password endpoint
      await api.put(`/users/${user?.id}`, { password: passwords.newPass });
      setPasswords({ current: '', newPass: '', confirm: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: <User size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    ...(user?.role === 'principal' ? [{ id: 'school', label: 'School', icon: <Globe size={16} /> }] : []),
  ] as const;

  const inputCls = 'w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all';

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Settings</h2>
        <p className="text-sm text-zinc-500 font-medium">Manage your account and school preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-100 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><User size={20} /></div>
            Personal Information
          </h3>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-2xl shadow-sm">
              {user?.firstName[0]}{user?.lastName[0]}
            </div>
            <div>
              <p className="font-bold text-zinc-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-zinc-400 capitalize">{user?.role} · {school?.name}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">First Name</label>
                <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Name</label>
                <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Role</label>
              <input type="text" value={user?.role || ''} readOnly className={`${inputCls} opacity-50 cursor-not-allowed capitalize`} />
            </div>

            <button type="submit" disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                saved ? 'bg-emerald-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200'
              } disabled:opacity-50`}>
              <Save size={16} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Shield size={20} /></div>
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-5">
            {pwError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{pwError}</div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Current Password</label>
              <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••" className={inputCls} required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="Min. 6 characters" className={`${inputCls} pr-12`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="••••••••" className={inputCls} required />
            </div>
            <button type="submit" disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                saved ? 'bg-emerald-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200'
              } disabled:opacity-50`}>
              <Shield size={16} /> {saving ? 'Updating...' : saved ? '✓ Updated!' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* School Tab — principal only */}
      {activeTab === 'school' && user?.role === 'principal' && (
        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Globe size={20} /></div>
            School Information
          </h3>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">School Name</label>
                <input type="text" defaultValue={school?.name} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subdomain</label>
                <input type="text" defaultValue={school?.subdomain} className={`${inputCls} opacity-50 cursor-not-allowed`} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Currency</label>
                <input type="text" defaultValue={school?.settings?.currency} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Timezone</label>
                <input type="text" defaultValue={school?.settings?.timeZone} className={inputCls} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subscription Status</label>
              <div className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                school?.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                school?.subscriptionStatus === 'trial'  ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>{school?.subscriptionStatus}</div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-orange-200 transition-all">
              <Save size={16} /> Save School Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
