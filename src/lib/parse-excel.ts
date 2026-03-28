import * as XLSX from 'xlsx';
import { DayData, ScheduleItem, Task, Meeting, InboxEmail, SentEmail } from './types';
import { getDateStr } from './city-time';

interface ParseResult {
  data: Record<string, DayData>;
  errors: string[];
  warnings: string[];
  rowsParsed: number;
}

export function emptyDay(date: string): DayData {
  return { date, schedule: [], tasks: [], meetings: [], emailsInbox: [], emailsSent: [] };
}

function ensureDay(data: Record<string, DayData>, date: string): DayData {
  if (!data[date]) data[date] = emptyDay(date);
  return data[date];
}

function todayStr(): string {
  return getDateStr('');
}

function genId(prefix: string, i: number): string {
  return `${prefix}-imp-${i}`;
}

/** Normalize scheduler taskType values to our 4-value enum */
function normalizeTaskType(raw: string): 'action' | 'deadline' | 'followup' | 'personal' {
  const v = raw.toLowerCase().replace(/[-_\s]/g, '');
  if (v === 'action') return 'action';
  if (v === 'deadline') return 'deadline';
  if (v === 'followup' || v === 'followups') return 'followup';
  if (v === 'personal') return 'personal';
  // Map scheduler-specific types
  if (v === 'decision') return 'action';
  if (v === 'commitment') return 'action';
  if (v === 'recurring') return 'action';
  if (v === 'overdue') return 'deadline'; // overdue items are usually deadline-related
  return 'action'; // safe default
}

/** Normalize priority: scheduler may send 'normal' which isn't in our enum */
function normalizePriority(raw: string): 'high' | 'medium' | 'low' {
  const v = raw.toLowerCase().trim();
  if (v === 'high') return 'high';
  if (v === 'medium') return 'medium';
  if (v === 'low') return 'low';
  if (v === 'normal') return 'medium'; // common scheduler output
  return 'medium';
}

/**
 * Normalize time values from Excel.
 * Excel can return times as:
 *  - Decimal numbers (0.4375 = 10:30 AM)
 *  - Strings like "10:30", "10:30:00", "10:30 AM"
 *  - Date objects
 * We normalize all to "HH:MM" (24-hour) format.
 */
function normalizeTime(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null;

  // If it's a number, treat as Excel serial time (fraction of day)
  if (typeof raw === 'number') {
    // Excel stores time as fraction: 0.5 = 12:00, 0.4375 = 10:30
    const totalMinutes = Math.round(raw * 24 * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const str = String(raw).trim();
  if (!str) return null;

  // Already in HH:MM or H:MM format
  const hhmm = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmm) {
    const h = parseInt(hhmm[1], 10);
    const m = parseInt(hhmm[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }

  // "10:30 AM" / "2:00 PM" format
  const ampm = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }

  // "10 AM" / "2 PM" (no minutes)
  const ampmNoMin = str.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (ampmNoMin) {
    let h = parseInt(ampmNoMin[1], 10);
    const period = ampmNoMin[2].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    if (h >= 0 && h < 24) {
      return `${h.toString().padStart(2, '0')}:00`;
    }
  }

  return null; // Could not parse
}

/** Warn if a date string doesn't match YYYY-MM-DD format */
function warnBadDate(dateStr: string, sheet: string, row: number, col: string, warnings: string[]): void {
  if (!dateStr || dateStr === todayStr()) return;
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateStr)) return; // looks like YYYY-MM-DD — good
  warnings.push(`${sheet} row ${row + 1}: "${col}" value "${dateStr}" is not in YYYY-MM-DD format. Dates like DD/MM or MM/DD are ambiguous.`);
}

function parseRows(wb: XLSX.WorkBook, data: Record<string, DayData>): { errors: string[]; rowsParsed: number; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rowsParsed = 0;

  // Schedule sheet
  const scheduleSheet = wb.Sheets['Schedule'] || wb.Sheets['schedule'];
  if (scheduleSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(scheduleSheet, { raw: false });
    rows.forEach((row, i) => {
      const date = String(row.date || '') || todayStr();
      warnBadDate(date, 'Schedule', i, 'date', warnings);
      ensureDay(data, date);
      const time = normalizeTime(row.time);
      if (time && row.title) {
        const endTime = normalizeTime(row.endTime) || time;
        data[date].schedule.push({
          id: genId('s', i),
          time,
          endTime,
          title: String(row.title),
          type: (String(row.type || 'task') as ScheduleItem['type']),
          description: row.description ? String(row.description) : undefined,
          link: row.link ? String(row.link) : undefined,
          responseStatus: row.responseStatus ? (String(row.responseStatus).toLowerCase() as ScheduleItem['responseStatus']) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // Tasks sheet
  const tasksSheet = wb.Sheets['Tasks'] || wb.Sheets['tasks'];
  if (tasksSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(tasksSheet, { raw: false });
    rows.forEach((row, i) => {
      const date = String(row.date || '') || todayStr();
      warnBadDate(date, 'Tasks', i, 'date', warnings);
      ensureDay(data, date);
      if (row.title) {
        if (row.dueDate) warnBadDate(String(row.dueDate), 'Tasks', i, 'dueDate', warnings);
        const daysOpenRaw = row.daysOpen;
        let daysOpen: number | null = null;
        if (daysOpenRaw !== undefined && daysOpenRaw !== '' && daysOpenRaw !== null) {
          const parsed = Number(daysOpenRaw);
          if (!isNaN(parsed)) daysOpen = parsed;
        }

        data[date].tasks.push({
          id: genId('t', i),
          title: String(row.title),
          priority: normalizePriority(String(row.priority || 'medium')),
          status: (String(row.status || 'open') as Task['status']),
          dueDate: row.dueDate ? String(row.dueDate) : undefined,
          source: row.source ? String(row.source) : undefined,
          owner: row.owner ? String(row.owner) : undefined,
          daysOpen,
          category: row.category ? String(row.category) : undefined,
          taskType: normalizeTaskType(String(row.taskType || 'action')),
          link: row.link ? String(row.link) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // Meetings sheet
  const meetingsSheet = wb.Sheets['Meetings'] || wb.Sheets['meetings'];
  if (meetingsSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(meetingsSheet, { raw: false });
    rows.forEach((row, i) => {
      const date = String(row.date || '') || todayStr();
      warnBadDate(date, 'Meetings', i, 'date', warnings);
      ensureDay(data, date);
      const time = normalizeTime(row.time);
      // Skip empty placeholder rows (date-only, no title)
      if (row.title && time) {
        const endTime = normalizeTime(row.endTime) || time;
        data[date].meetings.push({
          id: genId('m', i),
          title: String(row.title),
          time,
          endTime,
          organizer: row.organizer ? String(row.organizer) : undefined,
          attendees: row.attendees ? String(row.attendees) : '',
          location: row.location ? String(row.location) : undefined,
          type: (String(row.type || 'teams') as Meeting['type']),
          link: row.link ? String(row.link) : undefined,
          responseStatus: row.responseStatus ? (String(row.responseStatus).toLowerCase() as Meeting['responseStatus']) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // Emails Inbox sheet
  const inboxSheet = wb.Sheets['Emails Inbox'] || wb.Sheets['emails inbox'] || wb.Sheets['Inbox'];
  if (inboxSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(inboxSheet, { raw: false });
    rows.forEach((row, i) => {
      const date = String(row.date || '') || todayStr();
      warnBadDate(date, 'Emails Inbox', i, 'date', warnings);
      ensureDay(data, date);
      if (row.from && row.subject) {
        const time = normalizeTime(row.time) || '09:00';
        data[date].emailsInbox.push({
          id: genId('ei', i),
          time,
          from: String(row.from),
          subject: String(row.subject),
          folder: row.folder ? String(row.folder) : undefined,
          priority: (String(row.priority || 'normal') as InboxEmail['priority']),
          readStatus: (String(row.readStatus || 'read') as InboxEmail['readStatus']),
          addressed: (String(row.addressed || 'direct') as InboxEmail['addressed']),
          summary: row.summary ? String(row.summary) : '',
          myReply: (String(row.myReply || 'no') as InboxEmail['myReply']),
          replySummary: row.replySummary ? String(row.replySummary) : undefined,
          attachment: (String(row.attachment || 'no') as InboxEmail['attachment']),
          link: row.link ? String(row.link) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // Emails Sent sheet
  const sentSheet = wb.Sheets['Emails Sent'] || wb.Sheets['emails sent'] || wb.Sheets['Sent'];
  if (sentSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sentSheet, { raw: false });
    rows.forEach((row, i) => {
      const date = String(row.date || '') || todayStr();
      warnBadDate(date, 'Emails Sent', i, 'date', warnings);
      ensureDay(data, date);
      if (row.to && row.subject) {
        if (row.deadline) warnBadDate(String(row.deadline), 'Emails Sent', i, 'deadline', warnings);
        const time = normalizeTime(row.time) || '09:00';
        data[date].emailsSent.push({
          id: genId('es', i),
          time,
          to: String(row.to),
          subject: String(row.subject),
          summary: row.summary ? String(row.summary) : '',
          importance: (String(row.importance || 'normal') as SentEmail['importance']),
          commitment: (String(row.commitment || 'no') as SentEmail['commitment']),
          owner: row.owner ? String(row.owner) : undefined,
          deadline: row.deadline ? String(row.deadline) : undefined,
          attachment: (String(row.attachment || 'no') as SentEmail['attachment']),
          link: row.link ? String(row.link) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  if (rowsParsed === 0) {
    errors.push('No valid data found. Make sure your sheets are named: Schedule, Tasks, Meetings, Emails Inbox, Emails Sent');
  }

  return { errors, rowsParsed, warnings };
}

/** Client-side: parse from ArrayBuffer (file upload) */
export function parseExcelFile(file: ArrayBuffer): ParseResult {
  const data: Record<string, DayData> = {};
  try {
    const wb = XLSX.read(file, { type: 'array' });
    const { errors, rowsParsed, warnings } = parseRows(wb, data);
    return { data, errors, warnings, rowsParsed };
  } catch (e) {
    return { data, errors: [`Failed to parse file: ${e instanceof Error ? e.message : 'Unknown error'}`], warnings: [], rowsParsed: 0 };
  }
}
