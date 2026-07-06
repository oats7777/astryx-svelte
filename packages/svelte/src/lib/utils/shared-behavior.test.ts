// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file shared-behavior.test.ts
 * @input Media query fakes, timer-driven streaming text, temporal values, and style keys
 * @output Store and utility parity assertions for shared Svelte behavior
 * @position Red-first coverage for Todo 15 utility ports
 */

import {get} from 'svelte/store';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  DATE_FORMAT_MONTH_YEAR,
  createISOTimeString,
  formatDisplayTime12h,
  parseDateInput,
  parseTimeInput,
  plainDateAddDays,
  plainDateCreate,
  plainDateGetWeekNumber,
  plainDateToISO,
} from './date-time.js';
import {createMediaQueryStore} from './media-query.js';
import {parseStyleKey} from './parse-style-key.js';
import {createStreamingTextStore} from './streaming-text.js';
import {themeDataAttributes, themeProps} from './theme-props.js';

class FakeMediaQueryList extends EventTarget implements MediaQueryList {
  readonly media: string;
  readonly onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => void) | null = null;
  readonly addListener = vi.fn();
  readonly removeListener = vi.fn();
  matches: boolean;

  constructor(media: string, matches: boolean) {
    super();
    this.media = media;
    this.matches = matches;
  }

  setMatches(matches: boolean): void {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('createMediaQueryStore', () => {
  it('Given matchMedia is unavailable When store is read Then the SSR fallback is returned', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(get(createMediaQueryStore('(max-width: 768px)', {serverDefault: true}))).toBe(true);
  });

  it('Given matchMedia changes When subscribed Then the store emits the latest match state', () => {
    const query = new FakeMediaQueryList('(min-width: 900px)', false);
    vi.stubGlobal('matchMedia', vi.fn(() => query));
    const values: boolean[] = [];
    const unsubscribe = createMediaQueryStore('(min-width: 900px)').subscribe((value) => {
      values.push(value);
    });

    query.setMatches(true);
    unsubscribe();
    query.setMatches(false);

    expect(values).toEqual([false, true]);
  });
});

describe('createStreamingTextStore', () => {
  it('Given streaming text When fake time advances Then displayed text progresses and snaps complete', () => {
    vi.useFakeTimers();
    const stream = createStreamingTextStore('Hello streaming world', true, {
      speed: 'natural',
      tickMs: 10,
      charsPerTick: 5,
    });

    expect(get(stream)).toBe('');
    vi.advanceTimersByTime(10);
    expect(get(stream)).toBe('Hello');

    stream.setTarget('Hello streaming world!', false);

    expect(get(stream)).toBe('Hello streaming world!');
    stream.destroy();
  });
});

describe('date and time utilities', () => {
  it('Given plain dates When formatted and shifted Then ISO and week values match core utility behavior', () => {
    const date = plainDateCreate(2026, 1, 31);

    expect(plainDateToISO(date)).toBe('2026-01-31');
    expect(plainDateToISO(plainDateAddDays(date, 1))).toBe('2026-02-01');
    expect(plainDateGetWeekNumber(plainDateCreate(2026, 1, 1))).toBe(1);
    expect(new Intl.DateTimeFormat('en-US', DATE_FORMAT_MONTH_YEAR).format(new Date(2026, 0, 1))).toBe(
      'January 2026',
    );
  });

  it('Given user-entered temporal text When parsed Then date and time helpers normalize values', () => {
    expect(plainDateToISO(parseDateInput('Jan 25, 2026'))).toBe('2026-01-25');
    expect(createISOTimeString('14:05:30')).toBe('14:05:30');
    expect(parseTimeInput('2:30 PM')).toBe('14:30');
    expect(formatDisplayTime12h('00:05')).toBe('12:05 AM');
  });
});

describe('style key and theme prop utilities', () => {
  it('Given style keys When parsed Then selectors handle base, variants, states, and numeric values', () => {
    expect(parseStyleKey('base')).toBe('');
    expect(parseStyleKey('variant:destructive+disabled+level:2')).toBe(
      '.destructive.disabled.level-2',
    );
  });

  it('Given theme props When reflected Then className and data attributes match core conventions', () => {
    expect(themeDataAttributes({variant: 'secondary', listStyle: 'ordered', size: null})).toEqual({
      'data-variant': 'secondary',
      'data-list-style': 'ordered',
    });
    expect(themeProps('heading', {level: 2, weight: 'strong'})).toEqual({
      className: 'astryx-heading level-2 strong',
      'data-level': '2',
      'data-weight': 'strong',
    });
  });
});
