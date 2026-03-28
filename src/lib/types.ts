export type DayView = 'yesterday' | 'today' | 'tomorrow';

export interface ScheduleItem {
  id: string;
  time: string;
  endTime: string;
  title: string;
  type: 'meeting' | 'task' | 'break' | 'focus' | 'travel';
  color?: string;
  description?: string;
  link?: string;
  // Enriched from Meeting data when merged
  organizer?: string;
  attendees?: string;
  location?: string;
  meetingType?: 'teams' | 'in-person';
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'none';
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'done' | 'overdue';
  dueDate?: string;
  source?: string;
  owner?: string;
  daysOpen?: number | null;
  category?: string;
  taskType: 'action' | 'deadline' | 'followup' | 'personal';
  link?: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  endTime: string;
  organizer?: string;
  attendees: string;
  location?: string;
  type: 'teams' | 'in-person';
  link?: string;
  responseStatus?: 'accepted' | 'tentative' | 'declined' | 'none';
}

export interface InboxEmail {
  id: string;
  time: string;
  from: string;
  subject: string;
  folder?: string;
  priority: string; // e.g. 'evp', 'vp', 'direct', 'cc', 'normal' — any value accepted
  readStatus: 'unread' | 'read';
  addressed: 'direct' | 'cc';
  summary: string;
  myReply: 'yes' | 'no';
  replySummary?: string;
  attachment: 'yes' | 'no';
  link?: string;
}

export interface SentEmail {
  id: string;
  time: string;
  to: string;
  subject: string;
  summary: string;
  importance: 'high' | 'normal';
  commitment: 'yes' | 'no';
  owner?: string;
  deadline?: string;
  attachment: 'yes' | 'no';
  link?: string;
}

export interface DayData {
  date: string;
  schedule: ScheduleItem[];
  tasks: Task[];
  meetings: Meeting[];
  emailsInbox: InboxEmail[];
  emailsSent: SentEmail[];
}

// Sorting constants
export const TASK_TYPE_ORDER: Record<Task['taskType'], number> = {
  action: 0,
  deadline: 1,
  followup: 2,
  personal: 3,
};

export const PRIORITY_ORDER: Record<Task['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const INBOX_PRIORITY_ORDER: Record<string, number> = {
  evp: 0,
  vp: 1,
  high: 0,
  direct: 2,
  cc: 3,
  normal: 4,
};

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  meeting: { bg: 'rgba(96,165,250,0.12)', border: 'var(--accent-blue)', text: 'var(--accent-blue)' },
  task: { bg: 'rgba(167,139,250,0.12)', border: 'var(--accent-purple)', text: 'var(--accent-purple)' },
  email: { bg: 'rgba(52,211,153,0.12)', border: 'var(--accent-green)', text: 'var(--accent-green)' },
  break: { bg: 'rgba(34,211,238,0.12)', border: 'var(--accent-cyan)', text: 'var(--accent-cyan)' },
  focus: { bg: 'rgba(244,114,182,0.12)', border: 'var(--accent-pink)', text: 'var(--accent-pink)' },
  travel: { bg: 'rgba(251,191,36,0.12)', border: 'var(--accent-amber)', text: 'var(--accent-amber)' },
};
