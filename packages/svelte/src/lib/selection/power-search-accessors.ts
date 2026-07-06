// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-accessors.ts
 * @input PowerSearch configs and field/operator keys
 * @output Shared typed lookup helpers for fields and operators
 * @position Todo 10 PowerSearch config accessors for @astryxdesign/svelte
 */

import type {
  PowerSearchConfig,
  PowerSearchField,
  PowerSearchOperator,
} from './power-search-types.js';

export function getPowerSearchField(
  config: PowerSearchConfig,
  fieldKey: string,
): PowerSearchField | undefined {
  return config.fields.find((field) => field.key === fieldKey);
}

export function getPowerSearchOperator(
  config: PowerSearchConfig,
  fieldKey: string,
  operatorKey: string,
): PowerSearchOperator | undefined {
  return getPowerSearchField(config, fieldKey)?.operators.find((operator) => operator.key === operatorKey);
}

export function getDefaultPowerSearchOperator(
  config: PowerSearchConfig,
  fieldKey: string,
): PowerSearchOperator | undefined {
  const field = getPowerSearchField(config, fieldKey);
  if (field == null) {
    return undefined;
  }
  return field.operators.find((operator) => operator.key === field.defaultOperator) ?? field.operators[0];
}
