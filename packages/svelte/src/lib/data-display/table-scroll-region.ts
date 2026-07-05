// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file table-scroll-region.ts
 * @input A scrollable table wrapper node and accessible label
 * @output Svelte action that makes the horizontal scroll region keyboard focusable
 * @position Extracted Todo 8 helper for Table.svelte
 */

export function tableScrollRegion(
  node: HTMLElement,
  label: string,
): {readonly update: (nextLabel: string) => void} {
  node.tabIndex = 0;
  node.setAttribute('role', 'region');
  node.setAttribute('aria-label', label);
  return {
    update(nextLabel: string): void {
      node.setAttribute('aria-label', nextLabel);
    },
  };
}
