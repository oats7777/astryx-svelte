// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file temporal-utils.ts
 * @input User-entered temporal text and local date math inputs
 * @output Plain local dates, ISO strings, calendar grids, and time parsing helpers
 * @position Utility layer for Svelte temporal selection controls
 */

import type {DateRange, ISODateString, ISOTimeString, ParsedTime, PlainDate} from './temporal-types.js';

const MONTHS: Readonly<Record<string, number>> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
};

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const WEEKDAY_PREFIX_PATTERN = /^(?:sunday|sun|monday|mon|tuesday|tue|tues|wednesday|wed|thursday|thu|thurs|friday|fri|saturday|sat),\s+/i;

export type CalendarDay = {
  readonly date: PlainDate;
  readonly iso: ISODateString;
  readonly label: string;
  readonly isOutside: boolean;
};

export function createPlainDate(year: number, month: number, day: number): PlainDate | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return null;
  }
  const lastDay = new Date(year, month, 0).getDate();
  if (day > lastDay) {
    return null;
  }
  return {year, month, day};
}

export function dateToISO(date: PlainDate | null): ISODateString | null {
  if (date == null) {
    return null;
  }
  return `${date.year.toString().padStart(4, '0')}-${pad2(date.month)}-${pad2(date.day)}`;
}

export function parseISODate(input: string | undefined): PlainDate | null {
  if (input == null) {
    return null;
  }
  const match = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match == null) {
    return null;
  }
  return createPlainDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function parseDateInput(input: string): PlainDate | null {
  const trimmed = input.trim().replace(WEEKDAY_PREFIX_PATTERN, '');
  if (trimmed === '' || /^\d+$/.test(trimmed)) {
    return null;
  }

  const iso = parseISODate(trimmed);
  if (iso != null) {
    return iso;
  }

  const currentYear = new Date().getFullYear();
  const monthFirst = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})?$/);
  if (monthFirst != null) {
    const month = parseMonthName(monthFirst[1]);
    return month == null ? null : createPlainDate(Number(monthFirst[3] ?? currentYear), month, Number(monthFirst[2]));
  }

  const dayFirst = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+),?\s*(\d{4})?$/);
  if (dayFirst != null) {
    const month = parseMonthName(dayFirst[2]);
    return month == null ? null : createPlainDate(Number(dayFirst[3] ?? currentYear), month, Number(dayFirst[1]));
  }

  const numericWithYear = trimmed.match(/^(\d{1,2})([-/.])(\d{1,2})\2(\d{4})$/);
  if (numericWithYear != null) {
    return parseNumericDate(Number(numericWithYear[1]), Number(numericWithYear[3]), Number(numericWithYear[4]));
  }

  const numericNoYear = trimmed.match(/^(\d{1,2})([-/.])(\d{1,2})$/);
  if (numericNoYear != null) {
    return parseNumericDate(Number(numericNoYear[1]), Number(numericNoYear[3]), currentYear);
  }

  return null;
}

export function parseTimeInput(input: string, includeSeconds = false): ISOTimeString | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === '') {
    return null;
  }
  const hasMeridiem = /\s*[ap]\.?m\.?\s*$/.test(trimmed);
  const isPM = /\s*p\.?m\.?\s*$/.test(trimmed);
  const isAM = /\s*a\.?m\.?\s*$/.test(trimmed);
  const raw = trimmed.replace(/\s*[ap]\.?m\.?\s*$/, '').trim();

  const compact = parseCompactTime(raw, includeSeconds);
  if (compact != null && !hasMeridiem) {
    return compact;
  }

  const hourOnly = raw.match(/^\d{1,2}$/);
  if (hourOnly != null) {
    return parseHourOnly(Number(hourOnly[0]), hasMeridiem, isAM, isPM, includeSeconds);
  }

  const parts = raw.split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d{1,2}$/.test(part))) {
    return null;
  }

  const normalized = normalizeHour(Number(parts[0]), Number(parts[1]), parts[2] == null ? 0 : Number(parts[2]), hasMeridiem, isAM, isPM);
  return normalized == null ? null : formatISOTime(normalized, includeSeconds);
}

export function formatISOTime(time: ParsedTime, includeSeconds = false): ISOTimeString {
  const base = `${pad2(time.hour)}:${pad2(time.minute)}`;
  return includeSeconds ? `${base}:${pad2(time.second)}` : base;
}

export function formatDisplayDate(value: ISODateString | undefined): string {
  const date = parseISODate(value);
  return date == null ? '' : accessibleDate(date);
}

export function formatDisplayTime(value: ISOTimeString | undefined, hourFormat: '12h' | '24h' = '12h', includeSeconds = false): string {
  const parsed = parseISOTime(value);
  if (parsed == null) {
    return '';
  }
  if (hourFormat === '24h') {
    return formatISOTime(parsed, includeSeconds);
  }
  const hour12 = parsed.hour === 0 ? 12 : parsed.hour > 12 ? parsed.hour - 12 : parsed.hour;
  const minuteAndSecond = includeSeconds ? `${pad2(parsed.minute)}:${pad2(parsed.second)}` : pad2(parsed.minute);
  return `${hour12}:${minuteAndSecond} ${parsed.hour < 12 ? 'AM' : 'PM'}`;
}

export function parseISOTime(value: string | undefined): ParsedTime | null {
  if (value == null) {
    return null;
  }
  const parts = value.split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d{2}$/.test(part))) {
    return null;
  }
  return normalizeHour(Number(parts[0]), Number(parts[1]), parts[2] == null ? 0 : Number(parts[2]), false, false, false);
}

export function isTimeInRange(value: ISOTimeString, min?: ISOTimeString, max?: ISOTimeString): boolean {
  const comparable = timeToSeconds(value);
  const minSeconds = min == null ? null : timeToSeconds(min);
  const maxSeconds = max == null ? null : timeToSeconds(max);
  return comparable != null && (minSeconds == null || comparable >= minSeconds) && (maxSeconds == null || comparable <= maxSeconds);
}

export function addDays(date: PlainDate, days: number): PlainDate {
  return fromLocalDate(new Date(date.year, date.month - 1, date.day + days));
}

export function addMonths(date: PlainDate, months: number): PlainDate {
  const lastDay = new Date(date.year, date.month - 1 + months + 1, 0).getDate();
  return fromLocalDate(new Date(date.year, date.month - 1 + months, Math.min(date.day, lastDay)));
}

export function compareDates(a: PlainDate, b: PlainDate): number {
  return Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day);
}

export function isDateAllowed(date: PlainDate, min?: ISODateString, max?: ISODateString, disabledDates: readonly ISODateString[] = []): boolean {
  const iso = dateToISO(date);
  const minDate = parseISODate(min);
  const maxDate = parseISODate(max);
  return iso != null && !disabledDates.includes(iso) && (minDate == null || compareDates(date, minDate) >= 0) && (maxDate == null || compareDates(date, maxDate) <= 0);
}

export function normalizeRange(start: ISODateString, end: ISODateString): DateRange {
  const startDate = parseISODate(start);
  const endDate = parseISODate(end);
  if (startDate != null && endDate != null && compareDates(endDate, startDate) < 0) {
    return {start: end, end: start};
  }
  return {start, end};
}

export function monthLabel(date: PlainDate): string {
  return new Intl.DateTimeFormat(undefined, {month: 'long', year: 'numeric'}).format(toLocalDate(date));
}

export function accessibleDate(date: PlainDate): string {
  return new Intl.DateTimeFormat(undefined, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}).format(toLocalDate(date));
}

export function dayNames(weekStartsOn: number): readonly string[] {
  return Array.from({length: 7}, (_item, index) => DAY_NAMES[(index + weekStartsOn) % 7] ?? 'Su');
}

export function calendarDays(month: PlainDate, weekStartsOn = 0): readonly CalendarDay[] {
  const first = createPlainDate(month.year, month.month, 1) ?? month;
  const leading = (toLocalDate(first).getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -leading);
  return Array.from({length: 42}, (_item, index) => {
    const date = addDays(start, index);
    return {
      date,
      iso: dateToISO(date) ?? '',
      label: accessibleDate(date),
      isOutside: date.month !== month.month || date.year !== month.year,
    };
  });
}

export function toLocalDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

function parseNumericDate(first: number, second: number, year: number): PlainDate | null {
  if (first > 12 && second <= 12) {
    return createPlainDate(year, second, first);
  }
  if (second > 12 && first <= 12) {
    return createPlainDate(year, first, second);
  }
  if (first > 12 && second > 12) {
    return null;
  }
  return createPlainDate(year, first, second);
}

function parseMonthName(name: string | undefined): number | null {
  return name == null ? null : MONTHS[name.toLowerCase()] ?? null;
}

function parseCompactTime(raw: string, includeSeconds: boolean): ISOTimeString | null {
  if (/^\d{4}$/.test(raw)) {
    const parsed = normalizeHour(Number(raw.slice(0, 2)), Number(raw.slice(2, 4)), 0, false, false, false);
    return parsed == null ? null : formatISOTime(parsed, includeSeconds);
  }
  if (/^\d{6}$/.test(raw)) {
    const parsed = normalizeHour(Number(raw.slice(0, 2)), Number(raw.slice(2, 4)), Number(raw.slice(4, 6)), false, false, false);
    return parsed == null ? null : formatISOTime(parsed, includeSeconds);
  }
  return null;
}

function parseHourOnly(hour: number, hasMeridiem: boolean, isAM: boolean, isPM: boolean, includeSeconds: boolean): ISOTimeString | null {
  const normalized = normalizeHour(hour, 0, 0, hasMeridiem, isAM, isPM);
  return normalized == null ? null : formatISOTime(normalized, includeSeconds);
}

function normalizeHour(hour: number, minute: number, second: number, hasMeridiem: boolean, isAM: boolean, isPM: boolean): ParsedTime | null {
  if (minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }
  if (hasMeridiem) {
    if (hour < 1 || hour > 12) {
      return null;
    }
    const hour24 = isPM && hour !== 12 ? hour + 12 : isAM && hour === 12 ? 0 : hour;
    return {hour: hour24, minute, second};
  }
  if (hour < 0 || hour > 23) {
    return null;
  }
  return {hour, minute, second};
}

function timeToSeconds(value: ISOTimeString): number | null {
  const parsed = parseISOTime(value);
  return parsed == null ? null : parsed.hour * 3600 + parsed.minute * 60 + parsed.second;
}

function fromLocalDate(date: Date): PlainDate {
  return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}
