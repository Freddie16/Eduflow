/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Mail, Users, UserX } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { AddUserModal } from '../components/AddUserModal';
import api from '../api';

export function ParentsView() {
  const { user: currentUser } = useAuth();
  const [parents, setParents]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchParents = () => {
    api.get('/users?role=parent')
      .then((d: any) => setParents(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchParents(); }, []);

  const handleCreated = (newUser: any) => setParents((prev) => [newUser, ...prev]);

  const filtered = parents.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canAdd = ['principal', 'deputy'].includes(currentUser?.role || '');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Parents & Guardians</h2>
          <p className="text-sm text-zinc-500 font-medium">{parents.length} registered parents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder="Search parents..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm" />
          </div>
          {canAdd && (
            <button onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              <Plus size={18} /> Add Parent
            </button>
          )}
        </div>
      </div>

      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCreated={handleCreated} defaultRole="parent" />

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
                  <span className="inline-flex items-center px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[9px] font-black rounded-lg uppercase tracking-widest">
                    Parent
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                <MoreVertical size={16} className="text-zinc-400" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-500">
                <Mail size={13} className="text-zinc-400 shrink-0" />
                <span className="truncate">{parent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <Users size={13} className="text-zinc-400 shrink-0" />
                <span>{parent.studentIds?.length || 0} linked student{parent.studentIds?.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Linked students */}
            {parent.studentIds?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Children</p>
                <div className="flex flex-wrap gap-1.5">
                  {parent.studentIds.slice(0, 3).map((sid: any) => (
                    <span key={typeof sid === 'object' ? sid._id : sid}
                      className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg">
                      {typeof sid === 'object' ? `${sid.firstName} ${sid.lastName}` : 'Student'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          <UserX size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No parents registered yet</p>
          {canAdd && (
            <button onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-2xl text-sm font-bold hover:bg-orange-600 transition-all">
              Add First Parent
            </button>
          )}
        </div>
      )}
    </div>
  );
}
