/**
 * City-aware date/time utilities.
 * All dates and times in the app should use these helpers
 * so they reflect the user's configured city timezone.
 */

/** Register a custom city timezone (used by geocoding-based city search) */
export function registerCityTimezone(city: string, timezone: string) {
  CITY_TIMEZONES[city.toLowerCase()] = timezone;
}

/** IANA timezone for each supported city */
export const CITY_TIMEZONES: Record<string, string> = {
  'dubai': 'Asia/Dubai',
  'abu dhabi': 'Asia/Dubai',
  'sharjah': 'Asia/Dubai',
  'riyadh': 'Asia/Riyadh',
  'doha': 'Asia/Qatar',
  'mumbai': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'singapore': 'Asia/Singapore',
  'tokyo': 'Asia/Tokyo',
  'london': 'Europe/London',
  'paris': 'Europe/Paris',
  'new york': 'America/New_York',
  'san francisco': 'America/Los_Angeles',
  'los angeles': 'America/Los_Angeles',
  'chicago': 'America/Chicago',
  'toronto': 'America/Toronto',
  'sydney': 'Australia/Sydney',
};

function tz(city: string): string {
  return CITY_TIMEZONES[city.toLowerCase()] || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Get the current date parts in the city's timezone */
function partsInCity(city: string, date?: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const d = date || new Date();
  const timezone = tz(city);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map(p => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? '0' : parts.hour),
    minute: Number(parts.minute),
  };
}

/** YYYY-MM-DD for "today" in the city, with optional day offset (-1 = yesterday, +1 = tomorrow) */
export function getDateStr(city: string, dayOffset = 0): string {
  const d = new Date();
  if (dayOffset !== 0) d.setDate(d.getDate() + dayOffset);
  const { year, month, day } = partsInCity(city, d);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** HH:MM (24h) for the current time in the city */
export function getTimeStr(city: string): string {
  const { hour, minute } = partsInCity(city);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Current hour + fractional minutes (e.g. 14.5 = 2:30 PM) for timeline indicators */
export function getCurrentHourFraction(city: string): number {
  const { hour, minute } = partsInCity(city);
  return hour + minute / 60;
}

/** Current total minutes since midnight in the city (e.g. 870 = 2:30 PM) */
export function getCurrentMinutes(city: string): number {
  const { hour, minute } = partsInCity(city);
  return hour * 60 + minute;
}

/** Formatted time string for display (e.g. "2:30 PM" or "14:30") */
export function getDisplayTime(city: string, format: TimeFormatOption = '24h'): string {
  const timezone = tz(city);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h',
  }).format(new Date());
}

/**
 * Format a stored HH:MM (24h) time string for display.
 * In 24h mode returns as-is. In 12h mode converts to "2:30 PM".
 */
export function formatTimeDisplay(time: string, format: TimeFormatOption = '24h'): string {
  if (!time || format === '24h') return time;
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return m === '00' ? `${h} ${ampm}` : `${h}:${m} ${ampm}`;
}

/** Formatted date string for display (e.g. "Friday, Mar 28, 2026") */
export function getDisplayDate(city: string): string {
  const timezone = tz(city);
  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

/** Short date label for a day offset (e.g. "Mar 28") */
export function getShortDateLabel(city: string, dayOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const timezone = tz(city);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/** Check if a deadline date (YYYY-MM-DD) is overdue compared to today in the city */
export function isOverdueInCity(city: string, deadlineStr: string): boolean {
  const todayStr = getDateStr(city);
  return deadlineStr < todayStr;
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export type DateFormatOption = 'DD MMM YYYY' | 'MMM DD, YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormatOption = '24h' | '12h';

/**
 * Format a YYYY-MM-DD (or YYYY-MM-DD HH:MM) date string to the user's chosen format.
 * Returns the original string if it can't be parsed.
 */
export function formatDate(dateStr: string, format: DateFormatOption = 'DD MMM YYYY'): string {
  if (!dateStr) return dateStr;
  // Extract just the date part (handles "2026-03-27 10:00" or "2026-03-27T10:00")
  const datePart = dateStr.split(/[T\s]/)[0];
  const match = datePart.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return dateStr; // not a YYYY-MM-DD string, return as-is
  const [, y, m, d] = match;
  const month = parseInt(m, 10);
  const day = parseInt(d, 10);
  const mon = MONTH_SHORT[month - 1] || m;
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  switch (format) {
    case 'DD MMM YYYY': return `${day} ${mon} ${y}`;
    case 'MMM DD, YYYY': return `${mon} ${day}, ${y}`;
    case 'DD/MM/YYYY': return `${dd}/${mm}/${y}`;
    case 'MM/DD/YYYY': return `${mm}/${dd}/${y}`;
    case 'YYYY-MM-DD': return datePart;
    default: return `${day} ${mon} ${y}`;
  }
}

/** Short date label formatted per user preference (e.g. "28 Mar", "Mar 28", "28/03") */
export function getShortDateFormatted(city: string, dayOffset: number, format: DateFormatOption = 'DD MMM YYYY'): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const { year, month, day } = partsInCity(city, d);
  const mon = MONTH_SHORT[month - 1];
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  switch (format) {
    case 'DD MMM YYYY': return `${day} ${mon}`;
    case 'MMM DD, YYYY': return `${mon} ${day}`;
    case 'DD/MM/YYYY': return `${dd}/${mm}`;
    case 'MM/DD/YYYY': return `${mm}/${dd}`;
    case 'YYYY-MM-DD': return `${year}-${mm}-${dd}`;
    default: return `${day} ${mon}`;
  }
}

/** Full display date formatted per user preference (e.g. "Friday, 28 Mar 2026") */
export function getDisplayDateFormatted(city: string, format: DateFormatOption = 'DD MMM YYYY'): string {
  const timezone = tz(city);
  const d = new Date();
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(d);
  const { year, month, day } = partsInCity(city, d);
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return `${weekday}, ${formatDate(dateStr, format)}`;
}
