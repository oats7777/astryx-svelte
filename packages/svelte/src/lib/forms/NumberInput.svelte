<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file NumberInput.svelte
   * @input Number input props, bounds, status, and user input events
   * @output Labelled numeric input with clear and validation semantics
   * @position Number field control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {coerceNumber, describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {FieldStatusInput, InputSize, NumberChangeHandler} from './types.js';

  let {
    id = nextFormId('number-input'),
    label,
    value = null,
    min = undefined,
    max = undefined,
    step = undefined,
    units = undefined,
    placeholder = undefined,
    name = undefined,
    isIntegerOnly = false,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    isLoading = false,
    hasClear = false,
    status = undefined,
    size = 'md',
    onChange = undefined,
    onEnter = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: number | null;
    readonly min?: number;
    readonly max?: number;
    readonly step?: number;
    readonly units?: string;
    readonly placeholder?: string;
    readonly name?: string;
    readonly isIntegerOnly?: boolean;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly hasClear?: boolean;
    readonly status?: FieldStatusInput;
    readonly size?: InputSize;
    readonly onChange?: NumberChangeHandler;
    readonly onEnter?: (value: number | null, event: KeyboardEvent) => void;
  }>();

  let pending = $state(false);
  let invalidMessage = $state<string | undefined>();
  let inputElement = $state<HTMLInputElement>();
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const invalidId = $derived(invalidMessage == null ? undefined : `${id}-invalid`);
  const busy = $derived(isLoading || pending);
  const canClear = $derived(hasClear && value != null && !isDisabled && !busy);

  function isAllowed(nextValue: number | null): boolean {
    if (nextValue == null) {
      return true;
    }
    if (isIntegerOnly && !Number.isInteger(nextValue)) {
      return false;
    }
    if (min != null && nextValue < min) {
      return false;
    }
    if (max != null && nextValue > max) {
      return false;
    }
    return true;
  }

  async function emitChange(nextValue: number | null, event: Event): Promise<void> {
    if (!isAllowed(nextValue)) {
      invalidMessage = 'Invalid number';
      return;
    }
    invalidMessage = undefined;
    const result = onChange?.(nextValue, event);
    if (isPromiseLike(result)) {
      pending = true;
      try {
        await result;
      } finally {
        pending = false;
      }
    }
  }

  function handleInput(event: Event): void {
    if (isDisabled || busy || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    const nextValue = coerceNumber(event.currentTarget.value);
    if (!isAllowed(nextValue)) {
      invalidMessage = 'Invalid number';
      return;
    }
    invalidMessage = undefined;
    void emitChange(nextValue, event).catch(() => undefined);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || isDisabled || busy || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    const nextValue = coerceNumber(event.currentTarget.value);
    if (!isAllowed(nextValue)) {
      invalidMessage = 'Invalid number';
      return;
    }
    onEnter?.(nextValue, event);
    void emitChange(nextValue, event).catch(() => undefined);
  }

  function handleClear(event: MouseEvent): void {
    inputElement?.focus();
    invalidMessage = undefined;
    void emitChange(null, event).catch(() => undefined);
  }
</script>

<div class="astryx-field" data-size={size} data-invalid={status?.type === 'error'}>
  <label class:astryx-sr-only={isLabelHidden} for={id}>{label}</label>
  <div class="astryx-input-shell" onclick={() => inputElement?.focus()} role="presentation">
    <input
      bind:this={inputElement}
      {id}
      type="number"
      {name}
      {min}
      {max}
      {step}
      {placeholder}
      class="astryx-text-input"
      value={value ?? ''}
      disabled={isDisabled}
      aria-required={isRequired ? 'true' : undefined}
      aria-invalid={status?.type === 'error' || invalidMessage != null ? 'true' : undefined}
      aria-busy={busy ? 'true' : undefined}
      aria-describedby={describedBy(invalidId, statusId)}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />
    {#if units}
      <span class="astryx-input-affix">{units}</span>
    {/if}
    {#if canClear}
      <button class="astryx-clear-button" type="button" aria-label={`Clear ${label}`} onclick={handleClear}>Clear</button>
    {/if}
  </div>
  {#if invalidMessage}
    <p id={invalidId} class="astryx-sr-only" role="alert" aria-live="assertive">{invalidMessage}</p>
  {/if}
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
