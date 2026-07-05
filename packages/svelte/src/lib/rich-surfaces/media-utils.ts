// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file media-utils.ts
 * @input Media collection length and navigation intent
 * @output Clamped and wrapped item indexes
 * @position Pure helpers for Carousel.svelte and Lightbox.svelte
 */

export function clampIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.min(count - 1, Math.max(0, index));
}

export function wrappedIndex(index: number, count: number, direction: 1 | -1): number {
  if (count <= 0) {
    return 0;
  }
  return (index + direction + count) % count;
}
