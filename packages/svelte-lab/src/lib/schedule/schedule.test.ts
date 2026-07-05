// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file schedule.test.ts
 * @input Todo 17 Svelte lab schedule requirements
 * @output Vitest coverage for date math, layout grouping, plugins, and rendered views
 * @position Package-local test harness for packages/svelte-lab schedule
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import Schedule from './Schedule.svelte';
import {
  createEventFromISO,
  createScheduleDayView,
  createScheduleListView,
  createScheduleMonthlyView,
  createScheduleViewSelectorPlugin,
  createScheduleWeeklyView,
  getTimedEventLayouts,
  plainDateFromISO,
  sortEvents,
} from './index.js';
import type {CalendarEvent, Instant, ScheduleCategory} from './index.js';

const categories: readonly ScheduleCategory[] = [
  {label: 'Sync', color: 'blue'},
  {label: 'Design', color: 'purple'},
  {label: 'Migration', color: 'pink'},
];

const events: readonly CalendarEvent[] = [
  createEventFromISO({
    id: 'visible',
    title: 'Visible sync',
    category: 'Sync',
    start: '2026-05-13T16:00:00.000Z',
    end: '2026-05-13T16:30:00.000Z',
  }),
  createEventFromISO({
    id: 'all-day',
    title: 'Design review',
    category: 'Design',
    start: '2026-05-13',
    end: '2026-05-13',
  }),
  createEventFromISO({
    id: 'outside',
    title: 'Outside range',
    start: '2026-08-13',
    end: '2026-08-13',
  }),
];

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function textContent(target: ParentNode): string {
  return target.textContent ?? '';
}

function elementByRole(target: ParentNode, role: string, name: string): Element {
  const selector = role === 'heading' ? 'h1,h2,h3,h4,h5,h6,[role="heading"]' : `[role="${role}"]`;
  const found = Array.from(target.querySelectorAll(selector)).find(
    (element) => element.getAttribute('aria-label') === name || element.textContent?.trim() === name,
  );
  if (found == null) {
    throw new Error(`missing role ${role} named ${name}`);
  }
  return found;
}

describe('Svelte lab schedule event and date math', () => {
  it('Given date-only and instant ISO input When parsed Then all-day and timed events are typed and invalid ranges are rejected', () => {
    const dayEvent = createEventFromISO({
      id: 'planning',
      title: 'Planning offsite',
      start: '2026-05-13',
      end: '2026-05-14',
    });
    const timedEvent = createEventFromISO({
      id: 'standup',
      title: 'Standup',
      start: '2026-05-13T16:00:00.000Z',
      end: '2026-05-13T16:30:00.000Z',
    });

    expect(dayEvent.start).toEqual({year: 2026, month: 5, day: 13});
    expect(typeof timedEvent.start).toBe('number');
    expect(() =>
      createEventFromISO({
        id: 'bad',
        title: 'Bad',
        start: '2026-05-14',
        end: '2026-05-13',
      }),
    ).toThrow(RangeError);
  });

  it('Given overlapping timed events When layouts are computed Then visual levels and sort order remain deterministic', () => {
    const sorted = sortEvents(
      [
        createEventFromISO({id: 'late', title: 'Late', start: '2026-05-14T16:00:00.000Z', end: '2026-05-14T17:00:00.000Z'}),
        createEventFromISO({id: 'day', title: 'Day', start: '2026-05-13', end: '2026-05-13'}),
        createEventFromISO({id: 'early', title: 'Early', start: '2026-05-12T16:00:00.000Z', end: '2026-05-12T17:00:00.000Z'}),
      ],
      'UTC',
    );
    const layouts = getTimedEventLayouts({
      events: [
        createEventFromISO({id: 'a', title: 'Alpha', start: '2026-05-13T16:00:00.000Z', end: '2026-05-13T17:00:00.000Z'}),
        createEventFromISO({id: 'b', title: 'Beta', start: '2026-05-13T16:30:00.000Z', end: '2026-05-13T17:30:00.000Z'}),
      ].filter((event): event is Extract<CalendarEvent, {readonly start: Instant}> => typeof event.start === 'number'),
      day: plainDateFromISO('2026-05-13'),
      timezoneID: 'UTC',
      minHour: 16,
      maxHour: 18,
    });

    expect(sorted.map((event) => event.id)).toEqual(['early', 'day', 'late']);
    expect(layouts.map((layout) => layout.level)).toEqual([0, 1]);
    expect(layouts[0]?.top).toBe(0);
  });
});

describe('Svelte lab Schedule rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 13, 16, 15)));
    document.body.textContent = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Given a monthly schedule When rendered Then visible range filtering and accessible event labels are present', async () => {
    const target = createTarget();
    const app = mount(Schedule, {
      target,
      props: {
        view: createScheduleMonthlyView(),
        events,
        categories,
        date: Date.UTC(2026, 4, 13),
        focusDate: Date.UTC(2026, 4, 13),
        timezoneID: 'UTC',
      },
    });

    await tick();

    expect(elementByRole(target, 'grid', 'May 2026').getAttribute('aria-readonly')).toBe('true');
    expect(elementByRole(target, 'columnheader', 'Wednesday').getAttribute('aria-colindex')).toBe('4');
    expect(textContent(target)).toContain('Visible sync');
    expect(textContent(target)).toContain('Design review, Design, all day');
    expect(textContent(target)).not.toContain('Outside range');

    await unmount(app);
  });

  it('Given day and week views When rendered Then time-grid cells expose all-day and timed event labels', async () => {
    const target = createTarget();
    const app = mount(Schedule, {
      target,
      props: {
        view: createScheduleDayView({minHour: 16, maxHour: 17}),
        events,
        categories,
        date: Date.UTC(2026, 4, 13),
        focusDate: Date.UTC(2026, 4, 13),
        timezoneID: 'UTC',
      },
    });

    await tick();

    expect(elementByRole(target, 'grid', 'Schedule time grid')).not.toBeNull();
    expect(elementByRole(target, 'columnheader', 'Wednesday, May 13, 2026').getAttribute('aria-current')).toBe('date');
    expect(elementByRole(target, 'gridcell', 'Wednesday, May 13, 2026 all day. Design review, Design, all day')).not.toBeNull();
    expect(elementByRole(target, 'gridcell', 'Wednesday, May 13, 2026 4 PM. Visible sync, Sync, 4:00 PM - 4:30 PM')).not.toBeNull();

    await unmount(app);

    const weekTarget = createTarget();
    const weekApp = mount(Schedule, {
      target: weekTarget,
      props: {view: createScheduleWeeklyView(), events, categories, date: Date.UTC(2026, 4, 13), timezoneID: 'UTC'},
    });
    await tick();
    expect(elementByRole(weekTarget, 'grid', 'Schedule time grid')).not.toBeNull();
    await unmount(weekApp);
  });

  it('Given a list view When rendered Then events are grouped by day and empty base days stay visible', async () => {
    const target = createTarget();
    const app = mount(Schedule, {
      target,
      props: {view: createScheduleListView({days: 2}), events: [], date: Date.UTC(2026, 4, 13), timezoneID: 'UTC'},
    });

    await tick();

    expect(elementByRole(target, 'heading', 'Wednesday, May 13, 2026')).not.toBeNull();
    expect(textContent(target)).toContain('No events.');

    await unmount(app);
  });

  it('Given async events and pagination plugins When loaded and navigated Then range boundaries and changed date are observable', async () => {
    const onChangeDate = vi.fn();
    const loader = vi.fn(async (_start: Instant, _end: Instant) => [
      createEventFromISO({id: 'async', title: 'Loaded event', start: '2026-05-13T17:00:00.000Z', end: '2026-05-13T18:00:00.000Z'}),
    ]);
    const target = createTarget();
    const app = mount(Schedule, {
      target,
      props: {
        view: createScheduleDayView(),
        events: loader,
        date: Date.UTC(2026, 4, 13, 15, 6),
        timezoneID: 'UTC',
        onChangeDate,
      },
    });

    await tick();
    await tick();

    expect(loader).toHaveBeenCalledWith(Date.UTC(2026, 4, 13), Date.UTC(2026, 4, 14));
    expect(textContent(target)).toContain('Loaded event');
    const button = target.querySelector('button[aria-label="Previous day"]');
    if (button instanceof HTMLButtonElement) {
      button.click();
    }
    expect(onChangeDate).toHaveBeenCalledWith(Date.UTC(2026, 4, 12, 15, 6));

    await unmount(app);
  });

  it('Given a view selector plugin When changed Then the selected view callback receives the requested view', async () => {
    const onChangeView = vi.fn();
    const dayView = createScheduleDayView();
    const monthView = createScheduleMonthlyView();
    const target = createTarget();
    const app = mount(Schedule, {
      target,
      props: {
        view: dayView,
        events,
        date: Date.UTC(2026, 4, 13),
        timezoneID: 'UTC',
        plugins: [
          createScheduleViewSelectorPlugin(
            [
              {view: monthView, label: 'Month'},
              {view: dayView, label: 'Day'},
            ],
            {onChangeView},
          ),
        ],
      },
    });

    await tick();
    const select = target.querySelector('select');
    if (select instanceof HTMLSelectElement) {
      select.value = '0';
      select.dispatchEvent(new Event('change', {bubbles: true}));
    }

    expect(onChangeView).toHaveBeenCalledWith(monthView);

    await unmount(app);
  });
});
