<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Switch.svelte
   * @input Switch label, checked state, and change handler
   * @output Accessible switch control with hidden form value
   * @position Switch primitive for @astryxdesign/svelte forms
   */

  import {describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {BooleanChangeHandler, FieldStatusInput} from './types.js';
  import FieldStatus from './FieldStatus.svelte';

  let {
    id = nextFormId('switch'),
    label,
    name = undefined,
    isChecked = false,
    description = undefined,
    isDisabled = false,
    isLoading = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly name?: string;
    readonly isChecked?: boolean;
    readonly description?: string;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: BooleanChangeHandler;
  }>();

  let pending = $state(false);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const busy = $derived(isLoading || pending);

  async function toggle(event: Event): Promise<void> {
    if (isDisabled || busy) {
      return;
    }
    const result = onChange?.(!isChecked, event);
    if (isPromiseLike(result)) {
      pending = true;
      try {
        await result;
      } finally {
        pending = false;
      }
    }
  }
</script>

<div class="astryx-switch-field">
  {#if name}
    <input type="hidden" {name} value={isChecked ? 'true' : 'false'} />
  {/if}
  <button
    {id}
    type="button"
    class="astryx-switch"
    role="switch"
    aria-checked={isChecked ? 'true' : 'false'}
    aria-busy={busy ? 'true' : undefined}
    aria-describedby={describedBy(descriptionId, statusId)}
    disabled={isDisabled}
    onclick={(event) => void toggle(event).catch(() => undefined)}
  >
    <span class="astryx-switch-track" aria-hidden="true"><span class="astryx-switch-thumb"></span></span>
    <span>{label}</span>
  </button>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
