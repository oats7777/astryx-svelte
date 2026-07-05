// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-editing.ts
 * @input Current PowerSearch filter, operator, and enum value selection
 * @output Edited filter values and editable enum choices
 * @position Todo 10 PowerSearch edit-state helpers for @astryxdesign/svelte
 */

import type {
  PowerSearchEnumItem,
  PowerSearchFilter,
  PowerSearchOperator,
} from './power-search-types.js';

export function getPowerSearchEditableValues(
  operator: PowerSearchOperator | undefined,
): readonly PowerSearchEnumItem[] {
  if (operator?.value.type === 'enum' || operator?.value.type === 'enum_list') {
    return operator.value.values;
  }
  return [];
}

export function createEditedPowerSearchFilter(
  filter: PowerSearchFilter,
  operator: PowerSearchOperator | undefined,
  value: PowerSearchEnumItem,
): PowerSearchFilter {
  return {
    field: filter.field,
    operator: filter.operator,
    value: operator?.value.type === 'enum_list'
      ? {type: 'enum_list', value: [value.value]}
      : {type: 'enum', value: value.value},
  };
}
