/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Shield, BookOpen, UserX } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AddUserModal } from '../components/AddUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ActionMenu } from '../components/ActionMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Role } from '../types';
import api from '../api';

const ROLE_BADGES: Record<string, string> = {
  deputy:  'bg-purple-100 text-purple-700',
  teacher: 'bg-blue-100 text-blue-700',
};

export function StaffView() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [addRole, setAddRole]         = useState<Role>('teacher');
  const [editTarget, setEditTarget]   = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting]       = useState(false);

  const fetchStaff = () =>
    Promise.all([api.get('/users?role=teacher'), api.get('/users?role=deputy')])
      .then(([t, d]: any) => setStaff([...t.data, ...d.data]))
      .catch(console.error).finally(() => setLoading(false));

  useEffect(() => { fetchStaff(); }, []);

  const handleUpdated = (updated: any) =>
    setStaff((prev) => prev.map((s) => s._id === updated._id ? { ...s, ...updated } : s));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      setStaff((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(false); }
  };

  const filtered = staff.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = currentUser?.role === 'principal';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Staff</h2>
          <p className="text-sm text-zinc-500">{staff.length} staff members</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm" />
          </div>
          {canManage && (
            <>
              <button onClick={() => { setAddRole('teacher'); setIsAddOpen(true); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200">
                <Plus size={18} /> Add Teacher
              </button>
              <button onClick={() => { setAddRole('deputy'); setIsAddOpen(true); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 text-white rounded-2xl text-sm font-bold hover:bg-purple-600 shadow-lg shadow-purple-200">
                <Plus size={18} /> Add Deputy
              </button>
            </>
          )}
        </div>
      </div>

      <AddUserModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreated={(u) => setStaff((p) => [u, ...p])} defaultRole={addRole} />
      <EditUserModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} onUpdated={handleUpdated} user={editTarget} />
      <ConfirmDialog
        isOpen={!!deleteTarget} loading={deleting}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${deleteTarget?.firstName} ${deleteTarget?.lastName}?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />

      <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Staff Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Class</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((member) => (
                <tr key={member._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-black rounded-xl uppercase w-fit ${ROLE_BADGES[member.role] || 'bg-zinc-100 text-zinc-600'}`}>
                        <Shield size={10} /> {member.role}
                      </span>
                      {member.isClassTeacher && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase w-fit">
                          <BookOpen size={9} /> Class Teacher
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {member.assignedClass
                      ? <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-xl">{member.assignedClass.name}</span>
                      : <span className="text-xs text-zinc-300">—</span>}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs text-zinc-500"><Mail size={14} />{member.email}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-xl ${member.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <ActionMenu
                      disabled={!canManage}
                      onEdit={() => setEditTarget(member)}
                      onDelete={() => setDeleteTarget(member)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <UserX size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No staff found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}