// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file date-time.ts
 * @input ISO dates, user-entered date/time text, and plain local date records
 * @output Date/time parsing, formatting, and arithmetic utilities
 * @position Todo 15 utility parity port for reusable temporal behavior
 */

export type ISODateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
export type ISOTimeString = string & {readonly __brand: 'ISOTimeString'};
export type PlainDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};
export type ParsedTime = {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
};

const MONTHS: Readonly<Record<string, number>> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
};

export const DATE_FORMAT_WITH_WEEKDAY: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
export const DATE_FORMAT_LONG: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
export const DATE_FORMAT_MONTH_YEAR: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
};
export const DATE_FORMAT_SHORT: Intl.DateTimeFormatOptions = {month: 'short', day: 'numeric'};
export const DATE_FORMAT_SHORT_WITH_YEAR: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

export function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return [0, 31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 0;
}

export function plainDateCreate(year: number, month: number, day: number): PlainDate {
  if (!Number.isInteger(year) || year < 1) {
    throw new RangeError(`year must be a positive integer, got ${year}`);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`month must be 1-12, got ${month}`);
  }
  const maxDay = getDaysInMonth(year, month);
  if (!Number.isInteger(day) || day < 1 || day > maxDay) {
    throw new RangeError(`day must be 1-${maxDay}, got ${day}`);
  }
  return {year, month, day};
}

export function plainDateFromDate(date: Date): PlainDate {
  return {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()};
}

export function plainDateToDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

export function plainDateToISO(date: PlainDate | null): ISODateString | null {
  if (date == null) {
    return null;
  }
  const year = String(date.year).padStart(4, '0');
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${year}-${month}-${day}` as ISODateString;
}

export function plainDateFromISO(value: ISODateString | string): PlainDate {
  const parts = value.split('-').map(Number);
  return plainDateCreate(parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0);
}

export function tryPlainDate(year: number, month: number, day: number): PlainDate | null {
  try {
    return plainDateCreate(year, month, day);
  } catch (error) {
    if (error instanceof RangeError) {
      return null;
    }
    throw error;
  }
}

export function plainDateAddDays(date: PlainDate, days: number): PlainDate {
  const next = plainDateToDate(date);
  next.setDate(next.getDate() + days);
  return plainDateFromDate(next);
}

export function plainDateAddMonths(date: PlainDate, months: number): PlainDate {
  const next = plainDateToDate(date);
  next.setMonth(next.getMonth() + months);
  return plainDateFromDate(next);
}

export function plainDateGetWeekNumber(date: PlainDate): number {
  const next = plainDateToDate(date);
  const dayNumber = next.getDay() || 7;
  next.setDate(next.getDate() + 4 - dayNumber);
  const yearStart = new Date(next.getFullYear(), 0, 1);
  return Math.ceil(((next.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function plainDateFormat(date: PlainDate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, options).format(plainDateToDate(date));
}

function parseMonthName(name: string | undefined): number | null {
  return name == null ? null : MONTHS[name.toLowerCase()] ?? null;
}

function parseNumericDate(first: number, second: number, year: number): PlainDate | null {
  if (first > 12 && second <= 12) {
    return tryPlainDate(year, second, first);
  }
  if (second > 12 && first <= 12) {
    return tryPlainDate(year, first, second);
  }
  if (first > 12 && second > 12) {
    return null;
  }
  return tryPlainDate(year, first, second);
}

export function parseDateInput(input: string): PlainDate | null {
  const trimmed = input.trim();
  if (trimmed === '' || /^\d+$/.test(trimmed)) {
    return null;
  }
  const currentYear = new Date().getFullYear();
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso != null) {
    return tryPlainDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }
  const monthFirst = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})?$/);
  if (monthFirst != null) {
    const month = parseMonthName(monthFirst[1]);
    return month == null ? null : tryPlainDate(Number(monthFirst[3] ?? currentYear), month, Number(monthFirst[2]));
  }
  const dayFirst = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+),?\s*(\d{4})?$/);
  if (dayFirst != null) {
    const month = parseMonthName(dayFirst[2]);
    return month == null ? null : tryPlainDate(Number(dayFirst[3] ?? currentYear), month, Number(dayFirst[1]));
  }
  const numeric = trimmed.match(/^(\d{1,2})([-/.])(\d{1,2})(?:\2(\d{4}))?$/);
  if (numeric != null) {
    return parseNumericDate(Number(numeric[1]), Number(numeric[3]), Number(numeric[4] ?? currentYear));
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : tryPlainDate(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

export function parseISOTime(value: string | undefined): ParsedTime | null {
  if (value == null) {
    return null;
  }
  const parts = value.split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d{2}$/.test(part))) {
    return null;
  }
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  const second = parts[2] == null ? 0 : Number(parts[2]);
  return normalizeTime(hour, minute, second, false, false, false);
}

function normalizeTime(
  hour: number,
  minute: number,
  second: number,
  hasMeridiem: boolean,
  isAM: boolean,
  isPM: boolean,
): ParsedTime | null {
  if (minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }
  if (hasMeridiem) {
    if (hour < 1 || hour > 12) {
      return null;
    }
    return {hour: isAM && hour === 12 ? 0 : isPM && hour !== 12 ? hour + 12 : hour, minute, second};
  }
  return hour < 0 || hour > 23 ? null : {hour, minute, second};
}

export function formatISOTime(time: ParsedTime, includeSeconds = false): ISOTimeString {
  const base = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
  return (includeSeconds ? `${base}:${String(time.second).padStart(2, '0')}` : base) as ISOTimeString;
}

export function createISOTimeString(value: string): ISOTimeString | null {
  const parsed = parseISOTime(value);
  return parsed == null ? null : formatISOTime(parsed, value.split(':').length === 3);
}

export function parseTimeInput(input: string, includeSeconds = false): ISOTimeString | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === '') {
    return null;
  }
  const hasMeridiem = /\s*[ap]\.?m?\.?\s*$/.test(trimmed);
  const isPM = /\s*p\.?m?\.?\s*$/.test(trimmed);
  const isAM = /\s*a\.?m?\.?\s*$/.test(trimmed);
  const raw = trimmed.replace(/\s*[ap]\.?m?\.?\s*$/, '').trim();
  const compact = raw.match(/^(\d{2})(\d{2})(\d{2})?$/);
  if (compact != null && !hasMeridiem) {
    const parsed = normalizeTime(Number(compact[1]), Number(compact[2]), Number(compact[3] ?? 0), false, false, false);
    return parsed == null ? null : formatISOTime(parsed, includeSeconds);
  }
  const parts = raw.split(':');
  if (parts.length === 1 && /^\d{1,2}$/.test(parts[0] ?? '')) {
    const parsed = normalizeTime(Number(parts[0]), 0, 0, hasMeridiem, isAM, isPM);
    return parsed == null ? null : formatISOTime(parsed, includeSeconds);
  }
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d{1,2}$/.test(part))) {
    return null;
  }
  const parsed = normalizeTime(Number(parts[0]), Number(parts[1]), Number(parts[2] ?? 0), hasMeridiem, isAM, isPM);
  return parsed == null ? null : formatISOTime(parsed, includeSeconds);
}

export function formatDisplayTime12h(time: ISOTimeString | string | undefined, includeSeconds = false): string {
  const parsed = parseISOTime(time);
  if (parsed == null) {
    return '';
  }
  const hour = parsed.hour === 0 ? 12 : parsed.hour > 12 ? parsed.hour - 12 : parsed.hour;
  const seconds = includeSeconds ? `:${String(parsed.second).padStart(2, '0')}` : '';
  return `${hour}:${String(parsed.minute).padStart(2, '0')}${seconds} ${parsed.hour < 12 ? 'AM' : 'PM'}`;
}
