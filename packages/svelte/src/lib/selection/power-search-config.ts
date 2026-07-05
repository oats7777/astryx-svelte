// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-config.ts
 * @input PowerSearch field definitions and filters
 * @output Normalized PowerSearch config and data-filter application
 * @position Todo 10 PowerSearch config builder for @astryxdesign/svelte
 */

import type {
  PowerSearchConfig,
  PowerSearchEnumItem,
  PowerSearchField,
  PowerSearchFieldDefinition,
  PowerSearchFilter,
  PowerSearchOperator,
} from './power-search-types.js';
import {matchesPowerSearchFilter} from './power-search-filtering.js';

const stringOperators = [
  {key: 'contains', label: 'contains', value: {type: 'string'}},
  {key: 'not_contains', label: 'does not contain', value: {type: 'string'}},
  {key: 'starts_with', label: 'starts with', value: {type: 'string'}},
  {key: 'not_starts_with', label: 'does not start with', value: {type: 'string'}},
  {key: 'ends_with', label: 'ends with', value: {type: 'string'}},
  {key: 'not_ends_with', label: 'does not end with', value: {type: 'string'}},
  {key: 'is', label: 'is', value: {type: 'string'}},
  {key: 'is_not', label: 'is not', value: {type: 'string'}},
] satisfies readonly PowerSearchOperator[];

const numberOperators = [
  {key: 'equals', label: 'is', value: {type: 'float'}},
  {key: 'not_equals', label: 'is not', value: {type: 'float'}},
  {key: 'greater_than', label: 'is greater than', value: {type: 'float'}},
  {key: 'less_than', label: 'is less than', value: {type: 'float'}},
  {key: 'greater_than_or_equal', label: 'is greater than or equal to', value: {type: 'float'}},
  {key: 'less_than_or_equal', label: 'is less than or equal to', value: {type: 'float'}},
] satisfies readonly PowerSearchOperator[];

const dateOperators = [
  {key: 'before', label: 'is before', value: {type: 'date_absolute'}},
  {key: 'after', label: 'is after', value: {type: 'date_absolute'}},
] satisfies readonly PowerSearchOperator[];

const booleanOperators = [
  {key: 'is_true', label: 'is true', value: {type: 'empty'}},
  {key: 'is_false', label: 'is false', value: {type: 'empty'}},
] satisfies readonly PowerSearchOperator[];

const stringListOperators = [
  {key: 'is_any_of', label: 'is any of', value: {type: 'string_list'}},
  {key: 'is_none_of', label: 'is none of', value: {type: 'string_list'}},
] satisfies readonly PowerSearchOperator[];

export function createPowerSearchConfig(
  definitions: readonly PowerSearchFieldDefinition[],
  configName = 'PowerSearchConfig',
): {
  readonly config: PowerSearchConfig;
  readonly applyFilters: <T extends Record<string, unknown>>(
    filters: readonly PowerSearchFilter[],
    data: readonly T[],
  ) => T[];
} {
  const fields = definitions.map(buildField);
  return {
    config: {name: configName, fields},
    applyFilters: (filters, data) => {
      if (filters.length === 0) {
        return [...data];
      }
      return data.filter((row) => filters.every((filter) => matchesPowerSearchFilter(row, filter)));
    },
  };
}

function normalizeEnumValues(values: readonly PowerSearchEnumItem[] | undefined): readonly PowerSearchEnumItem[] {
  const seen = new Set<string>();
  const normalized: PowerSearchEnumItem[] = [];
  for (const item of values ?? []) {
    if (item.value.length === 0 || seen.has(item.value)) {
      continue;
    }
    seen.add(item.value);
    normalized.push({value: item.value, label: item.label});
  }
  return normalized;
}

function enumOperators(values: readonly PowerSearchEnumItem[]): readonly PowerSearchOperator[] {
  return [
    {key: 'is', label: 'is', value: {type: 'enum', values}},
    {key: 'is_not', label: 'is not', value: {type: 'enum', values}},
    {key: 'is_any_of', label: 'is any of', value: {type: 'enum_list', values}},
    {key: 'is_none_of', label: 'is none of', value: {type: 'enum_list', values}},
  ];
}

function enumListOperators(values: readonly PowerSearchEnumItem[]): readonly PowerSearchOperator[] {
  return [
    {key: 'is_any_of', label: 'is any of', value: {type: 'enum_list', values}},
    {key: 'is_none_of', label: 'is none of', value: {type: 'enum_list', values}},
  ];
}

function buildField(definition: PowerSearchFieldDefinition): PowerSearchField {
  const label = definition.label ?? definition.key;
  switch (definition.type) {
    case 'string':
      return {key: definition.key, label, operators: stringOperators, defaultOperator: 'contains'};
    case 'number':
      return {key: definition.key, label, operators: numberOperators, defaultOperator: 'equals'};
    case 'boolean':
      return {key: definition.key, label, operators: booleanOperators, defaultOperator: 'is_true'};
    case 'date':
      return {key: definition.key, label, operators: dateOperators, defaultOperator: 'after'};
    case 'enum': {
      const values = normalizeEnumValues(definition.enumValues);
      return {key: definition.key, label, operators: enumOperators(values), defaultOperator: 'is'};
    }
    case 'enum_list': {
      const values = normalizeEnumValues(definition.enumValues);
      return {key: definition.key, label, operators: enumListOperators(values), defaultOperator: 'is_any_of'};
    }
    case 'string_list':
      return {key: definition.key, label, operators: stringListOperators, defaultOperator: 'is_any_of'};
  }
}
