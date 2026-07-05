<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file MetadataList.svelte
   * @input Term-description pairs plus loading and empty labels
   * @output Semantic definition list for metadata
   * @position Svelte/Tailwind port of core MetadataList
   */

  import type {MetadataListItem} from './types.js';

  let {
    items = [],
    isLoading = false,
    loadingLabel = 'Loading metadata',
    emptyTitle = 'No metadata',
  }: {
    readonly items?: readonly MetadataListItem[];
    readonly isLoading?: boolean;
    readonly loadingLabel?: string;
    readonly emptyTitle?: string;
  } = $props();
</script>

{#if isLoading}
  <div class="astryx-metadata-list__state" role="status">{loadingLabel}</div>
{:else if items.length === 0}
  <div class="astryx-metadata-list__state" data-testid="metadata-list-empty">{emptyTitle}</div>
{:else}
  <dl class="astryx-metadata-list">
    {#each items as item (`${item.term}-${item.description}`)}
      <div>
        <dt>{item.term}</dt>
        <dd>{item.description}</dd>
      </div>
    {/each}
  </dl>
{/if}

<style>
  .astryx-metadata-list {
    display: grid;
    gap: var(--spacing-2);
    margin: 0;
  }

  .astryx-metadata-list div {
    display: grid;
    gap: var(--spacing-1);
    grid-template-columns: minmax(8rem, 0.4fr) 1fr;
  }

  .astryx-metadata-list dt {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .astryx-metadata-list dd {
    color: var(--color-text-primary);
    margin: 0;
  }

  .astryx-metadata-list__state {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
