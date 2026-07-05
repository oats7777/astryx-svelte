// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scroll-overflow.ts
 * @input Horizontally scrollable DOM node
 * @output Scroll edge state updates and cleanup via a Svelte action
 * @position Todo 15 shared action replacement for React useScrollOverflow
 */

import {observeResize, unobserveResize} from '../utils/shared-resize-observer.js';

export type ScrollOverflowState = {
  readonly overflowStart: boolean;
  readonly overflowEnd: boolean;
  readonly hasOverflow: boolean;
};

type ActionReturn = {
  readonly destroy: () => void;
};

export function scrollOverflow(
  node: HTMLElement,
  onChange: (state: ScrollOverflowState) => void,
): ActionReturn {
  let previous: ScrollOverflowState | undefined;

  function measure(): void {
    const tolerance = 1;
    const maxScroll = node.scrollWidth - node.clientWidth;
    const next = {
      overflowStart: Math.abs(node.scrollLeft) > tolerance,
      overflowEnd: Math.abs(node.scrollLeft) < maxScroll - tolerance,
      hasOverflow: node.scrollWidth > node.clientWidth + tolerance,
    };
    if (
      previous?.overflowStart === next.overflowStart &&
      previous.overflowEnd === next.overflowEnd &&
      previous.hasOverflow === next.hasOverflow
    ) {
      return;
    }
    previous = next;
    onChange(next);
  }

  node.addEventListener('scroll', measure, {passive: true});
  observeResize(node, measure);

  return {
    destroy() {
      node.removeEventListener('scroll', measure);
      unobserveResize(node);
    },
  };
}
