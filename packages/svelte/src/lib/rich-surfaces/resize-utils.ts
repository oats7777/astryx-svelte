// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resize-utils.ts
 * @input Requested size, bounds, keyboard key, and orientation
 * @output Clamped resize values for pointer and keyboard interactions
 * @position Pure helpers for Resizable.svelte
 */

export type ResizeOrientation = 'horizontal' | 'vertical';

export function clampSize(size: number, minSize: number, maxSize: number): number {
  return Math.min(maxSize, Math.max(minSize, Math.round(size)));
}

export function keyboardSize(
  key: string,
  current: number,
  minSize: number,
  maxSize: number,
  orientation: ResizeOrientation,
): number {
  const decrement = orientation === 'horizontal' ? key === 'ArrowLeft' : key === 'ArrowUp';
  const increment = orientation === 'horizontal' ? key === 'ArrowRight' : key === 'ArrowDown';
  if (key === 'Home') {
    return minSize;
  }
  if (key === 'End') {
    return maxSize;
  }
  if (decrement) {
    return clampSize(current - 10, minSize, maxSize);
  }
  if (increment) {
    return clampSize(current + 10, minSize, maxSize);
  }
  return current;
}
