// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file calendar-utils.ts
 * @input Calendar focus, month, week-start, and keyboard navigation inputs
 * @output Pure date helpers for the Svelte Calendar component
 * @position Internal calendar helper module for Todo 10 LOC split
 */

import type {DateRange, ISODateString, PlainDate} from './temporal-types.js';
import {addDays, addMonths, parseISODate, toLocalDate} from './temporal-utils.js';

type InitialCalendarDateInput = Readonly<{
  focusDate?: ISODateString;
  value?: ISODateString | DateRange;
  today: PlainDate;
}>;

export function normalizeWeekStart(weekStartsOn: number): number {
  return ((weekStartsOn % 7) + 7) % 7;
}

export function todayPlainDate(): PlainDate {
  const now = new Date();
  return {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
}

export function startOfMonth(date: PlainDate): PlainDate {
  return {year: date.year, month: date.month, day: 1};
}

export function resolveInitialCalendarDate(input: InitialCalendarDateInput): PlainDate {
  const fromFocus = parseISODate(input.focusDate);
  if (fromFocus != null) {
    return fromFocus;
  }
  if (typeof input.value === 'string') {
    return parseISODate(input.value) ?? input.today;
  }
  if (typeof input.value === 'object') {
    return parseISODate(input.value.start) ?? input.today;
  }
  return input.today;
}

export function calendarKeyboardTarget(key: string, date: PlainDate, weekStartsOn: number): PlainDate | null {
  if (key === 'ArrowLeft') {
    return addDays(date, -1);
  }
  if (key === 'ArrowRight') {
    return addDays(date, 1);
  }
  if (key === 'ArrowUp') {
    return addDays(date, -7);
  }
  if (key === 'ArrowDown') {
    return addDays(date, 7);
  }
  if (key === 'Home') {
    return addDays(date, -calendarColumnIndex(date, weekStartsOn));
  }
  if (key === 'End') {
    return addDays(date, 6 - calendarColumnIndex(date, weekStartsOn));
  }
  if (key === 'PageUp') {
    return addMonths(date, -1);
  }
  if (key === 'PageDown') {
    return addMonths(date, 1);
  }
  return null;
}

function calendarColumnIndex(date: PlainDate, weekStartsOn: number): number {
  return (toLocalDate(date).getDay() - weekStartsOn + 7) % 7;
}
