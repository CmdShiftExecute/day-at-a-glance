'use client';

import { motion } from 'framer-motion';
import { DayView } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface DaySummaryProps {
  activeDay: DayView;
  meetings: number;
  totalTasks: number;
  overdueTasks: number;
  doneTasks: number;
  emails: number;
  unreadEmails: number;
  commitments: number;
  /** Does any unread inbox email match a high-priority sender? */
  hasHighPriority: boolean;
  /** Next schedule item indicator */
  meetingIndicator?: { type: 'next'; time: string; title: string };
}

function generateSummary(props: DaySummaryProps): { text: string; tone: 'calm' | 'busy' | 'alert' } {
  const { activeDay, meetings, totalTasks, overdueTasks, doneTasks, unreadEmails, hasHighPriority, commitments } = props;

  const dayLabel = activeDay === 'yesterday' ? 'Yesterday' : activeDay === 'tomorrow' ? 'Tomorrow' : 'Today';
  const parts: string[] = [];
  let tone: 'calm' | 'busy' | 'alert' = 'calm';

  // Meeting load
  if (meetings === 0) parts.push('no meetings');
  else if (meetings <= 2) parts.push(`${meetings} meeting${meetings > 1 ? 's' : ''}`);
  else { parts.push(`${meetings} meetings`); tone = 'busy'; }

  // Task situation
  if (totalTasks === 0) {
    parts.push('no tasks');
  } else if (overdueTasks > 0) {
    parts.push(`${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`);
    tone = 'alert';
  } else if (doneTasks === totalTasks) {
    parts.push('all tasks done');
  } else {
    const open = totalTasks - doneTasks;
    parts.push(`${open} open task${open > 1 ? 's' : ''}`);
  }

  // High-priority emails
  if (hasHighPriority) {
    parts.push('priority email needs attention');
    tone = 'alert';
  } else if (unreadEmails > 0) {
    parts.push(`${unreadEmails} unread email${unreadEmails > 1 ? 's' : ''}`);
  }

  // Commitments
  if (commitments > 0) {
    parts.push(`${commitments} commitment${commitments > 1 ? 's' : ''} tracked`);
  }

  // Heavy day detection
  if (meetings >= 5 && totalTasks > 5) {
    tone = 'alert';
  }

  // Build sentence
  const prefix = tone === 'alert' ? `\u26a0\ufe0f ${dayLabel}:` : `${dayLabel}:`;
  const suffix = tone === 'calm' && meetings <= 1 && overdueTasks === 0
    ? ' \u2014 looking clear.'
    : tone === 'alert'
      ? ' \u2014 needs your attention.'
      : '.';

  return {
    text: `${prefix} ${parts.join(', ')}${suffix}`,
    tone,
  };
}

export function DaySummary(props: DaySummaryProps) {
  const { text, tone } = generateSummary(props);
  const { meetingIndicator } = props;

  const toneColors = {
    calm: 'var(--accent-green)',
    busy: 'var(--accent-amber)',
    alert: 'var(--accent-pink)',
  };

  return (
    <motion.div
      className="flex items-start sm:items-center gap-2 px-3 sm:px-4 py-2 rounded-xl mb-3"
      style={{
        backgroundColor: `color-mix(in srgb, ${toneColors[tone]} 6%, transparent)`,
        borderLeft: `3px solid ${toneColors[tone]}`,
      }}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: toneColors[tone] }} />
      <p className="text-[11px] sm:text-xs font-display font-medium leading-snug" style={{ color: 'var(--text-secondary)' }}>
        {text}
        {meetingIndicator && (
          <>
            <span className="opacity-30 mx-1.5">|</span>
            <span className="font-bold" style={{ color: '#ef4444' }}>
              📅 Up Next: {meetingIndicator.title} at <span className="font-mono font-extrabold">{meetingIndicator.time}</span>
            </span>
          </>
        )}
      </p>
    </motion.div>
  );
}
