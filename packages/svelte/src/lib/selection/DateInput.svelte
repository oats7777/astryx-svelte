<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file DateInput.svelte
   * @input Label, ISO date value, bounds, status, and text input events
   * @output Accessible date text input that emits normalized ISO dates only
   * @position Svelte DateInput port for Todo 10 temporal controls
   */

  import FieldStatus from '../forms/FieldStatus.svelte';
  import {describedBy, nextFormId} from '../forms/form-utils.js';
  import Calendar from './Calendar.svelte';
  import type {DateChangeHandler, FieldStatusInput, ISODateString} from './temporal-types.js';
  import {dateToISO, formatDisplayDate, isDateAllowed, parseDateInput} from './temporal-utils.js';

  let {
    id = nextFormId('date-input'),
    label,
    value = undefined,
    min = undefined,
    max = undefined,
    disabledDates = [],
    placeholder = 'Select a date',
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: ISODateString;
    readonly min?: ISODateString;
    readonly max?: ISODateString;
    readonly disabledDates?: readonly ISODateString[];
    readonly placeholder?: string;
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: DateChangeHandler;
  }>();

  let inputText = $state(initialText());
  let localInvalid = $state(false);
  let calendarOpen = $state(false);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const calendarId = $derived(`${id}-calendar`);
  const statusMessage = $derived(localInvalid ? 'Invalid date' : status?.message);
  const statusType = $derived(localInvalid ? 'error' : status?.type);
  const statusId = $derived(statusMessage == null ? undefined : `${id}-status`);
  const invalid = $derived(localInvalid || status?.type === 'error');

  function initialText(): string {
    return value == null ? '' : formatDisplayDate(value);
  }

  function handleInput(event: Event): void {
    if (isDisabled || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    inputText = event.currentTarget.value;
    commitInput(event);
  }

  function handleBlur(event: FocusEvent): void {
    if (inputText.trim() === '') {
      localInvalid = false;
      onChange?.(undefined, event);
      return;
    }
    commitInput(event);
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
      return;
    }
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    commitInput(event);
  }

  function handleCalendarChange(nextValue: ISODateString): void {
    inputText = formatDisplayDate(nextValue);
    localInvalid = false;
    calendarOpen = false;
    onChange?.(nextValue, new Event('change'));
  }

  function commitInput(event: Event): void {
    const parsed = parseDateInput(inputText);
    const iso = dateToISO(parsed);
    if (parsed == null || iso == null || !isDateAllowed(parsed, min, max, disabledDates)) {
      localInvalid = inputText.trim() !== '';
      return;
    }
    localInvalid = false;
    onChange?.(iso, event);
  }
</script>

<div class="astryx-field" data-invalid={invalid}>
  <label class:astryx-sr-only={isLabelHidden} for={id}>
    {label}
    {#if isRequired}
      <span class="astryx-field-indicator">Required</span>
    {/if}
  </label>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  <div class="astryx-input-shell">
    <input
      {id}
      class="astryx-text-input"
      role="combobox"
      type="text"
      inputmode="text"
      autocomplete="off"
      value={inputText}
      {placeholder}
      disabled={isDisabled}
      aria-required={isRequired ? 'true' : undefined}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={describedBy(descriptionId, statusId)}
      aria-haspopup="dialog"
      aria-expanded={calendarOpen ? 'true' : 'false'}
      aria-controls={calendarId}
      oninput={handleInput}
      onblur={handleBlur}
      onkeydown={handleKeydown}
    />
  </div>
  {#if calendarOpen}
    <div id={calendarId} role="dialog" aria-label={`Choose ${label}`}>
      <Calendar value={value} focusDate={value} {min} {max} {disabledDates} onChange={(nextValue) => {
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
