<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file RadioList.svelte
   * @input Radio item collection, selected value, and change events
   * @output Accessible radio group with hidden form value
   * @position Radio collection control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {describedBy, isPromiseLike, nextFormId} from './form-utils.js';
  import type {FieldStatusInput, SelectItem, StringChangeHandler} from './types.js';

  let {
    id = nextFormId('radio-list'),
    label,
    value = undefined,
    items = [],
    name = undefined,
    description = undefined,
    orientation = 'vertical',
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    status = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: string;
    readonly items?: readonly SelectItem[];
    readonly name?: string;
    readonly description?: string;
    readonly orientation?: 'vertical' | 'horizontal';
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly status?: FieldStatusInput;
    readonly onChange?: StringChangeHandler;
  }>();

  let pending = $state(false);
  let localValue = $state<string | undefined>();
  let lastPropValue = $state<string | undefined>();
  const selectedValue = $derived(localValue ?? value);
  const labelId = $derived(`${id}-label`);
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);

  $effect(() => {
    if (value !== lastPropValue) {
      lastPropValue = value;
      localValue = undefined;
    }
  });

  function isItemDisabled(item: SelectItem): boolean {
    return isDisabled || item.isDisabled === true;
  }

  function enabledItems(): readonly SelectItem[] {
    return items.filter((item: SelectItem) => !isItemDisabled(item));
  }

  function tabbableValue(): string | undefined {
    const enabled = enabledItems();
    const selectedEnabled = enabled.find((item: SelectItem) => item.value === selectedValue);
    return selectedEnabled?.value ?? enabled[0]?.value;
  }

  async function choose(item: SelectItem, event: Event): Promise<void> {
    if (isItemDisabled(item) || pending || item.value === selectedValue) {
      return;
    }
    localValue = item.value;
    const result = onChange?.(item.value, event);
    if (isPromiseLike(result)) {
      pending = true;
      try {
        await result;
      } finally {
        pending = false;
      }
    }
  }

  function navigationTarget(item: SelectItem, key: string): SelectItem | undefined {
    const enabled = enabledItems();
    const currentIndex = enabled.findIndex((candidate: SelectItem) => candidate.value === item.value);
    if (enabled.length === 0 || currentIndex < 0) {
      return undefined;
    }
    if (key === 'Home') {
      return enabled[0];
    }
    if (key === 'End') {
      return enabled[enabled.length - 1];
    }
    const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
    return enabled[(currentIndex + direction + enabled.length) % enabled.length];
  }

  function focusItem(event: KeyboardEvent, item: SelectItem): void {
    const current = event.currentTarget;
    if (!(current instanceof HTMLElement)) {
      return;
    }
    const group = current.closest('[role="radiogroup"]');
    if (!(group instanceof HTMLElement)) {
      return;
    }
    const enabledRadios = [...group.querySelectorAll<HTMLElement>('[role="radio"]')].filter(
      (radio) => radio.getAttribute('aria-disabled') !== 'true',
    );
    const targetIndex = enabledItems().findIndex((candidate: SelectItem) => candidate.value === item.value);
    const target = targetIndex < 0 ? undefined : enabledRadios[targetIndex];
    target?.focus();
  }

  function handleFocus(item: SelectItem, event: FocusEvent): void {
    if (selectedValue != null || isItemDisabled(item)) {
      return;
    }
    const current = event.currentTarget;
    if (!(current instanceof HTMLElement)) {
      return;
    }
    const group = current.closest('[role="radiogroup"]');
    if (!(group instanceof HTMLElement)) {
      return;
    }
    if (event.relatedTarget instanceof Node && group.contains(event.relatedTarget)) {
      return;
    }
    const targetValue = tabbableValue();
    if (targetValue == null || targetValue === item.value) {
      return;
    }
    const enabledRadios = [...group.querySelectorAll<HTMLElement>('[role="radio"]')].filter(
      (radio) => radio.getAttribute('aria-disabled') !== 'true',
    );
    const targetIndex = enabledItems().findIndex((candidate: SelectItem) => candidate.value === targetValue);
    const target = targetIndex < 0 ? undefined : enabledRadios[targetIndex];
    target?.focus();
  }

  function handleKeydown(item: SelectItem, event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      void choose(item, event);
      return;
    }
    if (
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    event.preventDefault();
    const target = navigationTarget(item, event.key);
    if (target == null) {
      return;
    }
    focusItem(event, target);
    void choose(target, event);
  }
</script>

<div
  class="astryx-radio-list"
  role="radiogroup"
  aria-labelledby={labelId}
  aria-describedby={describedBy(descriptionId, statusId)}
  aria-required={isRequired ? 'true' : undefined}
  aria-invalid={status?.type === 'error' ? 'true' : undefined}
  aria-orientation={orientation}
  data-orientation={orientation}
>
  <div id={labelId} class={isLabelHidden ? 'astryx-sr-only' : 'astryx-field-label'}>{label}</div>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  {#if name && selectedValue != null}
    <input type="hidden" {name} value={selectedValue} />
  {/if}
  <div class="astryx-choice-items">
    {#each items as item}
      <div
        role="radio"
        tabindex={isItemDisabled(item) ? undefined : tabbableValue() === item.value ? 0 : -1}
        class="astryx-choice-item"
        aria-checked={selectedValue === item.value ? 'true' : 'false'}
        aria-disabled={isItemDisabled(item) ? 'true' : undefined}
        onclick={(event) => void choose(item, event)}
        onfocus={(event) => handleFocus(item, event)}
        onkeydown={(event) => handleKeydown(item, event)}
      >
        <span class="astryx-choice-box" data-selected={selectedValue === item.value} aria-hidden="true"></span>
        <span>
          <span>{item.label}</span>
          {#if item.description}
            <span class="astryx-choice-description">{item.description}</span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
