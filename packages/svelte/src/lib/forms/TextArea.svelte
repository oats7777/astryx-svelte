<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TextArea.svelte
   * @input Text area props, status state, and user input events
   * @output Labelled multiline input with counter and ARIA state
   * @position Textarea control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {FieldStatusInput, InputSize, StringChangeHandler} from './types.js';

  let {
    id = nextFormId('textarea'),
    label,
    value = '',
    placeholder = undefined,
    name = undefined,
    rows = 3,
    maxLength = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    isLoading = false,
    hasSpellCheck = true,
    status = undefined,
    description = undefined,
    size = 'md',
    onChange = undefined,
    onPaste = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: string;
    readonly placeholder?: string;
    readonly name?: string;
    readonly rows?: number;
    readonly maxLength?: number;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly hasSpellCheck?: boolean;
    readonly status?: FieldStatusInput;
    readonly description?: string;
    readonly size?: InputSize;
    readonly onChange?: StringChangeHandler;
    readonly onPaste?: (event: ClipboardEvent) => void;
  }>();

  let pending = $state(false);
  let textAreaElement = $state<HTMLTextAreaElement>();
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const counterId = $derived(maxLength == null ? undefined : `${id}-counter`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const busy = $derived(isLoading || pending);

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
    if (isDisabled || busy || !(event.currentTarget instanceof HTMLTextAreaElement)) {
      return;
    }
    void emitChange(event.currentTarget.value, event).catch(() => undefined);
  }
</script>

<div class="astryx-field" data-size={size} data-invalid={status?.type === 'error'}>
  <label class:astryx-sr-only={isLabelHidden} for={id}>{label}</label>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  <div class="astryx-input-shell" onclick={() => textAreaElement?.focus()} role="presentation">
    <textarea
      bind:this={textAreaElement}
      {id}
      {name}
      {placeholder}
      {rows}
      spellcheck={hasSpellCheck}
      class="astryx-textarea"
      value={value}
      disabled={isDisabled}
      aria-required={isRequired ? 'true' : undefined}
      aria-invalid={status?.type === 'error' ? 'true' : undefined}
      aria-busy={busy ? 'true' : undefined}
      aria-describedby={describedBy(descriptionId, counterId, statusId)}
      oninput={handleInput}
      onpaste={onPaste}
    ></textarea>
  </div>
  {#if maxLength != null}
    <p id={counterId} class="astryx-field-counter" aria-live="polite">{value.length} / {maxLength}</p>
  {/if}
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
