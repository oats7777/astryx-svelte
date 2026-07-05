// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-interaction.ts
 * @input PowerSearch config and selected suggestion item metadata
 * @output Action model for adding filters or entering a value-picking flow
 * @position Todo 10 PowerSearch interaction helpers for @astryxdesign/svelte
 */

import {
  getPowerSearchField,
  getPowerSearchOperator,
} from './power-search-accessors.js';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
  PowerSearchItem,
  PowerSearchOperator,
} from './power-search-types.js';

export type PowerSearchSuggestionAction =
  | {readonly kind: 'add'; readonly filter: PowerSearchFilter}
  | {readonly kind: 'edit'; readonly filter: PowerSearchFilter}
  | {readonly kind: 'query'; readonly query: string}
  | {readonly kind: 'none'};

export function resolvePowerSearchSuggestionAction(
  config: PowerSearchConfig,
  item: PowerSearchItem | undefined,
): PowerSearchSuggestionAction {
  const data = item?.auxiliaryData;
  if (data?.fieldKey == null || data.operatorKey == null) {
    return {kind: 'none'};
  }
  if (data.filterValue != null) {
    return {kind: 'add', filter: {field: data.fieldKey, operator: data.operatorKey, value: data.filterValue}};
  }
  const field = getPowerSearchField(config, data.fieldKey);
  const operator = getPowerSearchOperator(config, data.fieldKey, data.operatorKey);
  if (field == null || operator == null) {
    return {kind: 'none'};
  }
  return createOperatorAction(field.label, data.fieldKey, operator);
}

function createOperatorAction(
  fieldLabel: string,
  fieldKey: string,
  operator: PowerSearchOperator,
): PowerSearchSuggestionAction {
  switch (operator.value.type) {
    case 'empty':
      return {kind: 'add', filter: {field: fieldKey, operator: operator.key, value: {type: 'empty'}}};
    case 'enum':
      return operator.value.values[0] == null
        ? {kind: 'none'}
        : {kind: 'edit', filter: {field: fieldKey, operator: operator.key, value: {type: 'enum', value: operator.value.values[0].value}}};
    case 'enum_list':
      return operator.value.values[0] == null
        ? {kind: 'none'}
        : {kind: 'edit', filter: {field: fieldKey, operator: operator.key, value: {type: 'enum_list', value: [operator.value.values[0].value]}}};
    case 'string':
    case 'string_list':
    case 'integer':
    case 'float':
    case 'date_absolute':
      return {kind: 'query', query: `${fieldLabel} ${operator.label} `};
  }
}
