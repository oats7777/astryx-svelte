// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Public Svelte lab schedule concepts
 * @output Event, date, view, and plugin types for the local schedule slice
 * @position Type surface for packages/svelte-lab/src/lib/schedule
 */

import type {Component} from 'svelte';

export type Instant = number;
export type ScheduleViewKind = 'day' | 'week' | 'month' | 'list';
export type ScheduleEventColor =
  | 'blue'
  | 'cyan'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

export type PlainDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

export type ScheduleCategory = {
  readonly label: string;
  readonly color: ScheduleEventColor;
};

export type CalendarEventBase = {
  readonly id: string;
  readonly title: string;
  readonly category?: string;
};

export type CalendarDayEvent = CalendarEventBase & {
  readonly start: PlainDate;
  readonly end: PlainDate;
};

export type CalendarInstantEvent = CalendarEventBase & {
  readonly start: Instant;
  readonly end: Instant;
};

export type CalendarEvent = CalendarDayEvent | CalendarInstantEvent;
export type ScheduleEventSource =
  | readonly CalendarEvent[]
  | ((start: Instant, end: Instant) => Promise<readonly CalendarEvent[]>);

export type ScheduleRange = {
  readonly startDate: PlainDate;
  readonly endDate: PlainDate;
  readonly start: Instant;
  readonly end: Instant;
};

export type ZonedDateTime = {
  readonly instant: Instant;
  readonly timezoneID: string;
  readonly toPlainDate: () => PlainDate;
  readonly addDays: (days: number) => ZonedDateTime;
  readonly startOfDay: () => ZonedDateTime;
};

export type ZonedDateTimeRange = readonly [ZonedDateTime, ZonedDateTime];

export type ScheduleNavigationRange = {
  readonly label: string;
  readonly range: ZonedDateTimeRange;
};

export type ScheduleViewOptions = {
  readonly minHour?: number;
  readonly maxHour?: number;
  readonly hourHeight?: number;
  readonly weekStartsOn?: number;
  readonly days?: number;
};

export type ScheduleViewBase<Options extends ScheduleViewOptions = ScheduleViewOptions> = {
  readonly kind: ScheduleViewKind;
  readonly label: string;
  readonly options: Options;
  readonly getDateRange: (date: ZonedDateTime) => ZonedDateTimeRange;
  readonly getPreviousDateRange: (date: ZonedDateTime) => ScheduleNavigationRange;
  readonly getNextDateRange: (date: ZonedDateTime) => ScheduleNavigationRange;
};

export type ScheduleView<Options extends ScheduleViewOptions = ScheduleViewOptions> = ScheduleViewBase<Options>;

export type ScheduleViewSelectorOption<View extends ScheduleViewBase = ScheduleView> = {
  readonly view: View;
  readonly label: string;
};

export type SchedulePluginPosition = 'start' | 'end';

export type SchedulePaginationPlugin = {
  readonly kind: 'pagination';
  readonly position: SchedulePluginPosition;
};

export type ScheduleViewSelectorPlugin<View extends ScheduleViewBase = ScheduleView> = {
  readonly kind: 'view-selector';
  readonly position: SchedulePluginPosition;
  readonly options: readonly ScheduleViewSelectorOption<View>[];
  readonly onChangeView?: (view: View) => void;
};

export type ScheduleLabelPlugin = {
  readonly kind: 'label';
  readonly position: SchedulePluginPosition;
  readonly label: string;
};

export type SchedulePlugin =
  | SchedulePaginationPlugin
  | ScheduleViewSelectorPlugin
  | ScheduleLabelPlugin;

export type AstryxScheduleComponent<Props extends Record<string, unknown>> =
  Component<Props>;
