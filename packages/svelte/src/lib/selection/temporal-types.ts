// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file temporal-types.ts
 * @input None
 * @output Shared temporal value types for Svelte selection controls
 * @position Type boundary for Todo 10 temporal components
 */

export type ISODateString = string;
export type ISOTimeString = string;
export type ISODateTimeString = string;

export type CalendarMode = 'single' | 'range';

export type FieldStatusType = 'error' | 'warning' | 'success';

export type FieldStatusInput = {
  readonly type: FieldStatusType;
  readonly message?: string;
};

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

export type DateRange = {
  readonly start: ISODateString;
  readonly end: ISODateString;
};

export type DateChangeHandler = (value: ISODateString | undefined, event: Event) => void;
export type TimeChangeHandler = (value: ISOTimeString | undefined, event: Event) => void;
export type DateTimeChangeHandler = (value: ISODateTimeString | undefined, event: Event) => void;
export type DateRangeChangeHandler = (value: DateRange | null, event: Event) => void;
