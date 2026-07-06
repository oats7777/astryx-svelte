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
      'astryx-side-nav',
      isCollapsed ? 'astryx-side-nav--collapsed' : 'astryx-side-nav--expanded',
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
    <header class="astryx-side-nav__header">
      {#if title && !isCollapsed}
        <strong class="astryx-side-nav__title">{title}</strong>
      {/if}
      {#if collapsible}
        <button
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={isCollapsed ? 'false' : 'true'}
          class="astryx-nav-button astryx-nav-button--compact"
          onclick={toggleCollapsed}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      {/if}
    </header>
  {/if}
  <div class="astryx-side-nav__items">
    {#each items as item}
      {@const hasChildren = (item.items?.length ?? 0) > 0}
      {#if hasChildren}
        <div data-sidenav-row={itemValue(item)} class="astryx-side-nav__row">
          <div class="astryx-side-nav__row-head">
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
              class="astryx-nav-button astryx-nav-button--compact"
              aria-label={isExpanded(item) ? `Collapse ${item.label}` : `Expand ${item.label}`}
              aria-expanded={isExpanded(item) ? 'true' : 'false'}
              onclick={() => toggleItem(item)}
            >
              {isExpanded(item) ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {#if isExpanded(item) && !isCollapsed}
            <div class="astryx-side-nav__children">
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
