// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file clickable-container.ts
 * @input Svelte action node plus click, link, and disabled options
 * @output Click delegation that preserves nested interactive controls
 * @position Todo 15 shared behavior action for card-like containers
 */

import {hasInteractiveAncestor} from './action-utils.js';

export type ClickableContainerOptions = {
  readonly href?: string;
  readonly target?: string;
  readonly isDisabled?: boolean;
  readonly interactive?: HTMLElement | null;
  readonly onClick?: (event: MouseEvent) => void;
};

type ActionReturn = {
  readonly update: (next: ClickableContainerOptions) => void;
  readonly destroy: () => void;
};

function hasTextSelection(node: HTMLElement): boolean {
  const selection = document.getSelection();
  return selection != null && !selection.isCollapsed && node.contains(selection.anchorNode);
}

function openHref(href: string, target: string | undefined, event: MouseEvent): void {
  if (target === '_blank' || event.ctrlKey || event.metaKey) {
    window.open(href, '_blank', 'noopener');
    return;
  }
  window.location.href = href;
}

export function clickableContainer(
  node: HTMLElement,
  options: ClickableContainerOptions = {},
): ActionReturn {
  let current = options;

  function shouldSkip(event: MouseEvent): boolean {
    if (current.isDisabled === true || hasTextSelection(node)) {
      return true;
    }
    return event.target !== node && hasInteractiveAncestor(event.target, node);
  }

  function handleClick(event: MouseEvent): void {
    if (shouldSkip(event)) {
      return;
    }
    current.onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (current.href != null) {
      openHref(current.href, current.target, event);
      return;
    }
    current.interactive?.click();
  }

  function handleMouseUp(event: MouseEvent): void {
    if (
      current.isDisabled === true ||
      current.href == null ||
      event.button !== 1 ||
      shouldSkip(event)
    ) {
      return;
    }
    window.open(current.href, '_blank', 'noopener');
  }

  node.setAttribute('data-pressable-container', 'true');
  node.addEventListener('click', handleClick);
  node.addEventListener('mouseup', handleMouseUp);

  return {
    update(next) {
      current = next;
    },
    destroy() {
      node.removeEventListener('click', handleClick);
      node.removeEventListener('mouseup', handleMouseUp);
      node.removeAttribute('data-pressable-container');
    },
  };
}
