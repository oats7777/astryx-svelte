// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-format.ts
 * @input PowerSearch config, filters, operators, and display length
 * @output Human-readable PowerSearch token labels
 * @position Todo 10 PowerSearch formatting utilities for @astryxdesign/svelte
 */

import {
  getPowerSearchField,
  getPowerSearchOperator,
} from './power-search-accessors.js';
import type {
  PowerSearchConfig,
  PowerSearchEnumItem,
  PowerSearchFilter,
  PowerSearchFilterValue,
  PowerSearchOperator,
} from './power-search-types.js';

export function formatPowerSearchFilter(
  config: PowerSearchConfig,
  filter: PowerSearchFilter,
  maxLength = 40,
): string {
  const field = getPowerSearchField(config, filter.field);
  const operator = getPowerSearchOperator(config, filter.field, filter.operator);
  const parts = [
    field?.label ?? filter.field,
    operator?.label ?? filter.operator,
    formatFilterValue(operator, filter.value, maxLength),
  ].filter((part) => part.length > 0);
  return parts.join(' ');
}

function formatFilterValue(
  operator: PowerSearchOperator | undefined,
  value: PowerSearchFilterValue,
  maxLength: number,
): string {
  switch (value.type) {
    case 'empty':
      return '';
    case 'string':
      return truncate(value.value, maxLength);
    case 'string_list':
    case 'enum_list':
      return formatListValue(operator, value, maxLength);
    case 'integer':
    case 'float':
      return String(value.value);
    case 'date_absolute':
      return new Intl.DateTimeFormat(undefined, {year: 'numeric', month: 'short', day: 'numeric'}).format(value.unixSeconds * 1000);
    case 'enum':
      return truncate(operator?.value.type === 'enum' ? enumLabel(operator.value.values, value.value) : value.value, maxLength);
  }
}

function formatListValue(
  operator: PowerSearchOperator | undefined,
  value: Extract<PowerSearchFilterValue, {readonly type: 'string_list' | 'enum_list'}>,
  maxLength: number,
): string {
  const labels = formatListLabels(operator, value);
  if (labels.length === 0) {
    return '';
  }
  const joined = labels.join(', ');
  return joined.length <= maxLength ? joined : `${labels.length} items`;
}

function enumLabel(values: readonly PowerSearchEnumItem[], value: string): string {
  return values.find((item) => item.value === value)?.label ?? value;
}

function formatListLabels(
  operator: PowerSearchOperator | undefined,
  value: Extract<PowerSearchFilterValue, {readonly type: 'string_list' | 'enum_list'}>,
): readonly string[] {
  if (value.type === 'enum_list' && operator != null) {
    const operatorValue = operator.value;
    if (operatorValue.type === 'enum_list') {
      return value.value.map((item) => enumLabel(operatorValue.values, item));
    }
  }
  return value.value;
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}
