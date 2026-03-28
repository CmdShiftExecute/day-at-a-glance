'use client';

import { CollapsiblePanel } from '@/components/shared/collapsible-panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { Meeting } from '@/lib/types';
import { Calendar, Video, MapPin, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getCurrentMinutes, formatTimeDisplay, TimeFormatOption } from '@/lib/city-time';

interface MeetingsPanelProps {
  meetings: Meeting[];
  city?: string;
  timeFormat?: string;
}

function calcDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function isMeetingCurrent(meeting: Meeting, city: string): boolean {
  const [sh, sm] = meeting.time.split(':').map(Number);
  const [eh, em] = meeting.endTime.split(':').map(Number);
  const currentMin = getCurrentMinutes(city);
  return currentMin >= sh * 60 + sm && currentMin < eh * 60 + em;
}

function isMeetingPast(meeting: Meeting, city: string): boolean {
  const [eh, em] = meeting.endTime.split(':').map(Number);
  return getCurrentMinutes(city) > eh * 60 + em;
}

export function MeetingsPanel({ meetings, city = '', timeFormat }: MeetingsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <CollapsiblePanel
      id="meetings"
      title="Meetings"
      icon={Calendar}
      iconColor="var(--accent-blue)"
      badge={meetings.length}
      badgeColor="var(--accent-blue)"
      gradient="blue"
    >
      <div className="space-y-2">
        {meetings.map((meeting, i) => {
          const current = isMeetingCurrent(meeting, city);
          const past = isMeetingPast(meeting, city);
          const isExpanded = expanded === meeting.id;
          const isTeams = meeting.type === 'teams';
          const attendeeList = meeting.attendees ? meeting.attendees.split(',').map(a => a.trim()) : [];

          return (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: past ? 0.5 : 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-3 cursor-pointer transition-all relative"
              style={{
                backgroundColor: current ? 'rgba(96,165,250,0.1)' : 'var(--glass-bg)',
                border: current ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent',
              }}
              onClick={() => setExpanded(isExpanded ? null : meeting.id)}
              whileHover={{
                backgroundColor: current ? 'rgba(96,165,250,0.15)' : 'var(--glass-bg-hover)',
                scale: 1.01,
              }}
              whileTap={{ scale: 0.99 }}
            >
              {current && (
                <motion.div
                  className="absolute -top-px -right-px w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-blue)' }}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {meeting.title}
                    </span>
                    {current && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse-soft"
                        style={{ backgroundColor: 'rgba(96,165,250,0.2)', color: 'var(--accent-blue)' }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatTimeDisplay(meeting.time, timeFormat as TimeFormatOption)} – {formatTimeDisplay(meeting.endTime, timeFormat as TimeFormatOption)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {calcDuration(meeting.time, meeting.endTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusBadge variant={meeting.type} showDot={false} label={isTeams ? 'Teams' : 'In-person'} />
                  {isTeams ? (
                    <Video className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>

              {/* Organizer + attendees preview */}
              <div className="flex items-center gap-3 mt-2">
                {meeting.organizer && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {meeting.organizer}
                    </span>
                  </div>
                )}
                {attendeeList.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {attendeeList.slice(0, 2).join(', ')}
                      {attendeeList.length > 2 && ` +${attendeeList.length - 2}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--glass-border)' }}>
                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {meeting.location}
                          </span>
                        </div>
                      )}
                      {attendeeList.length > 0 && (
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <strong>Attendees:</strong> {attendeeList.join(', ')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {meetings.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No meetings — your day is open
          </p>
        )}
      </div>
    </CollapsiblePanel>
  );
}
