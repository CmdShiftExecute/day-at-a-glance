'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const shortcuts = [
  { key: '← →', label: 'Switch days' },
  { key: 'R', label: 'Refresh data' },
  { key: 'S', label: 'Open settings' },
  { key: 'H', label: 'Open user guide' },
  { key: '?', label: 'Show shortcuts' },
];

export function KeyboardHelp() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShow(v => !v)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
        whileTap={{ scale: 0.9 }}
        title="Keyboard shortcuts (?)"
      >
        <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 glass-static rounded-xl p-3 shadow-xl border border-white/10 z-50 min-w-[180px]"
          >
            <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Keyboard Shortcuts
            </p>
            <div className="space-y-1.5">
              {shortcuts.map(s => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--glass-bg)', color: 'var(--accent-blue)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
