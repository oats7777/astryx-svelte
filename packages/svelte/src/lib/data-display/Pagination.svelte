<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Pagination.svelte
   * @input Current page, page size, total count, disabled state, and page callback
   * @output Accessible pagination controls
   * @position Svelte/Tailwind port of core Pagination
   */

  let {
    page = 1,
    pageSize = 10,
    totalItems = 0,
    isDisabled = false,
    onPageChange = undefined,
  }: {
    readonly page?: number;
    readonly pageSize?: number;
    readonly totalItems?: number;
    readonly isDisabled?: boolean;
    readonly onPageChange?: (page: number) => void;
  } = $props();

  const safePageSize = $derived(Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1);
  const pageCount = $derived(Math.max(1, Math.ceil(totalItems / safePageSize)));
  const canGoPrevious = $derived(!isDisabled && page > 1);
  const canGoNext = $derived(!isDisabled && page < pageCount);

  function goTo(nextPage: number): void {
    if (isDisabled || nextPage < 1 || nextPage > pageCount) {
      return;
    }
    onPageChange?.(nextPage);
  }
</script>

<nav class="astryx-pagination" aria-label="Pagination">
  <button type="button" aria-label="Previous page" disabled={!canGoPrevious} onclick={() => goTo(page - 1)}>
    Previous
  </button>
  <span aria-live="polite">Page {page} of {pageCount}</span>
  <button type="button" aria-label="Next page" disabled={!canGoNext} onclick={() => goTo(page + 1)}>
    Next
  </button>
</nav>

<style>
  .astryx-pagination {
    align-items: center;
    display: inline-flex;
    gap: var(--spacing-2);
  }

  .astryx-pagination button {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-element);
    color: var(--color-text-primary);
    min-height: var(--size-element-sm);
    padding-inline: var(--spacing-2);
  }

  .astryx-pagination button:disabled,
  .astryx-pagination span {
    color: var(--color-text-secondary);
  }
</style>
