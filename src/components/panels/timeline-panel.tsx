'use client';

import { CollapsiblePanel } from '@/components/shared/collapsible-panel';
import { TimeIndicator } from '@/components/shared/time-indicator';
import { CATEGORY_COLORS, ScheduleItem, DayView } from '@/lib/types';
import { Clock, ExternalLink, MapPin, User, Users, Video, Check, HelpCircle, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { getCurrentMinutes, formatTimeDisplay, TimeFormatOption } from '@/lib/city-time';

interface TimelinePanelProps {
  schedule: ScheduleItem[];
  activeDay: DayView;
  onAddClick?: () => void;
  city?: string;
  timeFormat?: string;
}

const HOUR_HEIGHT = 72; // Fixed comfortable height — panel scrolls if needed

function calcDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return '';
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

function getEventStatus(event: ScheduleItem, nowMinutes: number): 'past' | 'current' | 'upcoming' | 'future' {
  const startMin = timeToMinutes(event.time);
  const endMin = timeToMinutes(event.endTime);
  if (nowMinutes >= endMin) return 'past';
  if (nowMinutes >= startMin && nowMinutes < endMin) return 'current';
  if (startMin - nowMinutes <= 30 && startMin - nowMinutes > 0) return 'upcoming';
  return 'future';
}

function getCountdown(event: ScheduleItem, nowMinutes: number): string | null {
  const startMin = timeToMinutes(event.time);
  const diff = startMin - nowMinutes;
  if (diff <= 0 || diff > 30) return null;
  if (diff === 1) return 'in 1 min';
  return `in ${diff} min`;
}

/** Compute overlap columns for events (Outlook/Google style) */
interface LayoutEvent {
  event: ScheduleItem;
  col: number;
  totalCols: number;
}

function layoutOverlappingEvents(events: ScheduleItem[]): LayoutEvent[] {
  if (events.length === 0) return [];

  // Sort by start time, then by end time (longer first)
  const sorted = [...events].sort((a, b) => {
    const diff = timeToMinutes(a.time) - timeToMinutes(b.time);
    if (diff !== 0) return diff;
    return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  // Build overlap groups: events that share any time overlap form a group
  const groups: ScheduleItem[][] = [];
  let currentGroup: ScheduleItem[] = [];
  let groupEnd = 0;

  for (const ev of sorted) {
    const evStart = timeToMinutes(ev.time);
    const evEnd = timeToMinutes(ev.endTime);
    if (currentGroup.length === 0 || evStart < groupEnd) {
      currentGroup.push(ev);
      groupEnd = Math.max(groupEnd, evEnd);
    } else {
      groups.push(currentGroup);
      currentGroup = [ev];
      groupEnd = evEnd;
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // Assign columns within each group
  const result: LayoutEvent[] = [];
  for (const group of groups) {
    const columns: ScheduleItem[][] = [];
    for (const ev of group) {
      const evStart = timeToMinutes(ev.time);
      // Find first column where event doesn't overlap with existing events
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (evStart >= timeToMinutes(lastInCol.endTime)) {
          columns[col].push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([ev]);
      }
    }
    const totalCols = columns.length;
    for (let col = 0; col < columns.length; col++) {
      for (const ev of columns[col]) {
        result.push({ event: ev, col, totalCols });
      }
    }
  }

  return result;
}

/** Response status badge */
function ResponseBadge({ status }: { status?: string }) {
  if (!status || status === 'none') return null;
  const config = {
    accepted: { icon: Check, color: 'var(--accent-green)', bg: 'rgba(52,211,153,0.2)', label: 'Accepted' },
    tentative: { icon: HelpCircle, color: 'var(--accent-amber)', bg: 'rgba(251,191,36,0.2)', label: 'Tentative' },
    declined: { icon: X, color: 'var(--accent-pink)', bg: 'rgba(244,114,182,0.2)', label: 'Declined' },
  }[status];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className="text-[7px] px-1 py-0.5 rounded flex items-center gap-0.5 flex-shrink-0 font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon className="w-2 h-2" />
      {config.label}
    </span>
  );
}

const AddButton = ({ onClick }: { onClick?: () => void }) => onClick ? (
  <motion.button
    onClick={onClick}
    className="w-6 h-6 rounded-lg glass-static flex items-center justify-center cursor-pointer"
    style={{ color: 'var(--accent-cyan)' }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    title="Add schedule entry"
  >
    <Plus className="w-3.5 h-3.5" />
  </motion.button>
) : null;

export function TimelinePanel({ schedule, activeDay, onAddClick, city = '', timeFormat }: TimelinePanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [nowMinutes, setNowMinutes] = useState(() => getCurrentMinutes(city));

  useEffect(() => {
    if (activeDay !== 'today') return;
    setNowMinutes(getCurrentMinutes(city));
    const timer = setInterval(() => {
      setNowMinutes(getCurrentMinutes(city));
    }, 30000);
    return () => clearInterval(timer);
  }, [activeDay, city]);

  // Compute dynamic hour range — tight to events, minimal padding
  const { startHour, endHour } = useMemo(() => {
    if (schedule.length === 0) return { startHour: 8, endHour: 18 };
    let minH = 24, maxH = 0;
    for (const ev of schedule) {
      const s = timeToMinutes(ev.time) / 60;
      const e = timeToMinutes(ev.endTime) / 60;
      minH = Math.min(minH, Math.floor(s));
      maxH = Math.max(maxH, Math.ceil(e));
    }
    return {
      startHour: Math.max(0, minH),
      endHour: Math.min(24, maxH),
    };
  }, [schedule]);

  const totalHours = endHour - startHour;
  const hourHeight = HOUR_HEIGHT;

  function timeToPixels(time: string): number {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return (h + m / 60 - startHour) * hourHeight;
  }

  function durationPixels(start: string, end: string): number {
    return timeToPixels(end) - timeToPixels(start);
  }

  const totalHeight = totalHours * hourHeight;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);
  const meetingCount = schedule.filter(e => e.type === 'meeting').length;
  const isToday = activeDay === 'today';

  // Layout overlapping events
  const layoutEvents = useMemo(() => layoutOverlappingEvents(schedule), [schedule]);

  return (
    <CollapsiblePanel
      id="timeline"
      title="Schedule"
      icon={Clock}
      iconColor="var(--accent-cyan)"
      badge={`${schedule.length} events · ${meetingCount} meetings`}
      badgeColor="var(--accent-cyan)"
      gradient="none"
      className="h-full"
      headerAction={<AddButton onClick={onAddClick} />}
    >
      {/* Timeline content — the CollapsiblePanel handles scrolling */}
      <div className="relative" style={{ height: totalHeight }}>
            {/* Hour grid lines */}
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-start"
                style={{ top: (hour - startHour) * hourHeight }}
              >
                <span
                  className="text-[10px] font-mono w-12 flex-shrink-0 -mt-1.5 select-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatTimeDisplay(`${hour.toString().padStart(2,'0')}:00`, timeFormat as TimeFormatOption)}
                </span>
                <div className="flex-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />
              </div>
            ))}

            {/* Events with overlap layout */}
            {layoutEvents.map(({ event, col, totalCols }, i) => {
              const top = timeToPixels(event.time);
              const height = Math.max(durationPixels(event.time, event.endTime), 32);
              const colors = CATEGORY_COLORS[event.type] || CATEGORY_COLORS.task;
              const isSelected = selectedEvent === event.id;
              const isMeeting = event.type === 'meeting';
              const attendeeList = event.attendees ? event.attendees.split(',').map(a => a.trim()).filter(Boolean) : [];
              const duration = calcDuration(event.time, event.endTime);
              const isDeclined = event.responseStatus === 'declined';
              const isTentative = event.responseStatus === 'tentative';

              const status = isToday ? getEventStatus(event, nowMinutes) : 'future';
              const countdown = isToday ? getCountdown(event, nowMinutes) : null;
              const isPast = status === 'past';
              const isCurrent = status === 'current';

              // Column layout: divide the event area by totalCols, use col index
              const gapPx = 2;

              // Declined styling: dashed border, muted
              const borderStyle = isDeclined ? 'dashed' : 'solid';
              const eventOpacity = isPast ? 0.45 : isDeclined ? 0.5 : 1;

              // Calculate left/width as simple fractions of the event area
              // Event area starts at left:52px and goes to right:4px
              const colFraction = 1 / totalCols;
              const leftCalc = totalCols > 1
                ? `calc(52px + (100% - 56px) * ${col / totalCols} + ${col > 0 ? gapPx : 0}px)`
                : '52px';
              const widthCalc = totalCols > 1
                ? `calc((100% - 56px) * ${colFraction} - ${gapPx}px)`
                : 'calc(100% - 56px)';

              return (
                <motion.div
                  key={event.id}
                  className="absolute rounded-xl cursor-pointer overflow-hidden"
                  style={{
                    top,
                    minHeight: height,
                    left: leftCalc,
                    width: widthCalc,
                    backgroundColor: isDeclined
                      ? 'rgba(128,128,128,0.08)'
                      : isTentative
                        ? `color-mix(in srgb, ${colors.border} 8%, transparent)`
                        : isCurrent
                          ? `color-mix(in srgb, ${colors.border} 18%, transparent)`
                          : colors.bg,
                    borderLeft: `3px ${borderStyle} ${isPast || isDeclined ? 'var(--glass-border)' : isTentative ? 'var(--accent-amber)' : colors.border}`,
                    opacity: eventOpacity,
                    zIndex: isSelected ? 20 : isCurrent ? 5 : 1,
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: eventOpacity, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  whileHover={{
                    scale: totalCols > 1 ? 1.01 : 1.02,
                    opacity: 1,
                    boxShadow: `0 4px 20px ${colors.bg}`,
                    zIndex: 10,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                >
                  {/* Current event pulse border */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: `1.5px solid ${colors.border}` }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    />
                  )}

                  {/* Tentative hatching pattern */}
                  {isTentative && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-10 rounded-xl"
                      style={{
                        backgroundImage: `repeating-linear-gradient(135deg, var(--accent-amber), var(--accent-amber) 2px, transparent 2px, transparent 8px)`,
                      }}
                    />
                  )}

                  <div className="p-1.5 h-full flex flex-col justify-center">
                    <div className="flex items-center gap-1 flex-wrap">
                      {isCurrent && (
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                          style={{ backgroundColor: `color-mix(in srgb, ${colors.border} 25%, transparent)`, color: colors.text }}>
                          LIVE
                        </span>
                      )}
                      {countdown && (
                        <span className="text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0 animate-pulse"
                          style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: 'var(--accent-amber)' }}>
                          {countdown}
                        </span>
                      )}
                      <ResponseBadge status={event.responseStatus} />
                      <span
                        className="text-[11px] font-semibold truncate flex-1 min-w-0"
                        style={{
                          color: isPast || isDeclined ? 'var(--text-muted)' : colors.text,
                          textDecoration: isPast || isDeclined ? 'line-through' : 'none',
                        }}
                      >
                        {event.title}
                      </span>
                      {isMeeting && event.meetingType && !isPast && !isDeclined && totalCols <= 2 && (
                        <span className="text-[7px] px-1 py-0.5 rounded font-medium flex-shrink-0"
                          style={{
                            backgroundColor: event.meetingType === 'teams' ? 'rgba(96,165,250,0.2)' : 'rgba(52,211,153,0.2)',
                            color: event.meetingType === 'teams' ? 'var(--accent-blue)' : 'var(--accent-green)',
                          }}>
                          {event.meetingType === 'teams' ? 'Teams' : 'In-person'}
                        </span>
                      )}
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-2.5 h-2.5" style={{ color: colors.text }} />
                        </a>
                      )}
                    </div>
                    {height > 36 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono" style={{ color: isPast ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                          {formatTimeDisplay(event.time, timeFormat as TimeFormatOption)} – {formatTimeDisplay(event.endTime, timeFormat as TimeFormatOption)}
                        </span>
                        {duration && (
                          <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{duration}</span>
                        )}
                      </div>
                    )}
                    {/* Location line for compact view */}
                    {height > 52 && event.location && !isSelected && (
                      <span className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {event.location}
                      </span>
                    )}

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-1.5 pt-1.5 border-t space-y-1" style={{ borderColor: `${colors.border}40` }}>
                            {event.description && (
                              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
                            )}
                            {isMeeting && event.organizer && (
                              <div className="flex items-center gap-1">
                                <User className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{event.organizer}</span>
                              </div>
                            )}
                            {isMeeting && event.location && (
                              <div className="flex items-center gap-1">
                                {event.meetingType === 'teams' ? (
                                  <Video className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                ) : (
                                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                )}
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{event.location}</span>
                              </div>
                            )}
                            {attendeeList.length > 0 && (
                              <div className="flex items-start gap-1">
                                <Users className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{attendeeList.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {/* NOW indicator */}
            {isToday && <TimeIndicator startHour={startHour} endHour={endHour} city={city} />}
          </div>
    </CollapsiblePanel>
  );
}
