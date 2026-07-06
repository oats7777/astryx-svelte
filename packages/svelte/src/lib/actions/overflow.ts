// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file overflow.ts
 * @input Visible container, hidden measurement node, item count, and sizing options
 * @output Visible item count changes for horizontal overflow lists
 * @position Todo 15 shared Svelte action replacement for React useOverflow
 */

import {observeResize, unobserveResize} from '../utils/shared-resize-observer.js';

export type OverflowState = {
  readonly visibleCount: number;
  readonly hasOverflow: boolean;
};

export type OverflowOptions = {
  readonly itemCount: number;
  readonly measure: HTMLElement;
  readonly gap?: number;
  readonly minVisibleItems?: number;
  readonly collapseFrom?: 'start' | 'end';
  readonly behavior?: 'observeParent' | 'observeSelf';
  readonly onChange: (state: OverflowState) => void;
};

type ActionReturn = {
  readonly update: (next: OverflowOptions) => void;
  readonly destroy: () => void;
};

function availableWidth(container: HTMLElement, observeParent: boolean): number {
  if (!observeParent || container.parentElement == null) {
    return container.offsetWidth;
  }
  const parent = container.parentElement;
  const style = getComputedStyle(parent);
  return parent.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight);
}

function calculate(container: HTMLElement, options: OverflowOptions): OverflowState {
  const allChildren = Array.from(options.measure.children) as HTMLElement[];
  const children = allChildren.slice(0, options.itemCount);
  const indicator = allChildren.find((child) => child.hasAttribute('data-overflow-indicator'));
  const indicatorWidth = indicator == null ? 0 : indicator.offsetWidth;
  const gap = options.gap ?? 0;
  const minVisible = options.minVisibleItems ?? 0;
  const widths = children.map((child) => child.offsetWidth);
  const ordered = options.collapseFrom === 'start' ? [...widths].reverse() : widths;
  const width = availableWidth(container, options.behavior === 'observeParent');
  let total = 0;
  let count = 0;

  for (let index = 0; index < ordered.length; index += 1) {
    const itemWidth = ordered[index] ?? 0;
    const candidate = total + itemWidth + (index > 0 ? gap : 0);
    const isLast = index === ordered.length - 1;
    const reserve = isLast ? 0 : indicatorWidth + (count > 0 || indicatorWidth > 0 ? gap : 0);
    if (candidate + reserve > width && count >= minVisible) {
      break;
    }
    total = candidate;
    count += 1;
  }

  const visibleCount = Math.max(Math.min(count, options.itemCount), minVisible);
  return {visibleCount, hasOverflow: visibleCount < options.itemCount};
}

export function overflow(node: HTMLElement, options: OverflowOptions): ActionReturn {
  let current = options;
  let observed: HTMLElement | undefined;

  function emit(): void {
    current.onChange(calculate(node, current));
  }

  function observe(): void {
    if (observed != null) {
      unobserveResize(observed);
    }
    observed = current.behavior === 'observeParent' && node.parentElement != null ? node.parentElement : node;
    observeResize(observed, emit);
  }

  observe();
  emit();

  return {
    update(next) {
      current = next;
      observe();
      emit();
    },
    destroy() {
      if (observed != null) {
        unobserveResize(observed);
      }
    },
  };
}
