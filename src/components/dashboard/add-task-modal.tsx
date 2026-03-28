'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ListTodo } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDate: string; // YYYY-MM-DD
  userName: string;
  onAdded: () => void;
}

export function AddTaskModal({ isOpen, onClose, activeDate, userName, onAdded }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [status, setStatus] = useState<'open' | 'done' | 'overdue'>('open');
  const [dueDate, setDueDate] = useState('');
  const [source, setSource] = useState('Manual');
  const [owner, setOwner] = useState(userName);
  const [category, setCategory] = useState('');
  const [taskType, setTaskType] = useState<'action' | 'deadline' | 'followup' | 'personal'>('action');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const resetForm = () => {
    setTitle('');
    setPriority('medium');
    setStatus('open');
    setDueDate('');
    setSource('Manual');
    setOwner(userName);
    setCategory('');
    setTaskType('action');
    setSaved(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/add-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet: 'Tasks',
          data: {
            date: activeDate,
            title: title.trim(),
            priority,
            status,
            dueDate: dueDate || '',
            source: source.trim() || 'Manual',
            owner: owner.trim() || userName,
            daysOpen: 0,
            category: category.trim(),
            taskType,
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
                    style={{ backgroundColor: 'color-mix(in srgb, var(--accent-purple) 15%, transparent)' }}
                  >
                    <ListTodo className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} />
                  </div>
                  <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>Add Task</h2>
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
                  placeholder="What needs to be done?"
                  className={inputClass}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Priority + Status row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Priority *</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as typeof priority)} className={inputClass} style={inputStyle}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Status *</label>
                  <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className={inputClass} style={inputStyle}>
                    <option value="open">Open</option>
                    <option value="done">Done</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Task Type + Due Date row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Task Type *</label>
                  <select value={taskType} onChange={e => setTaskType(e.target.value as typeof taskType)} className={inputClass} style={inputStyle}>
                    <option value="action">Action</option>
                    <option value="deadline">Deadline</option>
                    <option value="followup">Follow-up</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Source + Owner row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="Manual"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={e => setOwner(e.target.value)}
                    placeholder={userName || 'Owner name'}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className={labelClass} style={labelStyle}>Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Finance, HR, IT..."
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || saving}
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saved
                    ? 'linear-gradient(135deg, var(--accent-green), var(--accent-teal))'
                    : 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))',
                  color: 'white',
                }}
              >
                {saved ? <><Check className="w-4 h-4" /> Added!</> : saving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
