// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CalendarEvent.ts
 * @input ISO event records
 * @output Calendar event parser with malformed range protection
 * @position Public event construction helper for Svelte lab schedule
 */

import {plainDateFromISO, plainDateIsAfter} from './plain-date.js';
import type {CalendarEvent} from './types.js';

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function createEventFromISO({
  id,
  title,
  category,
  start,
  end,
}: {
  readonly id: string;
  readonly title: string;
  readonly category?: string;
  readonly start: string;
  readonly end: string;
}): CalendarEvent {
  if (DATE_ONLY_RE.test(start) && DATE_ONLY_RE.test(end)) {
    const startDate = plainDateFromISO(start);
    const endDate = plainDateFromISO(end);
    if (plainDateIsAfter(startDate, endDate)) {
      throw new RangeError(`event ${id} ends before it starts`);
    }
    return category == null
      ? {id, title, start: startDate, end: endDate}
      : {id, title, category, start: startDate, end: endDate};
  }
  const startInstant = Date.parse(start);
  const endInstant = Date.parse(end);
  if (!Number.isFinite(startInstant) || !Number.isFinite(endInstant) || endInstant < startInstant) {
    throw new RangeError(`event ${id} has an invalid instant range`);
  }
  return category == null
    ? {id, title, start: startInstant, end: endInstant}
    : {id, title, category, start: startInstant, end: endInstant};
}
