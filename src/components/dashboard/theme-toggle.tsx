'use client';

import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';

export function ThemeToggle() {
  const { isDark, toggle, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-7 h-7 md:w-9 md:h-9" />;
  }

  return (
    <motion.button
      onClick={toggle}
      className="w-7 h-7 md:w-9 md:h-9 rounded-xl glass-static flex items-center justify-center cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: 'var(--accent-purple)' }} />
        ) : (
          <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: 'var(--accent-amber)' }} />
        )}
      </motion.div>
    </motion.button>
  );
}
