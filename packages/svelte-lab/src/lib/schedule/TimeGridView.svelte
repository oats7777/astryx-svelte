<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TimeGridView.svelte
   * @input Visible days, schedule events, categories, timezone, and hour bounds
   * @output Day/week time-grid with accessible grid labels and visible event rows
   * @position Shared Svelte view primitive for day and week schedule views
   */

  import {
    eventOccursOnDate,
    formatEventAccessibilityLabel,
    formatEventTime,
    getAllDayEventSegments,
    getTimedEventLayouts,
    isDayEvent,
  } from './dateMath.js';
  import {formatDayNumber, formatFullDate, formatHour, formatTimezoneAbbreviation, formatWeekday} from './format.js';
  import {plainDateAddDays, plainDateFromInstant, plainDateIsEqual, plainDateToInstant, plainDateToISO} from './plain-date.js';
  import type {CalendarEvent, CalendarInstantEvent, PlainDate, ScheduleCategory} from './types.js';

  type Props = {
    readonly days: readonly PlainDate[];
    readonly events: readonly CalendarEvent[];
    readonly categories: readonly ScheduleCategory[];
    readonly focusDate: PlainDate;
    readonly timezoneID: string;
    readonly minHour?: number;
    readonly maxHour?: number;
  };

  let {days, events, categories, focusDate, timezoneID, minHour = 0, maxHour = 24}: Props = $props();
  const currentTime = $derived(Date.now());
  const normalizedMinHour = $derived(Math.max(0, Math.min(23, Math.floor(minHour))));
  const normalizedMaxHour = $derived(Math.max(normalizedMinHour + 1, Math.min(24, Math.floor(maxHour))));
  const hours = $derived(Array.from({length: normalizedMaxHour - normalizedMinHour}, (_, index) => normalizedMinHour + index));
  const allDayEvents = $derived(events.filter(isDayEvent));
  const instantEvents = $derived(events.filter((event): event is CalendarInstantEvent => !isDayEvent(event)));
  const allDaySegments = $derived(getAllDayEventSegments(allDayEvents, days));
  const currentDate = $derived(plainDateFromInstant(currentTime, timezoneID));
  const timezoneLabel = $derived(formatTimezoneAbbreviation(days[0] ?? focusDate, timezoneID));

  function cellLabel(day: PlainDate, label: string, cellEvents: readonly CalendarEvent[]): string {
    if (cellEvents.length === 0) {
      return label;
    }
    return `${label}. ${cellEvents.map((event) => formatEventAccessibilityLabel(event, day, timezoneID, categories)).join('. ')}`;
  }

  function hourEvents(day: PlainDate, hour: number): CalendarInstantEvent[] {
    return instantEvents.filter((event) => {
      const hourStart = plainDateToInstant(day, timezoneID, hour);
      const hourEnd = hour === 23
        ? plainDateToInstant(plainDateAddDays(day, 1), timezoneID)
        : plainDateToInstant(day, timezoneID, hour + 1);
      return eventOccursOnDate(event, day, timezoneID) && event.start < hourEnd && event.end > hourStart;
    });
  }
</script>

<div role="grid" aria-label="Schedule time grid" aria-readonly="true" class="sr-only">
  <div role="row">
    <div role="columnheader" aria-colindex="1">Time</div>
    {#each days as day, index (plainDateToISO(day))}
      <div role="columnheader" aria-colindex={index + 2} aria-current={plainDateIsEqual(day, focusDate) ? 'date' : undefined}>
        {formatFullDate(day, timezoneID)}
      </div>
    {/each}
  </div>
  <div role="row">
    <div role="rowheader" aria-colindex="1">{timezoneLabel} all day</div>
    {#each days as day, index (plainDateToISO(day))}
      {@const cellEvents = allDayEvents.filter((event) => eventOccursOnDate(event, day, timezoneID))}
      <div role="gridcell" aria-colindex={index + 2} aria-label={cellLabel(day, `${formatFullDate(day, timezoneID)} all day`, cellEvents)}></div>
    {/each}
  </div>
  {#each hours as hour}
    <div role="row">
      <div role="rowheader" aria-colindex="1">{formatHour(hour)}</div>
      {#each days as day, index (plainDateToISO(day))}
        <div role="gridcell" aria-colindex={index + 2} aria-label={cellLabel(day, `${formatFullDate(day, timezoneID)} ${formatHour(hour)}`, hourEvents(day, hour))}></div>
      {/each}
    </div>
  {/each}
</div>

<div aria-hidden="true" class="time-grid" style={`--schedule-days:${days.length}`}>
  <div class="time-header">
    {#each days as day (plainDateToISO(day))}
      <div class:current={plainDateIsEqual(day, focusDate)} class="day-heading">
        <span>{formatWeekday(day, timezoneID, 'short')}</span>
        <strong>{formatDayNumber(day, timezoneID)}</strong>
      </div>
    {/each}
  </div>
  <div class="all-day">
    {#each allDaySegments as segment (`${segment.event.id}:${segment.columnStart}`)}
      <span class="event all-day-event" data-level={segment.level}>{segment.event.title}</span>
    {/each}
  </div>
  <div class="time-body">
    {#each days as day (plainDateToISO(day))}
      <section class="day-column">
        {#each hours as hour}
          <div class="hour-row">{formatHour(hour)}</div>
        {/each}
        {#each getTimedEventLayouts({events: instantEvents.filter((event) => eventOccursOnDate(event, day, timezoneID)), day, timezoneID, minHour: normalizedMinHour, maxHour: normalizedMaxHour}) as layout (layout.event.id)}
          <article class="event timed-event" data-level={layout.level}>
            <strong>{layout.event.title}</strong>
            <span>{formatEventTime(layout.event, day, timezoneID)}</span>
          </article>
        {/each}
        {#if plainDateIsEqual(day, currentDate)}
          <span class="now-line"></span>
        {/if}
      </section>
    {/each}
  </div>
</div>

<style>
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .time-grid { border: 1px solid var(--color-border); border-radius: var(--radius-lg, 12px); overflow: hidden; background: var(--color-bg-surface); }
  .time-header, .time-body { display: grid; grid-template-columns: repeat(var(--schedule-days), minmax(0, 1fr)); }
  .day-heading, .day-column { border-right: 1px solid var(--color-border); }
  .day-heading { padding: var(--spacing-3, 12px); color: var(--color-text-secondary); }
  .day-heading strong { display: inline-grid; place-items: center; margin-left: 8px; min-width: 28px; min-height: 28px; border-radius: 999px; color: var(--color-text-primary); }
  .day-heading.current strong { background: var(--color-bg-selected); }
  .all-day { min-height: 36px; padding: 8px; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
  .day-column { position: relative; min-height: 180px; }
  .hour-row { min-height: 36px; padding: 6px 8px; border-bottom: 1px solid var(--color-border-subtle, var(--color-border)); color: var(--color-text-tertiary); font-size: 12px; }
  .event { display: inline-flex; flex-direction: column; gap: 2px; margin: 4px; padding: 6px 8px; border-radius: var(--radius-md, 8px); background: var(--color-bg-selected); color: var(--color-text-primary); font-size: 12px; }
  .timed-event { border-left: 3px solid var(--color-data-categorical-blue); }
  .now-line { position: absolute; inset-inline: 0; top: 50%; height: 2px; background: var(--color-border-danger, var(--color-data-categorical-red)); }
</style>
