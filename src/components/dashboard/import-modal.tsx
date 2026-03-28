'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseExcelFile } from '@/lib/parse-excel';
import { DayData } from '@/lib/types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, DayData>) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus('parsing');
    setMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);

      if (result.errors.length > 0) {
        setStatus('error');
        setMessage(result.errors.join('. '));
      } else {
        setStatus('success');
        setWarnings(result.warnings || []);
        setMessage(`Parsed ${result.rowsParsed} rows across ${Object.keys(result.data).length} day(s)`);
        setTimeout(() => {
          onImport(result.data);
          onClose();
          resetState();
        }, 1500);
      }
    } catch {
      setStatus('error');
      setMessage('Failed to read file');
    }
  }, [onImport, onClose]);

  const resetState = () => {
    setFileName(null);
    setStatus('idle');
    setMessage('');
    setWarnings([]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => { onClose(); resetState(); }}
          />

          {/* Modal */}
          <motion.div
            className="relative glass-static gradient-border rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Close button */}
            <button
              onClick={() => { onClose(); resetState(); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-display font-bold gradient-text mb-1">Import Data</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Upload an Excel (.xlsx) or CSV file with your schedule, tasks, meetings, and emails.
            </p>

            {/* Drop zone */}
            <div
              className="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragging ? 'var(--accent-green)' : 'var(--glass-border)',
                backgroundColor: isDragging ? 'rgba(52,211,153,0.05)' : 'transparent',
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleChange}
              />

              {status === 'idle' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(52,211,153,0.1)' }}>
                    <Upload className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Drop file here or click to browse
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Supports .xlsx, .xls, .csv
                    </p>
                  </div>
                </div>
              )}

              {status === 'parsing' && (
                <div className="flex flex-col items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 animate-pulse" style={{ color: 'var(--accent-blue)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Parsing {fileName}...
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-8 h-8" style={{ color: 'var(--accent-green)' }} />
                  <p className="text-sm" style={{ color: 'var(--accent-green)' }}>{message}</p>
                  {warnings.length > 0 && (
                    <div className="w-full text-left mt-1 p-2 rounded-lg" style={{ backgroundColor: 'rgba(251,191,36,0.08)' }}>
                      <p className="text-[10px] font-semibold mb-1" style={{ color: 'var(--accent-amber)' }}>
                        Date format warnings ({warnings.length}):
                      </p>
                      <div className="max-h-20 overflow-y-auto custom-scrollbar space-y-0.5">
                        {warnings.slice(0, 5).map((w, i) => (
                          <p key={i} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{w}</p>
                        ))}
                        {warnings.length > 5 && (
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>...and {warnings.length - 5} more</p>
                        )}
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--accent-amber)' }}>
                        Use YYYY-MM-DD format for all dates.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center gap-3">
                  <AlertCircle className="w-8 h-8" style={{ color: 'var(--accent-pink)' }} />
                  <p className="text-sm" style={{ color: 'var(--accent-pink)' }}>{message}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); resetState(); }}
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-secondary)' }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>

            {/* Format help */}
            <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--glass-bg)' }}>
              <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Expected Excel Sheets:
              </p>
              <div className="grid grid-cols-2 gap-1">
                {['Schedule', 'Tasks', 'Meetings', 'Emails Inbox', 'Emails Sent'].map(sheet => (
                  <span key={sheet} className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {sheet}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex items-start gap-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-amber)' }} />
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  All date columns must use <strong style={{ color: 'var(--accent-amber)' }}>YYYY-MM-DD</strong> format (e.g. <code className="text-[10px] px-1 rounded" style={{ background: 'var(--glass-bg)' }}>2026-03-28</code>). Other formats like DD/MM or MM/DD are ambiguous and will not be parsed correctly.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
