'use client';

import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'high' | 'medium' | 'low'
  | 'urgent' | 'normal' | 'completed' | 'pending'
  | 'video' | 'in-person' | 'phone' | 'teams'
  | 'deadline' | 'followup' | 'personal'
  | 'evp' | 'vp' | 'direct' | 'cc' | 'vip'
  | 'overdue' | 'open' | 'done'
  | 'action'
  | string; // allow any custom priority value from Excel

const variantStyles: Record<string, { bg: string; text: string; dot: string }> = {
  high: { bg: 'rgba(244,114,182,0.12)', text: 'var(--accent-pink)', dot: 'var(--accent-pink)' },
  urgent: { bg: 'rgba(244,114,182,0.12)', text: 'var(--accent-pink)', dot: 'var(--accent-pink)' },
  vip: { bg: 'rgba(244,114,182,0.15)', text: 'var(--accent-pink)', dot: 'var(--accent-pink)' },
  evp: { bg: 'rgba(244,114,182,0.15)', text: 'var(--accent-pink)', dot: 'var(--accent-pink)' },
  overdue: { bg: 'rgba(244,114,182,0.15)', text: 'var(--accent-pink)', dot: 'var(--accent-pink)' },
  medium: { bg: 'rgba(251,191,36,0.12)', text: 'var(--accent-amber)', dot: 'var(--accent-amber)' },
  vp: { bg: 'rgba(251,191,36,0.15)', text: 'var(--accent-amber)', dot: 'var(--accent-amber)' },
  normal: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  direct: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  action: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  low: { bg: 'rgba(148,163,184,0.12)', text: 'var(--text-muted)', dot: 'var(--text-muted)' },
  cc: { bg: 'rgba(148,163,184,0.12)', text: 'var(--text-muted)', dot: 'var(--text-muted)' },
  completed: { bg: 'rgba(52,211,153,0.12)', text: 'var(--accent-green)', dot: 'var(--accent-green)' },
  done: { bg: 'rgba(52,211,153,0.12)', text: 'var(--accent-green)', dot: 'var(--accent-green)' },
  open: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  pending: { bg: 'rgba(167,139,250,0.12)', text: 'var(--accent-purple)', dot: 'var(--accent-purple)' },
  video: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  teams: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  'in-person': { bg: 'rgba(52,211,153,0.12)', text: 'var(--accent-green)', dot: 'var(--accent-green)' },
  phone: { bg: 'rgba(251,191,36,0.12)', text: 'var(--accent-amber)', dot: 'var(--accent-amber)' },
  deadline: { bg: 'rgba(251,191,36,0.12)', text: 'var(--accent-amber)', dot: 'var(--accent-amber)' },
  followup: { bg: 'rgba(96,165,250,0.12)', text: 'var(--accent-blue)', dot: 'var(--accent-blue)' },
  personal: { bg: 'rgba(52,211,153,0.12)', text: 'var(--accent-green)', dot: 'var(--accent-green)' },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ variant, label, showDot = true, className }: StatusBadgeProps) {
  const style = variantStyles[variant] || variantStyles.normal;
  const displayLabel = label || variant.charAt(0).toUpperCase() + variant.slice(1).replace('-', ' ');

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full', className)}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: style.dot }}
        />
      )}
      {displayLabel}
    </span>
  );
}
