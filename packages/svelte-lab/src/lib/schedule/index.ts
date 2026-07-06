// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Local Svelte schedule modules
 * @output Package-local schedule exports without root package integration
 * @position Local barrel for Todo 17 Svelte lab schedule slice
 */

export {default as Schedule} from './Schedule.svelte';
export {createEventFromISO} from './CalendarEvent.js';
export {
  enumerateDates,
  plainDateAddDays,
  plainDateAddMonths,
  plainDateCreate,
  plainDateFromISO,
  plainDateFromInstant,
  plainDateIsAfter,
  plainDateIsBefore,
  plainDateIsEqual,
  plainDateSetEndOfWeekExclusive,
  plainDateSetFirstOfMonth,
  plainDateSetStartOfWeek,
  plainDateToISO,
  plainDateToInstant,
} from './plain-date.js';
export {
  eventOccursOnDate,
  eventOverlapsRange,
  formatEventAccessibilityLabel,
  getAllDayEventSegments,
  getBrowserTimezoneID,
  getMonthEventSegments,
  getTimedEventLayouts,
  isDayEvent,
  sortEvents,
} from './dateMath.js';
export {createZonedDateTime, scheduleRangeToZonedDateTimeRange, zonedDateTimeFromInstant} from './zonedDateTime.js';
export {
  createScheduleDayView,
  createScheduleListView,
  createScheduleMonthlyView,
  createScheduleWeeklyView,
} from './views.js';
export {
  createScheduleLabelPlugin,
  createSchedulePaginationPlugin,
  createScheduleViewSelectorPlugin,
  defaultSchedulePaginationPlugin,
  defaultSchedulePlugins,
} from './plugins.js';
export type {
  CalendarDayEvent,
  CalendarEvent,
  CalendarEventBase,
  CalendarInstantEvent,
  Instant,
  PlainDate,
  ScheduleCategory,
  ScheduleEventColor,
  ScheduleEventSource,
  ScheduleNavigationRange,
  SchedulePlugin,
  SchedulePluginPosition,
  ScheduleRange,
  ScheduleView,
  ScheduleViewBase,
  ScheduleViewKind,
  ScheduleViewOptions,
  ScheduleViewSelectorOption,
  ZonedDateTime,
  ZonedDateTimeRange,
} from './types.js';
