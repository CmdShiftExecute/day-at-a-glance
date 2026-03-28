'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock } from 'lucide-react';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDate: string; // YYYY-MM-DD
  userName: string;
  onAdded: () => void;
}

export function AddScheduleModal({ isOpen, onClose, activeDate, userName, onAdded }: AddScheduleModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<'meeting' | 'task' | 'break' | 'focus' | 'travel'>('meeting');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const resetForm = () => {
    setTitle('');
    setTime('');
    setEndTime('');
    setType('meeting');
    setDescription('');
    setSaved(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !time || !endTime) return;
    setSaving(true);
    try {
      // Write to Schedule sheet
      const scheduleRes = await fetch('/api/add-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'Schedule',
          data: {
            date: activeDate,
            time,
            endTime,
            title: title.trim(),
            type,
            description: description.trim(),
          },
        }),
      });
      const scheduleResult = await scheduleRes.json();

      // If type is "meeting", also write to Meetings sheet
      if (type === 'meeting' && scheduleResult.success) {
        await fetch('/api/add-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Meetings',
            data: {
              date: activeDate,
              title: title.trim(),
              time,
              endTime,
              organizer: userName || '',
              attendees: '',
              location: '',
              type: 'in-person',
            },
          }),
        });
      }

      if (scheduleResult.success) {
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
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent-blue) 15%, transparent)' }}
                  >
                    <Clock className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>Add Schedule Entry</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className={labelClass} style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Meeting, focus time, break..."
                  className={inputClass}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Start Time *</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>End Time *</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className={labelClass} style={labelStyle}>Type *</label>
                <select value={type} onChange={e => setType(e.target.value as typeof type)} className={inputClass} style={inputStyle}>
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="break">Break</option>
                  <option value="focus">Focus</option>
                  <option value="travel">Travel</option>
                </select>
                {type === 'meeting' && (
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    This will also create an entry in the Meetings sheet.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className={labelClass} style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className={`${inputClass} resize-y`}
                  style={{ ...inputStyle, minHeight: '60px' }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !time || !endTime || saving}
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saved
                    ? 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))'
                    : 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))',
                  color: 'white',
                }}
              >
                {saved ? <><Check className="w-4 h-4" /> Added!</> : saving ? 'Adding...' : 'Add to Schedule'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
