<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TimeInput.svelte
   * @input Label, ISO time value, bounds, status, and text input events
   * @output Accessible time text input that emits normalized ISO times only
   * @position Svelte TimeInput port for Todo 10 temporal controls
   */

  import FieldStatus from '../forms/FieldStatus.svelte';
  import {describedBy, nextFormId} from '../forms/form-utils.js';
  import type {FieldStatusInput, ISOTimeString, TimeChangeHandler} from './temporal-types.js';
  import {formatDisplayTime, isTimeInRange, parseTimeInput} from './temporal-utils.js';

  let {
    id = nextFormId('time-input'),
    label,
    value = undefined,
    min = undefined,
    max = undefined,
    hasSeconds = false,
    hourFormat = '12h',
    placeholder = 'Select a time',
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: ISOTimeString;
    readonly min?: ISOTimeString;
    readonly max?: ISOTimeString;
    readonly hasSeconds?: boolean;
    readonly hourFormat?: '12h' | '24h';
    readonly placeholder?: string;
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: TimeChangeHandler;
  }>();

  let inputText = $state(initialText());
  let localInvalid = $state(false);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusMessage = $derived(localInvalid ? 'Invalid time' : status?.message);
  const statusType = $derived(localInvalid ? 'error' : status?.type);
  const statusId = $derived(statusMessage == null ? undefined : `${id}-status`);
  const invalid = $derived(localInvalid || status?.type === 'error');

  function initialText(): string {
    return value == null ? '' : formatDisplayTime(value, hourFormat, hasSeconds);
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
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    commitInput(event);
  }

  function commitInput(event: Event): void {
    const parsed = parseTimeInput(inputText, hasSeconds);
    if (parsed == null || !isTimeInRange(parsed, min, max)) {
      localInvalid = inputText.trim() !== '';
      return;
    }
    localInvalid = false;
    onChange?.(parsed, event);
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
      type="text"
      inputmode="numeric"
      autocomplete="off"
      value={inputText}
      {placeholder}
      disabled={isDisabled}
      aria-required={isRequired ? 'true' : undefined}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={describedBy(descriptionId, statusId)}
      oninput={handleInput}
      onblur={handleBlur}
      onkeydown={handleKeydown}
    />
  </div>
  {#if statusMessage != null && statusType != null}
    <FieldStatus id={statusId} type={statusType} message={statusMessage} />
  {/if}
</div>
