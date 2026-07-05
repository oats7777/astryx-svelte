<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Pagination.svelte
   * @input Current page, page counts, disabled state, and change callback
   * @output Accessible pagination navigation with page-range compaction and live page announcements
   * @position Todo 12 pagination component
   */

  import {announce} from '../actions/announce.js';
  import {generatePageRange} from './navigation-utils.js';

  let {
    page,
    totalPages = undefined,
    totalItems = undefined,
    pageSize = 10,
    hasMore = undefined,
    label = 'Pagination',
    variant = 'pages',
    siblingCount = 1,
    disabled = false,
    onChange,
    'data-testid': testId = undefined,
  } = $props<{
    readonly page: number;
    readonly totalPages?: number;
    readonly totalItems?: number;
    readonly pageSize?: number;
    readonly hasMore?: boolean;
    readonly label?: string;
    readonly variant?: 'pages' | 'count' | 'compact' | 'dots' | 'none';
    readonly siblingCount?: number;
    readonly disabled?: boolean;
    readonly onChange: (page: number) => void;
    readonly 'data-testid'?: string;
  }>();

  const safePageSize = $derived(Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1);
  const computedTotalPages = $derived(totalPages ?? (totalItems == null ? undefined : Math.ceil(totalItems / safePageSize)));
  const shouldRender = $derived(totalItems !== 0 && computedTotalPages !== 0);
  const pageRange = $derived(computedTotalPages == null ? [] : generatePageRange(page, computedTotalPages, siblingCount));
  const canPrevious = $derived(!disabled && page > 1);
  const canNext = $derived(!disabled && (computedTotalPages == null ? hasMore === true : page < computedTotalPages));

  function go(nextPage: number): void {
    if (disabled || nextPage === page || nextPage < 1) {
      return;
    }
    if (computedTotalPages != null && nextPage > computedTotalPages) {
      return;
    }
    onChange(nextPage);
    announce(computedTotalPages == null ? `Page ${nextPage}` : `Page ${nextPage} of ${computedTotalPages}`);
  }
</script>

{#if shouldRender}
  <nav class="flex items-center gap-2" aria-label={label} data-testid={testId}>
    <button type="button" aria-label="Go to previous page" disabled={!canPrevious} onclick={() => go(page - 1)}>
      Previous
    </button>
    {#if variant === 'count' && totalItems != null}
      <span>{(page - 1) * safePageSize + 1}–{Math.min(page * safePageSize, totalItems)} of {totalItems}</span>
    {:else if variant === 'compact' && computedTotalPages != null}
      <span>Page {page} of {computedTotalPages}</span>
    {:else if variant === 'dots' && computedTotalPages != null}
      <span role="group" aria-label="Page indicators">
        {#each Array.from({length: computedTotalPages}, (_value, index) => index + 1) as item}
          <button type="button" aria-label={`Go to page ${item}`} aria-current={item === page ? 'page' : undefined} disabled={disabled} onclick={() => go(item)}>
            {item}
          </button>
        {/each}
      </span>
    {:else if variant === 'pages' && computedTotalPages != null}
      {#each pageRange as item}
        {#if item === '...'}
          <span data-ellipsis="true" aria-hidden="true">...</span>
        {:else}
          <button type="button" aria-label={`Go to page ${item}`} aria-current={item === page ? 'page' : undefined} disabled={disabled} onclick={() => go(item)}>
            {item}
          </button>
        {/if}
      {/each}
    {/if}
    <button type="button" aria-label="Go to next page" disabled={!canNext} onclick={() => go(page + 1)}>
      Next
    </button>
  </nav>
{/if}
