<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file SegmentedControl.svelte
   * @input Label, selected value, options, disabled state, and change callback
   * @output Radio-group segmented control with roving keyboard navigation
   * @position Todo 12 segmented control component
   */

  import {enabledOptions, nextOption} from './navigation-utils.js';
  import type {ChoiceOption} from './types.js';

  let {
    label,
    value,
    options = [],
    disabled = false,
    onChange,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label: string;
    readonly value: string;
    readonly options?: readonly ChoiceOption[];
    readonly disabled?: boolean;
    readonly onChange: (value: string) => void;
    readonly 'data-testid'?: string;
  }>();

  const tabbableValue = $derived(
    enabledOptions(options).find((option) => option.value === value)?.value ?? enabledOptions(options)[0]?.value,
  );

  function choose(option: ChoiceOption): void {
    if (disabled || option.disabled === true || option.value === value) {
      return;
    }
    onChange(option.value);
  }

  function focusValue(root: HTMLElement, nextValue: string): void {
    root.querySelector<HTMLElement>(`[role="radio"][data-value="${nextValue}"]`)?.focus();
  }

  function handleKeydown(option: ChoiceOption, event: KeyboardEvent): void {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const root = event.currentTarget instanceof HTMLElement ? event.currentTarget.closest('[role="radiogroup"]') : null;
    if (!(root instanceof HTMLElement)) {
      return;
    }
    const target = nextOption(options, option.value, event.key);
    if (target == null) {
      return;
    }
    focusValue(root, target.value);
    choose(target);
  }
</script>

<div
  role="radiogroup"
  aria-label={label}
  aria-disabled={disabled ? 'true' : undefined}
  class="inline-flex rounded-md border border-[var(--color-border)] p-1"
  data-testid={testId}
>
  {#each options as option}
    <button
      type="button"
      role="radio"
      class="rounded px-3 py-1 text-sm"
      data-value={option.value}
      aria-checked={option.value === value ? 'true' : 'false'}
      aria-disabled={disabled || option.disabled ? 'true' : undefined}
      tabindex={option.value === tabbableValue ? 0 : -1}
      disabled={disabled || option.disabled}
      onclick={() => choose(option)}
      onkeydown={(event) => handleKeydown(option, event)}
    >
      {option.label}
    </button>
  {/each}
</div>
