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
  <ol class="astryx-breadcrumbs">
    {#each items as item, index}
      <li class="astryx-breadcrumbs__item">
        <span aria-hidden="true" class={index === 0 ? 'astryx-sr-only' : 'astryx-breadcrumbs__separator'}>
          {separator}
        </span>
        {#if isCurrent(item, index) || item.disabled}
          <span class="astryx-breadcrumbs__current" aria-current={isCurrent(item, index) ? 'page' : undefined}>{item.label}</span>
        {:else if item.href}
          <NavigationLink
            class="astryx-breadcrumbs__link"
            href={item.href}
            label={item.label}
          >
            {item.label}
          </NavigationLink>
        {:else}
          <button type="button" class="astryx-breadcrumbs__link">{item.label}</button>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
