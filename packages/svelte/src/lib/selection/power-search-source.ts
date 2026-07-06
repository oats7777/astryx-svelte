// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-source.ts
 * @input PowerSearch configs and user query text
 * @output Deterministic PowerSearch suggestion source behavior
 * @position Todo 10 PowerSearch suggestion source for @astryxdesign/svelte
 */

import {
  getDefaultPowerSearchOperator,
  getPowerSearchField,
} from './power-search-accessors.js';
import type {
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchFilterValue,
  PowerSearchItem,
  PowerSearchOperator,
  PowerSearchSource,
} from './power-search-types.js';

export function createPowerSearchSource(
  config: PowerSearchConfig,
): PowerSearchSource {
  const items = buildFieldItems(config);
  return {
    bootstrap: () => items,
    search: (query) => searchConfig(config, items, query),
  };
}

export async function resolvePowerSearchSourceResults<T extends PowerSearchItem>(
  source: PowerSearchSource<T>,
  query: string,
): Promise<readonly T[]> {
  return source.search(query);
}

function buildFieldItems(config: PowerSearchConfig): readonly PowerSearchItem[] {
  return config.fields.map((field) => {
    const defaultOperator = getDefaultPowerSearchOperator(config, field.key);
    return {
      id: field.key,
      label: field.label,
      auxiliaryData: {fieldKey: field.key, operatorKey: defaultOperator?.key},
    };
  });
}

function searchConfig(
  config: PowerSearchConfig,
  bootstrapItems: readonly PowerSearchItem[],
  query: string,
): readonly PowerSearchItem[] {
  const lower = query.toLowerCase().trim();
  if (lower.length === 0) {
    return bootstrapItems;
  }
  const results: PowerSearchItem[] = [];
  const seen = new Set<string>();
  for (const field of config.fields) {
    addFieldAndOperatorMatches(config, field, lower, results, seen);
  }
  for (const field of config.fields) {
    addValueMatches(field, query, lower, results, seen);
  }
  addContentSearchMatch(config, query, lower, results);
  return results;
}

function addFieldAndOperatorMatches(
  config: PowerSearchConfig,
  field: PowerSearchField,
  lower: string,
  results: PowerSearchItem[],
  seen: Set<string>,
): void {
  if (field.typeaheadMinQueryLength != null && lower.length < field.typeaheadMinQueryLength) {
    return;
  }
  const fieldMatches = field.label.toLowerCase().includes(lower)
    || field.typeaheadAliases?.some((alias) => alias.toLowerCase().includes(lower)) === true;
  if (fieldMatches && !seen.has(field.key)) {
    seen.add(field.key);
    results.push({
      id: field.key,
      label: field.label,
      auxiliaryData: {
        fieldKey: field.key,
        operatorKey: getDefaultPowerSearchOperator(config, field.key)?.key,
      },
    });
  }
  for (const operator of field.operators) {
    const label = `${field.label} ${operator.label}`;
    if (label.toLowerCase().includes(lower)) {
      addOperatorMatch(field, operator, label, results, seen);
    }
  }
}

function addOperatorMatch(
  field: PowerSearchField,
  operator: PowerSearchOperator,
  label: string,
  results: PowerSearchItem[],
  seen: Set<string>,
): void {
  const id = `${field.key}:${operator.key}`;
  if (seen.has(id)) {
    return;
  }
  seen.add(id);
  results.push({id, label, auxiliaryData: {fieldKey: field.key, operatorKey: operator.key}});
}

function addValueMatches(
  field: PowerSearchField,
  query: string,
  lower: string,
  results: PowerSearchItem[],
  seen: Set<string>,
): void {
  if (field.isValueMatchAllowed === false) {
    return;
  }
  const fieldPrefix = `${field.label.toLowerCase()} `;
  if (!lower.startsWith(fieldPrefix) || lower.length <= fieldPrefix.length) {
    return;
  }
  const rawValue = query.slice(fieldPrefix.length);
  const remainder = lower.slice(fieldPrefix.length);
  if (field.operators.some((operator) => operator.label.toLowerCase().startsWith(remainder))) {
    return;
  }
  for (const operator of field.operators) {
    for (const match of resolveValueMatches(operator, rawValue)) {
      addValueMatch(field, operator, match, results, seen);
    }
  }
}

function addValueMatch(
  field: PowerSearchField,
  operator: PowerSearchOperator,
  match: ValueMatch,
  results: PowerSearchItem[],
  seen: Set<string>,
): void {
  const id = `${field.key}:${operator.key}:value:${match.displayValue}`;
  if (seen.has(id)) {
    return;
  }
  seen.add(id);
  results.push({
    id,
    label: `${field.label} ${operator.label} ${match.quoted ? `"${match.displayValue}"` : match.displayValue}`,
    auxiliaryData: {fieldKey: field.key, operatorKey: operator.key, filterValue: match.filterValue},
  });
}

type ValueMatch = {
  readonly displayValue: string;
  readonly filterValue: PowerSearchFilterValue;
  readonly quoted: boolean;
};

function resolveValueMatches(
  operator: PowerSearchOperator,
  rawValue: string,
): readonly ValueMatch[] {
  if (operator.value.type === 'string') {
    return [{displayValue: rawValue, filterValue: {type: 'string', value: rawValue}, quoted: true}];
  }
  if (operator.value.type === 'string_list') {
    return [{displayValue: rawValue, filterValue: {type: 'string_list', value: [rawValue]}, quoted: true}];
  }
  if (operator.value.type === 'enum' || operator.value.type === 'enum_list') {
    const lower = rawValue.toLowerCase();
    return operator.value.values
      .filter((item) => item.label.toLowerCase().includes(lower))
      .map((item) => ({
        displayValue: item.label,
        filterValue: operator.value.type === 'enum'
          ? {type: 'enum', value: item.value}
          : {type: 'enum_list', value: [item.value]},
        quoted: false,
      }));
  }
  return [];
}

function addContentSearchMatch(
  config: PowerSearchConfig,
  query: string,
  lower: string,
  results: PowerSearchItem[],
): void {
  const fieldKey = config.contentSearchFieldKey;
  if (fieldKey == null) {
    return;
  }
  const field = getPowerSearchField(config, fieldKey);
  const operator = getDefaultPowerSearchOperator(config, fieldKey);
  const exact = config.fields.some(
    (item) => item.label.toLowerCase() === lower
      || item.operators.some((op) => `${item.label} ${op.label}`.toLowerCase() === lower),
  );
  if (field == null || operator == null || exact) {
    return;
  }
  results.unshift({
    id: `__content_search__:${query}`,
    label: `"${query}"`,
    auxiliaryData: {fieldKey, operatorKey: operator.key, filterValue: {type: 'string', value: query}},
  });
}
