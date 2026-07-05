<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file SideNav.svelte
   * @input Side navigation items, title, collapse state, and selection callback
   * @output Vertical navigation landmark with optional collapse control
   * @position Todo 12 side navigation component
   */

  import NavItem from './NavItem.svelte';
  import {cx, itemValue} from './navigation-utils.js';
  import type {NavItemModel} from './types.js';

  let {
    label = 'Side navigation',
    title = undefined,
    items = [],
    collapsible = false,
    collapsed = undefined,
    onCollapsedChange = undefined,
    onSelect = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label?: string;
    readonly title?: string;
    readonly items?: readonly NavItemModel[];
    readonly collapsible?: boolean;
    readonly collapsed?: boolean;
    readonly onCollapsedChange?: (collapsed: boolean) => void;
    readonly onSelect?: (value: string, event: MouseEvent) => void;
    readonly 'data-testid'?: string;
  }>();

  let localCollapsed = $state(false);
  let expandedKeys = $state<readonly string[]>([]);
  const isCollapsed = $derived(collapsed ?? localCollapsed);
  const rootClass = $derived(
    cx(
      'flex h-full min-h-0 flex-col gap-3 border-r border-[var(--color-border)]',
      'bg-[var(--color-background-surface)] p-3',
      isCollapsed ? 'w-16' : 'w-64',
    ),
  );

  function toggleCollapsed(): void {
    const next = !isCollapsed;
    if (collapsed === undefined) {
      localCollapsed = next;
    }
    onCollapsedChange?.(next);
  }

  function isExpanded(item: NavItemModel): boolean {
    return expandedKeys.includes(itemValue(item));
  }

  function toggleItem(item: NavItemModel): void {
    const value = itemValue(item);
    expandedKeys = isExpanded(item)
      ? expandedKeys.filter((key) => key !== value)
      : [...expandedKeys, value];
  }
</script>

<nav class={rootClass} aria-label={label} data-collapsed={isCollapsed} data-testid={testId}>
  {#if title || collapsible}
    <header class="flex min-h-9 items-center justify-between gap-2">
      {#if title && !isCollapsed}
        <strong class="truncate text-sm font-semibold">{title}</strong>
      {/if}
      {#if collapsible}
        <button
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={isCollapsed ? 'false' : 'true'}
          class="rounded-md px-2 py-1 text-sm"
          onclick={toggleCollapsed}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      {/if}
    </header>
  {/if}
  <div class="flex min-h-0 flex-1 flex-col gap-1 overflow-auto">
    {#each items as item}
      {@const hasChildren = (item.items?.length ?? 0) > 0}
      {#if hasChildren}
        <div data-sidenav-row={itemValue(item)} class="grid gap-1">
          <div class="flex min-w-0 items-center gap-1">
            <NavItem
              label={item.label}
              value={itemValue(item)}
              href={item.href}
              active={item.active}
              disabled={item.disabled}
              compact={isCollapsed}
              onSelect={onSelect}
            />
            <button
              type="button"
              class="rounded-md px-2 py-1 text-sm"
              aria-label={isExpanded(item) ? `Collapse ${item.label}` : `Expand ${item.label}`}
              aria-expanded={isExpanded(item) ? 'true' : 'false'}
              onclick={() => toggleItem(item)}
            >
              {isExpanded(item) ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {#if isExpanded(item) && !isCollapsed}
            <div class="grid gap-1 pl-4">
              {#each item.items ?? [] as child}
                <NavItem
                  label={child.label}
                  value={itemValue(child)}
                  href={child.href}
                  active={child.active}
                  disabled={child.disabled}
                  onSelect={onSelect}
                />
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <NavItem
          label={item.label}
          value={itemValue(item)}
          href={item.href}
          active={item.active}
          disabled={item.disabled}
          compact={isCollapsed}
          onSelect={onSelect}
        />
      {/if}
    {/each}
  </div>
</nav>
