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
  if (v === 'high' || v === 'urgent' || v === 'critical' || v === 'evp' || v === 'vp') return 'high';
  if (v === 'medium' || v === 'normal' || v === 'moderate') return 'medium';
  if (v === 'low' || v === 'minor' || v === 'fyi' || v === 'info') return 'low';
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
function warnBadDate(dateStr: string, sheet: string, row: number, colName: string, warnings: string[]): void {
  if (!dateStr || dateStr === todayStr()) return;
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateStr)) return; // looks like YYYY-MM-DD — good
  warnings.push(`${sheet} row ${row + 1}: "${colName}" value "${dateStr}" is not in YYYY-MM-DD format. Dates like DD/MM or MM/DD are ambiguous.`);
}

// ---------------------------------------------------------------------------
// Case-insensitive, alias-aware column resolver
// ---------------------------------------------------------------------------

/**
 * Normalize row keys to lowercase for case-insensitive matching.
 * Called once per row, returns a new object with all keys lowercased.
 */
function lowerKeys(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    out[key.toLowerCase().trim()] = row[key];
  }
  return out;
}

/**
 * Resolve a column value by trying a list of lowercase aliases in order.
 * The row passed in MUST already have lowercased keys (via lowerKeys()).
 *
 * Example: col(row, 'title', 'subject', 'taskname', 'name', 'event', 'eventtitle')
 * will try row.title, row.subject, row.taskname, row.name, etc.
 */
function col(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Sheet finder — case-insensitive + common aliases
// ---------------------------------------------------------------------------
function findSheet(wb: XLSX.WorkBook, ...names: string[]): XLSX.WorkSheet | null {
  // Build a lowercase → actual name map
  const lcMap: Record<string, string> = {};
  for (const sn of wb.SheetNames) {
    lcMap[sn.toLowerCase().trim()] = sn;
  }
  for (const name of names) {
    const actual = lcMap[name.toLowerCase().trim()];
    if (actual && wb.Sheets[actual]) return wb.Sheets[actual];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main row parser
// ---------------------------------------------------------------------------
function parseRows(wb: XLSX.WorkBook, data: Record<string, DayData>): { errors: string[]; rowsParsed: number; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  let rowsParsed = 0;

  // ── Schedule sheet ──────────────────────────────────────────────────
  const scheduleSheet = findSheet(wb, 'Schedule');
  if (scheduleSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(scheduleSheet, { raw: false });
    rows.forEach((rawRow, i) => {
      const row = lowerKeys(rawRow);
      const date = String(col(row, 'date') || '') || todayStr();
      warnBadDate(date, 'Schedule', i, 'date', warnings);
      ensureDay(data, date);
      const time = normalizeTime(col(row, 'time', 'starttime', 'start_time', 'start'));
      const title = col(row, 'title', 'subject', 'event', 'eventtitle', 'event_title', 'eventname', 'name');
      if (time && title) {
        const endTime = normalizeTime(col(row, 'endtime', 'end_time', 'end')) || time;
        data[date].schedule.push({
          id: genId('s', i),
          time,
          endTime,
          title: String(title),
          type: (String(col(row, 'type', 'eventtype', 'event_type', 'category') || 'task') as ScheduleItem['type']),
          description: col(row, 'description', 'notes', 'agendanotes', 'agenda_notes', 'agenda', 'details', 'body', 'comment', 'comments') ? String(col(row, 'description', 'notes', 'agendanotes', 'agenda_notes', 'agenda', 'details', 'body', 'comment', 'comments')) : undefined,
          link: col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink') ? String(col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink')) : undefined,
          responseStatus: col(row, 'responsestatus', 'response_status', 'response', 'rsvp', 'status') ? (String(col(row, 'responsestatus', 'response_status', 'response', 'rsvp', 'status')).toLowerCase() as ScheduleItem['responseStatus']) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // ── Tasks sheet ─────────────────────────────────────────────────────
  const tasksSheet = findSheet(wb, 'Tasks');
  if (tasksSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(tasksSheet, { raw: false });
    rows.forEach((rawRow, i) => {
      const row = lowerKeys(rawRow);
      const date = String(col(row, 'date') || '') || todayStr();
      warnBadDate(date, 'Tasks', i, 'date', warnings);
      ensureDay(data, date);
      const title = col(row, 'title', 'taskname', 'task_name', 'task', 'name', 'subject', 'description');
      if (title) {
        const dueDate = col(row, 'duedate', 'due_date', 'due', 'deadline');
        if (dueDate) warnBadDate(String(dueDate), 'Tasks', i, 'dueDate', warnings);
        const daysOpenRaw = col(row, 'daysopen', 'days_open', 'dayspending', 'age');
        let daysOpen: number | null = null;
        if (daysOpenRaw !== undefined && daysOpenRaw !== '' && daysOpenRaw !== null) {
          const parsed = Number(daysOpenRaw);
          if (!isNaN(parsed)) daysOpen = parsed;
        }

        data[date].tasks.push({
          id: genId('t', i),
          title: String(title),
          priority: normalizePriority(String(col(row, 'priority', 'importance', 'urgency', 'level') || 'medium')),
          status: (String(col(row, 'status', 'state', 'taskstatus', 'task_status') || 'open') as Task['status']),
          dueDate: dueDate ? String(dueDate) : undefined,
          source: col(row, 'source', 'origin', 'from', 'sourceinfo') ? String(col(row, 'source', 'origin', 'from', 'sourceinfo')) : undefined,
          owner: col(row, 'owner', 'assignee', 'assignedto', 'assigned_to', 'responsible') ? String(col(row, 'owner', 'assignee', 'assignedto', 'assigned_to', 'responsible')) : undefined,
          daysOpen,
          category: col(row, 'category', 'group', 'tag', 'label', 'department') ? String(col(row, 'category', 'group', 'tag', 'label', 'department')) : undefined,
          taskType: normalizeTaskType(String(col(row, 'tasktype', 'task_type', 'type', 'kind') || 'action')),
          link: col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink') ? String(col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink')) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // ── Meetings sheet ──────────────────────────────────────────────────
  const meetingsSheet = findSheet(wb, 'Meetings', 'Meeting');
  if (meetingsSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(meetingsSheet, { raw: false });
    rows.forEach((rawRow, i) => {
      const row = lowerKeys(rawRow);
      const date = String(col(row, 'date') || '') || todayStr();
      warnBadDate(date, 'Meetings', i, 'date', warnings);
      ensureDay(data, date);
      const time = normalizeTime(col(row, 'time', 'starttime', 'start_time', 'start'));
      const title = col(row, 'title', 'subject', 'meetingtitle', 'meeting_title', 'meetingname', 'name', 'event', 'eventtitle');
      // Skip empty placeholder rows (date-only, no title)
      if (title && time) {
        const endTime = normalizeTime(col(row, 'endtime', 'end_time', 'end')) || time;
        data[date].meetings.push({
          id: genId('m', i),
          title: String(title),
          time,
          endTime,
          organizer: col(row, 'organizer', 'organiser', 'host', 'createdby', 'created_by', 'scheduledby') ? String(col(row, 'organizer', 'organiser', 'host', 'createdby', 'created_by', 'scheduledby')) : undefined,
          attendees: col(row, 'attendees', 'participants', 'invitees', 'members', 'people') ? String(col(row, 'attendees', 'participants', 'invitees', 'members', 'people')) : '',
          location: col(row, 'location', 'room', 'venue', 'place', 'meetingroom', 'meeting_room') ? String(col(row, 'location', 'room', 'venue', 'place', 'meetingroom', 'meeting_room')) : undefined,
          type: (String(col(row, 'type', 'meetingtype', 'meeting_type', 'format', 'mode') || 'teams') as Meeting['type']),
          link: col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink') ? String(col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink')) : undefined,
          responseStatus: col(row, 'responsestatus', 'response_status', 'response', 'rsvp', 'status') ? (String(col(row, 'responsestatus', 'response_status', 'response', 'rsvp', 'status')).toLowerCase() as Meeting['responseStatus']) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // ── Emails Inbox sheet ──────────────────────────────────────────────
  const inboxSheet = findSheet(wb, 'Emails Inbox', 'Inbox', 'Email Inbox', 'EmailsInbox', 'Emails_Inbox');
  if (inboxSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(inboxSheet, { raw: false });
    rows.forEach((rawRow, i) => {
      const row = lowerKeys(rawRow);
      const date = String(col(row, 'date') || '') || todayStr();
      warnBadDate(date, 'Emails Inbox', i, 'date', warnings);
      ensureDay(data, date);
      const from = col(row, 'from', 'sender', 'sentby', 'sent_by', 'author', 'sendername', 'sender_name');
      const subject = col(row, 'subject', 'title', 'emailsubject', 'email_subject', 'subjectline', 'subject_line');
      if (from && subject) {
        const time = normalizeTime(col(row, 'time', 'receivedtime', 'received_time', 'received', 'timestamp')) || '09:00';
        data[date].emailsInbox.push({
          id: genId('ei', i),
          time,
          from: String(from),
          subject: String(subject),
          folder: col(row, 'folder', 'foldername', 'folder_name', 'mailbox', 'category') ? String(col(row, 'folder', 'foldername', 'folder_name', 'mailbox', 'category')) : undefined,
          priority: (String(col(row, 'priority', 'importance', 'urgency', 'level') || 'normal') as InboxEmail['priority']),
          readStatus: (String(col(row, 'readstatus', 'read_status', 'read', 'unread', 'status', 'isread') || 'read') as InboxEmail['readStatus']),
          addressed: (String(col(row, 'addressed', 'addressedto', 'addressed_to', 'toorcc', 'recipienttype') || 'direct') as InboxEmail['addressed']),
          summary: col(row, 'summary', 'description', 'body', 'preview', 'snippet', 'notes', 'emailsummary') ? String(col(row, 'summary', 'description', 'body', 'preview', 'snippet', 'notes', 'emailsummary')) : '',
          myReply: (String(col(row, 'myreply', 'my_reply', 'replied', 'hasreply', 'has_reply', 'reply') || 'no') as InboxEmail['myReply']),
          replySummary: col(row, 'replysummary', 'reply_summary', 'replytext', 'reply_text', 'replydetail') ? String(col(row, 'replysummary', 'reply_summary', 'replytext', 'reply_text', 'replydetail')) : undefined,
          attachment: (String(col(row, 'attachment', 'attachments', 'hasattachment', 'has_attachment', 'hasattachments') || 'no') as InboxEmail['attachment']),
          link: col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink') ? String(col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink')) : undefined,
        });
        rowsParsed++;
      }
    });
  }

  // ── Emails Sent sheet ───────────────────────────────────────────────
  const sentSheet = findSheet(wb, 'Emails Sent', 'Sent', 'Email Sent', 'EmailsSent', 'Emails_Sent', 'Sent Items');
  if (sentSheet) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sentSheet, { raw: false });
    rows.forEach((rawRow, i) => {
      const row = lowerKeys(rawRow);
      const date = String(col(row, 'date') || '') || todayStr();
      warnBadDate(date, 'Emails Sent', i, 'date', warnings);
      ensureDay(data, date);
      const to = col(row, 'to', 'recipient', 'sentto', 'sent_to', 'recipients', 'toname');
      const subject = col(row, 'subject', 'title', 'emailsubject', 'email_subject', 'subjectline', 'subject_line');
      if (to && subject) {
        const deadlineVal = col(row, 'deadline', 'duedate', 'due_date', 'due', 'commitmentdeadline');
        if (deadlineVal) warnBadDate(String(deadlineVal), 'Emails Sent', i, 'deadline', warnings);
        const time = normalizeTime(col(row, 'time', 'senttime', 'sent_time', 'sent', 'timestamp')) || '09:00';
        data[date].emailsSent.push({
          id: genId('es', i),
          time,
          to: String(to),
          subject: String(subject),
          summary: col(row, 'summary', 'description', 'body', 'preview', 'snippet', 'notes', 'emailsummary') ? String(col(row, 'summary', 'description', 'body', 'preview', 'snippet', 'notes', 'emailsummary')) : '',
          importance: (String(col(row, 'importance', 'priority', 'urgency', 'level') || 'normal') as SentEmail['importance']),
          commitment: (String(col(row, 'commitment', 'iscommitment', 'is_commitment', 'committed', 'hascommitment') || 'no') as SentEmail['commitment']),
          owner: col(row, 'owner', 'assignee', 'assignedto', 'assigned_to', 'responsible', 'commitmentowner') ? String(col(row, 'owner', 'assignee', 'assignedto', 'assigned_to', 'responsible', 'commitmentowner')) : undefined,
          deadline: deadlineVal ? String(deadlineVal) : undefined,
          attachment: (String(col(row, 'attachment', 'attachments', 'hasattachment', 'has_attachment', 'hasattachments') || 'no') as SentEmail['attachment']),
          link: col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink') ? String(col(row, 'link', 'url', 'outlookurl', 'outlook_url', 'weblink')) : undefined,
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
