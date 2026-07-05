<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Calendar.svelte
   * @input Calendar value, focus date, bounds, disabled dates, and selection callback
   * @output Accessible local-date calendar grid with keyboard navigation
   * @position Svelte temporal selection primitive for Todo 10
   */

  import {flushSync} from 'svelte';
  import type {CalendarMode, DateRange, ISODateString, PlainDate} from './temporal-types.js';
  import {
    calendarKeyboardTarget,
    normalizeWeekStart,
    resolveInitialCalendarDate,
    startOfMonth,
    todayPlainDate,
  } from './calendar-utils.js';
  import {
    addMonths,
    calendarDays,
    compareDates,
    dateToISO,
    dayNames,
    isDateAllowed,
    monthLabel,
    normalizeRange,
    parseISODate,
    toLocalDate,
  } from './temporal-utils.js';

  let {
    id = 'astryx-calendar',
    mode = 'single',
    value = undefined,
    focusDate = undefined,
    min = undefined,
    max = undefined,
    disabledDates = [],
    weekStartsOn = 0,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly mode?: CalendarMode;
    readonly value?: ISODateString | DateRange;
    readonly focusDate?: ISODateString;
    readonly min?: ISODateString;
    readonly max?: ISODateString;
    readonly disabledDates?: readonly ISODateString[];
    readonly weekStartsOn?: number;
    readonly onChange?: (value: ISODateString | DateRange, valueAsDate?: Date) => void;
  }>();

  let root = $state<HTMLDivElement>();
  let visibleMonth = $state(initialVisibleMonth());
  let rangeStart = $state<ISODateString | null>(null);
  const weekStart = $derived(normalizeWeekStart(weekStartsOn));
  const days = $derived(calendarDays(visibleMonth, weekStart));
  const labels = $derived(dayNames(weekStart));
  const selectedDate = $derived(typeof value === 'string' ? value : undefined);
  const selectedRange = $derived(typeof value === 'object' ? value : undefined);
  const tabbableDate = $derived(resolveTabbableDate());

  function initialVisibleMonth(): PlainDate {
    return startOfMonth(resolveInitialCalendarDate({focusDate, value, today: todayPlainDate()}));
  }

  function canSelect(date: PlainDate, isOutside: boolean): boolean {
    return !isOutside && isDateAllowed(date, min, max, disabledDates);
  }

  function isSelected(iso: ISODateString): boolean {
    if (mode === 'single') {
      return selectedDate === iso;
    }
    if (rangeStart === iso) {
      return true;
    }
    if (selectedRange == null) {
      return false;
    }
    const date = parseISODate(iso);
    const start = parseISODate(selectedRange.start);
    const end = parseISODate(selectedRange.end);
    return date != null && start != null && end != null && compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
  }

  function selectDay(date: PlainDate, isOutside: boolean): void {
    if (!canSelect(date, isOutside)) {
      return;
    }
    const iso = dateToISO(date);
    if (iso == null) {
      return;
    }
    if (mode === 'range') {
      if (rangeStart == null) {
        rangeStart = iso;
        return;
      }
      const range = normalizeRange(rangeStart, iso);
      rangeStart = null;
      onChange?.(range);
      return;
    }
    onChange?.(iso, toLocalDate(date));
  }

  function resolveTabbableDate(): ISODateString | null {
    const candidates = [selectedDate, rangeStart, selectedRange?.start, focusDate];
    for (const candidate of candidates) {
      if (isTabbableDate(candidate)) {
        return candidate ?? null;
      }
    }
    return days.find((day) => canSelect(day.date, day.isOutside))?.iso ?? null;
  }

  function isTabbableDate(iso: ISODateString | null | undefined): boolean {
    if (iso == null) {
      return false;
    }
    const day = days.find((candidate) => candidate.iso === iso);
    return day != null && canSelect(day.date, day.isOutside);
  }

  function handleKeydown(event: KeyboardEvent, iso: ISODateString): void {
    const date = parseISODate(iso);
    if (date == null) {
      return;
    }
    const target = calendarKeyboardTarget(event.key, date, weekStart);
    if (target == null) {
      return;
    }
    event.preventDefault();
    focusCalendarDate(target);
  }

  function focusCalendarDate(date: PlainDate): void {
    const iso = dateToISO(date);
    const existingButton = root?.querySelector<HTMLButtonElement>(`button[data-date="${iso ?? ''}"]`);
    if (existingButton != null) {
      existingButton.focus();
      return;
    }
    visibleMonth = startOfMonth(date);
    flushSync();
    root?.querySelector<HTMLButtonElement>(`button[data-date="${iso ?? ''}"]`)?.focus();
  }

  function moveMonth(months: number): void {
    visibleMonth = addMonths(visibleMonth, months);
  }
</script>

<div bind:this={root} class="astryx-calendar" data-mode={mode} {id}>
  <div class="astryx-calendar-header">
    <button class="astryx-calendar-nav" type="button" aria-label="Previous month" onclick={() => moveMonth(-1)}>‹</button>
    <h2 class="astryx-calendar-title">{monthLabel(visibleMonth)}</h2>
    <button class="astryx-calendar-nav" type="button" aria-label="Next month" onclick={() => moveMonth(1)}>›</button>
  </div>
  <div role="grid" aria-labelledby={id} class="astryx-calendar-grid">
    <div role="row" class="astryx-calendar-row">
      {#each labels as label}
        <div role="columnheader" class="astryx-calendar-weekday">{label}</div>
      {/each}
    </div>
    {#each Array.from({length: 6}) as _row, rowIndex}
      <div role="row" class="astryx-calendar-row">
        {#each days.slice(rowIndex * 7, rowIndex * 7 + 7) as day}
          {@const disabled = !canSelect(day.date, day.isOutside)}
          <div role="gridcell" class="astryx-calendar-cell" aria-selected={isSelected(day.iso) ? 'true' : 'false'}>
            <button
              type="button"
              class="astryx-calendar-day"
              data-date={day.iso}
              data-outside={day.isOutside}
              data-selected={isSelected(day.iso)}
              aria-label={day.label}
              disabled={disabled}
              aria-disabled={disabled ? 'true' : undefined}
              tabindex={day.iso === tabbableDate ? 0 : -1}
              onclick={() => selectDay(day.date, day.isOutside)}
              onkeydown={(event) => handleKeydown(event, day.iso)}
            >
              {day.date.day}
            </button>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .astryx-calendar {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    color: var(--color-text-primary);
    display: grid; gap: var(--spacing-3);
    padding: var(--spacing-3);
    width: max-content;
  }

  .astryx-calendar-header,
  .astryx-calendar-row {
    align-items: center; display: grid;
    grid-template-columns: repeat(7, var(--size-element-md));
    gap: var(--spacing-1);
  }

  .astryx-calendar-header {
    grid-template-columns: var(--size-element-md) 1fr var(--size-element-md);
  }

  .astryx-calendar-title {
    font-family: var(--font-family-body); font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    margin: 0; text-align: center;
  }

  .astryx-calendar-nav,
  .astryx-calendar-day {
    background: transparent; border: 0;
    border-radius: var(--radius-element);
    color: inherit; cursor: pointer; font: inherit;
    min-height: var(--size-element-md);
  }

  .astryx-calendar-weekday {
    color: var(--color-text-secondary); font-size: var(--font-size-sm); text-align: center;
  }

  .astryx-calendar-day[data-selected="true"] {
    background: var(--color-accent);
    color: var(--color-on-accent);
  }

  .astryx-calendar-day:disabled {
    color: var(--color-text-disabled); cursor: not-allowed;
    opacity: 0.56;
  }

  .astryx-calendar-day:focus-visible,
  .astryx-calendar-nav:focus-visible {
    outline: var(--border-width) solid var(--color-accent);
    outline-offset: var(--spacing-1);
  }
</style>
