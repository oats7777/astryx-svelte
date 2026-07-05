<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ListView.svelte
   * @input Schedule range, events, focus date, and timezone
   * @output Grouped list schedule view with empty state
   * @position Svelte list schedule view
   */

  import {eventOccursOnDate, formatEventTime, isDayEvent} from './dateMath.js';
  import {formatDayNumber, formatFullDate, formatWeekday} from './format.js';
  import {enumerateDates, plainDateIsEqual, plainDateToISO} from './plain-date.js';
  import type {CalendarEvent, PlainDate, ScheduleRange} from './types.js';

  type Props = {
    readonly range: ScheduleRange;
    readonly events: readonly CalendarEvent[];
    readonly focusDate: PlainDate;
    readonly timezoneID: string;
  };

  let {range, events, focusDate, timezoneID}: Props = $props();
  const days = $derived(enumerateDates(range.startDate, range.endDate));
  const visibleDays = $derived(days.map((day) => ({
    day,
    events: events.filter((event) => eventOccursOnDate(event, day, timezoneID)),
    current: plainDateIsEqual(day, focusDate),
    base: plainDateIsEqual(day, range.startDate),
  })).filter((record) => record.events.length > 0 || record.current || record.base));
</script>

<div class="list-view">
  {#if visibleDays.length === 0}
    <p class="empty">No events scheduled.</p>
  {:else}
    {#each visibleDays as record (plainDateToISO(record.day))}
      <section class="list-day">
        <h3 aria-current={record.current ? 'date' : undefined} aria-label={formatFullDate(record.day, timezoneID)}>
          <span>{formatDayNumber(record.day, timezoneID)}</span>
          {formatWeekday(record.day, timezoneID, 'short')}
        </h3>
        {#if record.events.length === 0}
          <p class="empty">No events.</p>
        {:else}
          <ul>
            {#each record.events as event (event.id)}
              <li>
                <span>{isDayEvent(event) ? 'All day' : formatEventTime(event, record.day, timezoneID)}</span>
                <strong>{event.title}</strong>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    {/each}
  {/if}
</div>

<style>
  .list-view { display: grid; gap: 12px; }
  .list-day { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 12px; padding-block: 12px; border-bottom: 1px solid var(--color-border); }
  h3 { margin: 0; color: var(--color-text-secondary); font-size: 14px; }
  h3 span { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 999px; color: var(--color-text-primary); background: var(--color-bg-subtle); }
  h3[aria-current='date'] span { background: var(--color-bg-selected); }
  ul { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
  li { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 12px; align-items: baseline; padding: 8px 10px; border-radius: var(--radius-md, 8px); background: var(--color-bg-surface); }
  li span, .empty { color: var(--color-text-secondary); }
  .empty { margin: 0; }
</style>
