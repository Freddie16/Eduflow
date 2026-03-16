/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, title, message, confirmLabel = 'Delete',
  onConfirm, onCancel, loading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white border border-zinc-200 rounded-[32px] shadow-2xl p-8 text-center">

            <button onClick={onCancel} className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-xl text-zinc-400">
              <X size={18} />
            </button>

            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-red-500" />
            </div>

            <h3 className="text-lg font-black text-zinc-900 mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 mb-8">{message}</p>

            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-3 border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-500 hover:bg-zinc-50 transition-colors">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={loading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold transition-colors disabled:opacity-50">
                {loading ? 'Deleting...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}