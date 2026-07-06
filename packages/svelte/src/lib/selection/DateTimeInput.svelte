<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file DateTimeInput.svelte
   * @input Label, ISO datetime value, bounds, status, and date/time text inputs
   * @output Accessible datetime input that emits normalized local ISO datetime strings only
   * @position Svelte DateTimeInput port for Todo 10 temporal controls
   */

  import FieldStatus from '../forms/FieldStatus.svelte';
  import {describedBy, nextFormId} from '../forms/form-utils.js';
  import Calendar from './Calendar.svelte';
  import type {DateTimeChangeHandler, FieldStatusInput, ISODateTimeString} from './temporal-types.js';
  import {dateToISO, formatDisplayDate, formatDisplayTime, isTimeInRange, parseDateInput, parseTimeInput} from './temporal-utils.js';

  let {
    id = nextFormId('datetime-input'),
    label,
    value = undefined,
    hasSeconds = false,
    hourFormat = '12h',
    timeLabel = undefined,
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: ISODateTimeString;
    readonly hasSeconds?: boolean;
    readonly hourFormat?: '12h' | '24h';
    readonly timeLabel?: string;
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: DateTimeChangeHandler;
  }>();

  let dateText = $state(initialDateText());
  let timeText = $state(initialTimeText());
  let localInvalid = $state(false);
  let calendarOpen = $state(false);
  const groupId = $derived(`${id}-group`);
  const dateId = $derived(`${id}-date`);
  const timeId = $derived(`${id}-time`);
  const calendarId = $derived(`${id}-calendar`);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusMessage = $derived(localInvalid ? 'Invalid date or time' : status?.message);
  const statusType = $derived(localInvalid ? 'error' : status?.type);
  const statusId = $derived(statusMessage == null ? undefined : `${id}-status`);
  const valueDate = $derived(value?.split('T')[0]);
  const parsedDate = $derived(dateToISO(parseDateInput(dateText)));
  const calendarDate = $derived(parsedDate ?? valueDate);
  const parsedTime = $derived(parseTimeInput(timeText, hasSeconds));
  const dateInvalid = $derived(dateText.trim() !== '' && parsedDate == null);
  const timeInvalid = $derived(timeText.trim() !== '' && (parsedTime == null || !isTimeInRange(parsedTime)));
  const invalid = $derived(localInvalid || dateInvalid || timeInvalid || status?.type === 'error');

  function initialDateText(): string {
    const initialDate = value?.split('T')[0];
    return initialDate == null ? '' : formatDisplayDate(initialDate);
  }

  function initialTimeText(): string {
    const initialTime = value?.split('T')[1];
    return initialTime == null ? '' : formatDisplayTime(initialTime, hourFormat, hasSeconds);
  }

  function handleDateInput(event: Event): void {
    if (event.currentTarget instanceof HTMLInputElement) {
      dateText = event.currentTarget.value;
      commitDateTime(event);
    }
  }

  function handleTimeInput(event: Event): void {
    if (event.currentTarget instanceof HTMLInputElement) {
      timeText = event.currentTarget.value;
      commitDateTime(event);
    }
  }

  function commitDateTime(event: Event): void {
    if (isDisabled) {
      return;
    }
    if (dateText.trim() === '' && timeText.trim() === '') {
      localInvalid = false;
      onChange?.(undefined, event);
      return;
    }
    if (parsedDate == null || parsedTime == null || !isTimeInRange(parsedTime)) {
      localInvalid = dateText.trim() !== '' || timeText.trim() !== '';
      return;
    }
    localInvalid = false;
    onChange?.(`${parsedDate}T${parsedTime}`, event);
  }

  function handleDateKeydown(event: KeyboardEvent): void {
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

  function handleCalendarChange(nextDate: string): void {
    dateText = formatDisplayDate(nextDate);
    calendarOpen = false;
    if (parsedTime == null || !isTimeInRange(parsedTime)) {
      localInvalid = true;
      return;
    }
    localInvalid = false;
    onChange?.(`${nextDate}T${parsedTime}`, new Event('change'));
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
  <div class="astryx-datetime-row" role="group" aria-labelledby={groupId}>
    <div class="astryx-input-shell">
      <input
        id={dateId}
        class="astryx-text-input"
        role="combobox"
        type="text"
        autocomplete="off"
        value={dateText}
        placeholder="Date"
        disabled={isDisabled}
        aria-required={isRequired ? 'true' : undefined}
        aria-invalid={dateInvalid || status?.type === 'error' ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        aria-haspopup="dialog"
        aria-expanded={calendarOpen ? 'true' : 'false'}
        aria-controls={calendarId}
        oninput={handleDateInput}
        onblur={commitDateTime}
        onkeydown={handleDateKeydown}
      />
      {#if dateInvalid}
        <p class="astryx-sr-only" role="alert" aria-live="assertive">Invalid date</p>
      {/if}
    </div>
    <div class="astryx-input-shell">
      <input
        id={timeId}
        class="astryx-text-input"
        type="text"
        autocomplete="off"
        value={timeText}
        placeholder="Time"
        disabled={isDisabled}
        aria-label={timeLabel ?? `${label} time`}
        aria-required={isRequired ? 'true' : undefined}
        aria-invalid={timeInvalid || status?.type === 'error' ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        oninput={handleTimeInput}
        onblur={commitDateTime}
      />
      {#if timeInvalid}
        <p class="astryx-sr-only" role="alert" aria-live="assertive">Invalid time</p>
      {/if}
    </div>
  </div>
  {#if calendarOpen}
    <div id={calendarId} role="dialog" aria-label={`Choose ${label}`}>
      <Calendar value={calendarDate} focusDate={calendarDate} onChange={(nextValue) => {
        if (typeof nextValue === 'string') {
          handleCalendarChange(nextValue);
        }
      }} />
    </div>
  {/if}
  {#if statusMessage != null && statusType != null}
    <FieldStatus id={statusId} type={statusType} message={statusMessage} />
  {/if}
</div>

<style>
  .astryx-datetime-row {
    display: grid;
    gap: var(--spacing-2);
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
</style>
