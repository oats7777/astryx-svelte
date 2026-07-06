<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file CheckboxInput.svelte
   * @input Checkbox props, label state, and change events
   * @output Accessible checkbox control with disabled, required, and busy states
   * @position Checkbox primitive for @astryxdesign/svelte forms
   */

  import {describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {BooleanChangeHandler, InputSize} from './types.js';

  let {
    id = nextFormId('checkbox'),
    label,
    value = false,
    description = undefined,
    name = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    isLoading = false,
    isIndeterminate = false,
    size = 'md',
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: boolean;
    readonly description?: string;
    readonly name?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly isIndeterminate?: boolean;
    readonly size?: InputSize;
    readonly onChange?: BooleanChangeHandler;
  }>();

  let pending = $state(false);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const busy = $derived(isLoading || pending);

  async function emitChange(nextValue: boolean, event: Event): Promise<void> {
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

  function handleChange(event: Event): void {
    if (isDisabled || busy || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    void emitChange(event.currentTarget.checked, event).catch(() => undefined);
  }
</script>

<div class="astryx-choice" data-size={size} data-disabled={isDisabled}>
  <input
    {id}
    {name}
    type="checkbox"
    checked={value}
    disabled={isDisabled}
    aria-required={isRequired ? 'true' : undefined}
    aria-checked={isIndeterminate ? 'mixed' : value ? 'true' : 'false'}
    aria-busy={busy ? 'true' : undefined}
    aria-describedby={descriptionId}
    oninput={handleChange}
  />
  <label class={isLabelHidden ? 'astryx-sr-only' : undefined} for={id}>{label}</label>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
</div>
