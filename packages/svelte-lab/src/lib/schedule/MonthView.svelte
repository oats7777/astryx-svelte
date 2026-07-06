<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file MonthView.svelte
   * @input Month range, events, categories, focus date, and timezone
   * @output Accessible month grid with event labels and visible event chips
   * @position Svelte month schedule view
   */

  import {eventOccursOnDate, formatEventAccessibilityLabel, getMonthEventSegments} from './dateMath.js';
  import {formatDayNumber, formatFullDate, formatMonthTitle, formatWeekday} from './format.js';
  import {enumerateDates, plainDateIsEqual, plainDateToISO} from './plain-date.js';
  import type {CalendarEvent, PlainDate, ScheduleCategory, ScheduleRange} from './types.js';

  type Props = {
    readonly range: ScheduleRange;
    readonly events: readonly CalendarEvent[];
    readonly categories: readonly ScheduleCategory[];
    readonly focusDate: PlainDate;
    readonly timezoneID: string;
  };

  let {range, events, categories, focusDate, timezoneID}: Props = $props();
  const days = $derived(enumerateDates(range.startDate, range.endDate));
  const weeks = $derived(Array.from({length: Math.ceil(days.length / 7)}, (_, index) => days.slice(index * 7, index * 7 + 7)));
  const monthEvents = $derived(getMonthEventSegments(events, days, timezoneID));
</script>

<div role="grid" aria-label={formatMonthTitle(focusDate, timezoneID)} aria-readonly="true" class="month-grid">
  <div role="row" class="weekday-row">
    {#each days.slice(0, 7) as day, index (plainDateToISO(day))}
      <div role="columnheader" aria-label={formatWeekday(day, timezoneID, 'long')} aria-colindex={index + 1}>
        {formatWeekday(day, timezoneID, 'short')}
      </div>
    {/each}
  </div>
  {#each weeks as week (plainDateToISO(week[0] ?? range.startDate))}
    <div role="row" class="week-row">
      {#each week as day, index (plainDateToISO(day))}
        {@const dayEvents = events.filter((event) => eventOccursOnDate(event, day, timezoneID))}
        <div
          role="gridcell"
          aria-colindex={index + 1}
          aria-current={plainDateIsEqual(day, focusDate) ? 'date' : undefined}
          aria-label={formatFullDate(day, timezoneID)}
          class:current={plainDateIsEqual(day, focusDate)}
          class="month-cell"
        >
          <span class="day-number">{formatDayNumber(day, timezoneID)}</span>
          {#if dayEvents.length > 0}
            <ul class="sr-only">
              {#each dayEvents as event (event.id)}
                <li>{formatEventAccessibilityLabel(event, day, timezoneID, categories)}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
  <div aria-hidden="true" class="month-events">
    {#each monthEvents as segment (`${segment.event.id}:${segment.week}:${segment.columnStart}`)}
      <span class="event" data-week={segment.week} data-level={segment.level}>{segment.event.title}</span>
    {/each}
  </div>
</div>

<style>
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .month-grid { position: relative; border: 1px solid var(--color-border); border-radius: var(--radius-lg, 12px); overflow: hidden; background: var(--color-bg-surface); }
  .weekday-row, .week-row { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
  .weekday-row > div { padding: 10px; color: var(--color-text-secondary); font-weight: 600; border-bottom: 1px solid var(--color-border); }
  .month-cell { min-height: 72px; padding: 8px; border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
  .day-number { display: inline-grid; place-items: center; min-width: 28px; min-height: 28px; border-radius: 999px; color: var(--color-text-secondary); }
  .current .day-number { background: var(--color-bg-selected); color: var(--color-text-primary); }
  .month-events { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border-top: 1px solid var(--color-border); }
  .event { padding: 4px 8px; border-radius: var(--radius-md, 8px); background: var(--color-bg-selected); color: var(--color-text-primary); font-size: 12px; }
</style>
