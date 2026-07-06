// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-filtering.ts
 * @input PowerSearch filters and row values
 * @output Predicate helpers for applying structured PowerSearch filters
 * @position Todo 10 PowerSearch filtering utilities for @astryxdesign/svelte
 */

import type {PowerSearchFilter} from './power-search-types.js';

export function matchesPowerSearchFilter(
  row: Record<string, unknown>,
  filter: PowerSearchFilter,
): boolean {
  const value = row[filter.field];
  switch (filter.value.type) {
    case 'empty':
      return matchesEmptyFilter(value, filter.operator);
    case 'string':
      return typeof value === 'string' && matchesString(value, filter.operator, filter.value.value);
    case 'integer':
    case 'float':
      return typeof value === 'number' && matchesNumber(value, filter.operator, filter.value.value);
    case 'date_absolute':
      return typeof value === 'number' && matchesDate(value, filter.operator, filter.value.unixSeconds);
    case 'enum':
      return typeof value === 'string' && matchesEnum(value, filter.operator, filter.value.value);
    case 'enum_list':
    case 'string_list':
      return matchesList(value, filter.operator, filter.value.value);
  }
}

function matchesEmptyFilter(value: unknown, operator: string): boolean {
  if (operator === 'is_true') {
    return Boolean(value);
  }
  if (operator === 'is_false') {
    return !value;
  }
  return false;
}

function matchesString(value: string, operator: string, targetValue: string): boolean {
  const source = value.toLowerCase();
  const target = targetValue.toLowerCase();
  switch (operator) {
    case 'contains':
      return source.includes(target);
    case 'not_contains':
      return !source.includes(target);
    case 'starts_with':
      return source.startsWith(target);
    case 'not_starts_with':
      return !source.startsWith(target);
    case 'ends_with':
      return source.endsWith(target);
    case 'not_ends_with':
      return !source.endsWith(target);
    case 'is':
      return source === target;
    case 'is_not':
      return source !== target;
    default:
      return false;
  }
}

function matchesNumber(value: number, operator: string, target: number): boolean {
  switch (operator) {
    case 'equals':
      return value === target;
    case 'not_equals':
      return value !== target;
    case 'greater_than':
      return value > target;
    case 'less_than':
      return value < target;
    case 'greater_than_or_equal':
      return value >= target;
    case 'less_than_or_equal':
      return value <= target;
    default:
      return false;
  }
}

function matchesDate(value: number, operator: string, target: number): boolean {
  if (operator === 'before') {
    return value < target;
  }
  if (operator === 'after') {
    return value > target;
  }
  return false;
}

function matchesEnum(value: string, operator: string, target: string): boolean {
  if (operator === 'is') {
    return value === target;
  }
  if (operator === 'is_not') {
    return value !== target;
  }
  return false;
}

function matchesList(value: unknown, operator: string, target: readonly string[]): boolean {
  const values = typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.filter((item) => typeof item === 'string')
      : [];
  if (values.length === 0) {
    return false;
  }
  if (operator === 'is_any_of') {
    return values.some((item) => target.includes(item));
  }
  if (operator === 'is_none_of') {
    return values.every((item) => !target.includes(item));
  }
  return false;
}
