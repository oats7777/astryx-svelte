// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateMath.ts
 * @input Schedule dates, ranges, events, and timezone IDs
 * @output Pure overlap, sorting, layout, and formatting utilities
 * @position Shared schedule behavior layer used by components and tests
 */

import {
  plainDateAddDays,
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateToInstant,
} from './plain-date.js';
import type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarInstantEvent,
  PlainDate,
  ScheduleCategory,
  ScheduleRange,
} from './types.js';

export function getBrowserTimezoneID(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function isDayEvent(event: CalendarEvent): event is CalendarDayEvent {
  return typeof event.start !== 'number';
}

export function eventOverlapsRange(event: CalendarEvent, range: ScheduleRange, timezoneID: string): boolean {
  if (isDayEvent(event)) {
    const start = plainDateToInstant(event.start, timezoneID);
    const end = plainDateToInstant(plainDateAddDays(event.end, 1), timezoneID);
    return start < range.end && end > range.start;
  }
  return event.start < range.end && event.end > range.start;
}

export function eventOccursOnDate(event: CalendarEvent, date: PlainDate, timezoneID: string): boolean {
  if (isDayEvent(event)) {
    return !plainDateIsAfter(event.start, date) && !plainDateIsBefore(event.end, date);
  }
  const startDate = plainDateFromInstant(event.start, timezoneID);
  const endDate = plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID);
  return !plainDateIsAfter(startDate, date) && !plainDateIsBefore(endDate, date);
}

export function sortEvents(events: readonly CalendarEvent[], timezoneID: string): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const startDelta = getEventSortStart(a, timezoneID) - getEventSortStart(b, timezoneID);
    return startDelta === 0 ? a.title.localeCompare(b.title) : startDelta;
  });
}

export function getTimedEventLayouts({
  events,
  day,
  timezoneID,
  minHour,
  maxHour,
}: {
  readonly events: readonly CalendarInstantEvent[];
  readonly day: PlainDate;
  readonly timezoneID: string;
  readonly minHour: number;
  readonly maxHour: number;
}): Array<{readonly event: CalendarInstantEvent; readonly top: number; readonly height: number; readonly level: number}> {
  const totalMinutes = (maxHour - minHour) * 60;
  const levelEnds: number[] = [];
  return events
    .map((event) => timedWindow(event, day, timezoneID, minHour, maxHour))
    .filter((record): record is {readonly event: CalendarInstantEvent; readonly start: number; readonly end: number} => record != null)
    .sort((a, b) => a.start - b.start || a.end - b.end || a.event.title.localeCompare(b.event.title))
    .map(({event, start, end}) => {
      const level = firstAvailableLevel(levelEnds, start);
      levelEnds[level] = end;
      return {
        event,
        level,
        top: ((start - minHour * 60) / totalMinutes) * 100,
        height: ((end - start) / totalMinutes) * 100,
      };
    });
}

export function getAllDayEventSegments(events: readonly CalendarDayEvent[], days: readonly PlainDate[]) {
  const levels: number[] = [];
  return events
    .map((event) => {
      const startIndex = days.findIndex((day) => !plainDateIsBefore(day, event.start));
      const endIndex = findLastDateIndex(days, (day) => !plainDateIsAfter(day, event.end));
      return startIndex < 0 || endIndex < 0 ? null : {event, startIndex, endIndex};
    })
    .filter((segment): segment is {readonly event: CalendarDayEvent; readonly startIndex: number; readonly endIndex: number} => segment != null)
    .sort((a, b) => a.startIndex - b.startIndex || b.endIndex - b.startIndex - (a.endIndex - a.startIndex) || a.event.title.localeCompare(b.event.title))
    .map(({event, startIndex, endIndex}) => {
      const level = firstAvailableLevel(levels, startIndex);
      levels[level] = endIndex;
      return {event, columnStart: startIndex, columnEnd: endIndex, level};
    });
}

export function getMonthEventSegments(events: readonly CalendarEvent[], days: readonly PlainDate[], timezoneID: string) {
  const levelsByWeek: number[][] = [];
  return events
    .flatMap((event) => monthSegmentsForEvent(event, days, timezoneID))
    .sort((a, b) => a.startIndex - b.startIndex || Number(b.priority) - Number(a.priority) || b.endIndex - b.startIndex - (a.endIndex - a.startIndex))
    .flatMap(({event, startIndex, endIndex}) => {
      const segments: Array<{readonly event: CalendarEvent; readonly week: number; readonly columnStart: number; readonly columnEnd: number; readonly level: number}> = [];
      for (let week = Math.floor(startIndex / 7); week <= Math.floor(endIndex / 7); week += 1) {
        const columnStart = week === Math.floor(startIndex / 7) ? startIndex % 7 : 0;
        const columnEnd = week === Math.floor(endIndex / 7) ? endIndex % 7 : 6;
        const weekLevels = levelsByWeek[week] ?? [];
        levelsByWeek[week] = weekLevels;
        const level = firstAvailableLevel(weekLevels, columnStart);
        if (level < 4) {
          weekLevels[level] = columnEnd;
          segments.push({event, week, columnStart, columnEnd, level});
        }
      }
      return segments;
    });
}

export function formatEventAccessibilityLabel(event: CalendarEvent, day: PlainDate, timezoneID: string, categories: readonly ScheduleCategory[]): string {
  const category = categories.find((item) => item.label === event.category)?.label ?? event.category ?? 'Event';
  return isDayEvent(event)
    ? `${event.title}, ${category}, all day`
    : `${event.title}, ${category}, ${formatEventTime(event, day, timezoneID)}`;
}

export function formatEventTime(event: CalendarInstantEvent, _day: PlainDate, timezoneID: string): string {
  return `${formatInstantTime(event.start, timezoneID)} - ${formatInstantTime(event.end, timezoneID)}`;
}

export function formatInstantTime(instant: number, timezoneID: string): string {
  return new Intl.DateTimeFormat(undefined, {hour: 'numeric', minute: '2-digit', timeZone: timezoneID}).format(new Date(instant));
}

export function formatDate(date: PlainDate, timezoneID: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, {...options, timeZone: timezoneID}).format(new Date(plainDateToInstant(date, timezoneID, 12)));
}

function getEventSortStart(event: CalendarEvent, timezoneID: string): number {
  return isDayEvent(event) ? plainDateToInstant(event.start, timezoneID) : event.start;
}

function timedWindow(event: CalendarInstantEvent, day: PlainDate, timezoneID: string, minHour: number, maxHour: number) {
  if (!eventOccursOnDate(event, day, timezoneID)) {
    return null;
  }
  const rawStart = plainDateIsBefore(plainDateFromInstant(event.start, timezoneID), day) ? 0 : minutesSinceStart(event.start, timezoneID);
  const rawEnd = eventSpansPastDay(event, day, timezoneID) ? 1440 : minutesSinceStart(event.end, timezoneID);
  const start = Math.max(rawStart, minHour * 60);
  const end = Math.min(maxHour * 60, Math.max(start + 15, rawEnd));
  return end <= start ? null : {event, start, end};
}

function eventSpansPastDay(event: CalendarInstantEvent, day: PlainDate, timezoneID: string): boolean {
  return plainDateIsAfter(plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID), day);
}

function minutesSinceStart(instant: number, timezoneID: string): number {
  const start = plainDateToInstant(plainDateFromInstant(instant, timezoneID), timezoneID);
  return Math.floor((instant - start) / 60000);
}

function firstAvailableLevel(levelEnds: readonly number[], start: number): number {
  const level = levelEnds.findIndex((end) => start > end);
  return level >= 0 ? level : levelEnds.length;
}

function monthSegmentsForEvent(event: CalendarEvent, days: readonly PlainDate[], timezoneID: string) {
  const [start, end] = eventDateSpan(event, timezoneID);
  const startIndex = days.findIndex((day) => !plainDateIsBefore(day, start));
  const endIndex = findLastDateIndex(days, (day) => !plainDateIsAfter(day, end));
  if (startIndex < 0 || endIndex < 0) {
    return [];
  }
  return [{event, startIndex, endIndex, priority: isDayEvent(event) || endIndex > startIndex}];
}

function eventDateSpan(event: CalendarEvent, timezoneID: string): readonly [PlainDate, PlainDate] {
  return isDayEvent(event)
    ? [event.start, event.end]
    : [plainDateFromInstant(event.start, timezoneID), plainDateFromInstant(Math.max(event.end - 1, event.start), timezoneID)];
}

function findLastDateIndex(days: readonly PlainDate[], predicate: (day: PlainDate) => boolean): number {
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];
    if (day != null && predicate(day)) {
      return index;
    }
  }
  return -1;
}
