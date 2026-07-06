<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file CheckboxList.svelte
   * @input Checkbox item collection, selected values, and change events
   * @output Accessible checkbox group with hidden form values
   * @position Checkbox collection control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {FieldStatusInput, SelectItem, StringArrayChangeHandler} from './types.js';

  let {
    id = nextFormId('checkbox-list'),
    label,
    value = [],
    items = [],
    name = undefined,
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    isLoading = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: readonly string[];
    readonly items?: readonly SelectItem[];
    readonly name?: string;
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: StringArrayChangeHandler;
  }>();

  let pendingValue = $state<string | undefined>();
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const labelId = $derived(`${id}-label`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const selected = $derived(new Set(value));

  async function toggle(item: SelectItem, event: Event): Promise<void> {
    if (isDisabled || isLoading || item.isDisabled || item.isLoading || pendingValue != null) {
      return;
    }
    const next = new Set(value);
    if (next.has(item.value)) {
      next.delete(item.value);
    } else {
      next.add(item.value);
    }
    const result = onChange?.([...next], event);
    if (isPromiseLike(result)) {
      pendingValue = item.value;
      try {
        await result;
      } finally {
        pendingValue = undefined;
      }
    }
  }
</script>

<fieldset class="astryx-choice-list" aria-describedby={describedBy(descriptionId, statusId)}>
  <legend id={labelId} class={isLabelHidden ? 'astryx-sr-only' : undefined}>
    {label}
    {#if isRequired}
      <span class="astryx-field-indicator">Required</span>
    {/if}
  </legend>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  {#each value as selectedValue}
    {#if name}
      <input type="hidden" {name} value={selectedValue} />
    {/if}
  {/each}
  <div id={`${id}-options`} role="group" aria-labelledby={labelId} aria-describedby={describedBy(descriptionId, statusId)}>
    <div class="astryx-choice-items">
      {#each items as item}
        <div
          role="checkbox"
          tabindex={isDisabled || item.isDisabled ? undefined : 0}
          class="astryx-choice-item"
          aria-checked={selected.has(item.value) ? 'true' : 'false'}
          aria-disabled={isDisabled || item.isDisabled ? 'true' : undefined}
          aria-busy={isLoading || item.isLoading || pendingValue === item.value ? 'true' : undefined}
          onclick={(event) => void toggle(item, event).catch(() => undefined)}
          onkeydown={(event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault();
              void toggle(item, event).catch(() => undefined);
            }
          }}
        >
          <span class="astryx-choice-box" data-selected={selected.has(item.value)} aria-hidden="true"></span>
          <span>
            <span>{item.label}</span>
            {#if item.description}
              <span class="astryx-choice-description">{item.description}</span>
            {/if}
          </span>
        </div>
      {/each}
    </div>
  </div>
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</fieldset>
