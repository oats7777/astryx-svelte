<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Schedule.svelte
   * @input Events, view descriptor, focused instants, timezone, categories, and plugins
   * @output Read-only Svelte schedule shell for day, week, month, and list views
   * @position Root component for the private Svelte lab schedule slice
   */

  import ListView from './ListView.svelte';
  import MonthView from './MonthView.svelte';
  import TimeGridView from './TimeGridView.svelte';
  import {eventOverlapsRange, getBrowserTimezoneID, sortEvents} from './dateMath.js';
  import {formatMonthTitle, formatWeekTitle} from './format.js';
  import {defaultSchedulePlugins} from './plugins.js';
  import {enumerateDates, plainDateAddDays, plainDateFromInstant} from './plain-date.js';
  import {createZonedDateTime} from './zonedDateTime.js';
  import type {
    CalendarEvent,
    Instant,
    ScheduleCategory,
    ScheduleEventSource,
    SchedulePlugin,
    ScheduleRange,
    ScheduleView,
    ScheduleViewSelectorPlugin,
    ZonedDateTime,
    ZonedDateTimeRange,
  } from './types.js';

  type Props = {
    readonly view: ScheduleView;
    readonly events: ScheduleEventSource;
    readonly categories?: readonly ScheduleCategory[];
    readonly date: Instant;
    readonly focusDate?: Instant;
    readonly timezoneID?: string;
    readonly plugins?: readonly SchedulePlugin[];
    readonly onChangeDate?: (date: Instant) => void;
  };

  let {
    view,
    events,
    categories = [],
    date,
    focusDate,
    timezoneID = getBrowserTimezoneID(),
    plugins = defaultSchedulePlugins,
    onChangeDate,
  }: Props = $props();

  let loadedEvents = $state<readonly CalendarEvent[]>([]);
  let isLoading = $state(false);
  let loadVersion = 0;
  const focusedInstant = $derived(focusDate ?? Date.now());
  const zonedDate = $derived(createZonedDateTime(date, timezoneID));
  const focusedDate = $derived(plainDateFromInstant(focusedInstant, timezoneID));
  const range = $derived(toScheduleRange(view, zonedDate));
  const previous = $derived(view.getPreviousDateRange(zonedDate));
  const next = $derived(view.getNextDateRange(zonedDate));
  const hourOptions = $derived(getHourOptions(view));
  const activeEvents = $derived(sortEvents(
    loadedEvents.filter((event) => eventOverlapsRange(event, range, timezoneID)),
    timezoneID,
  ));
  const title = $derived(getTitle(view, range, timezoneID));

  $effect(() => {
    const source = events;
    const activeRange = range;
    loadVersion += 1;
    const version = loadVersion;
    if (typeof source !== 'function') {
      loadedEvents = source;
      isLoading = false;
      return;
    }
    isLoading = true;
    source(activeRange.start, activeRange.end).then(
      (value) => {
        if (version === loadVersion) {
          loadedEvents = value;
          isLoading = false;
        }
      },
      () => {
        if (version === loadVersion) {
          loadedEvents = [];
          isLoading = false;
        }
      },
    );
  });

  function shiftTo(target: ZonedDateTimeRange): void {
    const current = view.getDateRange(zonedDate);
    onChangeDate?.(zonedDate.instant + target[0].instant - current[0].instant);
  }

  function renderPosition(position: 'start' | 'end'): SchedulePlugin[] {
    return plugins.filter((plugin) => plugin.position === position);
  }

  function isViewSelector(plugin: SchedulePlugin): plugin is ScheduleViewSelectorPlugin {
    return plugin.kind === 'view-selector';
  }

  function toScheduleRange(activeView: ScheduleView, activeDate: ZonedDateTime): ScheduleRange {
    const [start, end] = activeView.getDateRange(activeDate);
    return {
      start: start.instant,
      end: end.instant,
      startDate: plainDateFromInstant(start.instant, start.timezoneID),
      endDate: plainDateFromInstant(end.instant, end.timezoneID),
    };
  }

  function getTitle(activeView: ScheduleView, activeRange: ScheduleRange, activeTimezoneID: string): string {
    if (activeView.kind === 'month') {
      return formatMonthTitle(plainDateFromInstant(activeRange.start + 14 * 86400000, activeTimezoneID), activeTimezoneID);
    }
    const end = plainDateAddDays(activeRange.endDate, -1);
    return formatWeekTitle(activeRange.startDate, end, activeTimezoneID);
  }

  function getHourOptions(activeView: ScheduleView): {readonly minHour?: number; readonly maxHour?: number} {
    const minHour = typeof activeView.options.minHour === 'number' ? activeView.options.minHour : undefined;
    const maxHour = typeof activeView.options.maxHour === 'number' ? activeView.options.maxHour : undefined;
    return {minHour, maxHour};
  }
</script>

<section class="schedule" data-astryx-schedule aria-label={title}>
  <header class="schedule-header">
    <div class="header-slot">
      {#each renderPosition('start') as plugin}
        {#if plugin.kind === 'pagination'}
          <div role="group" aria-label="Schedule pagination" class="button-group">
            <button type="button" onclick={() => shiftTo(previous.range)} aria-label={previous.label}>‹</button>
            <button type="button" onclick={() => onChangeDate?.(Date.now())}>Today</button>
            <button type="button" onclick={() => shiftTo(next.range)} aria-label={next.label}>›</button>
          </div>
        {:else if plugin.kind === 'label'}
          <span>{plugin.label}</span>
        {/if}
      {/each}
    </div>
    <h2>{title}{#if isLoading}<span aria-label="Loading events" class="spinner">Loading</span>{/if}</h2>
    <div class="header-slot end">
      {#each renderPosition('end') as plugin}
        {#if isViewSelector(plugin)}
          <label>
            <span class="sr-only">Schedule view</span>
            <select disabled={plugin.onChangeView == null} onchange={(event) => {
              const selected = plugin.options[Number(event.currentTarget.value)];
              if (selected != null) {
                plugin.onChangeView?.(selected.view);
              }
            }}>
              {#each plugin.options as option, index}
                <option value={index} selected={option.view === view}>{option.label}</option>
              {/each}
            </select>
          </label>
        {:else if plugin.kind === 'pagination'}
          <div role="group" aria-label="Schedule pagination" class="button-group">
            <button type="button" onclick={() => shiftTo(previous.range)} aria-label={previous.label}>‹</button>
            <button type="button" onclick={() => onChangeDate?.(Date.now())}>Today</button>
            <button type="button" onclick={() => shiftTo(next.range)} aria-label={next.label}>›</button>
          </div>
        {:else}
          <span>{plugin.label}</span>
        {/if}
      {/each}
    </div>
  </header>

  {#if view.kind === 'month'}
    <MonthView {range} events={activeEvents} {categories} {timezoneID} focusDate={focusedDate} />
  {:else if view.kind === 'list'}
    <ListView {range} events={activeEvents} {timezoneID} focusDate={focusedDate} />
  {:else}
    {@const days = enumerateDates(range.startDate, range.endDate)}
    <TimeGridView
      {days}
      events={activeEvents}
      {categories}
      {timezoneID}
      focusDate={focusedDate}
      minHour={hourOptions.minHour}
      maxHour={hourOptions.maxHour}
    />
  {/if}
</section>

<style>
  .schedule { display: grid; gap: 16px; color: var(--color-text-primary); }
  .schedule-header { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 12px; }
  .header-slot { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .header-slot.end { justify-content: end; }
  h2 { margin: 0; font-size: 20px; line-height: 1.2; }
  .button-group { display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px); overflow: hidden; }
  button, select { min-height: 32px; border: 0; background: var(--color-bg-surface); color: var(--color-text-primary); font: inherit; }
  button { padding-inline: 10px; border-right: 1px solid var(--color-border); cursor: pointer; }
  button:last-child { border-right: 0; }
  select { border: 1px solid var(--color-border); border-radius: var(--radius-md, 8px); padding-inline: 10px; }
  .spinner { margin-left: 8px; color: var(--color-text-secondary); font-size: 12px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style>
