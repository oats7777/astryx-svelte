<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file List.svelte
   * @input List items plus empty and loading labels
   * @output Semantic list with loading and empty states
   * @position Svelte/Tailwind port of core List
   */

  import type {ListItem} from './types.js';

  let {
    items = [],
    isLoading = false,
    loadingLabel = 'Loading',
    emptyTitle = 'No items',
    'data-testid': testId = undefined,
  }: {
    readonly items?: readonly ListItem[];
    readonly isLoading?: boolean;
    readonly loadingLabel?: string;
    readonly emptyTitle?: string;
    readonly 'data-testid'?: string;
  } = $props();
</script>

<div class="astryx-list" data-testid={testId}>
  {#if isLoading}
    <div class="astryx-list__state" role="status">{loadingLabel}</div>
  {:else if items.length === 0}
    <div class="astryx-list__state" data-testid="list-empty">{emptyTitle}</div>
  {:else}
    <ul>
      {#each items as item (item.id)}
        <li>
          <span class="astryx-list__label">{item.label}</span>
          {#if item.description}
            <span class="astryx-list__description">{item.description}</span>
          {/if}
          {#if item.meta}
            <span class="astryx-list__meta">{item.meta}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .astryx-list ul {
    display: grid;
    gap: var(--spacing-2);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .astryx-list li {
    border-block-end: var(--border-width) solid var(--color-border);
    display: grid;
    gap: var(--spacing-1);
    padding-block: var(--spacing-2);
  }

  .astryx-list__label {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .astryx-list__description,
  .astryx-list__meta,
  .astryx-list__state {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
