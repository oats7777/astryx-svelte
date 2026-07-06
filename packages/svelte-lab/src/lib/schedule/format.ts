// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file format.ts
 * @input PlainDate values and timezone IDs
 * @output Localized schedule display strings
 * @position Formatting helper layer shared by Svelte schedule views
 */

import {formatDate} from './dateMath.js';
import type {PlainDate} from './types.js';

export function formatFullDate(date: PlainDate, timezoneID: string): string {
  return formatDate(date, timezoneID, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'});
}

export function formatMonthTitle(date: PlainDate, timezoneID: string): string {
  return formatDate(date, timezoneID, {month: 'long', year: 'numeric'});
}

export function formatWeekTitle(start: PlainDate, end: PlainDate, timezoneID: string): string {
  if (start.year === end.year && start.month === end.month) {
    return formatMonthTitle(start, timezoneID);
  }
  const startMonth = formatDate(start, timezoneID, {month: 'long'});
  const endMonth = formatDate(end, timezoneID, {month: 'long'});
  return start.year === end.year
    ? `${startMonth} - ${endMonth} ${end.year}`
    : `${startMonth} ${start.year} - ${endMonth} ${end.year}`;
}

export function formatWeekday(date: PlainDate, timezoneID: string, weekday: 'short' | 'long'): string {
  return formatDate(date, timezoneID, {weekday});
}

export function formatDayNumber(date: PlainDate, timezoneID: string): string {
  return formatDate(date, timezoneID, {day: 'numeric'});
}

export function formatHour(hour: number): string {
  return new Intl.DateTimeFormat(undefined, {hour: 'numeric', timeZone: 'UTC'}).format(
    new Date(Date.UTC(2026, 0, 1, hour)),
  );
}

export function formatTimezoneAbbreviation(date: PlainDate, timezoneID: string): string {
  const part = new Intl.DateTimeFormat(undefined, {timeZone: timezoneID, timeZoneName: 'short'})
    .formatToParts(new Date(Date.UTC(date.year, date.month - 1, date.day, 12)))
    .find((item) => item.type === 'timeZoneName');
  return part?.value ?? timezoneID;
}
