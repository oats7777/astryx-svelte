<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Outline.svelte
   * @input Outline headings plus loading and empty labels
   * @output Navigation outline with stable heading levels
   * @position Svelte/Tailwind port of core Outline
   */

  import type {OutlineItem} from './types.js';

  let {
    items = [],
    isLoading = false,
    loadingLabel = 'Loading outline',
    emptyTitle = 'No outline',
    label = 'Outline',
  }: {
    readonly items?: readonly OutlineItem[];
    readonly isLoading?: boolean;
    readonly loadingLabel?: string;
    readonly emptyTitle?: string;
    readonly label?: string;
  } = $props();
</script>

<nav class="astryx-outline" aria-label={label}>
  {#if isLoading}
    <div class="astryx-outline__state" role="status">{loadingLabel}</div>
  {:else if items.length === 0}
    <div class="astryx-outline__state" data-testid="outline-empty">{emptyTitle}</div>
  {:else}
    <ol>
      {#each items as item (item.id)}
        <li data-level={item.level ?? 2}>
          <a href={`#${item.id}`}>{item.title}</a>
        </li>
      {/each}
    </ol>
  {/if}
</nav>

<style>
  .astryx-outline ol {
    display: grid;
    gap: var(--spacing-1);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .astryx-outline li[data-level='3'] {
    padding-inline-start: var(--spacing-3);
  }

  .astryx-outline li[data-level='4'],
  .astryx-outline li[data-level='5'],
  .astryx-outline li[data-level='6'] {
    padding-inline-start: var(--spacing-5);
  }

  .astryx-outline a {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    text-decoration: none;
  }

  .astryx-outline__state {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
