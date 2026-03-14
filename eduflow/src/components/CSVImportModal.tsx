/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  title: string;
  templateUrl?: string;
}

export function CSVImportModal({ isOpen, onClose, onImport, title, templateUrl }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setStatus('idle');
    } else {
      setStatus('error');
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus('uploading');
    
    // Mock CSV parsing
    setTimeout(() => {
      setStatus('success');
      onImport([{ id: Date.now(), name: 'Imported Data' }]); // Mock data
      setTimeout(() => {
        onClose();
        setFile(null);
        setStatus('idle');
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <Upload size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight">Import {title}</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Upload CSV to populate data</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile?.type === 'text/csv') setFile(droppedFile);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDragging ? 'border-orange-500 bg-orange-50/50' : 'border-zinc-200 hover:border-orange-200 hover:bg-zinc-50/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                  file ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-zinc-50 text-zinc-300'
                }`}>
                  {file ? <FileText size={32} /> : <Upload size={32} />}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm font-black text-zinc-900">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium">CSV files only (max. 10MB)</p>
                </div>

                {status === 'uploading' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[32px]">
                    <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4" />
                    <p className="text-sm font-black text-orange-600 uppercase tracking-widest">Processing Data...</p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[32px] text-orange-600">
                    <CheckCircle2 size={48} className="mb-4 animate-in zoom-in" />
                    <p className="text-sm font-black uppercase tracking-widest">Import Successful!</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Info size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-900">Important Note</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    Please ensure your CSV follows the required format. Download the template below to see the expected columns and data types.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest">
                  <Download size={16} />
                  Download Template
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={onClose}
                    className="px-8 py-3.5 rounded-2xl text-xs font-black text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading'}
                    className="px-10 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-orange-200 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Import
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
