<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Typeahead.svelte
   * @input Search source, selected item, form name, and change callback
   * @output Editable combobox with incremental filtering, listbox semantics, and hidden value
   * @position Svelte/Tailwind port selection slice for Todo 10
   */

  import type {SearchSourceInput, SearchableItem, TypeaheadChangeHandler} from './combo-types.js';
  import {nextComboId, optionId, searchSource} from './combo-utils.js';

  type TypeaheadProps = {
    readonly id?: string;
    readonly label: string;
    readonly value?: SearchableItem | null;
    readonly source: SearchSourceInput<SearchableItem>;
    readonly name?: string;
    readonly placeholder?: string;
    readonly isDisabled?: boolean;
    readonly emptyText?: string;
    readonly onChange: TypeaheadChangeHandler;
    readonly 'data-testid'?: string;
  };

  let {
    id = nextComboId('typeahead'),
    label,
    value = undefined,
    source,
    name = undefined,
    placeholder = 'Search',
    isDisabled = false,
    emptyText = 'No results found',
    onChange,
    'data-testid': testId = undefined,
  }: TypeaheadProps = $props();

  let query = $state('');
  let open = $state(false);
  let results = $state<readonly SearchableItem[]>([]);
  let activeIndex = $state(-1);
  let localValue = $state<SearchableItem | null>(null);
  let requestVersion = 0;

  const hasControlledValue = $derived(value !== undefined);
  const selectedItem = $derived(hasControlledValue ? value : localValue);
  const listboxId = $derived(`${id}-listbox`);
  const activeItem = $derived(activeIndex < 0 ? undefined : results[activeIndex]);

  async function runSearch(nextQuery: string): Promise<void> {
    requestVersion += 1;
    const version = requestVersion;
    try {
      const nextResults = await searchSource(source, nextQuery);
      if (version !== requestVersion) {
        return;
      }
      results = nextResults.filter((item) => item.isDisabled !== true);
      activeIndex = results.length > 0 ? 0 : -1;
      open = true;
    } catch (error) {
      if (error instanceof Error) {
        results = [];
        activeIndex = -1;
        open = true;
        return;
      }
      throw error;
    }
  }

  function handleInput(event: Event): void {
    if (isDisabled || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    query = event.currentTarget.value;
    void runSearch(query);
  }

  function choose(item: SearchableItem | null, event: Event): void {
    if (!hasControlledValue) {
      localValue = item;
    }
    query = item?.label ?? '';
    open = false;
    activeIndex = -1;
    void onChange(item, event);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      open = false;
      activeIndex = -1;
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        void runSearch(query);
        return;
      }
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      activeIndex = results.length === 0 ? -1 : (activeIndex + direction + results.length) % results.length;
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      activeIndex = event.key === 'Home' ? 0 : results.length - 1;
      return;
    }
    if (event.key === 'Enter' && activeItem != null) {
      event.preventDefault();
      choose(activeItem, event);
    }
  }
</script>

<div class="astryx-field" data-testid={testId}>
  <label for={id}>{label}</label>
  {#if name && selectedItem != null}
    <input type="hidden" {name} value={selectedItem.value ?? selectedItem.id} />
  {/if}
  <div class="astryx-input-shell">
    <input
      {id}
      class="astryx-text-input"
      role="combobox"
      type="text"
      value={query || selectedItem?.label || ''}
      {placeholder}
      disabled={isDisabled}
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-activedescendant={open && activeItem ? optionId(id, activeItem.id) : undefined}
      onfocus={() => void runSearch(query)}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />
  </div>
  {#if open}
    <div id={listboxId} class="astryx-menu" role="listbox">
      {#each results as item}
        <button
          id={optionId(id, item.id)}
          type="button"
          role="option"
          data-value={item.value ?? item.id}
          aria-selected={selectedItem?.id === item.id ? 'true' : 'false'}
          data-active={activeItem?.id === item.id ? 'true' : undefined}
          onclick={(event) => choose(item, event)}
        >
          {item.label}
        </button>
      {/each}
      {#if results.length === 0}
        <p class="astryx-field-description">{emptyText}</p>
      {/if}
    </div>
  {/if}
</div>
