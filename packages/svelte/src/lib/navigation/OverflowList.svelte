<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file OverflowList.svelte
   * @input Item labels, deterministic max-visible count, and collapse direction
   * @output Horizontal overflow list with hidden item and overflow-count observables
   * @position Todo 12 overflow-list component
   */

  let {
    items = [],
    maxVisibleItems = items.length,
    collapseFrom = 'end',
    'data-testid': testId = undefined,
  } = $props<{
    readonly items?: readonly string[];
    readonly maxVisibleItems?: number;
    readonly collapseFrom?: 'start' | 'end';
    readonly 'data-testid'?: string;
  }>();

  const hiddenCount = $derived(Math.max(0, items.length - maxVisibleItems));
  const visibleItems = $derived(
    collapseFrom === 'start' ? items.slice(hiddenCount) : items.slice(0, maxVisibleItems),
  );
  const hiddenItems = $derived(
    collapseFrom === 'start' ? items.slice(0, hiddenCount) : items.slice(maxVisibleItems),
  );
</script>

<div class="astryx-overflow-list" data-testid={testId}>
  {#each hiddenItems as item}
    <span data-overflow-hidden="true" hidden>{item}</span>
  {/each}
  {#each visibleItems as item}
    <span class="astryx-overflow-list__item">{item}</span>
  {/each}
  {#if hiddenCount > 0}
    <span class="astryx-overflow-list__item" data-overflow-count={hiddenCount}>
      +{hiddenCount}
    </span>
  {/if}
</div>
