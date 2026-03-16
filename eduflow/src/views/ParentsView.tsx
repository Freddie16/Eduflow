/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Users, UserX } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AddUserModal } from '../components/AddUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { ActionMenu } from '../components/ActionMenu';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LinkModal } from '../components/LinkModal';
import api from '../api';

export function ParentsView() {
  const { user: currentUser } = useAuth();
  const [parents, setParents]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isLinkOpen, setIsLinkOpen]   = useState(false);
  const [linkSeed, setLinkSeed]       = useState<any>(null);

  const fetchParents = () =>
    api.get('/users?role=parent').then((d: any) => setParents(d.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { fetchParents(); }, []);

  const handleUpdated = (updated: any) =>
    setParents((prev) => prev.map((p) => p._id === updated._id ? { ...p, ...updated } : p));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget._id}`);
      setParents((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(false); }
  };

  const filtered = parents.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canManage = ['principal', 'deputy'].includes(currentUser?.role || '');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Parents & Guardians</h2>
          <p className="text-sm text-zinc-500">{parents.length} registered</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search parents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm" />
          </div>
          {canManage && (
            <>
              <button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 shadow-lg shadow-orange-200">
                <Plus size={18} /> Add Parent
              </button>
              <button onClick={() => { setLinkSeed(null); setIsLinkOpen(true); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-2xl text-sm font-bold hover:bg-zinc-700 shadow-lg transition-all">
                🔗 Manage Links
              </button>
            </>
          )}
        </div>
      </div>

      <AddUserModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onCreated={(u) => setParents((p) => [u, ...p])} defaultRole="parent" />
      <EditUserModal isOpen={!!editTarget} onClose={() => setEditTarget(null)} onUpdated={handleUpdated} user={editTarget} />
      <LinkModal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)}
        seedUser={linkSeed || undefined} seedType={linkSeed ? 'parent' : undefined} onLinked={fetchParents} />
      <ConfirmDialog
        isOpen={!!deleteTarget} loading={deleting}
        title="Remove Parent"
        message={`Remove ${deleteTarget?.firstName} ${deleteTarget?.lastName} from the system?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((parent) => (
          <div key={parent._id} className="bg-white border border-zinc-200 rounded-[28px] p-6 hover:border-orange-200 transition-all shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-lg">
                  {parent.firstName[0]}{parent.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{parent.firstName} {parent.lastName}</p>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-black rounded-lg uppercase tracking-widest">Parent</span>
                </div>
              </div>
              <ActionMenu
                disabled={!canManage}
                onEdit={() => setEditTarget(parent)}
                onDelete={() => setDeleteTarget(parent)}
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-500"><Mail size={13} className="text-zinc-400 shrink-0" /><span className="truncate">{parent.email}</span></div>
              <div className="flex items-center gap-2 text-zinc-500"><Users size={13} className="text-zinc-400 shrink-0" />{parent.studentIds?.length || 0} linked student{parent.studentIds?.length !== 1 ? 's' : ''}</div>
            </div>
            {canManage && (
              <button onClick={() => { setLinkSeed(parent); setIsLinkOpen(true); }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">
                🔗 Link / Manage Children
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          <UserX size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No parents found</p>
          {canManage && <button onClick={() => setIsAddOpen(true)} className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600">Add First Parent</button>}
        </div>
      )}
    </div>
  );
}