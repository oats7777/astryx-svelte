<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts" module>
  let powerSearchSequence = 0;
</script>

<script lang="ts">
  /**
   * @file PowerSearch.svelte
   * @input PowerSearch config, filters, and change handler
   * @output Tokenized search control with editable structured filters
   * @position Todo 10 PowerSearch Svelte port component
   */

  import type {
    PowerSearchConfig,
    PowerSearchFilter,
    PowerSearchItem,
    PowerSearchProps,
  } from './power-search-types.js';
  import {
    createEditedPowerSearchFilter,
    getPowerSearchEditableValues,
  } from './power-search-editing.js';
  import {
    createPowerSearchSource,
    formatPowerSearchFilter,
  } from './power-search-utils.js';
  import {resolvePowerSearchSuggestionAction} from './power-search-interaction.js';
  import PowerSearchFilterEditor from './PowerSearchFilterEditor.svelte';
  import PowerSearchValueEditor from './PowerSearchValueEditor.svelte';

  let {
    config,
    filters,
    onChange,
    label = 'Search',
    placeholder = 'Search...',
  }: PowerSearchProps = $props();

  const listboxId = `power-search-listbox-${++powerSearchSequence}`;
  const source = $derived(createPowerSearchSource(config));
  let query = $state('');
  let suggestions = $state<readonly PowerSearchItem[]>([]);
  let activeIndex = $state(0);
  let editingIndex = $state<number | null>(null);
  let draftFilter = $state<PowerSearchFilter | null>(null);
  let editValueIndex = $state(0);
  const isOpen = $derived(suggestions.length > 0);
  const editingFilter = $derived(editingIndex == null ? draftFilter : filters[editingIndex]);
  const editingField = $derived(editingFilter == null ? undefined : config.fields.find((field) => field.key === editingFilter.field));
  const editingOperator = $derived(editingField?.operators.find((operator) => operator.key === editingFilter?.operator));
  const editingValues = $derived(getPowerSearchEditableValues(editingOperator));
  const hasEditableFilters = $derived(filters.some((filter) => filter.isReadOnly !== true));

  function updateSuggestions(nextQuery: string): void {
    const result = source.search(nextQuery);
    if (result instanceof Promise) {
      void result.then((items) => {
        suggestions = items;
        activeIndex = 0;
      });
      return;
    }
    suggestions = result;
    activeIndex = 0;
  }

  function handleInput(event: Event): void {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    query = event.currentTarget.value;
    updateSuggestions(query);
  }

  function addFilter(filter: PowerSearchFilter): void {
    onChange([...filters, filter], 'add', filters.length);
    query = '';
    suggestions = [];
    draftFilter = null;
  }

  function choose(item: PowerSearchItem | undefined): void {
    const action = resolvePowerSearchSuggestionAction(config, item);
    if (action.kind === 'add') {
      addFilter(action.filter);
    } else if (action.kind === 'edit') {
      draftFilter = action.filter;
      editingIndex = null;
      editValueIndex = 0;
      suggestions = [];
    } else if (action.kind === 'query') {
      query = action.query;
      updateSuggestions(query);
    }
  }

  function activateSuggestion(index: number): void {
    activeIndex = index;
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
      return;
    }
    if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (suggestions.length === 0) {
        updateSuggestions(query);
      }
      choose(suggestions[activeIndex] ?? suggestions[0]);
    }
    if (event.key === 'Escape') {
      suggestions = [];
    }
  }

  function removeFilter(index: number): void {
    if (filters[index]?.isReadOnly === true) {
      return;
    }
    onChange(filters.filter((_filter, filterIndex) => filterIndex !== index), 'remove', index);
  }

  function clearFilters(): void {
    const nextFilters = filters.filter((filter) => filter.isReadOnly === true);
    if (nextFilters.length === filters.length) {
      return;
    }
    onChange(nextFilters, 'clear', -1);
  }

  function openEditor(index: number): void {
    if (filters[index]?.isReadOnly === true) {
      return;
    }
    editingIndex = index;
    draftFilter = null;
    editValueIndex = 0;
  }

  function saveEdit(nextValueIndex: number): void {
    if (editingFilter == null) {
      return;
    }
    const value = editingValues[nextValueIndex];
    if (value == null) {
      return;
    }
    if (editingFilter.isReadOnly === true) {
      return;
    }
    if (editingIndex == null) {
      addFilter(createEditedPowerSearchFilter(editingFilter, editingOperator, value));
      return;
    }
    const nextFilters = [...filters];
    nextFilters[editingIndex] = createEditedPowerSearchFilter(editingFilter, editingOperator, value);
    onChange(nextFilters, 'edit', editingIndex);
    editingIndex = null;
    draftFilter = null;
  }

  function handleEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      editValueIndex = Math.min(editValueIndex + 1, editingValues.length - 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      editValueIndex = Math.max(editValueIndex - 1, 0);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(editValueIndex);
    }
    if (event.key === 'Escape') {
      editingIndex = null;
      draftFilter = null;
    }
  }
</script>

<div class="astryx-power-search" data-config-name={config.name}>
  <label class="astryx-power-search__label" for={listboxId}>{label}</label>
  <div class="astryx-power-search__tokens">
    {#each filters as filter, index}
      <span class="astryx-power-search__token">
        <button type="button" data-testid={`filter-${index}`} disabled={filter.isReadOnly === true} onclick={() => openEditor(index)}>
          {formatPowerSearchFilter(config, filter)}
        </button>
        <button
          type="button"
          aria-label={`Remove ${formatPowerSearchFilter(config, filter)}`}
          data-testid={`filter-${index}-remove`}
          disabled={filter.isReadOnly === true}
          onclick={() => removeFilter(index)}
        >
          ×
        </button>
      </span>
    {/each}
    <input
      aria-label={label}
      aria-controls={listboxId}
      aria-expanded={isOpen ? 'true' : 'false'}
      aria-activedescendant={isOpen ? `${listboxId}-option-${activeIndex}` : undefined}
      role="combobox"
      {placeholder}
      value={query}
      oninput={handleInput}
      onkeydown={handleInputKeydown}
      onfocus={() => updateSuggestions(query)}
    />
    <button type="button" data-testid="power-search-clear" disabled={!hasEditableFilters} onclick={clearFilters}>Clear</button>
  </div>
  {#if isOpen}
    <PowerSearchFilterEditor
      {listboxId}
      {label}
      {suggestions}
      {activeIndex}
      onChoose={choose}
      onHover={activateSuggestion}
    />
  {/if}
  {#if editingFilter}
    <PowerSearchValueEditor
      fieldLabel={editingField?.label ?? editingFilter.field}
      values={editingValues}
      activeIndex={editValueIndex}
      onKeydown={handleEditKeydown}
      onSave={saveEdit}
    />
  {/if}
</div>

<style>
  .astryx-power-search {
    color: var(--color-text-primary); display: grid; font-family: var(--font-family-body); gap: var(--spacing-2); max-width: 100%;
  }

  .astryx-power-search__label {
    color: var(--color-text-secondary); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
  }

  .astryx-power-search__tokens {
    align-items: center; background: var(--color-background-surface); border: var(--border-width) solid var(--color-border); border-radius: var(--radius-container); display: flex; flex-wrap: wrap; gap: var(--spacing-2); padding: var(--spacing-2);
  }

  .astryx-power-search__token {
    align-items: center; background: var(--color-background-muted); border-radius: var(--radius-element); display: inline-flex; overflow: hidden;
  }

  .astryx-power-search button,
  .astryx-power-search input {
    color: inherit; font: inherit;
  }

  .astryx-power-search button {
    background: transparent; border: 0; cursor: pointer; padding: var(--spacing-2);
  }

  .astryx-power-search input {
    background: transparent; border: 0; flex: 1 1 var(--size-element-lg); min-width: var(--size-element-lg); outline: none;
  }

</style>
