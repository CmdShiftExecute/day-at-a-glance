'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Target } from 'lucide-react';
import { getTimeStr } from '@/lib/city-time';

interface AddCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDate: string; // YYYY-MM-DD
  userName: string;
  city: string;
  onAdded: () => void;
}

export function AddCommitmentModal({ isOpen, onClose, activeDate, userName, city, onAdded }: AddCommitmentModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [summary, setSummary] = useState('');
  const [owner, setOwner] = useState(userName);
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const resetForm = () => {
    setTo('');
    setSubject('');
    setSummary('');
    setOwner(userName);
    setDeadline('');
    setSaved(false);
  };

  const handleSubmit = async () => {
    if (!to.trim() || !subject.trim() || !owner.trim() || !deadline) return;
    setSaving(true);
    try {
      const timeStr = getTimeStr(city);

      const res = await fetch('/api/add-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'Emails Sent',
          data: {
            date: activeDate,
            time: timeStr,
            to: to.trim(),
            subject: subject.trim(),
            summary: summary.trim(),
            importance: 'normal',
            commitment: 'yes',
            owner: owner.trim(),
            deadline,
            attachment: 'no',
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSaved(true);
        onAdded();
        setTimeout(() => {
          resetForm();
          onClose();
        }, 600);
      }
    } catch {}
    setSaving(false);
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-white/10 focus:border-blue-500/50 transition-colors';
  const inputStyle = { background: 'var(--glass-bg)', color: 'var(--text-primary)' };
  const labelClass = 'text-xs font-medium mb-1.5 block';
  const labelStyle = { color: 'var(--text-muted)' };

  return (
    <AnimatePresence onExitComplete={resetForm}>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="glass-static rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent-amber) 15%, transparent)' }}
                  >
                    <Target className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
                  </div>
                  <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>Add Commitment</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* To */}
              <div className="mb-4">
                <label className={labelClass} style={labelStyle}>To (who owes the commitment) *</label>
                <input
                  type="text"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  placeholder="Person or team name"
                  className={inputClass}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Subject */}
              <div className="mb-4">
                <label className={labelClass} style={labelStyle}>Subject *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What was committed?"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Summary */}
              <div className="mb-4">
                <label className={labelClass} style={labelStyle}>Summary</label>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Brief description of the commitment..."
                  rows={2}
                  className={`${inputClass} resize-y`}
                  style={{ ...inputStyle, minHeight: '60px' }}
                />
              </div>

              {/* Owner + Deadline row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className={labelClass} style={labelStyle}>Owner (who acts) *</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    placeholder={userName || 'Owner name'}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Deadline *</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!to.trim() || !subject.trim() || !owner.trim() || !deadline || saving}
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saved
                    ? 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))'
                    : 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))',
                  color: 'white',
                }}
              >
                {saved ? <><Check className="w-4 h-4" /> Added!</> : saving ? 'Adding...' : 'Add Commitment'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
