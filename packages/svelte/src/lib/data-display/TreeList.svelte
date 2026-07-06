<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TreeList.svelte
   * @input Nested tree items, expansion state, selected key, and callbacks
   * @output ARIA tree with roving keyboard navigation
   * @position Svelte/Tailwind port of core TreeList
   */

  import {tick} from 'svelte';
  import type {TreeItem, VisibleTreeItem} from './types.js';

  let {
    items = [],
    label = 'Tree',
    expandedKeys = [],
    selectedKey = undefined,
    isLoading = false,
    loadingLabel = 'Loading tree',
    emptyTitle = 'No items',
    onSelectionChange = undefined,
  }: {
    readonly items?: readonly TreeItem[];
    readonly label?: string;
    readonly expandedKeys?: readonly string[];
    readonly selectedKey?: string;
    readonly isLoading?: boolean;
    readonly loadingLabel?: string;
    readonly emptyTitle?: string;
    readonly onSelectionChange?: (key: string) => void;
  } = $props();

  let localExpandedKeys = $state<readonly string[]>([]);
  let focusedKey = $state<string | undefined>(undefined);
  let localSelectedKey = $state<string | undefined>(undefined);
  let hasSyncedInitialProps = $state(false);
  let treeRoot = $state<HTMLElement | undefined>(undefined);

  const effectiveSelectedKey = $derived(localSelectedKey ?? selectedKey);
  const visibleItems = $derived(flattenVisibleItems(items, new Set(localExpandedKeys), 1, undefined));
  const tabbableKey = $derived(focusedKey ?? effectiveSelectedKey ?? visibleItems[0]?.key);

  $effect(() => {
    if (hasSyncedInitialProps) {
      return;
    }
    localExpandedKeys = expandedKeys;
    focusedKey = selectedKey;
    hasSyncedInitialProps = true;
  });

  function flattenVisibleItems(
    sourceItems: readonly TreeItem[],
    expanded: ReadonlySet<string>,
    depth: number,
    parentKey: string | undefined,
  ): readonly VisibleTreeItem[] {
    const flattened: VisibleTreeItem[] = [];
    const setSize = sourceItems.length;
    for (const [index, item] of sourceItems.entries()) {
      flattened.push({
        ...item,
        depth,
        parentKey,
        position: index + 1,
        setSize,
      });
      if (item.children != null && expanded.has(item.key)) {
        flattened.push(...flattenVisibleItems(item.children, expanded, depth + 1, item.key));
      }
    }
    return flattened;
  }

  function isExpanded(key: string): boolean {
    return localExpandedKeys.includes(key);
  }

  function setExpanded(key: string, next: boolean): void {
    localExpandedKeys = next
      ? [...localExpandedKeys, key]
      : localExpandedKeys.filter((expandedKey) => expandedKey !== key);
  }

  async function focusKey(key: string): Promise<void> {
    focusedKey = key;
    const next = findTreeItem(key);
    if (next != null) {
      next.focus();
      return;
    }
    await tick();
    findTreeItem(key)?.focus();
  }

  function findTreeItem(key: string): HTMLElement | undefined {
    return [...(treeRoot?.querySelectorAll<HTMLElement>('[data-tree-key]') ?? [])].find(
      (element) => element.dataset.treeKey === key,
    );
  }

  function itemIndex(key: string): number {
    return visibleItems.findIndex((item) => item.key === key);
  }

  function choose(key: string): void {
    localSelectedKey = key;
    onSelectionChange?.(key);
  }

  function handleKeydown(event: KeyboardEvent, item: VisibleTreeItem): void {
    const children = item.children ?? [];
    const index = itemIndex(item.key);

    if (event.key === 'ArrowRight' && children.length > 0) {
      event.preventDefault();
      if (!isExpanded(item.key)) {
        setExpanded(item.key, true);
        return;
      }
      void focusKey(children[0]?.key ?? item.key);
      return;
    }
    if (event.key === 'ArrowLeft' && children.length > 0 && isExpanded(item.key)) {
      event.preventDefault();
      setExpanded(item.key, false);
      return;
    }
    if (event.key === 'ArrowLeft' && item.parentKey != null) {
      event.preventDefault();
      void focusKey(item.parentKey);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextItem = visibleItems[Math.min(index + 1, visibleItems.length - 1)];
      if (nextItem != null) {
        void focusKey(nextItem.key);
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const previousItem = visibleItems[Math.max(index - 1, 0)];
      if (previousItem != null) {
        void focusKey(previousItem.key);
      }
      return;
    }
    if (event.key === 'Home' && visibleItems[0] != null) {
      event.preventDefault();
      void focusKey(visibleItems[0].key);
      return;
    }
    if (event.key === 'End' && visibleItems.at(-1) != null) {
      event.preventDefault();
      void focusKey(visibleItems.at(-1)?.key ?? item.key);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(item.key);
    }
  }
</script>

{#if isLoading}
  <div class="astryx-tree-list__state" role="status">{loadingLabel}</div>
{:else if items.length === 0}
  <div class="astryx-tree-list__state" data-testid="tree-empty">{emptyTitle}</div>
{:else}
  <div class="astryx-tree-list" role="tree" aria-label={label} bind:this={treeRoot}>
    {#each visibleItems as item (item.key)}
      {@const hasChildren = (item.children?.length ?? 0) > 0}
      <div
        role="treeitem"
        class="astryx-tree-list__item"
        data-tree-key={item.key}
        aria-level={item.depth}
        aria-posinset={item.position}
        aria-setsize={item.setSize}
        aria-selected={effectiveSelectedKey === item.key ? 'true' : undefined}
        aria-expanded={hasChildren ? (isExpanded(item.key) ? 'true' : 'false') : undefined}
        tabindex={tabbableKey === item.key ? 0 : -1}
        style={`padding-inline-start: ${(item.depth - 1) * 16}px`}
        onfocus={() => (focusedKey = item.key)}
        onkeydown={(event) => handleKeydown(event, item)}
      >
        {item.label}
      </div>
    {/each}
  </div>
{/if}

<style>
  .astryx-tree-list {
    display: grid;
    gap: var(--spacing-1);
  }

  .astryx-tree-list__item {
    border-radius: var(--radius-element);
    color: var(--color-text-primary);
    outline: none;
    padding-block: var(--spacing-1);
    padding-inline-end: var(--spacing-2);
  }

  .astryx-tree-list__item:focus-visible {
    box-shadow: 0 0 0 var(--border-width-2, 2px) var(--color-focus-ring);
  }

  .astryx-tree-list__item[aria-selected='true'] {
    background: var(--color-background-selected);
  }

  .astryx-tree-list__state {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
</style>
