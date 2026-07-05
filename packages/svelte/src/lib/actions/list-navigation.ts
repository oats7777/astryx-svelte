// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file list-navigation.ts
 * @input List container, item selector, orientation, wrapping, and roving options
 * @output Keyboard focus Svelte action for linear lists
 * @position Todo 15 shared behavior action for menus, tabs, and toolbars
 */

export type ListNavigationOptions = {
  readonly itemSelector?: string;
  readonly wrap?: boolean;
  readonly orientation?: 'horizontal' | 'vertical' | 'both';
  readonly onEscape?: () => void;
  readonly hasHomeEnd?: boolean;
  readonly isRtl?: boolean;
  readonly hasRovingTabIndex?: boolean;
  readonly hasCaretGuard?: boolean;
};

type ActionReturn = {
  readonly update: (next: ListNavigationOptions) => void;
  readonly destroy: () => void;
};

function items(node: HTMLElement, selector: string): readonly HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(selector));
}

function isDisabled(element: HTMLElement): boolean {
  return (
    element.getAttribute('aria-disabled') === 'true' ||
    element.hasAttribute('disabled') ||
    (element instanceof HTMLButtonElement && element.disabled) ||
    (element instanceof HTMLInputElement && element.disabled) ||
    (element instanceof HTMLSelectElement && element.disabled) ||
    (element instanceof HTMLTextAreaElement && element.disabled)
  );
}

function setTabStop(element: HTMLElement, value: 0 | -1): void {
  if (element.getAttribute('tabindex') !== String(value)) {
    element.setAttribute('tabindex', String(value));
  }
}

function syncTabStops(elements: readonly HTMLElement[]): void {
  const enabled = elements.filter(element => !isDisabled(element));
  const current = enabled.find(element => element.getAttribute('tabindex') === '0');
  const tabbable = current ?? enabled[0];

  if (tabbable == null) {
    return;
  }

  for (const element of elements) {
    setTabStop(element, element === tabbable ? 0 : -1);
  }
}

function focusAt(elements: readonly HTMLElement[], index: number, roving: boolean): void {
  const target = elements[index];
  if (target == null) {
    return;
  }
  if (roving) {
    for (const element of elements) {
      setTabStop(element, element === target ? 0 : -1);
    }
  }
  target.focus();
}

function findEnabledIndex(
  elements: readonly HTMLElement[],
  start: number,
  step: 1 | -1,
  wrap: boolean,
): number {
  if (elements.length === 0) {
    return -1;
  }

  let index = start;
  for (let checked = 0; checked < elements.length; checked += 1) {
    if (index < 0 || index >= elements.length) {
      if (!wrap) {
        return -1;
      }
      index = (index + elements.length) % elements.length;
    }

    const candidate = elements[index];
    if (candidate != null && !isDisabled(candidate)) {
      return index;
    }
    index += step;
  }

  return -1;
}

function textInputCanUseCaret(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }
  return (
    element instanceof HTMLInputElement &&
    ['text', 'search', 'url', 'tel', 'email', 'password', 'number'].includes(element.type)
  );
}

function shouldDeferToCaret(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const editable = target.closest<HTMLElement>('[contenteditable]:not([contenteditable="false"])');
  if (editable != null) {
    return (editable.textContent ?? '').length > 0;
  }

  if (!textInputCanUseCaret(target)) {
    return false;
  }

  if (target.selectionStart !== target.selectionEnd) {
    return true;
  }
  if (target.selectionStart == null) {
    return true;
  }
  if (key === 'ArrowLeft' || key === 'ArrowUp' || key === 'Home') {
    return target.selectionStart > 0;
  }
  if (key === 'ArrowRight' || key === 'ArrowDown' || key === 'End') {
    return target.selectionStart < target.value.length;
  }
  return false;
}

export function listNavigation(
  node: HTMLElement,
  options: ListNavigationOptions = {},
): ActionReturn {
  let current = options;
  const selector = (): string => current.itemSelector ?? '[role="menuitem"]';
  const currentItems = (): readonly HTMLElement[] => items(node, selector());

  function syncIfNeeded(): void {
    if (current.hasRovingTabIndex === true) {
      syncTabStops(currentItems());
    }
  }

  function handleFocusIn(): void {
    syncIfNeeded();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const focusable = currentItems();
    const active = document.activeElement;
    const index = focusable.findIndex((item) => item === active || item.contains(active));
    const wrap = current.wrap ?? true;
    const orientation = current.orientation ?? 'vertical';
    const horizontal = orientation === 'horizontal' || orientation === 'both';
    const vertical = orientation === 'vertical' || orientation === 'both';
    const nextKeys = [
      ...(horizontal ? [current.isRtl === true ? 'ArrowLeft' : 'ArrowRight'] : []),
      ...(vertical ? ['ArrowDown'] : []),
    ];
    const previousKeys = [
      ...(horizontal ? [current.isRtl === true ? 'ArrowRight' : 'ArrowLeft'] : []),
      ...(vertical ? ['ArrowUp'] : []),
    ];
    const isNext = nextKeys.includes(event.key);
    const isPrevious = previousKeys.includes(event.key);
    const isHome = (current.hasHomeEnd ?? true) && event.key === 'Home';
    const isEnd = (current.hasHomeEnd ?? true) && event.key === 'End';

    if (event.key === 'Escape') {
      event.preventDefault();
      current.onEscape?.();
      return;
    }

    if (!isNext && !isPrevious && !isHome && !isEnd) {
      return;
    }

    if (
      current.hasCaretGuard === true &&
      (shouldDeferToCaret(event.target, event.key) ||
        shouldDeferToCaret(document.activeElement, event.key))
    ) {
      return;
    }

    if (isNext) {
      const next = findEnabledIndex(focusable, index === -1 ? 0 : index + 1, 1, wrap);
      if (next !== -1) {
        focusAt(focusable, next, current.hasRovingTabIndex === true);
      }
    } else if (isPrevious) {
      const previous = findEnabledIndex(
        focusable,
        index === -1 ? focusable.length - 1 : index - 1,
        -1,
        wrap,
      );
      if (previous !== -1) {
        focusAt(focusable, previous, current.hasRovingTabIndex === true);
      }
    } else if (isHome) {
      const first = findEnabledIndex(focusable, 0, 1, false);
      if (first !== -1) {
        focusAt(focusable, first, current.hasRovingTabIndex === true);
      }
    } else if (isEnd) {
      const last = findEnabledIndex(focusable, focusable.length - 1, -1, false);
      if (last !== -1) {
        focusAt(focusable, last, current.hasRovingTabIndex === true);
      }
    }

    event.preventDefault();
  }

  node.addEventListener('keydown', handleKeyDown);
  node.addEventListener('focusin', handleFocusIn);
  syncIfNeeded();
  return {
    update(next) {
      current = next;
      syncIfNeeded();
    },
    destroy() {
      node.removeEventListener('keydown', handleKeyDown);
      node.removeEventListener('focusin', handleFocusIn);
    },
  };
}
