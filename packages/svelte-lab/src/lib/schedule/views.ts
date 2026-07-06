// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file views.ts
 * @input Schedule view option records
 * @output Day, week, month, and list schedule view factories
 * @position Public view factory layer for Svelte lab schedule
 */

import {
  plainDateAddDays,
  plainDateAddMonths,
  plainDateSetEndOfWeekExclusive,
  plainDateSetFirstOfMonth,
  plainDateSetStartOfWeek,
} from './plain-date.js';
import {getScheduleRangeFromDates, scheduleRangeToZonedDateTimeRange} from './zonedDateTime.js';
import type {PlainDate, ScheduleView} from './types.js';

export type ScheduleDayViewOptions = {
  readonly minHour?: number;
  readonly maxHour?: number;
  readonly hourHeight?: number;
};

export type ScheduleWeeklyViewOptions = ScheduleDayViewOptions & {
  readonly weekStartsOn?: number;
};

export type ScheduleMonthlyViewOptions = {
  readonly weekStartsOn?: number;
};

export type ScheduleListViewOptions = {
  readonly days?: number;
};

export function createScheduleDayView(options: ScheduleDayViewOptions = {}): ScheduleView<ScheduleDayViewOptions> {
  const resolved = {minHour: 0, maxHour: 24, hourHeight: 64, ...options};
  return {
    kind: 'day',
    label: 'Day',
    options: resolved,
    getDateRange: (date) => scheduleRangeToZonedDateTimeRange(dayRange(date.toPlainDate(), date.timezoneID), date.timezoneID),
    getPreviousDateRange: (date) => ({label: 'Previous day', range: scheduleRangeToZonedDateTimeRange(dayRange(plainDateAddDays(date.toPlainDate(), -1), date.timezoneID), date.timezoneID)}),
    getNextDateRange: (date) => ({label: 'Next day', range: scheduleRangeToZonedDateTimeRange(dayRange(plainDateAddDays(date.toPlainDate(), 1), date.timezoneID), date.timezoneID)}),
  };
}

export function createScheduleWeeklyView(options: ScheduleWeeklyViewOptions = {}): ScheduleView<ScheduleWeeklyViewOptions> {
  const resolved = {weekStartsOn: 0, minHour: 0, maxHour: 24, hourHeight: 64, ...options};
  return {
    kind: 'week',
    label: 'Week',
    options: resolved,
    getDateRange: (date) => scheduleRangeToZonedDateTimeRange(weekRange(date.toPlainDate(), date.timezoneID, resolved.weekStartsOn), date.timezoneID),
    getPreviousDateRange: (date) => ({label: 'Previous week', range: scheduleRangeToZonedDateTimeRange(weekRange(plainDateAddDays(date.toPlainDate(), -7), date.timezoneID, resolved.weekStartsOn), date.timezoneID)}),
    getNextDateRange: (date) => ({label: 'Next week', range: scheduleRangeToZonedDateTimeRange(weekRange(plainDateAddDays(date.toPlainDate(), 7), date.timezoneID, resolved.weekStartsOn), date.timezoneID)}),
  };
}

export function createScheduleMonthlyView(options: ScheduleMonthlyViewOptions = {}): ScheduleView<ScheduleMonthlyViewOptions> {
  const resolved = {weekStartsOn: 0, ...options};
  return {
    kind: 'month',
    label: 'Month',
    options: resolved,
    getDateRange: (date) => scheduleRangeToZonedDateTimeRange(monthRange(date.toPlainDate(), date.timezoneID, resolved.weekStartsOn), date.timezoneID),
    getPreviousDateRange: (date) => ({label: 'Previous month', range: scheduleRangeToZonedDateTimeRange(monthRange(plainDateAddMonths(date.toPlainDate(), -1), date.timezoneID, resolved.weekStartsOn), date.timezoneID)}),
    getNextDateRange: (date) => ({label: 'Next month', range: scheduleRangeToZonedDateTimeRange(monthRange(plainDateAddMonths(date.toPlainDate(), 1), date.timezoneID, resolved.weekStartsOn), date.timezoneID)}),
  };
}

export function createScheduleListView(options: ScheduleListViewOptions = {}): ScheduleView<ScheduleListViewOptions> {
  const resolved = {days: 7, ...options};
  return {
    kind: 'list',
    label: 'List',
    options: resolved,
    getDateRange: (date) => scheduleRangeToZonedDateTimeRange(listRange(date.toPlainDate(), date.timezoneID, resolved.days), date.timezoneID),
    getPreviousDateRange: (date) => ({label: 'Previous list range', range: scheduleRangeToZonedDateTimeRange(listRange(plainDateAddDays(date.toPlainDate(), -resolved.days), date.timezoneID, resolved.days), date.timezoneID)}),
    getNextDateRange: (date) => ({label: 'Next list range', range: scheduleRangeToZonedDateTimeRange(listRange(plainDateAddDays(date.toPlainDate(), resolved.days), date.timezoneID, resolved.days), date.timezoneID)}),
  };
}

function dayRange(date: PlainDate, timezoneID: string) {
  return getScheduleRangeFromDates({startDate: date, endDate: plainDateAddDays(date, 1), timezoneID});
}

function weekRange(date: PlainDate, timezoneID: string, weekStartsOn: number) {
  const startDate = plainDateSetStartOfWeek(date, weekStartsOn);
  return getScheduleRangeFromDates({startDate, endDate: plainDateAddDays(startDate, 7), timezoneID});
}

function monthRange(date: PlainDate, timezoneID: string, weekStartsOn: number) {
  const first = plainDateSetFirstOfMonth(date);
  const nextMonth = plainDateAddMonths(first, 1);
  return getScheduleRangeFromDates({
    startDate: plainDateSetStartOfWeek(first, weekStartsOn),
    endDate: plainDateSetEndOfWeekExclusive(plainDateAddDays(nextMonth, -1), weekStartsOn),
    timezoneID,
  });
}

function listRange(date: PlainDate, timezoneID: string, days: number) {
  return getScheduleRangeFromDates({startDate: date, endDate: plainDateAddDays(date, days), timezoneID});
}
