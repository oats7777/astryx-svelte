<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Timestamp.svelte
   * @input Date value, format mode, and time attributes
   * @output Human-readable timestamp
   * @position Svelte port of core Timestamp
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type TimestampFormat =
    | 'relative'
    | 'auto'
    | 'date'
    | 'date_time'
    | 'time'
    | 'system_date'
    | 'system_date_time'
    | 'system_time';
  type Props = HTMLAttributes<HTMLTimeElement> & {
    readonly value: string | number;
    readonly format?: TimestampFormat;
  };

  let {value, format = 'auto', class: className, ...rest}: Props = $props();
  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86400;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  const DEFAULT_AUTO_THRESHOLD = 7 * DAY;
  const FUTURE_SKEW_TOLERANCE = 30;
  const date = $derived(parseTimestamp(value));
  const dateTime = $derived(date.toISOString());
  const label = $derived(formatTimestamp(date, format));

  function parseTimestamp(input: string | number): Date {
    return new Date(typeof input === 'number' && input < 1_000_000_000_000 ? input * 1000 : input);
  }

  function pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  function systemDate(input: Date): string {
    return `${input.getFullYear()}-${pad(input.getMonth() + 1)}-${pad(input.getDate())}`;
  }

  function systemTime(input: Date): string {
    return `${pad(input.getHours())}:${pad(input.getMinutes())}:${pad(input.getSeconds())}`;
  }

  function relativeUnit(count: number, unit: string, suffix: 'ago' | 'from-now'): string {
    const label = `${count} ${unit}${count === 1 ? '' : 's'}`;
    return suffix === 'ago' ? `${label} ago` : `in ${label}`;
  }

  function relativeTimestamp(input: Date, now: Date): string {
    const diffSeconds = Math.round((now.getTime() - input.getTime()) / 1000);
    if (Math.abs(diffSeconds) < 10) {
      return 'now';
    }
    if (diffSeconds < 0) {
      const futureSeconds = Math.abs(diffSeconds);
      if (futureSeconds <= FUTURE_SKEW_TOLERANCE) {
        return 'now';
      }
      if (futureSeconds < MINUTE) {
        return 'in a few seconds';
      }
      if (futureSeconds < HOUR) {
        return relativeUnit(Math.round(futureSeconds / MINUTE), 'minute', 'from-now');
      }
      if (futureSeconds < DAY) {
        return relativeUnit(Math.round(futureSeconds / HOUR), 'hour', 'from-now');
      }
      if (futureSeconds < MONTH) {
        return relativeUnit(Math.round(futureSeconds / DAY), 'day', 'from-now');
      }
      if (futureSeconds < YEAR) {
        return relativeUnit(Math.round(futureSeconds / MONTH), 'month', 'from-now');
      }
      return relativeUnit(Math.round(futureSeconds / YEAR), 'year', 'from-now');
    }
    if (diffSeconds < MINUTE) {
      return relativeUnit(diffSeconds, 'second', 'ago');
    }
    if (diffSeconds < HOUR) {
      return relativeUnit(Math.round(diffSeconds / MINUTE), 'minute', 'ago');
    }
    if (diffSeconds < DAY) {
      return relativeUnit(Math.round(diffSeconds / HOUR), 'hour', 'ago');
    }
    if (diffSeconds < 2 * DAY) {
      return 'yesterday';
    }
    if (diffSeconds < MONTH) {
      return relativeUnit(Math.round(diffSeconds / DAY), 'day', 'ago');
    }
    if (diffSeconds < YEAR) {
      return relativeUnit(Math.round(diffSeconds / MONTH), 'month', 'ago');
    }
    return relativeUnit(Math.round(diffSeconds / YEAR), 'year', 'ago');
  }

  function formatTimestamp(input: Date, mode: TimestampFormat): string {
    switch (mode) {
      case 'relative':
        return relativeTimestamp(input, new Date());
      case 'auto':
        return Math.abs((Date.now() - input.getTime()) / 1000) <= DEFAULT_AUTO_THRESHOLD
          ? relativeTimestamp(input, new Date())
          : input.toLocaleString();
      case 'date':
        return input.toLocaleDateString();
      case 'date_time':
        return input.toLocaleString();
      case 'time':
        return input.toLocaleTimeString();
      case 'system_date':
        return systemDate(input);
      case 'system_date_time':
        return `${systemDate(input)} ${systemTime(input)}`;
      case 'system_time':
        return systemTime(input);
    }
  }
</script>

<time {...rest} class={foundationClass('timestamp', className)} datetime={dateTime}>{label}</time>
