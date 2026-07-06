// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tree-navigation.ts
 * @input Tree container, treeitem selectors, expansion callbacks, and keyboard events
 * @output Svelte action for WAI-ARIA tree focus and activation behavior
 * @position Shared Svelte accessibility action for tree and outline components
 */

import {createTypeahead} from './typeahead.js';

export type TreeNavigationOptions = {
  readonly itemSelector?: string;
  readonly isItemDisabled?: (item: HTMLElement) => boolean;
  readonly getLevel?: (item: HTMLElement) => number;
  readonly isExpanded?: (item: HTMLElement) => boolean;
  readonly isCollapsed?: (item: HTMLElement) => boolean;
  readonly getItemId?: (item: HTMLElement) => string | undefined;
  readonly onToggleExpand?: (id: string) => void;
  readonly onActivate?: (item: HTMLElement, id: string | undefined) => boolean | undefined;
  readonly typeahead?: boolean;
  readonly typeaheadResetMs?: number;
  readonly onActiveChange?: (id: string | undefined) => void;
};

type ActionReturn = {
  readonly update: (next: TreeNavigationOptions) => void;
  readonly destroy: () => void;
};

const NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' ']);

function defaultDisabled(item: HTMLElement): boolean {
  return item.dataset.treeDisabled != null || item.getAttribute('aria-disabled') === 'true';
}

function defaultLevel(item: HTMLElement): number {
  const parsed = Number(item.getAttribute('aria-level') ?? '1');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function treeNavigation(node: HTMLElement, options: TreeNavigationOptions = {}): ActionReturn {
  let current = options;

  function selector(): string {
    return current.itemSelector ?? '[role="treeitem"]';
  }

  function items(): HTMLElement[] {
    return Array.from(node.querySelectorAll<HTMLElement>(selector()));
  }

  function isDisabled(item: HTMLElement): boolean {
    return current.isItemDisabled?.(item) ?? defaultDisabled(item);
  }

  function levelOf(item: HTMLElement): number {
    return current.getLevel?.(item) ?? defaultLevel(item);
  }

  function expandedOf(item: HTMLElement): boolean {
    return current.isExpanded?.(item) ?? item.getAttribute('aria-expanded') === 'true';
  }

  function collapsedOf(item: HTMLElement): boolean {
    return current.isCollapsed?.(item) ?? item.getAttribute('aria-expanded') === 'false';
  }

  function idOf(item: HTMLElement): string | undefined {
    return current.getItemId?.(item) ?? item.dataset.treeId;
  }

  function focusItem(item: HTMLElement | undefined): void {
    if (item == null) {
      return;
    }
    current.onActiveChange?.(idOf(item));
    item.focus();
  }

  function focusEnabledFrom(elements: readonly HTMLElement[], start: number, direction: 1 | -1): void {
    for (let index = start; index >= 0 && index < elements.length; index += direction) {
      const candidate = elements[index];
      if (candidate != null && !isDisabled(candidate)) {
        focusItem(candidate);
        return;
      }
    }
  }

  const typeahead = createTypeahead({
    getItemLabels: () => items().map(item => item.textContent),
    getCurrentIndex: () => {
      const activeTreeItem = document.activeElement?.closest(selector());
      return items().findIndex(item => item === activeTreeItem);
    },
    isDisabled: index => {
      const item = items()[index];
      return item == null || isDisabled(item);
    },
    onMatch: index => {
      focusItem(items()[index]);
    },
    resetMs: current.typeaheadResetMs,
  });

  function handleKeyDown(event: KeyboardEvent): void {
    const elements = items();
    if (elements.length === 0) {
      return;
    }

    const activeTreeItem = document.activeElement?.closest(selector());
    const currentIndex = elements.findIndex(item => item === activeTreeItem);
    const focused = currentIndex >= 0 ? elements[currentIndex] : undefined;

    if (
      current.typeahead !== false &&
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !NAVIGATION_KEYS.has(event.key)
    ) {
      if (typeahead.onKeyDown(event)) {
        event.preventDefault();
      }
      return;
    }

    if (!NAVIGATION_KEYS.has(event.key)) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusEnabledFrom(elements, currentIndex < 0 ? 0 : currentIndex + 1, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusEnabledFrom(elements, currentIndex < 0 ? elements.length - 1 : currentIndex - 1, -1);
        break;
      case 'ArrowRight':
        if (focused != null) {
          event.preventDefault();
          if (collapsedOf(focused)) {
            const id = idOf(focused);
            if (id != null) {
              current.onToggleExpand?.(id);
            }
          } else if (expandedOf(focused)) {
            const next = elements[currentIndex + 1];
            if (next != null && levelOf(next) > levelOf(focused)) {
              focusItem(next);
            }
          }
        }
        break;
      case 'ArrowLeft':
        if (focused != null) {
          event.preventDefault();
          if (expandedOf(focused)) {
            const id = idOf(focused);
            if (id != null) {
              current.onToggleExpand?.(id);
            }
          } else {
            const focusedLevel = levelOf(focused);
            for (let index = currentIndex - 1; index >= 0; index -= 1) {
              const candidate = elements[index];
              if (candidate != null && levelOf(candidate) < focusedLevel) {
                focusItem(candidate);
                break;
              }
            }
          }
        }
        break;
      case 'Home':
        event.preventDefault();
        focusEnabledFrom(elements, 0, 1);
        break;
      case 'End':
        event.preventDefault();
        focusEnabledFrom(elements, elements.length - 1, -1);
        break;
      case 'Enter':
      case ' ':
        if (focused != null && !isDisabled(focused)) {
          event.preventDefault();
          const id = idOf(focused);
          const handled = current.onActivate?.(focused, id) === true;
          if (!handled && focused.getAttribute('aria-expanded') != null && id != null) {
            current.onToggleExpand?.(id);
          }
        }
        break;
    }
  }

  node.addEventListener('keydown', handleKeyDown);

  return {
    update(next) {
      current = next;
      typeahead.reset();
    },
    destroy() {
      typeahead.reset();
      node.removeEventListener('keydown', handleKeyDown);
    },
  };
}
