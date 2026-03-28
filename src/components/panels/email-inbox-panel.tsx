'use client';

import { CollapsiblePanel } from '@/components/shared/collapsible-panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { InboxEmail, INBOX_PRIORITY_ORDER } from '@/lib/types';
import { isHighPriorityEmail } from '@/hooks/use-settings';
import { Inbox, Paperclip, ChevronRight, Reply, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { formatTimeDisplay, TimeFormatOption } from '@/lib/city-time';

interface EmailInboxPanelProps {
  emails: InboxEmail[];
  highPriorityEmails?: string;
  timeFormat?: string;
}

export function EmailInboxPanel({ emails, highPriorityEmails = '', timeFormat }: EmailInboxPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sort: VIP senders first, then by original priority rank, then time descending
  const sorted = [...emails].sort((a, b) => {
    const aVip = isHighPriorityEmail(a.from, highPriorityEmails) ? 0 : 1;
    const bVip = isHighPriorityEmail(b.from, highPriorityEmails) ? 0 : 1;
    if (aVip !== bVip) return aVip - bVip;
    const pDiff = (INBOX_PRIORITY_ORDER[a.priority] ?? 4) - (INBOX_PRIORITY_ORDER[b.priority] ?? 4);
    if (pDiff !== 0) return pDiff;
    return b.time.localeCompare(a.time);
  });

  const unreadCount = emails.filter(e => e.readStatus === 'unread').length;

  return (
    <CollapsiblePanel
      id="email-inbox"
      title="Inbox"
      icon={Inbox}
      iconColor="var(--accent-green)"
      badge={unreadCount > 0 ? `${unreadCount} unread` : emails.length}
      badgeColor={unreadCount > 0 ? 'var(--accent-pink)' : 'var(--accent-green)'}
      gradient="green"
    >
      <div className="space-y-1">
        {sorted.map((email, i) => {
          const isExpanded = expandedId === email.id;
          const isUnread = email.readStatus === 'unread';
          const isVip = isHighPriorityEmail(email.from, highPriorityEmails);

          return (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl p-2.5 cursor-pointer transition-all group"
              style={{
                backgroundColor: 'transparent',
                borderLeft: isHighPriorityEmail(email.from, highPriorityEmails)
                  ? '3px solid var(--accent-pink)'
                  : '3px solid transparent',
              }}
              onClick={() => setExpandedId(isExpanded ? null : email.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {/* Unread dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-blue)' }} />
                    )}
                    <span className={`text-xs truncate ${isUnread ? 'font-bold' : 'font-semibold'}`} style={{ color: 'var(--text-primary)' }}>
                      {email.from}
                    </span>
                    <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatTimeDisplay(email.time, timeFormat as TimeFormatOption)}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isUnread ? 'font-semibold' : 'font-medium'}`} style={{ color: 'var(--text-secondary)' }}>
                    {email.subject}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {email.folder && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium hidden sm:inline-flex"
                      style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-muted)' }}>
                      {email.folder}
                    </span>
                  )}
                  {email.attachment === 'yes' && (
                    <Paperclip className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  )}
                  {email.myReply === 'yes' && (
                    <Reply className="w-3 h-3" style={{ color: 'var(--accent-blue)' }} />
                  )}
                  <StatusBadge variant={isVip ? 'vip' : email.priority} label={isVip ? 'Priority' : undefined} showDot className="hidden sm:inline-flex" />
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                  </motion.div>
                </div>
              </div>

              {/* Expanded summary */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2 border-t space-y-2" style={{ borderColor: 'var(--glass-border)' }}>
                      <div className="flex items-center gap-2">
                        <StatusBadge variant={isVip ? 'vip' : email.priority} label={isVip ? 'Priority' : undefined} showDot />
                        <StatusBadge variant={email.addressed === 'direct' ? 'direct' : 'cc'} label={email.addressed === 'direct' ? 'To you' : 'CC'} showDot={false} />
                        {email.folder && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--glass-bg)', color: 'var(--text-muted)' }}>
                            {email.folder}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {email.summary}
                      </p>
                      {email.myReply === 'yes' && email.replySummary && (
                        <div className="ml-3 pl-3 border-l-2 rounded-sm" style={{ borderColor: 'var(--accent-blue)' }}>
                          <p className="text-[11px] font-medium" style={{ color: 'var(--accent-blue)' }}>You replied:</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {email.replySummary}
                          </p>
                        </div>
                      )}
                      {email.link && (
                        <a
                          href={email.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline mt-1"
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
        {emails.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No emails
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
}
