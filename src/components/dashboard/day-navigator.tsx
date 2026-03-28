'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayView } from '@/lib/types';
import { getShortDateFormatted, DateFormatOption } from '@/lib/city-time';

interface DayNavigatorProps {
  activeDay: DayView;
  onDayChange: (day: DayView) => void;
  city?: string;
  dateFormat?: string;
}

const days: { view: DayView; label: string; shortLabel: string; offset: number }[] = [
  { view: 'yesterday', label: 'Yesterday', shortLabel: 'Yest', offset: -1 },
  { view: 'today', label: 'Today', shortLabel: 'Today', offset: 0 },
  { view: 'tomorrow', label: 'Tomorrow', shortLabel: 'Tmrw', offset: 1 },
];

export function DayNavigator({ activeDay, onDayChange, city = '', dateFormat }: DayNavigatorProps) {
  const activeIndex = days.findIndex(d => d.view === activeDay);

  const goLeft = () => {
    if (activeIndex > 0) onDayChange(days[activeIndex - 1].view);
  };
  const goRight = () => {
    if (activeIndex < days.length - 1) onDayChange(days[activeIndex + 1].view);
  };

  return (
    <div className="flex items-center gap-1">
      <motion.button
        onClick={goLeft}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
        whileHover={{ scale: 1.1, color: 'var(--text-primary)' }}
        whileTap={{ scale: 0.9 }}
        disabled={activeIndex === 0}
        aria-label="Previous day"
      >
        <ChevronLeft className="w-4 h-4" />
      </motion.button>

      <div className="flex items-center glass-static rounded-xl p-0.5 sm:p-1 gap-0.5">
        {days.map(({ view, label, shortLabel, offset }) => (
          <motion.button
            key={view}
            onClick={() => onDayChange(view)}
            className="relative px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm font-display font-medium cursor-pointer"
            style={{
              color: activeDay === view ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
            whileHover={{ color: 'var(--text-primary)' }}
            whileTap={{ scale: 0.97 }}
          >
            {activeDay === view && (
              <motion.div
                layoutId="activeDay"
                className="absolute inset-0 rounded-lg gradient-border"
                style={{
                  background: 'var(--glass-bg-hover)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              {/* Short label on mobile, full on desktop */}
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
              <span className="text-[9px] sm:text-[10px] font-mono opacity-60 mt-0.5">
                {getShortDateFormatted(city, offset, dateFormat as DateFormatOption)}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={goRight}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer"
        style={{ color: 'var(--text-muted)' }}
        whileHover={{ scale: 1.1, color: 'var(--text-primary)' }}
        whileTap={{ scale: 0.9 }}
        disabled={activeIndex === days.length - 1}
        aria-label="Next day"
      >
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
