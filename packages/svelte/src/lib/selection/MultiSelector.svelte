<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file MultiSelector.svelte
   * @input Grouped option data, selected values, form name, and change callback
   * @output Multi-select combobox listbox with removable chips and hidden form values
   * @position Svelte/Tailwind port selection slice for Todo 10
   */

  import type {ComboOption, StringArrayChangeHandler} from './combo-types.js';
  import {announce} from '../actions/announce.js';
  import {flattenedOptions, nextComboId, nextEnabledIndex, optionId} from './combo-utils.js';

  let {
    id = nextComboId('multi-selector'),
    label,
    value = [],
    options = [],
    name = undefined,
    placeholder = 'Select',
    isDisabled = false,
    onChange = undefined,
    'data-testid': testId = undefined,
  }: {
    readonly id?: string;
    readonly label: string;
    readonly value?: readonly string[];
    readonly options?: readonly ComboOption[];
    readonly name?: string;
    readonly placeholder?: string;
    readonly isDisabled?: boolean;
    readonly onChange?: StringArrayChangeHandler;
    readonly 'data-testid'?: string;
  } = $props();

  let open = $state(false);
  let localValue = $state<readonly string[] | null>(null);
  let lastPropValue = $state<readonly string[] | undefined>();
  let activeIndex = $state(-1);

  const selectedValues = $derived(localValue ?? value);
  const normalized = $derived(flattenedOptions(options));
  const selectableValues = $derived(normalized.filter((option) => option.isDisabled !== true).map((option) => option.value));
  const selectedOptions = $derived(normalized.filter((option) => selectedValues.includes(option.value)));
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

  function emit(nextValues: readonly string[], event: Event): void {
    localValue = nextValues;
    announceSelection(nextValues);
    void onChange?.(nextValues, event);
  }

  function announceSelection(nextValues: readonly string[]): void {
    const selectedCount = nextValues.filter((nextValue) => selectableValues.includes(nextValue)).length;
    if (selectedCount === 0) {
      announce('Selection cleared');
      return;
    }
    if (selectedCount === selectableValues.length) {
      announce('All selected');
      return;
    }
    announce(`${selectedCount} of ${selectableValues.length} selected`);
  }

  function toggleValue(optionValue: string, event: Event): void {
    const option = normalized.find((candidate) => candidate.value === optionValue);
    if (option == null || option.isDisabled === true || isDisabled) {
      return;
    }
    const nextValues = selectedValues.includes(option.value)
      ? selectedValues.filter((valueEntry) => valueEntry !== option.value)
      : [...selectedValues, option.value];
    emit(nextValues, event);
  }

  function removeValue(optionValue: string, event: Event): void {
    if (isDisabled) {
      return;
    }
    emit(selectedValues.filter((valueEntry) => valueEntry !== optionValue), event);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if ((event.key === 'Delete' || event.key === 'Backspace') && !open && selectedValues.length > 0) {
      event.preventDefault();
      emit([], event);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open && activeOption != null) {
        toggleValue(activeOption.value, event);
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
  {#each selectedValues as selectedValue}
    {#if name}
      <input type="hidden" {name} value={selectedValue} />
    {/if}
  {/each}
  <div class="astryx-input-shell">
    {#each selectedOptions as option}
      <span class="astryx-token">
        <span class="astryx-token__label">{option.label}</span>
        <button type="button" class="astryx-token__remove" aria-label={`Remove ${option.label}`} onclick={(event) => removeValue(option.value, event)}>
          ×
        </button>
      </span>
    {/each}
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
      {selectedOptions.length === 0 ? placeholder : `${selectedOptions.length} selected`}
    </button>
  </div>
  {#if open}
    <div id={listboxId} class="astryx-menu" role="listbox" aria-multiselectable="true" aria-labelledby={`${id}-label`}>
      {#each options as option}
        {#if typeof option === 'string' || !('type' in option)}
          {@const normalizedOption = typeof option === 'string' ? {label: option, value: option} : option}
          <button
            id={optionId(id, normalizedOption.value)}
            type="button"
            role="option"
            data-value={normalizedOption.value}
            aria-selected={selectedValues.includes(normalizedOption.value) ? 'true' : 'false'}
            aria-disabled={normalizedOption.isDisabled === true ? 'true' : undefined}
            disabled={normalizedOption.isDisabled === true}
            data-active={activeOption?.value === normalizedOption.value ? 'true' : undefined}
            onclick={(event) => toggleValue(normalizedOption.value, event)}
          >
            {selectedValues.includes(normalizedOption.value) ? '✓ ' : ''}{normalizedOption.label}
          </button>
        {:else if option.type === 'divider'}
          <div class="astryx-menu-divider" role="separator"></div>
        {:else}
          <div class="astryx-field-description">{option.label}</div>
          {#each option.options as child}
            {@const childOption = typeof child === 'string' ? {label: child, value: child} : child}
            <button
              id={optionId(id, childOption.value)}
              type="button"
              role="option"
              data-value={childOption.value}
              aria-selected={selectedValues.includes(childOption.value) ? 'true' : 'false'}
              aria-disabled={childOption.isDisabled === true ? 'true' : undefined}
              disabled={childOption.isDisabled === true}
              data-active={activeOption?.value === childOption.value ? 'true' : undefined}
              onclick={(event) => toggleValue(childOption.value, event)}
            >
              {selectedValues.includes(childOption.value) ? '✓ ' : ''}{childOption.label}
            </button>
          {/each}
        {/if}
      {/each}
    </div>
  {/if}
</div>
