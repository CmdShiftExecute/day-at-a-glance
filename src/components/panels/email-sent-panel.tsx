'use client';

import { CollapsiblePanel } from '@/components/shared/collapsible-panel';
import { SentEmail } from '@/lib/types';
import { Send, Paperclip, ChevronRight, AlertCircle, User, CalendarClock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { formatDate, formatTimeDisplay, DateFormatOption, TimeFormatOption } from '@/lib/city-time';

interface EmailSentPanelProps {
  emails: SentEmail[];
  dateFormat?: string;
  timeFormat?: string;
}

export function EmailSentPanel({ emails, dateFormat, timeFormat }: EmailSentPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const commitmentCount = emails.filter(e => e.commitment === 'yes').length;

  return (
    <CollapsiblePanel
      id="email-sent"
      title="Sent"
      icon={Send}
      iconColor="var(--accent-cyan)"
      badge={commitmentCount > 0 ? `${commitmentCount} commits` : emails.length}
      badgeColor={commitmentCount > 0 ? 'var(--accent-amber)' : 'var(--accent-cyan)'}
      gradient="none"
    >
      <div className="space-y-1">
        {emails.map((email, i) => {
          const isExpanded = expandedId === email.id;
          const isCommitment = email.commitment === 'yes';

          return (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl p-2.5 cursor-pointer transition-all group"
              style={{
                backgroundColor: isCommitment ? 'rgba(251,191,36,0.05)' : 'transparent',
                borderLeft: isCommitment ? '3px solid var(--accent-amber)' : '3px solid transparent',
              }}
              onClick={() => setExpandedId(isExpanded ? null : email.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isCommitment ? 'rgba(251,191,36,0.1)' : 'var(--glass-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isCommitment ? 'rgba(251,191,36,0.05)' : 'transparent';
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: 'rgba(34,211,238,0.1)',
                        color: 'var(--accent-cyan)',
                      }}>
                      To
                    </span>
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {email.to}
                    </span>
                    <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatTimeDisplay(email.time, timeFormat as TimeFormatOption)}
                    </span>
                  </div>
                  <p className="text-xs font-medium truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {email.subject}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {email.importance === 'high' && (
                    <AlertCircle className="w-3 h-3" style={{ color: 'var(--accent-pink)' }} />
                  )}
                  {isCommitment && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: 'var(--accent-amber)' }}>
                      Commitment
                    </span>
                  )}
                  {email.attachment === 'yes' && (
                    <Paperclip className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2 border-t space-y-2" style={{ borderColor: 'var(--glass-border)' }}>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {email.summary}
                      </p>
                      {email.link && (
                        <a
                          href={email.link}
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
                      {isCommitment && (email.owner || email.deadline) && (
                        <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(251,191,36,0.08)' }}>
                          <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--accent-amber)' }}>
                            Commitment Tracking
                          </p>
                          {email.owner && (
                            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                              <User className="w-3 h-3" />
                              <span>Owner: {email.owner}</span>
                            </div>
                          )}
                          {email.deadline && (
                            <div className="flex items-center gap-1.5 text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                              <CalendarClock className="w-3 h-3" />
                              <span>Due: {formatDate(email.deadline!, dateFormat as DateFormatOption)}</span>
                            </div>
                          )}
                        </div>
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
            No sent emails
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
}
