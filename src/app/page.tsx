'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@/components/dashboard/splash-screen';
import { BackgroundMesh } from '@/components/dashboard/background-mesh';
import { Header } from '@/components/dashboard/header';
import { StatsBar } from '@/components/dashboard/stats-bar';
import { DaySummary } from '@/components/dashboard/day-summary';
import { DataFreshness } from '@/components/dashboard/data-freshness';
import { KeyboardHelp } from '@/components/dashboard/keyboard-help';
import { Footer } from '@/components/dashboard/footer';
import { ImportModal } from '@/components/dashboard/import-modal';
import { SettingsModal } from '@/components/dashboard/settings-modal';
import { HelpModal } from '@/components/dashboard/help-modal';
import { AddTaskModal } from '@/components/dashboard/add-task-modal';
import { AddScheduleModal } from '@/components/dashboard/add-schedule-modal';
import { AddCommitmentModal } from '@/components/dashboard/add-commitment-modal';
import { TimelinePanel } from '@/components/panels/timeline-panel';
import { TasksPanel } from '@/components/panels/tasks-panel';
import { EmailInboxPanel } from '@/components/panels/email-inbox-panel';
import { EmailSentPanel } from '@/components/panels/email-sent-panel';
import { CommitmentTrackerPanel } from '@/components/panels/commitment-tracker-panel';
import { useDayData } from '@/hooks/use-day-data';
import { useSettings } from '@/hooks/use-settings';
import { DayView, ScheduleItem } from '@/lib/types';
import { getDateStr, getShortDateFormatted, DateFormatOption } from '@/lib/city-time';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

export default function DashboardPage() {
  const { settings, updateSettings, displayName, mounted: settingsMounted } = useSettings();

  const {
    activeDay,
    setActiveDay,
    dayData,
    allData,
    importData,
    resetToDemo,
    isUsingDemo,
    isLoading,
    loadError,
    toggleTask,
    refreshFromFolder,
    stats,
    lastLoaded,
  } = useDayData(settings.highPriorityEmails, settings.city);

  // Splash screen — show once per session.
  // dashboardReady flips true only after the splash exit animation finishes,
  // so the dashboard DOM mounts fresh and all entrance animations play visibly.
  const [showSplash, setShowSplash] = useState(true);
  const [dashboardReady, setDashboardReady] = useState(false);
  const splashTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (showSplash) {
      splashTimerRef.current = setTimeout(() => setShowSplash(false), 2500);
      return () => clearTimeout(splashTimerRef.current);
    }
  }, [showSplash]);

  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [addCommitmentOpen, setAddCommitmentOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  const dayOffsetMap: Record<DayView, number> = { yesterday: -1, today: 0, tomorrow: 1 };
  function getActiveDateStr(day: DayView): string {
    return getDateStr(settings.city, dayOffsetMap[day]);
  }

  const handleDayChange = useCallback((day: DayView) => {
    const order: DayView[] = ['yesterday', 'today', 'tomorrow'];
    const currentIdx = order.indexOf(activeDay);
    const newIdx = order.indexOf(day);
    setDirection(newIdx - currentIdx);
    setActiveDay(day);
  }, [activeDay, setActiveDay]);

  // Dynamic page title
  useEffect(() => {
    if (!settingsMounted) return;
    const dayLabels: Record<DayView, string> = {
      yesterday: 'Yesterday',
      today: 'Today',
      tomorrow: 'Tomorrow',
    };
    const dateStr = getShortDateFormatted(settings.city, 0, settings.dateFormat as DateFormatOption);
    const name = settings.name || 'Day at a Glance';
    document.title = `${name} — ${dayLabels[activeDay]} · ${dateStr}`;
  }, [activeDay, settings.name, settings.dateFormat, settingsMounted]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const order: DayView[] = ['yesterday', 'today', 'tomorrow'];
      const currentIdx = order.indexOf(activeDay);

      switch (e.key) {
        case 'ArrowLeft':
          if (currentIdx > 0) handleDayChange(order[currentIdx - 1]);
          break;
        case 'ArrowRight':
          if (currentIdx < 2) handleDayChange(order[currentIdx + 1]);
          break;
        case 'r':
        case 'R':
          refreshFromFolder();
          break;
        case 's':
        case 'S':
          setSettingsOpen(true);
          break;
        case 'h':
        case 'H':
          setHelpOpen(true);
          break;
        case '?':
          // KeyboardHelp handles its own toggle
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDay, handleDayChange, refreshFromFolder]);

  // Enrich schedule items with meeting data (merge meetings into timeline)
  const enrichedSchedule: ScheduleItem[] = dayData.schedule.map(item => {
    if (item.type === 'meeting') {
      const match = dayData.meetings.find(
        m => m.title === item.title || (m.time === item.time && m.endTime === item.endTime)
      );
      if (match) {
        return {
          ...item,
          organizer: match.organizer,
          attendees: match.attendees,
          location: match.location,
          meetingType: match.type,
          link: item.link || match.link,
          responseStatus: item.responseStatus || match.responseStatus,
          description: item.description || (match.location ? `Location: ${match.location}. Organizer: ${match.organizer || 'N/A'}. ${match.attendees ? `Group invite: ${match.attendees}.` : ''}` : item.description),
        };
      }
    }
    return item;
  });

  // Add meetings not in schedule
  const unmatchedMeetings: ScheduleItem[] = dayData.meetings
    .filter(m => !dayData.schedule.some(
      s => s.title === m.title || (s.time === m.time && s.endTime === m.endTime)
    ))
    .map((m, i) => ({
      id: `m-sched-${i}`,
      time: m.time,
      endTime: m.endTime,
      title: m.title,
      type: 'meeting' as const,
      description: m.location ? `Location: ${m.location}. Organizer: ${m.organizer || 'N/A'}. ${m.attendees ? `Group invite: ${m.attendees}.` : ''}` : undefined,
      link: m.link,
      organizer: m.organizer,
      attendees: m.attendees,
      location: m.location,
      meetingType: m.type,
      responseStatus: m.responseStatus,
    }));

  const fullSchedule = [...enrichedSchedule, ...unmatchedMeetings].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  // Compute next/current meeting (only relevant for "today" view)
  const meetingIndicator = (() => {
    if (activeDay !== 'today') return undefined;
    const now = new Date();
    const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find the next upcoming item on the schedule
    const upcoming = fullSchedule.find(item => item.time > nowStr);
    if (upcoming) return { type: 'next' as const, time: upcoming.time, title: upcoming.title };

    return undefined;
  })();

  return (
    <>
      {/* Splash screen overlay — dashboard mounts only after exit completes */}
      <AnimatePresence onExitComplete={() => setDashboardReady(true)}>
        {showSplash && <SplashScreen onComplete={() => {}} />}
      </AnimatePresence>

      <BackgroundMesh />

      {/* Dashboard renders once splash exit animation is done, so all entrance animations play visibly */}
      {dashboardReady && (<>
      <div className="relative z-10 max-w-[1440px] mx-auto px-3 md:px-6">

        {/* Sticky header zone */}
        <div className="sticky top-0 z-40 pt-3 md:pt-4 pb-2">
          <div className="glass-static rounded-2xl overflow-hidden gradient-border">
            <Header
              activeDay={activeDay}
              onDayChange={handleDayChange}
              onImportClick={() => setImportOpen(true)}
              onResetClick={resetToDemo}
              onRefreshClick={refreshFromFolder}
              onSettingsClick={() => setSettingsOpen(true)}
              onHelpClick={() => setHelpOpen(true)}
              isUsingDemo={isUsingDemo}
              isLoading={isLoading}
              displayName={displayName}
              photoUrl={settings.photoUrl}
              city={settings.city}
              dateFormat={settings.dateFormat}
              timeFormat={settings.timeFormat}
            />
            {/* Divider */}
            <div className="mx-4 md:mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--accent-blue), var(--accent-teal), transparent)' }} />
            {/* Stats + freshness + keyboard help */}
            <div className="flex items-center">
              <div className="flex-1">
                <StatsBar {...stats} />
              </div>
              <div className="flex items-center gap-1 pr-3 md:pr-6">
                <DataFreshness lastLoaded={lastLoaded} isUsingDemo={isUsingDemo} loadError={loadError} />
                <KeyboardHelp />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeDay}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="pb-6 md:pb-8"
          >
            {/* Day summary */}
            <DaySummary
              activeDay={activeDay}
              meetings={stats.meetings}
              totalTasks={stats.total}
              overdueTasks={stats.overdue}
              doneTasks={stats.done}
              emails={stats.emails}
              unreadEmails={stats.unreadEmails}
              commitments={stats.commitments}
              hasHighPriority={stats.hasHighPriority}
              meetingIndicator={meetingIndicator}
            />

            {/* Row 1: 3 columns — Schedule | Tasks | Inbox (staggered entrance) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mb-3 md:mb-4">
              <motion.div
                className="md:col-span-3 h-[500px] md:h-[calc(100dvh-220px)] min-h-[400px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
              >
                <TimelinePanel schedule={fullSchedule} activeDay={activeDay} onAddClick={() => setAddScheduleOpen(true)} city={settings.city} timeFormat={settings.timeFormat} />
              </motion.div>
              <motion.div
                className="md:col-span-5 h-[500px] md:h-[calc(100dvh-220px)] min-h-[400px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
              >
                <TasksPanel
                  tasks={dayData.tasks}
                  onToggle={toggleTask}
                  completed={stats.done}
                  total={stats.total}
                  onAddClick={() => setAddTaskOpen(true)}
                  city={settings.city}
                  dateFormat={settings.dateFormat}
                />
              </motion.div>
              <motion.div
                className="md:col-span-4 h-[500px] md:h-[calc(100dvh-220px)] min-h-[400px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.19, ease: [0.4, 0, 0.2, 1] }}
              >
                <EmailInboxPanel emails={dayData.emailsInbox} highPriorityEmails={settings.highPriorityEmails} timeFormat={settings.timeFormat} />
              </motion.div>
            </div>

            {/* Row 2: 2 columns — Commitments | Sent (staggered entrance) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <motion.div
                className="h-[400px] md:h-[450px] min-h-[300px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.26, ease: [0.4, 0, 0.2, 1] }}
              >
                <CommitmentTrackerPanel allData={allData} userName={settings.name} onAddClick={() => setAddCommitmentOpen(true)} city={settings.city} dateFormat={settings.dateFormat} />
              </motion.div>
              <motion.div
                className="h-[400px] md:h-[450px] min-h-[300px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.33, ease: [0.4, 0, 0.2, 1] }}
              >
                <EmailSentPanel emails={dayData.emailsSent} dateFormat={settings.dateFormat} timeFormat={settings.timeFormat} />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={importData}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      <AddTaskModal
        isOpen={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        activeDate={getActiveDateStr(activeDay)}
        userName={settings.name}
        onAdded={refreshFromFolder}
      />

      <AddScheduleModal
        isOpen={addScheduleOpen}
        onClose={() => setAddScheduleOpen(false)}
        activeDate={getActiveDateStr(activeDay)}
        userName={settings.name}
        onAdded={refreshFromFolder}
      />

      <AddCommitmentModal
        isOpen={addCommitmentOpen}
        onClose={() => setAddCommitmentOpen(false)}
        activeDate={getActiveDateStr(activeDay)}
        userName={settings.name}
        city={settings.city}
        onAdded={refreshFromFolder}
      />

      <Footer />
      </>)}
    </>
  );
}
