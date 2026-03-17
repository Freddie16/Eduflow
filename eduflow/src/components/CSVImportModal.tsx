/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, X, FileText, CheckCircle2, AlertCircle,
  Download, Info, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../api';

// ── CSV templates ─────────────────────────────────────────────────────────────
const TEMPLATES: Record<string, { headers: string[]; example: string[][] }> = {
  Students: {
    headers: ['firstName', 'lastName', 'email', 'password'],
    example: [
      ['Kevin', 'Kamau', 'k.kamau@school.edu', 'EduFlow@123'],
      ['Alice', 'Wanjiku', 'a.wanjiku@school.edu', 'EduFlow@123'],
    ],
  },
  Staff: {
    headers: ['firstName', 'lastName', 'email', 'role', 'password'],
    example: [
      ['Mary', 'Wanjiku', 'm.wanjiku@school.edu', 'teacher', 'EduFlow@123'],
      ['Ann', 'Chebet', 'a.chebet@school.edu', 'deputy', 'EduFlow@123'],
    ],
  },
  Parents: {
    headers: ['firstName', 'lastName', 'email', 'password'],
    example: [
      ['Peter', 'Kamau', 'p.kamau@gmail.com', 'EduFlow@123'],
      ['Susan', 'Waweru', 's.waweru@gmail.com', 'EduFlow@123'],
    ],
  },
  Classes: {
    headers: ['name', 'grade'],
    example: [
      ['Grade 7A', '7'],
      ['Grade 8B', '8'],
    ],
  },
  Exams: {
    headers: ['subject', 'date', 'startTime', 'duration', 'location'],
    example: [
      ['Mathematics', '2026-04-07', '08:00', '2h', 'Main Hall'],
      ['English', '2026-04-08', '08:00', '2h', 'Main Hall'],
    ],
  },
  Lessons: {
    headers: ['title', 'body'],
    example: [
      ['Introduction to Algebra', 'Algebra covers variables and equations.'],
    ],
  },
};

// ── Per-title API call ────────────────────────────────────────────────────────
async function importRow(title: string, row: Record<string, string>): Promise<void> {
  switch (title) {
    case 'Students':
      await api.post('/users', { ...row, role: 'student' });
      break;
    case 'Staff':
      await api.post('/users', row);
      break;
    case 'Parents':
      await api.post('/users', { ...row, role: 'parent' });
      break;
    case 'Classes':
      await api.post('/classes', row);
      break;
    case 'Exams':
      // Exams require a classId — we skip if not provided; user should add via UI instead
      if (!row.classId) throw new Error('classId required for exams — use the Exams page instead');
      await api.post('/exams', row);
      break;
    case 'Lessons':
      if (!row.classId) throw new Error('classId required for lessons');
      await api.post('/lessons', { classId: row.classId, title: row.title, content: { body: row.body } });
      break;
    default:
      throw new Error(`Unknown import type: ${title}`);
  }
}

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

// ── Template downloader ───────────────────────────────────────────────────────
function downloadTemplate(title: string) {
  const tpl = TEMPLATES[title];
  if (!tpl) return;
  const rows = [tpl.headers, ...tpl.example];
  const csv  = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${title.toLowerCase()}-template.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Types ─────────────────────────────────────────────────────────────────────
type RowResult = { row: Record<string, string>; status: 'pending' | 'ok' | 'error'; error?: string };
type Phase = 'idle' | 'preview' | 'importing' | 'done';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  title: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CSVImportModal({ isOpen, onClose, onImport, title }: CSVImportModalProps) {
  const [file, setFile]         = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase]       = useState<Phase>('idle');
  const [rows, setRows]         = useState<RowResult[]>([]);
  const [current, setCurrent]   = useState(0);
  const fileInputRef            = useRef<HTMLInputElement>(null);

  const tpl = TEMPLATES[title];

  const reset = () => {
    setFile(null); setPhase('idle'); setRows([]); setCurrent(0);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target?.result as string);
      setRows(parsed.map((row) => ({ row, status: 'pending' })));
      setPhase('preview');
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    setPhase('importing');
    setCurrent(0);
    const results: RowResult[] = rows.map((r) => ({ ...r, status: 'pending' }));
    setRows([...results]);

    for (let i = 0; i < results.length; i++) {
      setCurrent(i + 1);
      try {
        await importRow(title, results[i].row);
        results[i] = { ...results[i], status: 'ok' };
      } catch (err: any) {
        results[i] = { ...results[i], status: 'error', error: err.message || 'Failed' };
      }
      setRows([...results]);
    }

    setPhase('done');
    const succeeded = results.filter((r) => r.status === 'ok').map((r) => r.row);
    onImport(succeeded);
  };

  const okCount    = rows.filter((r) => r.status === 'ok').length;
  const errorCount = rows.filter((r) => r.status === 'error').length;
  const pct        = rows.length > 0 ? Math.round((current / rows.length) * 100) : 0;

  // header keys to display (first 4 max)
  const displayKeys = rows[0] ? Object.keys(rows[0].row).slice(0, 4) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={phase === 'importing' ? undefined : handleClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md" />

          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Upload size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Import {title}</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {phase === 'idle'     && 'Upload a CSV file to bulk-create records'}
                    {phase === 'preview'  && `${rows.length} rows ready to import`}
                    {phase === 'importing'&& `Importing ${current} of ${rows.length}…`}
                    {phase === 'done'     && `Done — ${okCount} created, ${errorCount} failed`}
                  </p>
                </div>
              </div>
              {phase !== 'importing' && (
                <button onClick={handleClose} className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-8 space-y-6">

              {/* ── IDLE: drop zone ── */}
              {phase === 'idle' && (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[28px] p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isDragging ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 hover:border-orange-300 hover:bg-zinc-50'
                    }`}
                  >
                    <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} accept=".csv" className="hidden" />
                    <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-5 text-zinc-400">
                      <Upload size={30} />
                    </div>
                    <p className="text-sm font-black text-zinc-900 mb-1">Drop your CSV here or click to browse</p>
                    <p className="text-xs text-zinc-400">CSV files only</p>
                  </div>

                  {/* Template hint */}
                  {tpl && (
                    <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-600 uppercase tracking-widest">
                        <Info size={14} className="text-orange-500" /> Required columns
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tpl.headers.map((h) => (
                          <span key={h} className="px-3 py-1 bg-white border border-zinc-200 rounded-xl text-[11px] font-bold text-zinc-600">
                            {h}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => downloadTemplate(title)}
                        className="flex items-center gap-2 text-[11px] font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest mt-1">
                        <Download size={13} /> Download template CSV
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── PREVIEW: show parsed rows ── */}
              {phase === 'preview' && rows.length > 0 && (
                <>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-white">
                            <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">#</th>
                            {displayKeys.map((k) => (
                              <th key={k} className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{k}</th>
                            ))}
                            {Object.keys(rows[0].row).length > 4 && (
                              <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">…</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {rows.slice(0, 8).map((r, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="px-4 py-3 text-zinc-400 font-bold">{i + 1}</td>
                              {displayKeys.map((k) => (
                                <td key={k} className="px-4 py-3 text-zinc-700 font-medium truncate max-w-[120px]">{r.row[k]}</td>
                              ))}
                              {Object.keys(r.row).length > 4 && <td className="px-4 py-3 text-zinc-300">…</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {rows.length > 8 && (
                      <div className="px-4 py-3 border-t border-zinc-100 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        …and {rows.length - 8} more rows
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl text-sm text-orange-700">
                    <Info size={16} className="shrink-0" />
                    <span><strong>{rows.length} rows</strong> detected. Review above then click Import to create them.</span>
                  </div>
                </>
              )}

              {/* ── IMPORTING: live progress ── */}
              {phase === 'importing' && (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-500">
                      <span>Importing row {current} of {rows.length}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} />
                    </div>
                  </div>

                  {/* Row results */}
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {rows.map((r, i) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all ${
                        r.status === 'ok'      ? 'bg-emerald-50 border border-emerald-100' :
                        r.status === 'error'   ? 'bg-red-50 border border-red-100' :
                        i === current - 1      ? 'bg-orange-50 border border-orange-100' :
                                                 'bg-zinc-50 border border-zinc-100'
                      }`}>
                        <span className="font-black text-zinc-400 w-5 shrink-0">{i + 1}</span>
                        <span className="flex-1 text-zinc-700 truncate">
                          {r.row.firstName ? `${r.row.firstName} ${r.row.lastName}` : r.row.name || r.row.subject || r.row.title || JSON.stringify(r.row).slice(0, 40)}
                        </span>
                        {r.status === 'ok'      && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                        {r.status === 'error'   && <span className="text-red-500 font-bold shrink-0 text-[10px]">{r.error}</span>}
                        {r.status === 'pending' && i === current - 1 && <Loader2 size={14} className="text-orange-500 animate-spin shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── DONE: summary ── */}
              {phase === 'done' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                      <p className="text-3xl font-black text-emerald-600">{okCount}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Created</p>
                    </div>
                    <div className={`p-5 border rounded-2xl text-center ${errorCount > 0 ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
                      <p className={`text-3xl font-black ${errorCount > 0 ? 'text-red-500' : 'text-zinc-300'}`}>{errorCount}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${errorCount > 0 ? 'text-red-400' : 'text-zinc-400'}`}>Failed</p>
                    </div>
                  </div>

                  {/* Show errors */}
                  {errorCount > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {rows.filter((r) => r.status === 'error').map((r, i) => (
                        <div key={i} className="flex items-start gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs">
                          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                          <span className="text-zinc-600 flex-1 truncate">
                            {r.row.firstName ? `${r.row.firstName} ${r.row.lastName}` : r.row.name || r.row.subject || 'Row'}
                          </span>
                          <span className="text-red-500 font-bold">{r.error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 shrink-0 flex items-center justify-between gap-4">
              {phase === 'idle' && (
                <>
                  <button onClick={handleClose} className="px-6 py-3 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-all">
                    Cancel
                  </button>
                  <p className="text-xs text-zinc-400 flex-1 text-center">No file selected</p>
                </>
              )}

              {phase === 'preview' && (
                <>
                  <button onClick={reset} className="px-6 py-3 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-all">
                    ← Choose Different File
                  </button>
                  <button onClick={handleImport}
                    className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-200 flex items-center justify-center gap-2 transition-all">
                    <ChevronRight size={16} /> Import {rows.length} Rows
                  </button>
                </>
              )}

              {phase === 'importing' && (
                <div className="flex-1 flex items-center justify-center gap-3 text-sm font-bold text-zinc-500">
                  <Loader2 size={18} className="animate-spin text-orange-500" />
                  Please wait — do not close this window
                </div>
              )}

              {phase === 'done' && (
                <button onClick={handleClose}
                  className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all">
                  Done
                </button>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}