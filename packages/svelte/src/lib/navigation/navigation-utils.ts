// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation-utils.ts
 * @input Navigation state and item collections
 * @output Shared class, id, and roving-focus helpers
 * @position Todo 12 navigation utility layer
 */

import type {ChoiceOption, NavItemModel, NavValue, PageRangeItem} from './types.js';

let navigationId = 0;

export function nextNavigationId(prefix: string): string {
  navigationId += 1;
  return `astryx-${prefix}-${navigationId}`;
}

export function cx(...values: readonly (false | null | string | undefined)[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}

export function itemValue(item: NavItemModel | ChoiceOption): NavValue {
  return item.value ?? ('href' in item ? item.href : undefined) ?? item.label;
}

export function enabledOptions(options: readonly ChoiceOption[]): readonly ChoiceOption[] {
  return options.filter((option) => option.disabled !== true);
}

export function nextOption(
  options: readonly ChoiceOption[],
  currentValue: NavValue,
  key: string,
): ChoiceOption | undefined {
  const enabled = enabledOptions(options);
  if (enabled.length === 0) {
    return undefined;
  }
  if (key === 'Home') {
    return enabled[0];
  }
  if (key === 'End') {
    return enabled[enabled.length - 1];
  }
  const currentIndex = Math.max(0, enabled.findIndex((option) => option.value === currentValue));
  const direction = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
  return enabled[(currentIndex + direction + enabled.length) % enabled.length];
}

export function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): readonly PageRangeItem[] {
  const totalSlots = siblingCount * 2 + 5;
  if (totalPages <= totalSlots) {
    return Array.from({length: totalPages}, (_value, index) => index + 1);
  }
  const left = Math.max(currentPage - siblingCount, 1);
  const right = Math.min(currentPage + siblingCount, totalPages);
  const showLeft = left > 2;
  const showRight = right < totalPages - 1;
  if (!showLeft) {
    return [...Array.from({length: 3 + siblingCount * 2}, (_value, index) => index + 1), '...', totalPages];
  }
  if (!showRight) {
    const start = totalPages - (2 + siblingCount * 2);
    return [1, '...', ...Array.from({length: 3 + siblingCount * 2}, (_value, index) => start + index)];
  }
  return [1, '...', ...Array.from({length: right - left + 1}, (_value, index) => left + index), '...', totalPages];
}

export function breakpointQuery(breakpoint: string | undefined): string {
  if (breakpoint === 'none') {
    return '(max-width: 0px)';
  }
  const widths: Record<string, number> = {sm: 639, md: 767, lg: 1023, xl: 1279};
  return `(max-width: ${widths[breakpoint ?? 'md'] ?? widths.md}px)`;
}
