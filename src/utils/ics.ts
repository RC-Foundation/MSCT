import { ComplianceItem, Status } from '../types/compliance';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed);
};

const resolveMonthPlaceholder = (value?: string | null) => {
  if (!value) return null;
  const month = MONTHS.find((monthName) => value.toLowerCase().includes(monthName.toLowerCase()));
  if (!month) return null;
  const now = new Date();
  return new Date(`${month} 1, ${now.getFullYear()}`);
};

export const deriveScheduleDate = (item: ComplianceItem) => {
  return (
    parseDate(item.deadline) ||
    parseDate(item.annualDate) ||
    parseDate(item.cyclicDate) ||
    resolveMonthPlaceholder(item.deadline) ||
    resolveMonthPlaceholder(item.annualDate) ||
    resolveMonthPlaceholder(item.cyclicDate) ||
    new Date()
  );
};

const pad = (value: number) => value.toString().padStart(2, '0');

const formatDate = (date: Date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;

const formatDateTimeUTC = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(
    date.getUTCMinutes(),
  )}${pad(date.getUTCSeconds())}Z`;

const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n');

const buildEvent = (item: ComplianceItem, status: Status, notes: string | undefined, sourceUrl: string) => {
  const start = deriveScheduleDate(item);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const dtStart = formatDate(start);
  const dtEnd = formatDate(end);
  const dtStamp = formatDateTimeUTC(new Date());

  const descriptionSegments = [
    item.description,
    `Status: ${status}`,
    `Deadline: ${item.deadline || 'Flexible / Triggered'}`,
    `Frequency: ${item.frequency}`,
    `Responsible: ${item.responsible}`,
  ];

  if (notes) {
    descriptionSegments.push(`Notes: ${notes}`);
  }

  descriptionSegments.push(`Source: ${sourceUrl}`);

  const description = escapeText(descriptionSegments.join('\n'));

  return [
    'BEGIN:VEVENT',
    `UID:msct-${item.id}-${dtStart}@metis-settlements`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escapeText(`${item.title} (${status})`)}`,
    `DESCRIPTION:${description}`,
    `CATEGORIES:${escapeText(item.category)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
  ].join('\r\n');
};

export const buildCalendar = (
  items: ComplianceItem[],
  statusMap: Record<number, Status>,
  notesMap: Record<number, string>,
  sourceUrl: string,
) => {
  if (items.length === 0) return '';

  const events = items
    .map((item) => buildEvent(item, statusMap[item.id] ?? 'Pending', notesMap[item.id], sourceUrl))
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MSCT//Compliance Tracker//EN',
    'CALSCALE:GREGORIAN',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
};

export const downloadCalendar = (icsContent: string, fileName: string) => {
  if (!icsContent) return;
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.ics') ? fileName : `${fileName}.ics`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const downloadItemsToCalendar = (
  items: ComplianceItem[],
  statusMap: Record<number, Status>,
  notesMap: Record<number, string>,
  sourceUrl: string,
  fileName: string,
) => {
  const calendar = buildCalendar(items, statusMap, notesMap, sourceUrl);
  if (!calendar) return false;
  downloadCalendar(calendar, fileName);
  return true;
};

export const downloadItemToCalendar = (
  item: ComplianceItem,
  statusMap: Record<number, Status>,
  notesMap: Record<number, string>,
  sourceUrl: string,
  fileName: string,
) => {
  const calendar = buildCalendar([item], statusMap, notesMap, sourceUrl);
  if (!calendar) return false;
  downloadCalendar(calendar, fileName);
  return true;
};
