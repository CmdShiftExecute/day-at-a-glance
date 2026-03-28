'use client';

import { CollapsiblePanel } from '@/components/shared/collapsible-panel';
import { DayData } from '@/lib/types';
import { Target, ExternalLink, User, CalendarClock, ChevronRight, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { getDateStr, formatDate, DateFormatOption } from '@/lib/city-time';

interface CommitmentTrackerPanelProps {
  allData: Record<string, DayData>;
  userName?: string;
  onAddClick?: () => void;
  city?: string;
  dateFormat?: string;
}

interface Commitment {
  id: string;
  subject: string;
  to: string;
  summary: string;
  owner?: string;
  deadline?: string;
  date: string; // when the email was sent
  link?: string;
  /** 'to-me' = someone owes me (I assigned it), 'from-me' = I owe someone */
  direction: 'to-me' | 'from-me';
  daysUntilDue: number | null;
  isOverdue: boolean;
}

interface Bucket {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  items: Commitment[];
}

const AddButton = ({ onClick }: { onClick?: () => void }) => onClick ? (
  <motion.button
    onClick={onClick}
    className="w-6 h-6 rounded-lg glass-static flex items-center justify-center cursor-pointer"
    style={{ color: 'var(--accent-amber)' }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    title="Add commitment"
  >
    <Plus className="w-3.5 h-3.5" />
  </motion.button>
) : null;

export function CommitmentTrackerPanel({ allData, userName = '', onAddClick, city = '', dateFormat }: CommitmentTrackerPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const commitments = useMemo(() => {
    const todayStr = getDateStr(city);
    const todayDate = new Date(todayStr + 'T00:00:00');
    // Use the first word of the display name for matching (e.g. "Jane Doe" → "jane")
    const nameParts = userName.trim().toLowerCase().split(/\s+/);
    const selfName = nameParts[0] || '';
    const result: Commitment[] = [];
    const seen = new Set<string>(); // deduplicate by subject+owner

    for (const [dateKey, dayData] of Object.entries(allData)) {
      for (const email of dayData.emailsSent) {
        if (email.commitment !== 'yes') continue;

        const dedupeKey = `${email.subject.toLowerCase()}|${(email.owner || '').toLowerCase()}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        let daysUntilDue: number | null = null;
        let isOverdue = false;
        if (email.deadline) {
          // Strip time portion if present (e.g., "2026-03-27 10:00" → "2026-03-27")
          const deadlineDateStr = email.deadline.split(' ')[0].split('T')[0];
          const deadlineDate = new Date(deadlineDateStr + 'T00:00:00');
          if (!isNaN(deadlineDate.getTime())) {
            const diffMs = deadlineDate.getTime() - todayDate.getTime();
            daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            isOverdue = daysUntilDue < 0;
          }
        }

        // Determine direction: if owner contains the user's name, it's "from-me" (I owe)
        // Otherwise it's "to-me" (they owe me, I need to follow up)
        const ownerLower = (email.owner || '').toLowerCase();
        const direction: 'to-me' | 'from-me' = ownerLower.includes(selfName) ? 'from-me' : 'to-me';

        result.push({
          id: `c-${dateKey}-${email.id}`,
          subject: email.subject,
          to: email.to,
          summary: email.summary,
          owner: email.owner,
          deadline: email.deadline,
          date: dateKey,
          link: email.link,
          direction,
          daysUntilDue,
          isOverdue,
        });
      }
    }

    // Sort: overdue first, then by daysUntilDue ascending
    return result.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999);
    });
  }, [allData]);

  // Bucket into time horizons
  const buckets = useMemo((): Bucket[] => {
    const overdue: Commitment[] = [];
    const in3: Commitment[] = [];
    const in5: Commitment[] = [];
    const in7: Commitment[] = [];
    const in14: Commitment[] = [];
    const in30: Commitment[] = [];
    const noDeadline: Commitment[] = [];

    for (const c of commitments) {
      if (c.daysUntilDue === null) { noDeadline.push(c); continue; }
      if (c.isOverdue) { overdue.push(c); continue; }
      const d = c.daysUntilDue;
      if (d <= 3) in3.push(c);
      else if (d <= 5) in5.push(c);
      else if (d <= 7) in7.push(c);
      else if (d <= 14) in14.push(c);
      else in30.push(c);
    }

    return [
      { key: 'overdue', label: 'Overdue', color: 'var(--accent-pink)', bgColor: 'rgba(244,114,182,0.1)', items: overdue },
      { key: 'in3', label: 'Due in 3 days', color: 'var(--accent-amber)', bgColor: 'rgba(251,191,36,0.08)', items: in3 },
      { key: 'in5', label: 'Due in 5 days', color: 'var(--accent-amber)', bgColor: 'rgba(251,191,36,0.05)', items: in5 },
      { key: 'in7', label: 'Due in 7 days', color: 'var(--accent-blue)', bgColor: 'rgba(96,165,250,0.06)', items: in7 },
      { key: 'in14', label: 'Due in 14 days', color: 'var(--accent-purple)', bgColor: 'rgba(167,139,250,0.05)', items: in14 },
      { key: 'in30', label: 'Due in 30 days', color: 'var(--text-muted)', bgColor: 'transparent', items: in30 },
      { key: 'nodeadline', label: 'No deadline set', color: 'var(--text-muted)', bgColor: 'transparent', items: noDeadline },
    ].filter(b => b.items.length > 0);
  }, [commitments]);

  const overdueCount = commitments.filter(c => c.isOverdue).length;

  if (commitments.length === 0) {
    return (
      <CollapsiblePanel
        id="commitments"
        title="Commitment Tracker"
        icon={Target}
        iconColor="var(--accent-amber)"
        badge="0"
        badgeColor="var(--text-muted)"
        gradient="none"
        headerAction={<AddButton onClick={onAddClick} />}
      >
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
          No tracked commitments
        </p>
      </CollapsiblePanel>
    );
  }

  return (
    <CollapsiblePanel
      id="commitments"
      title="Commitment Tracker"
      icon={Target}
      iconColor="var(--accent-amber)"
      badge={overdueCount > 0 ? `${overdueCount} overdue` : `${commitments.length} total`}
      badgeColor={overdueCount > 0 ? 'var(--accent-pink)' : 'var(--accent-amber)'}
      gradient="none"
      headerAction={<AddButton onClick={onAddClick} />}
    >
      <div className="space-y-3">
        {buckets.map(bucket => (
          <div key={bucket.key}>
            {/* Bucket header */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: bucket.color }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: bucket.color }}
              >
                {bucket.label}
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                ({bucket.items.length})
              </span>
            </div>

            {/* Commitment items */}
            <div className="space-y-1">
              {bucket.items.map((c, i) => {
                const isExpanded = expandedId === c.id;
                const DirectionIcon = c.direction === 'to-me' ? ArrowDownLeft : ArrowUpRight;
                const dirLabel = c.direction === 'to-me' ? 'They owe you' : 'You owe';
                const dirColor = c.direction === 'to-me' ? 'var(--accent-cyan)' : 'var(--accent-pink)';

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-xl p-2.5 cursor-pointer transition-all group"
                    style={{
                      backgroundColor: bucket.bgColor,
                      borderLeft: c.isOverdue ? '3px solid var(--accent-pink)' : '3px solid transparent',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${bucket.color} 10%, transparent)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = bucket.bgColor;
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {/* Direction indicator */}
                          <span
                            className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ backgroundColor: `color-mix(in srgb, ${dirColor} 15%, transparent)`, color: dirColor }}
                          >
                            <DirectionIcon className="w-2.5 h-2.5" />
                            {c.direction === 'to-me' ? 'ASK' : 'OWE'}
                          </span>
                          <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {c.owner || c.to}
                          </span>
                        </div>
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {c.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono" style={{ color: bucket.color }}>
                            {c.daysUntilDue === null
                              ? 'No deadline'
                              : c.isOverdue
                                ? `${Math.abs(c.daysUntilDue)}d overdue`
                                : c.daysUntilDue === 0
                                  ? 'Due today'
                                  : c.daysUntilDue === 1
                                    ? 'Due tomorrow'
                                    : `${c.daysUntilDue}d left`
                            }
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            · {dirLabel}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 mt-1"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--glass-border)' }}>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {c.summary}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              {c.owner && (
                                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                  <User className="w-3 h-3" />
                                  {c.owner}
                                </div>
                              )}
                              {c.deadline && (
                                <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                  <CalendarClock className="w-3 h-3" />
                                  {formatDate(c.deadline!, dateFormat as DateFormatOption)}
                                </div>
                              )}
                            </div>
                            {c.link && (
                              <a
                                href={c.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                                style={{ color: 'var(--accent-blue)' }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open in Outlook
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
