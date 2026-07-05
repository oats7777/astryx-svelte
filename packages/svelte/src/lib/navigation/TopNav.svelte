<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TopNav.svelte
   * @input Top navigation label, title, item collections, and selection callback
   * @output Router-free horizontal navigation landmark
   * @position Todo 12 top navigation component
   */

  import NavigationLink from './NavigationLink.svelte';
  import NavItem from './NavItem.svelte';
  import {cx, itemValue} from './navigation-utils.js';
  import type {NavItemModel} from './types.js';

  let {
    label = 'Main navigation',
    title = undefined,
    items = [],
    endItems = [],
    onSelect = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label?: string;
    readonly title?: string;
    readonly items?: readonly NavItemModel[];
    readonly endItems?: readonly NavItemModel[];
    readonly onSelect?: (value: string, event: MouseEvent) => void;
    readonly 'data-testid'?: string;
  }>();

  const navClass = cx(
    'grid min-h-14 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--color-border)]',
    'bg-[var(--color-background-surface)] px-4',
  );
</script>

<nav class={navClass} aria-label={label} data-testid={testId}>
  <div class="flex min-w-0 items-center gap-3">
    {#if title}
      <NavigationLink
        class="truncate text-sm font-semibold text-[var(--color-text-primary)]"
        href="/"
        label={title}
      >
        {title}
      </NavigationLink>
    {/if}
    <div class="flex min-w-0 items-center gap-1">
      {#each items as item}
        <NavItem
          label={item.label}
          value={itemValue(item)}
          href={item.href}
          active={item.active}
          disabled={item.disabled}
          onSelect={onSelect}
        />
      {/each}
    </div>
  </div>
  <div aria-hidden="true"></div>
  <div class="flex items-center justify-end gap-1">
    {#each endItems as item}
      <NavItem
        label={item.label}
        value={itemValue(item)}
        href={item.href}
        active={item.active}
        disabled={item.disabled}
        onSelect={onSelect}
      />
    {/each}
  </div>
</nav>
