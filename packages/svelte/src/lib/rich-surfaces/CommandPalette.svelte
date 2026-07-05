<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts" module>
  let paletteSequence = 0;
</script>

<script lang="ts">
  /**
   * @file CommandPalette.svelte
   * @input Open state, command search source, labels, and selection callbacks
   * @output Dialog-like searchable command list with grouping and keyboard selection
   * @position Svelte port of core CommandPalette root behavior
   */

  import {commandItemId, enabledCommands, groupCommands, nextActiveIndex} from './command-utils.js';
  import type {CommandItem, SearchSource} from './types.js';

  let {
    open = false,
    label = 'Command palette',
    searchSource,
    value = '',
    onOpenChange = undefined,
    onValueChange = undefined,
    emptySearchText = 'No results',
    emptyBootstrapText = 'Type to search',
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly open?: boolean;
    readonly label?: string;
    readonly searchSource: SearchSource;
    readonly value?: string;
    readonly onOpenChange?: (open: boolean) => void;
    readonly onValueChange?: (value: string) => void;
    readonly emptySearchText?: string;
    readonly emptyBootstrapText?: string;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  const baseId = `astryx-command-palette-${++paletteSequence}`;
  const listId = `${baseId}-listbox`;
  let query = $state('');
  let results = $state<readonly CommandItem[]>([]);
  let activeIndex = $state(0);
  let busy = $state(false);
  let latestRequestId = 0;
  const selectable = $derived(enabledCommands(results));
  const grouped = $derived(groupCommands(results));
  const activeItem = $derived(selectable[activeIndex]);
  const activeId = $derived(activeItem == null ? undefined : commandItemId(baseId, activeItem));
  const emptyText = $derived(query.length > 0 ? emptySearchText : emptyBootstrapText);

  $effect(() => {
    if (open) {
      loadResults('');
    }
  });

  function loadResults(nextQuery: string): void {
    const requestId = ++latestRequestId;
    busy = true;
    const sourceResult =
      nextQuery.length === 0 && searchSource.bootstrap != null
        ? searchSource.bootstrap()
        : searchSource.search(nextQuery);
    if (sourceResult instanceof Promise) {
      void sourceResult
        .then(
          (items) => {
            if (requestId === latestRequestId) {
              assignResults(items);
            }
          },
          () => undefined,
        )
        .finally(() => {
          if (requestId === latestRequestId) {
            busy = false;
          }
        });
      return;
    }
    if (requestId === latestRequestId) {
      assignResults(sourceResult);
    }
  }

  function assignResults(items: readonly CommandItem[]): void {
    const nextActiveIndex = items.length > 0 ? 0 : -1;
    results = items;
    activeIndex = nextActiveIndex;
    busy = false;
  }

  function close(): void {
    onOpenChange?.(false);
  }

  function choose(item: CommandItem | undefined): void {
    if (item == null || item.isDisabled === true) {
      return;
    }
    onValueChange?.(item.value ?? item.id);
    close();
  }

  function handleInput(event: Event): void {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    query = event.currentTarget.value;
    loadResults(query);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = nextActiveIndex(activeIndex, selectable.length, event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      activeIndex = event.key === 'Home' ? 0 : selectable.length - 1;
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      choose(activeItem);
    }
  }
</script>

{#if open}
  <div
    class={['astryx-command-palette astryx-reduced-motion-safe', className].filter(Boolean).join(' ')}
    role="dialog"
    aria-modal="true"
    aria-label={label}
    data-testid={testId}
  >
    <input
      class="astryx-command-palette__input"
      role="combobox"
      aria-label="Search commands"
      aria-expanded="true"
      aria-controls={listId}
      aria-activedescendant={activeId}
      aria-busy={busy ? 'true' : undefined}
      value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />
    <div id={listId} class="astryx-command-palette__list" role="listbox" aria-label="Commands">
      {#if results.length === 0}
        <p class="astryx-command-palette__empty">{emptyText}</p>
      {/if}
      {#each grouped as group}
        {#if group.heading != null}
          <div class="astryx-command-palette__group" role="presentation">{group.heading}</div>
        {/if}
        {#each group.items as item}
          <button
            id={commandItemId(baseId, item)}
            type="button"
            class="astryx-command-palette__item"
            role="option"
            data-value={item.value ?? item.id}
            data-selected={value === (item.value ?? item.id) || activeItem?.id === item.id ? 'true' : undefined}
            aria-selected={value === (item.value ?? item.id) ? 'true' : 'false'}
            aria-disabled={item.isDisabled ? 'true' : undefined}
            disabled={item.isDisabled}
            onmouseenter={() => (activeIndex = selectable.findIndex((candidate) => candidate.id === item.id))}
            onclick={() => choose(item)}
          >
            {item.label}
          </button>
        {/each}
      {/each}
    </div>
  </div>
{/if}

<style>
  .astryx-command-palette {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-overlay);
    display: grid;
    gap: var(--spacing-2);
    max-height: min(480px, 90vh);
    max-width: 640px;
    padding: var(--spacing-3);
    width: min(640px, 100%);
  }

  .astryx-command-palette__input {
    background: var(--color-background-muted);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-element);
    color: var(--color-text-primary);
    font: inherit;
    padding: var(--spacing-2) var(--spacing-3);
  }

  .astryx-command-palette__list {
    display: grid;
    gap: var(--spacing-1);
    overflow: auto;
  }

  .astryx-command-palette__group {
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    padding: var(--spacing-2) var(--spacing-2) var(--spacing-1);
  }

  .astryx-command-palette__item {
    background: transparent;
    border: 0;
    border-radius: var(--radius-inner);
    color: var(--color-text-primary);
    cursor: pointer;
    font: inherit;
    padding: var(--spacing-2);
    text-align: start;
  }

  .astryx-command-palette__item[data-selected='true'] {
    background: var(--color-overlay-hover);
  }

  .astryx-command-palette__empty {
    color: var(--color-text-secondary);
    margin: 0;
    padding: var(--spacing-3);
  }
</style>
