<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file DateRangeInput.svelte
   * @input Label, date range value, bounds, status, and two text inputs
   * @output Accessible date range input that emits normalized start/end dates only
   * @position Svelte DateRangeInput port for Todo 10 temporal controls
   */

  import FieldStatus from '../forms/FieldStatus.svelte';
  import {describedBy, nextFormId} from '../forms/form-utils.js';
  import Calendar from './Calendar.svelte';
  import type {DateRange, DateRangeChangeHandler, FieldStatusInput, ISODateString} from './temporal-types.js';
  import {dateToISO, formatDisplayDate, isDateAllowed, normalizeRange, parseDateInput} from './temporal-utils.js';

  let {
    id = nextFormId('date-range'),
    label,
    value = null,
    min = undefined,
    max = undefined,
    disabledDates = [],
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: DateRange | null;
    readonly min?: ISODateString;
    readonly max?: ISODateString;
    readonly disabledDates?: readonly ISODateString[];
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: DateRangeChangeHandler;
  }>();

  let startText = $state(initialStartText());
  let endText = $state(initialEndText());
  let localInvalid = $state(false);
  let calendarOpen = $state(false);
  const groupId = $derived(`${id}-group`);
  const startId = $derived(`${id}-start`);
  const endId = $derived(`${id}-end`);
  const calendarId = $derived(`${id}-calendar`);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusMessage = $derived(localInvalid ? 'Invalid date range' : status?.message);
  const statusType = $derived(localInvalid ? 'error' : status?.type);
  const statusId = $derived(statusMessage == null ? undefined : `${id}-status`);
  const invalid = $derived(localInvalid || status?.type === 'error');

  function initialStartText(): string {
    return value == null ? '' : formatDisplayDate(value.start);
  }

  function initialEndText(): string {
    return value == null ? '' : formatDisplayDate(value.end);
  }

  function handleStartInput(event: Event): void {
    if (event.currentTarget instanceof HTMLInputElement) {
      startText = event.currentTarget.value;
      commitRange(event);
    }
  }

  function handleEndInput(event: Event): void {
    if (event.currentTarget instanceof HTMLInputElement) {
      endText = event.currentTarget.value;
      commitRange(event);
    }
  }

  function commitRange(event: Event): void {
    if (isDisabled) {
      return;
    }
    if (startText.trim() === '' && endText.trim() === '') {
      localInvalid = false;
      onChange?.(null, event);
      return;
    }
    const start = parseDateInput(startText);
    const end = parseDateInput(endText);
    const startIso = dateToISO(start);
    const endIso = dateToISO(end);
    if (
      start == null ||
      end == null ||
      startIso == null ||
      endIso == null ||
      !isDateAllowed(start, min, max, disabledDates) ||
      !isDateAllowed(end, min, max, disabledDates)
    ) {
      localInvalid = startText.trim() !== '' || endText.trim() !== '';
      return;
    }
    localInvalid = false;
    onChange?.(normalizeRange(startIso, endIso), event);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && calendarOpen) {
      event.preventDefault();
      calendarOpen = false;
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isDisabled) {
        calendarOpen = true;
      }
    }
  }

  function handleCalendarChange(nextValue: ISODateString | DateRange): void {
    if (typeof nextValue === 'string') {
      return;
    }
    startText = formatDisplayDate(nextValue.start);
    endText = formatDisplayDate(nextValue.end);
    localInvalid = false;
    calendarOpen = false;
    onChange?.(nextValue, new Event('change'));
  }
</script>

<div class="astryx-field" data-invalid={invalid}>
  <div id={groupId} class={isLabelHidden ? 'astryx-sr-only' : 'astryx-field-label'}>
    {label}
    {#if isRequired}
      <span class="astryx-field-indicator">Required</span>
    {/if}
  </div>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  <div class="astryx-range-row" role="group" aria-labelledby={groupId}>
    <div class="astryx-input-shell">
      <input
        id={startId}
        class="astryx-text-input"
        role="combobox"
        type="text"
        autocomplete="off"
        value={startText}
        placeholder="Start date"
        disabled={isDisabled}
        aria-required={isRequired ? 'true' : undefined}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        aria-haspopup="dialog"
        aria-expanded={calendarOpen ? 'true' : 'false'}
        aria-controls={calendarId}
        oninput={handleStartInput}
        onblur={commitRange}
        onkeydown={handleKeydown}
      />
    </div>
    <div class="astryx-input-shell">
      <input
        id={endId}
        class="astryx-text-input"
        role="combobox"
        type="text"
        autocomplete="off"
        value={endText}
        placeholder="End date"
        disabled={isDisabled}
        aria-required={isRequired ? 'true' : undefined}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        aria-haspopup="dialog"
        aria-expanded={calendarOpen ? 'true' : 'false'}
        aria-controls={calendarId}
        oninput={handleEndInput}
        onblur={commitRange}
        onkeydown={handleKeydown}
      />
    </div>
  </div>
  {#if calendarOpen}
    <div id={calendarId} role="dialog" aria-label={`Choose ${label}`}>
      <Calendar mode="range" value={value ?? undefined} focusDate={value?.start} {min} {max} {disabledDates} onChange={handleCalendarChange} />
    </div>
  {/if}
  {#if statusMessage != null && statusType != null}
    <FieldStatus id={statusId} type={statusType} message={statusMessage} />
  {/if}
</div>

<style>
  .astryx-range-row {
    display: grid;
    gap: var(--spacing-2);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
</style>
