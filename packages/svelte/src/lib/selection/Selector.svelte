<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Selector.svelte
   * @input Single-select option data, form name, controlled value, and change callback
   * @output Keyboard-operable combobox button with listbox and hidden form value
   * @position Svelte/Tailwind port selection slice for Todo 10
   */

  import type {ComboOption, StringChangeHandler} from './combo-types.js';
  import {flattenedOptions, nextComboId, nextEnabledIndex, optionId} from './combo-utils.js';

  let {
    id = nextComboId('selector'),
    label,
    value = null,
    options = [],
    name = undefined,
    placeholder = 'Select',
    isDisabled = false,
    onChange = undefined,
    'data-testid': testId = undefined,
  }: {
    readonly id?: string;
    readonly label: string;
    readonly value?: string | null;
    readonly options?: readonly ComboOption[];
    readonly name?: string;
    readonly placeholder?: string;
    readonly isDisabled?: boolean;
    readonly onChange?: StringChangeHandler;
    readonly 'data-testid'?: string;
  } = $props();

  let open = $state(false);
  let localValue = $state<string | null>(null);
  let lastPropValue = $state<string | null | undefined>();
  let activeIndex = $state(-1);

  const selectedValue = $derived(localValue ?? value);
  const normalized = $derived(flattenedOptions(options));
  const selectedOption = $derived(normalized.find((option) => option.value === selectedValue));
  const listboxId = $derived(`${id}-listbox`);
  const activeOption = $derived(activeIndex < 0 ? undefined : normalized[activeIndex]);

  $effect(() => {
    if (value !== lastPropValue) {
      lastPropValue = value;
      localValue = null;
    }
  });

  function setOpen(next: boolean): void {
    if (isDisabled) {
      return;
    }
    open = next;
    activeIndex = -1;
  }

  function choose(nextValue: string | null, event: Event): void {
    localValue = nextValue;
    open = false;
    activeIndex = -1;
    void onChange?.(nextValue, event);
  }

  function chooseOption(optionValue: string, event: Event): void {
    const option = normalized.find((candidate) => candidate.value === optionValue);
    if (option == null || option.isDisabled === true) {
      return;
    }
    choose(option.value, event);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && !open && selectedValue != null) {
      event.preventDefault();
      choose(null, event);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open && activeOption != null) {
        choose(activeOption.value, event);
      } else {
        setOpen(true);
      }
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    if (!open) {
      open = true;
      activeIndex = nextEnabledIndex(normalized, null, event.key);
      return;
    }
    const currentValue = activeOption?.value ?? null;
    activeIndex = nextEnabledIndex(normalized, currentValue, event.key);
  }
</script>

<div class="astryx-field" data-testid={testId}>
  <label id={`${id}-label`} for={id}>{label}</label>
  {#if name && selectedValue != null}
    <input type="hidden" {name} value={selectedValue} />
  {/if}
  <div class="astryx-input-shell">
    <button
      id={id}
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-labelledby={`${id}-label`}
      aria-activedescendant={open && activeOption ? optionId(id, activeOption.value) : undefined}
      disabled={isDisabled}
      onclick={() => setOpen(!open)}
      onkeydown={handleKeydown}
    >
      {selectedOption?.label ?? placeholder}
    </button>
  </div>
  {#if open}
    <div id={listboxId} class="astryx-menu" role="listbox" aria-labelledby={`${id}-label`}>
      {#each normalized as option}
        <button
          id={optionId(id, option.value)}
          type="button"
          role="option"
          data-value={option.value}
          aria-selected={selectedValue === option.value ? 'true' : 'false'}
          aria-disabled={option.isDisabled === true ? 'true' : undefined}
          disabled={option.isDisabled === true}
          data-active={activeOption?.value === option.value ? 'true' : undefined}
          onclick={(event) => chooseOption(option.value, event)}
        >
          {option.label}
        </button>
      {/each}
      {#if normalized.length === 0}
        <p class="astryx-field-description">No options</p>
      {/if}
    </div>
  {/if}
</div>
