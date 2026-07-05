<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Breadcrumbs.svelte
   * @input Breadcrumb item collection, label, and separator
   * @output Ordered breadcrumb navigation with aria-current and hidden separators
   * @position Todo 12 breadcrumbs component
   */

  import NavigationLink from './NavigationLink.svelte';

  type BreadcrumbItem = {
    readonly label: string;
    readonly href?: string;
    readonly current?: boolean;
    readonly disabled?: boolean;
  };

  let {
    label = 'Breadcrumb',
    items = [],
    separator = '/',
    'data-testid': testId = undefined,
  } = $props<{
    readonly label?: string;
    readonly items?: readonly BreadcrumbItem[];
    readonly separator?: string;
    readonly 'data-testid'?: string;
  }>();

  function isCurrent(item: BreadcrumbItem, index: number): boolean {
    return item.current === true || (items.every((candidate: BreadcrumbItem) => candidate.current !== true) && index === items.length - 1);
  }
</script>

<nav aria-label={label} data-testid={testId}>
  <ol class="flex min-w-0 items-center gap-1 text-sm">
    {#each items as item, index}
      <li class="flex min-w-0 items-center gap-1">
        <span aria-hidden="true" class={index === 0 ? 'sr-only' : 'text-[var(--color-text-tertiary)]'}>
          {separator}
        </span>
        {#if isCurrent(item, index) || item.disabled}
          <span class="truncate" aria-current={isCurrent(item, index) ? 'page' : undefined}>{item.label}</span>
        {:else if item.href}
          <NavigationLink
            class="truncate text-[var(--color-text-accent)] hover:underline"
            href={item.href}
            label={item.label}
          >
            {item.label}
          </NavigationLink>
        {:else}
          <button type="button" class="truncate text-[var(--color-text-accent)]">{item.label}</button>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
