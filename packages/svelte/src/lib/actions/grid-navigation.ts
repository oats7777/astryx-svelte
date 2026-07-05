// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file grid-navigation.ts
 * @input Grid container, column count, focus selector, and boundary callbacks
 * @output WAI-ARIA grid keyboard focus Svelte action
 * @position Todo 15 shared behavior action for calendars and grids
 */

export type GridNavigationOptions = {
  readonly columns: number;
  readonly cellSelector?: string;
  readonly onNavigateBefore?: (column: number, offset: number) => void;
  readonly onNavigateAfter?: (column: number, offset: number) => void;
  readonly onPageUp?: () => void;
  readonly onPageDown?: () => void;
};

type ActionReturn = {
  readonly update: (next: GridNavigationOptions) => void;
  readonly destroy: () => void;
};

function cells(node: HTMLElement, selector: string): readonly HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(selector));
}

function focusCell(elements: readonly HTMLElement[], index: number): void {
  elements[Math.max(0, Math.min(index, elements.length - 1))]?.focus();
}

export function gridNavigation(node: HTMLElement, options: GridNavigationOptions): ActionReturn {
  let current = options;

  function focusInternal(
    elements: readonly HTMLElement[],
    index: number,
    column: number,
    offset: number,
  ): void {
    if (index < 0) {
      current.onNavigateBefore?.(column, offset);
      return;
    }
    if (index >= elements.length) {
      current.onNavigateAfter?.(column, offset);
      return;
    }
    elements[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const selector = current.cellSelector ?? 'button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = cells(node, selector);
    const index = focusable.findIndex((cell) => cell === document.activeElement || cell.contains(document.activeElement));
    if (index === -1) {
      return;
    }

    const columns = Math.max(1, current.columns);
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowCount = Math.ceil(focusable.length / columns);
    let handled = true;

    switch (event.key) {
      case 'ArrowRight':
        focusInternal(focusable, index + 1, (column + 1) % columns, 1);
        break;
      case 'ArrowLeft':
        focusInternal(focusable, index - 1, column === 0 ? columns - 1 : column - 1, 1);
        break;
      case 'ArrowDown':
        if (row < rowCount - 1) {
          focusInternal(focusable, Math.min(index + columns, focusable.length - 1), column, columns);
        } else {
          current.onNavigateAfter?.(column, columns);
        }
        break;
      case 'ArrowUp':
        if (row > 0) {
          focusInternal(focusable, index - columns, column, columns);
        } else {
          current.onNavigateBefore?.(column, columns);
        }
        break;
      case 'Home':
        focusCell(focusable, event.ctrlKey || event.metaKey ? 0 : row * columns);
        break;
      case 'End':
        focusCell(
          focusable,
          event.ctrlKey || event.metaKey ? focusable.length - 1 : Math.min((row + 1) * columns - 1, focusable.length - 1),
        );
        break;
      case 'PageUp':
        current.onPageUp?.();
        break;
      case 'PageDown':
        current.onPageDown?.();
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  node.addEventListener('keydown', handleKeyDown);
  return {
    update(next) {
      current = next;
    },
    destroy() {
      node.removeEventListener('keydown', handleKeyDown);
    },
  };
}
