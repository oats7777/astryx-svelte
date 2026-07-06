// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file class-names.ts
 * @input Svelte class values from component internals and consumers
 * @output Deterministic class string composition
 * @position Styling primitive for @astryxdesign/svelte internals
 */

type ClassDictionary = Readonly<Record<string, unknown>>;

export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ClassDictionary
  | readonly ClassValue[];

function isClassValueArray(value: ClassValue): value is readonly ClassValue[] {
  return Array.isArray(value);
}

function appendClassValue(classes: string[], value: ClassValue): void {
  if (!value) {
    return;
  }

  if (isClassValueArray(value)) {
    for (const item of value) {
      appendClassValue(classes, item);
    }
    return;
  }

  if (typeof value === 'object') {
    for (const [name, isEnabled] of Object.entries(value)) {
      if (isEnabled) {
        classes.push(name);
      }
    }
    return;
  }

  if (typeof value === 'boolean') {
    return;
  }

  const trimmed = String(value).trim();
  if (trimmed) {
    classes.push(trimmed);
  }
}

export function classNames(...values: readonly ClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    appendClassValue(classes, value);
  }

  return classes.join(' ');
}
