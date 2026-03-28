'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Mail, AlertTriangle, Send } from 'lucide-react';

/** Animates a number from 0 to `end` over `duration` ms using rAF */
function CountUp({ end, duration = 800, delay = 600 }: { end: number; duration?: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (end === 0) { setDisplay(0); return; }
    const timeout = setTimeout(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      const start = performance.now();
      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * end));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timeout); startedRef.current = false; };
  }, [end, duration, delay]);

  return <>{display}</>;
}

interface StatsBarProps {
  open: number;
  done: number;
  overdue: number;
  total: number;
  meetings: number;
  emails: number;
  unreadEmails: number;
  commitments: number;
  percentage: number;
  emailHeat?: 'high' | 'normal' | null;
}

export function StatsBar({ done, overdue, total, meetings, emails, unreadEmails, commitments, percentage, emailHeat }: StatsBarProps) {
  const emailColor = emailHeat === 'high'
    ? 'var(--accent-pink)'
    : 'var(--accent-purple)';

  const emailLabel = emailHeat === 'high'
    ? 'Emails \u26a0\ufe0f'
    : 'Emails';

  const stats: { icon: typeof CheckCircle2; label: string; value: React.ReactNode; color: string }[] = [
    {
      icon: CheckCircle2,
      label: 'Tasks Done',
      value: total > 0 ? <><CountUp end={done} />{`/${total}`}</> : '\u2014',
      color: 'var(--accent-green)',
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      value: overdue > 0 ? <CountUp end={overdue} /> : '\u2014',
      color: overdue > 0 ? 'var(--accent-pink)' : 'var(--text-muted)',
    },
    {
      icon: Calendar,
      label: 'Meetings',
      value: <CountUp end={meetings} />,
      color: 'var(--accent-blue)',
    },
    {
      icon: Mail,
      label: emailLabel,
      value: unreadEmails > 0 ? <><CountUp end={unreadEmails} />{' unread'}</> : <CountUp end={emails} />,
      color: emailColor,
    },
    {
      icon: Send,
      label: 'Commits',
      value: commitments > 0 ? <CountUp end={commitments} /> : '\u2014',
      color: commitments > 0 ? 'var(--accent-amber)' : 'var(--text-muted)',
    },
  ];

  return (
    <motion.div
      className="p-2 sm:p-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl min-w-[100px] sm:min-w-0 flex-shrink-0 sm:flex-shrink overflow-hidden"
            style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 8%, transparent)` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            whileHover={{ scale: 1.02, backgroundColor: `color-mix(in srgb, ${stat.color} 14%, transparent)` }}
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}
            >
              <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <div className="font-mono font-bold text-xs sm:text-base truncate" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[9px] sm:text-xs font-display truncate" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--glass-bg)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-green))`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
