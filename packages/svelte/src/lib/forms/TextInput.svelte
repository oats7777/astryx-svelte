<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TextInput.svelte
   * @input Text input props, status state, and user input events
   * @output Labelled text input with clear, busy, invalid, and described-by semantics
   * @position Text field control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {FieldStatusInput, InputSize, StringChangeHandler} from './types.js';

  let {
    id = nextFormId('text-input'),
    label,
    value = '',
    type = 'text',
    placeholder = undefined,
    name = undefined,
    autoComplete = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    isLoading = false,
    hasClear = false,
    status = undefined,
    description = undefined,
    size = 'md',
    onChange = undefined,
    onFocus = undefined,
    onBlur = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: string;
    readonly type?: 'text' | 'password' | 'email';
    readonly placeholder?: string;
    readonly name?: string;
    readonly autoComplete?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly hasClear?: boolean;
    readonly status?: FieldStatusInput;
    readonly description?: string;
    readonly size?: InputSize;
    readonly onChange?: StringChangeHandler;
    readonly onFocus?: (event: FocusEvent) => void;
    readonly onBlur?: (event: FocusEvent) => void;
  }>();

  let pending = $state(false);
  let inputElement = $state<HTMLInputElement>();
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const busy = $derived(isLoading || pending);
  const canClear = $derived(hasClear && value.length > 0 && !isDisabled && !busy);

  async function emitChange(nextValue: string, event: Event): Promise<void> {
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
    void emitChange(event.currentTarget.value, event).catch(() => undefined);
  }

  function handleClear(event: MouseEvent): void {
    if (isDisabled || busy) {
      return;
    }
    inputElement?.focus();
    void emitChange('', event).catch(() => undefined);
  }
</script>

<div class="astryx-field" data-size={size} data-invalid={status?.type === 'error'}>
  <label class:astryx-sr-only={isLabelHidden} for={id}>{label}</label>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  <div class="astryx-input-shell" onclick={() => inputElement?.focus()} role="presentation">
    <input
      bind:this={inputElement}
      {id}
      type={type}
      {name}
      {placeholder}
      autocomplete={autoComplete}
      class="astryx-text-input"
      value={value}
      disabled={isDisabled}
      aria-required={isRequired ? 'true' : undefined}
      aria-invalid={status?.type === 'error' ? 'true' : undefined}
      aria-busy={busy ? 'true' : undefined}
      aria-describedby={describedBy(descriptionId, statusId)}
      oninput={handleInput}
      onfocus={onFocus}
      onblur={onBlur}
    />
    {#if canClear}
      <button class="astryx-clear-button" type="button" aria-label={`Clear ${label}`} onclick={handleClear}>Clear</button>
    {/if}
  </div>
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
