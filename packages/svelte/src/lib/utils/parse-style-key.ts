// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parse-style-key.ts
 * @input Astryx component style key strings
 * @output CSS selector suffixes for generated theme override rules
 * @position Todo 15 utility parity port for style-key parsing
 */

export function parseStyleKey(key: string): string {
  if (key === 'base') {
    return '';
  }

  return key
    .split('+')
    .map((part) => {
      const [prop, value] = part.split(':');
      if (value == null) {
        return `.${prop ?? ''}`;
      }
      return /^\d/.test(value) ? `.${prop}-${value}` : `.${value}`;
    })
    .join('');
}
