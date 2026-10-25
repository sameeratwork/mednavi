import { VisitEvent } from './types';

/**
 * Escapes characters for RFC 5545 iCalendar values.
 */
function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Converts a Tokyo local date (YYYY-MM-DD) and time (HH:mm) into a UTC Date object.
 * Tokyo is UTC+9 with no daylight saving time.
 */
function getTokyoDateAsUtc(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Tokyo is UTC+9, so UTC hours = hours - 9
  return new Date(Date.UTC(year, month - 1, day, hours - 9, minutes, 0));
}

/**
 * Formats a Date object to iCalendar UTC timestamp string: YYYYMMDDTHHmmssZ
 */
function formatIcsUtcTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

/**
 * Builds the standard "What to bring" checklist description for medical visits in Japan.
 */
function buildEventDescription(event: VisitEvent): string {
  const parts: string[] = [];

  parts.push(`Medical Visit: ${event.title}`);
  parts.push(`Clinic: ${event.clinic}`);
  parts.push(`Department: ${event.department}`);
  if (event.doctorName) {
    parts.push(`Doctor: ${event.doctorName}`);
  }
  if (event.address) {
    parts.push(`Address: ${event.address}`);
  }
  if (event.notes) {
    parts.push(`\nNotes:\n${event.notes}`);
  }

  parts.push('\n--- WHAT TO BRING (持参物チェックリスト) ---');
  parts.push('1. Health insurance card (健康保険証) or My Number card (マイナンバーカード)');
  parts.push('2. Residence card (在留カード) or Passport');
  parts.push('3. Medicine notebook or prescription history (お薬手帳)');
  parts.push('4. Cash in JPY (many Japanese clinics do not accept credit cards)');
  parts.push('\nManaged via MedNavi Japan (https://mednavi.jp)');

  return parts.join('\n');
}

/**
 * Generates an RFC 5545 VEVENT block for a VisitEvent.
 */
function generateVEventBlock(event: VisitEvent): string {
  const startDateUtc = getTokyoDateAsUtc(event.date, event.time);
  // Default appointment length: 45 minutes
  const endDateUtc = new Date(startDateUtc.getTime() + 45 * 60 * 1000);
  const nowUtc = new Date();

  const dtStart = formatIcsUtcTimestamp(startDateUtc);
  const dtEnd = formatIcsUtcTimestamp(endDateUtc);
  const dtStamp = formatIcsUtcTimestamp(nowUtc);
  const uid = `${event.id}@mednavi.jp`;

  const description = escapeIcsText(buildEventDescription(event));
  const summary = escapeIcsText(`${event.title} - ${event.clinic}`);
  const location = escapeIcsText(event.address || event.clinic);

  let valarmBlock = '';
  if (event.reminder === '1_day_before') {
    valarmBlock = [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Medical visit tomorrow at ' + escapeIcsText(event.clinic),
      'TRIGGER:-P1D',
      'END:VALARM',
    ].join('\r\n');
  } else if (event.reminder === '2_hours_before') {
    valarmBlock = [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Medical visit in 2 hours at ' + escapeIcsText(event.clinic),
      'TRIGGER:-PT2H',
      'END:VALARM',
    ].join('\r\n');
  }

  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
  ];

  if (valarmBlock) {
    lines.push(valarmBlock);
  }

  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Generates a full RFC 5545 iCalendar string for a single event.
 */
export function generateSingleEventIcs(event: VisitEvent): string {
  const vevent = generateVEventBlock(event);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MedNavi Japan//Care Planner Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:Asia/Tokyo',
    vevent,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates a full RFC 5545 iCalendar string containing multiple events.
 */
export function generateBulkIcs(events: VisitEvent[]): string {
  const vevents = events.map(generateVEventBlock).join('\r\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MedNavi Japan//Care Planner Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-TIMEZONE:Asia/Tokyo',
    vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser download of the generated .ics content.
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds a direct "Add to Google Calendar" link using UTC timestamps adjusted from Tokyo.
 */
export function buildGoogleCalendarUrl(event: VisitEvent): string {
  const startDateUtc = getTokyoDateAsUtc(event.date, event.time);
  const endDateUtc = new Date(startDateUtc.getTime() + 45 * 60 * 1000);

  const startFormatted = formatIcsUtcTimestamp(startDateUtc);
  const endFormatted = formatIcsUtcTimestamp(endDateUtc);

  const text = encodeURIComponent(`${event.title} - ${event.clinic}`);
  const dates = `${startFormatted}/${endFormatted}`;
  const details = encodeURIComponent(buildEventDescription(event));
  const location = encodeURIComponent(event.address || event.clinic);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}
