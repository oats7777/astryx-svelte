// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file plain-date.ts
 * @input ISO dates, timezone IDs, and epoch milliseconds
 * @output Local PlainDate arithmetic and timezone conversion helpers
 * @position Internal date primitive layer for Svelte lab schedule
 */

import type {Instant, PlainDate} from './types.js';

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

export function plainDateFromISO(value: string): PlainDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match == null) {
    throw new RangeError(`invalid ISO date: ${value}`);
  }
  const [, year, month, day] = match;
  return plainDateCreate(Number(year), Number(month), Number(day));
}

export function plainDateToISO(date: PlainDate): string {
  const y = String(date.year).padStart(4, '0');
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

export function plainDateSetFirstOfMonth(date: PlainDate): PlainDate {
  return {year: date.year, month: date.month, day: 1};
}

export function plainDateSetStartOfWeek(date: PlainDate, weekStartsOn: number): PlainDate {
  const day = plainDateToDate(date).getDay();
  return plainDateAddDays(date, -((day - weekStartsOn + 7) % 7));
}

export function plainDateSetEndOfWeekExclusive(date: PlainDate, weekStartsOn: number): PlainDate {
  return plainDateAddDays(plainDateSetStartOfWeek(date, weekStartsOn), 7);
}

export function plainDateIsBefore(a: PlainDate, b: PlainDate): boolean {
  return comparePlainDates(a, b) < 0;
}

export function plainDateIsAfter(a: PlainDate, b: PlainDate): boolean {
  return comparePlainDates(a, b) > 0;
}

export function plainDateIsEqual(a: PlainDate, b: PlainDate): boolean {
  return comparePlainDates(a, b) === 0;
}

export function plainDateToInstant(
  date: PlainDate,
  timezoneID: string,
  hour = 0,
  minute = 0,
): Instant {
  const utcGuess = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  const firstOffset = getTimezoneOffsetMS(timezoneID, utcGuess);
  const firstInstant = utcGuess - firstOffset;
  const secondOffset = getTimezoneOffsetMS(timezoneID, firstInstant);
  return utcGuess - secondOffset;
}

export function plainDateFromInstant(instant: Instant, timezoneID: string): PlainDate {
  const parts = getTimeZoneParts(instant, timezoneID);
  return plainDateCreate(parts.year, parts.month, parts.day);
}

export function enumerateDates(start: PlainDate, endExclusive: PlainDate): PlainDate[] {
  const dates: PlainDate[] = [];
  let current = start;
  while (plainDateIsBefore(current, endExclusive)) {
    dates.push(current);
    current = plainDateAddDays(current, 1);
  }
  return dates;
}

function plainDateToDate(date: PlainDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

function plainDateFromDate(date: Date): PlainDate {
  return plainDateCreate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  }
  return [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}

function comparePlainDates(a: PlainDate, b: PlainDate): number {
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  if (a.month !== b.month) {
    return a.month - b.month;
  }
  return a.day - b.day;
}

function getTimezoneOffsetMS(timezoneID: string, instant: number): number {
  const parts = getTimeZoneParts(instant, timezoneID);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - instant;
}

function getTimeZoneParts(
  instant: number,
  timezoneID: string,
): {readonly year: number; readonly month: number; readonly day: number; readonly hour: number; readonly minute: number; readonly second: number} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneID,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const valueFor = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: valueFor('year'),
    month: valueFor('month'),
    day: valueFor('day'),
    hour: valueFor('hour'),
    minute: valueFor('minute'),
    second: valueFor('second'),
  };
}
