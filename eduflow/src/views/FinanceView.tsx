/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock,
  Download, Filter, Search, ArrowUpRight, ArrowDownRight, Upload, Plus
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { CSVImportModal } from '../components/CSVImportModal';
import { motion } from 'motion/react';
import api from '../api';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  paid:    { label: 'Paid',    color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={14} /> },
  partial: { label: 'Partial', color: 'bg-orange-100 text-orange-700',  icon: <Clock size={14} /> },
  unpaid:  { label: 'Unpaid',  color: 'bg-red-100 text-red-700',        icon: <AlertCircle size={14} /> },
};

export function FinanceView() {
  const { user } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const fetchData = () => {
    api.get('/finance').then((data: any) => {
      setFees(data.data);
      setSummary(data.summary);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handlePayment = async (feeId: string) => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    try {
      await api.patch(`/finance/${feeId}/payment`, { amount });
      setPayingId(null);
      setPayAmount('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = fees.filter((f) => {
    if (!searchQuery) return true;
    const name = f.studentId
      ? `${f.studentId.firstName} ${f.studentId.lastName}`.toLowerCase()
      : '';
    return name.includes(searchQuery.toLowerCase());
  });

  const currency = user?.role !== 'parent' ? 'KES' : 'KES';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Financial Overview</h2>
          <p className="text-sm text-zinc-500 font-medium">Track fee payments, balances, and school revenue.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-2xl text-sm font-black hover:bg-zinc-50 transition-all shadow-sm uppercase tracking-widest"
          >
            <Upload size={18} /> Import CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl text-sm font-black hover:bg-zinc-50 transition-all shadow-sm uppercase tracking-widest">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <CSVImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={() => {}} title="Finance Records" />

      {/* Stats — only for principal/deputy */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Total Expected"
            value={`KES ${(summary.totalExpected / 1000).toFixed(1)}K`}
            icon={<DollarSign size={20} />}
            trend={`${summary.paidCount + summary.partialCount + summary.unpaidCount} fee records`}
            color="orange"
          />
          <StatCard
            title="Total Collected"
            value={`KES ${(summary.totalCollected / 1000).toFixed(1)}K`}
            icon={<ArrowUpRight size={20} />}
            trend={`${summary.paidCount} fully paid`}
            color="emerald"
          />
          <StatCard
            title="Outstanding"
            value={`KES ${(summary.outstanding / 1000).toFixed(1)}K`}
            icon={<ArrowDownRight size={20} />}
            trend={`${summary.unpaidCount} unpaid`}
            color="red"
          />
          <StatCard
            title="Collection Rate"
            value={summary.totalExpected > 0 ? `${Math.round((summary.totalCollected / summary.totalExpected) * 100)}%` : '0%'}
            icon={<TrendingUp size={20} />}
            trend={`${summary.partialCount} partial payments`}
            color="blue"
          />
        </div>
      )}

      {/* Search */}
      {['principal', 'deputy'].includes(user?.role || '') && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Filter size={18} /> Filter
          </button>
        </div>
      )}

      {/* Fee Records Table */}
      <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Term</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Paid</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Balance</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status</th>
                {['principal', 'deputy'].includes(user?.role || '') && (
                  <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((fee) => {
                const balance = fee.totalAmount - fee.paidAmount;
                const paidPct = fee.totalAmount > 0 ? Math.round((fee.paidAmount / fee.totalAmount) * 100) : 0;
                const cfg = STATUS_CONFIG[fee.status] || STATUS_CONFIG.unpaid;

                return (
                  <motion.tr
                    key={fee._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm">
                          {fee.studentId ? `${fee.studentId.firstName[0]}${fee.studentId.lastName[0]}` : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">
                            {fee.studentId ? `${fee.studentId.firstName} ${fee.studentId.lastName}` : 'Unknown'}
                          </p>
                          {fee.lastPaymentDate && (
                            <p className="text-[10px] text-zinc-400">Last paid: {fee.lastPaymentDate}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-zinc-600">{fee.term || '—'}</td>
                    <td className="px-8 py-5 text-sm font-bold text-zinc-900">
                      {fee.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <span className="text-sm font-bold text-emerald-600">{fee.paidAmount.toLocaleString()}</span>
                        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-700"
                            style={{ width: `${paidPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-red-500">
                      {balance > 0 ? balance.toLocaleString() : '—'}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    {['principal', 'deputy'].includes(user?.role || '') && (
                      <td className="px-8 py-5 text-right">
                        {payingId === fee._id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <input
                              type="number"
                              placeholder="Amount"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              className="w-28 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                            <button
                              onClick={() => handlePayment(fee._id)}
                              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
                            >Save</button>
                            <button
                              onClick={() => { setPayingId(null); setPayAmount(''); }}
                              className="px-3 py-2 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold"
                            >×</button>
                          </div>
                        ) : (
                          fee.status !== 'paid' && (
                            <button
                              onClick={() => setPayingId(fee._id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-orange-100 hover:text-orange-600 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ml-auto"
                            >
                              <Plus size={12} /> Record Payment
                            </button>
                          )
                        )}
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-400">
              <DollarSign size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No fee records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string; value: string; icon: React.ReactNode; trend: string; color: string }) {
  const colorMap: Record<string, string> = {
    orange:  'bg-orange-100 text-orange-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red:     'bg-red-100 text-red-500',
    blue:    'bg-blue-100 text-blue-600',
  };
  return (
    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] hover:border-orange-200 transition-all shadow-sm group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
      </div>
      <div className="space-y-2">
        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{title}</h4>
        <div className="text-3xl font-black text-zinc-900 tracking-tight">{value}</div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{trend}</p>
      </div>
    </div>
  );
}
