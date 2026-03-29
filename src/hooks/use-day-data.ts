'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { DayView, DayData, Task } from '@/lib/types';
import { getDemoData, getDayDataForView } from '@/lib/demo-data';
import { isHighPriorityEmail } from '@/hooks/use-settings';
import { getDateStr as cityDateStr } from '@/lib/city-time';

function emptyDay(date: string): DayData {
  return { date, schedule: [], tasks: [], meetings: [], emailsInbox: [], emailsSent: [] };
}

function persistTasks(allData: Record<string, DayData>, city: string): Record<string, DayData> {
  const result = { ...allData };

  // Ensure yesterday, today, tomorrow always exist so tasks can carry forward
  for (const offset of [-1, 0, 1]) {
    const dk = cityDateStr(city, offset);
    if (!result[dk]) result[dk] = emptyDay(dk);
  }

  const dateKeys = Object.keys(result).sort(); // chronological
  if (dateKeys.length <= 1) return result;

  // Deep clone each day's tasks
  for (const key of dateKeys) {
    result[key] = { ...result[key], tasks: [...result[key].tasks] };
  }

  for (let i = 0; i < dateKeys.length - 1; i++) {
    const currentDay = result[dateKeys[i]];
    const nextDay = result[dateKeys[i + 1]];
    const nextTitles = new Set(nextDay.tasks.map(t => t.title.toLowerCase()));

    for (const task of currentDay.tasks) {
      if (!nextTitles.has(task.title.toLowerCase())) {
        if (task.status === 'done') {
          // Carry forward done tasks too (so they appear faded at the bottom, not vanish)
          const carried: Task = {
            ...task,
            id: `${task.id}-cf-${dateKeys[i + 1]}`,
          };
          nextDay.tasks.push(carried);
          nextTitles.add(task.title.toLowerCase());
        } else {
          // Open/overdue: carry forward with incremented daysOpen
          const carried: Task = {
            ...task,
            id: `${task.id}-cf-${dateKeys[i + 1]}`,
            daysOpen: (task.daysOpen ?? 0) + 1,
            status: task.status === 'overdue' ? 'overdue' : (task.dueDate && task.dueDate < dateKeys[i + 1] ? 'overdue' : 'open'),
          };
          nextDay.tasks.push(carried);
          nextTitles.add(task.title.toLowerCase());
        }
      }
    }
  }

  return result;
}

export function useDayData(highPriorityEmails: string = '', city: string = '') {
  const [activeDay, setActiveDay] = useState<DayView>('today');
  // Start empty — NOT demo. Real data or demo will be set after load attempt.
  const [allData, setAllData] = useState<Record<string, DayData>>({});
  const [isUsingDemo, setIsUsingDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // start as loading
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Apply task persistence
  const persistedData = useMemo(() => persistTasks(allData, city), [allData, city]);

  const dayData = useMemo(() => getDayDataForView(activeDay, persistedData, city), [activeDay, persistedData, city]);

  const loadFromFolder = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/load-data');
      const json = await res.json();

      if (json.empty) {
        // File doesn't exist in data/ folder → fall back to demo
        setAllData(getDemoData());
        setIsUsingDemo(true);
        setLastLoaded(null);
        return false;
      }

      if (!res.ok || json.error) {
        // File exists but parsing failed — show error, NOT demo
        const errMsg = json.error || `Server returned ${res.status}`;
        console.error('[Day Data] Parse error:', errMsg);
        setLoadError(errMsg);
        // Keep whatever data we already have (empty or previous load)
        return false;
      }

      if (json.data) {
        // Check if we actually got any meaningful data
        const dayKeys = Object.keys(json.data);
        const totalItems = dayKeys.reduce((sum, k) => {
          const d = json.data[k];
          return sum + (d.schedule?.length || 0) + (d.tasks?.length || 0) +
            (d.meetings?.length || 0) + (d.emailsInbox?.length || 0) + (d.emailsSent?.length || 0);
        }, 0);

        if (totalItems > 0) {
          setAllData(json.data);
          setIsUsingDemo(false);
          setLastLoaded(new Date());
          if (json.warnings?.length > 0) {
            console.warn('[Day Data] Warnings:', json.warnings);
          }
          return true;
        } else {
          // File parsed but 0 items — still use it (could be a genuine empty day)
          setAllData(json.data);
          setIsUsingDemo(false);
          setLastLoaded(new Date());
          return true;
        }
      }

      // Unexpected response shape — fall back to demo
      setAllData(getDemoData());
      setIsUsingDemo(true);
      return false;
    } catch (err) {
      // Network error or fetch failure
      const errMsg = err instanceof Error ? err.message : 'Failed to load data';
      console.error('[Day Data] Load failed:', errMsg);
      setLoadError(errMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load from data/ folder on mount (skip on Vercel demo — keep demo data)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') {
      // Vercel demo mode: show demo data immediately
      setAllData(getDemoData());
      setIsUsingDemo(true);
      setIsLoading(false);
    } else {
      loadFromFolder();
    }
  }, [loadFromFolder]);

  const importData = useCallback((data: Record<string, DayData>) => {
    setAllData(data);
    setIsUsingDemo(false);
    setLoadError(null);
  }, []);

  const resetToDemo = useCallback(() => {
    setAllData(getDemoData());
    setIsUsingDemo(true);
    setLoadError(null);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setAllData(prev => {
      const next = { ...prev };

      // First, try to find the task directly in allData (original tasks)
      let found = false;
      for (const dateKey of Object.keys(next)) {
        const day = next[dateKey];
        const taskIndex = day.tasks.findIndex((t: Task) => t.id === taskId);
        if (taskIndex !== -1) {
          const task = day.tasks[taskIndex];
          const newStatus = task.status === 'done' ? 'open' : 'done';

          next[dateKey] = {
            ...day,
            tasks: day.tasks.map((t: Task) => {
              if (t.id !== taskId) return t;
              return { ...t, status: newStatus as Task['status'] };
            }),
          };

          // Write back to Excel (fire-and-forget)
          if (!isUsingDemo) {
            fetch('/api/update-task', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: dateKey, title: task.title, newStatus }),
            }).catch(() => {});
          }

          found = true;
          break;
        }
      }

      // If not found, this is a carried-forward task (exists only in persistedData).
      // The ID format is "{originalId}-cf-{date}". Find the original task by stripping the "-cf-..." suffix.
      if (!found && taskId.includes('-cf-')) {
        const originalId = taskId.replace(/-cf-\d{4}-\d{2}-\d{2}$/, '');
        for (const dateKey of Object.keys(next)) {
          const day = next[dateKey];
          const taskIndex = day.tasks.findIndex((t: Task) => t.id === originalId);
          if (taskIndex !== -1) {
            const task = day.tasks[taskIndex];
            const newStatus = task.status === 'done' ? 'open' : 'done';

            next[dateKey] = {
              ...day,
              tasks: day.tasks.map((t: Task) => {
                if (t.id !== originalId) return t;
                return { ...t, status: newStatus as Task['status'] };
              }),
            };

            // Write back to Excel
            if (!isUsingDemo) {
              fetch('/api/update-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateKey, title: task.title, newStatus }),
              }).catch(() => {});
            }

            break;
          }
        }
      }

      return next;
    });
  }, [isUsingDemo]);

  const stats = useMemo(() => {
    const tasks = dayData.tasks;
    const open = tasks.filter((t: Task) => t.status === 'open').length;
    const done = tasks.filter((t: Task) => t.status === 'done').length;
    const overdue = tasks.filter((t: Task) => t.status === 'overdue').length;
    const total = tasks.length;
    const meetings = dayData.meetings.length;
    const emails = dayData.emailsInbox.length;
    const unreadEmails = dayData.emailsInbox.filter(e => e.readStatus === 'unread').length;
    const commitments = dayData.emailsSent.filter(e => e.commitment === 'yes').length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    // Email priority heat: check if any unread emails match high-priority senders
    const unreadInbox = dayData.emailsInbox.filter(e => e.readStatus === 'unread');
    const hasHighPriority = unreadInbox.some(e => isHighPriorityEmail(e.from, highPriorityEmails));
    const emailHeat: 'high' | 'normal' | null = hasHighPriority ? 'high' : unreadEmails > 0 ? 'normal' : null;

    return { open, done, overdue, total, meetings, emails, unreadEmails, commitments, percentage, emailHeat, hasHighPriority };
  }, [dayData, highPriorityEmails]);

  return {
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
    refreshFromFolder: loadFromFolder,
    stats,
    lastLoaded,
  };
}
