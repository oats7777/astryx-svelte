// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Foundation component sizing, style, and class values
 * @output Shared foundation component helper types and formatters
 * @position Internal helpers for Svelte foundation components
 */

import {classNames, type ClassValue} from '../internal/class-names.js';

export type SizeValue = number | string;
export type SpacingStep = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
export type AlignValue = 'start' | 'center' | 'end' | 'stretch';
export type JustifyValue = AlignValue | 'between' | 'around' | 'evenly';
export type StyleValue = string | null | undefined;

const spacingSteps = new Set<SpacingStep>([0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10]);

export function formatSize(value: SizeValue | null | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

export function spacingVar(step: SpacingStep | null | undefined): string | undefined {
  if (step == null || !spacingSteps.has(step)) {
    return undefined;
  }
  return step === 0 ? '0' : `var(--spacing-${String(step).replace('.', '-')})`;
}

export function styleEntries(
  base: StyleValue,
  entries: readonly (readonly [string, string | undefined])[],
): string | undefined {
  const declarations = entries
    .filter((entry): entry is readonly [string, string] => entry[1] != null && entry[1] !== '')
    .map(([name, value]) => `${name}: ${value}`);
  return [base, declarations.join('; ')].filter(Boolean).join('; ') || undefined;
}

export function foundationClass(
  component: string,
  className: ClassValue,
  modifiers: readonly ClassValue[] = [],
): string {
  return classNames(`astryx-${component}`, modifiers, className);
}
