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
      if (task.status === 'open' || task.status === 'overdue') {
        if (!nextTitles.has(task.title.toLowerCase())) {
          // Carry forward: increment daysOpen, mark as overdue if it had a dueDate in the past
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
  const [allData, setAllData] = useState<Record<string, DayData>>(() => getDemoData());
  const [isUsingDemo, setIsUsingDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  // Apply task persistence
  const persistedData = useMemo(() => persistTasks(allData, city), [allData, city]);

  const dayData = useMemo(() => getDayDataForView(activeDay, persistedData, city), [activeDay, persistedData, city]);

  const loadFromFolder = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/load-data');
      const json = await res.json();
      if (json.data && !json.empty) {
        setAllData(json.data);
        setIsUsingDemo(false);
        setLastLoaded(new Date());
        return true;
      }
    } catch {
      // silently fall back to demo
    } finally {
      setIsLoading(false);
    }
    return false;
  }, []);

  // Auto-load from data/ folder on mount (skip on Vercel demo — keep demo data)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== '1') {
      loadFromFolder();
    }
  }, [loadFromFolder]);

  const importData = useCallback((data: Record<string, DayData>) => {
    setAllData(data);
    setIsUsingDemo(false);
  }, []);

  const resetToDemo = useCallback(() => {
    setAllData(getDemoData());
    setIsUsingDemo(true);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setAllData(prev => {
      const next = { ...prev };
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

          // Write back to Excel (fire-and-forget — don't block the UI)
          if (!isUsingDemo) {
            fetch('/api/update-task', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date: dateKey, title: task.title, newStatus }),
            }).catch(() => {
              // Silent failure — UI state is already updated
            });
          }

          break;
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
    toggleTask,
    refreshFromFolder: loadFromFolder,
    stats,
    lastLoaded,
  };
}
