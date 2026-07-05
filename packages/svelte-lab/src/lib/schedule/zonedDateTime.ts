// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zonedDateTime.ts
 * @input Epoch milliseconds and timezone IDs
 * @output Lightweight timezone-aware date bridge
 * @position Internal view range helper for Svelte lab schedule
 */

import {plainDateAddDays, plainDateFromInstant, plainDateToInstant} from './plain-date.js';
import type {Instant, PlainDate, ScheduleRange, ZonedDateTime, ZonedDateTimeRange} from './types.js';

export function createZonedDateTime(instant: Instant, timezoneID: string): ZonedDateTime {
  return zonedDateTimeFromInstant(instant, timezoneID);
}

export function zonedDateTimeFromInstant(instant: Instant, timezoneID: string): ZonedDateTime {
  return {
    instant,
    timezoneID,
    toPlainDate: () => plainDateFromInstant(instant, timezoneID),
    addDays: (days) => {
      const date = plainDateAddDays(plainDateFromInstant(instant, timezoneID), days);
      return zonedDateTimeFromInstant(plainDateToInstant(date, timezoneID), timezoneID);
    },
    startOfDay: () => {
      const date = plainDateFromInstant(instant, timezoneID);
      return zonedDateTimeFromInstant(plainDateToInstant(date, timezoneID), timezoneID);
    },
  };
}

export function scheduleRangeToZonedDateTimeRange(
  range: ScheduleRange,
  timezoneID: string,
): ZonedDateTimeRange {
  return [
    zonedDateTimeFromInstant(range.start, timezoneID),
    zonedDateTimeFromInstant(range.end, timezoneID),
  ];
}

export function getScheduleRangeFromDates({
  startDate,
  endDate,
  timezoneID,
}: {
  readonly startDate: PlainDate;
  readonly endDate: PlainDate;
  readonly timezoneID: string;
}): ScheduleRange {
  return {
    startDate,
    endDate,
    start: plainDateToInstant(startDate, timezoneID),
    end: plainDateToInstant(endDate, timezoneID),
  };
}
