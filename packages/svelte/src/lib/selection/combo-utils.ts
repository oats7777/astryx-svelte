// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file combo-utils.ts
 * @input Combo option collections, queries, and tokenizer text
 * @output Normalized option lists, keyboard navigation helpers, and token serialization
 * @position Shared runtime utility layer for Todo 10 Svelte selection controls
 */

import type {ComboOption, ComboOptionData, SearchSourceInput, SearchableItem, TokenizerToken} from './combo-types.js';

let comboIdCounter = 0;

export function nextComboId(prefix: string): string {
  comboIdCounter += 1;
  return `astryx-${prefix}-${comboIdCounter}`;
}

export function normalizeOption(option: string | ComboOptionData): ComboOptionData {
  if (typeof option === 'string') {
    return {label: option, value: option};
  }
  return option;
}

export function flattenedOptions(options: readonly ComboOption[]): readonly ComboOptionData[] {
  const result: ComboOptionData[] = [];
  for (const option of options) {
    if (typeof option === 'string') {
      result.push(normalizeOption(option));
    } else if ('type' in option) {
      if (option.type === 'section') {
        result.push(...option.options.map(normalizeOption));
      }
    } else {
      result.push(normalizeOption(option));
    }
  }
  return result;
}

export function enabledOptions(options: readonly ComboOptionData[]): readonly ComboOptionData[] {
  return options.filter((option) => option.isDisabled !== true);
}

export function optionId(baseId: string, value: string): string {
  return `${baseId}-option-${value.replaceAll(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function nextEnabledIndex(
  options: readonly ComboOptionData[],
  currentValue: string | null,
  key: string,
): number {
  const enabled = enabledOptions(options);
  if (enabled.length === 0) {
    return -1;
  }
  const currentIndex = enabled.findIndex((option) => option.value === currentValue);
  if (key === 'Home') {
    return options.findIndex((option) => option.value === enabled[0]?.value);
  }
  if (key === 'End') {
    return options.findIndex((option) => option.value === enabled[enabled.length - 1]?.value);
  }
  const direction = key === 'ArrowUp' ? -1 : 1;
  const fallbackIndex = direction > 0 ? -1 : 0;
  const nextEnabled = enabled[(Math.max(currentIndex, fallbackIndex) + direction + enabled.length) % enabled.length];
  return options.findIndex((option) => option.value === nextEnabled?.value);
}

export function itemMatchesQuery(item: SearchableItem, query: string): boolean {
  return item.label.toLowerCase().includes(query.trim().toLowerCase());
}

function isSearchArray<T extends SearchableItem>(source: SearchSourceInput<T>): source is readonly T[] {
  return Array.isArray(source);
}

export function searchSource<T extends SearchableItem>(
  source: SearchSourceInput<T>,
  query: string,
): Promise<readonly T[]> {
  if (isSearchArray(source)) {
    return Promise.resolve(source.filter((item) => itemMatchesQuery(item, query)));
  }
  if (typeof source === 'function') {
    return Promise.resolve(source(query));
  }
  return Promise.resolve(query.trim() === '' && source.bootstrap != null ? source.bootstrap() : source.search(query));
}

export function splitTokenInput(value: string, delimiters: readonly string[]): readonly string[] {
  const escaped = delimiters.map((delimiter) => delimiter.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
  return value.split(new RegExp(`[${escaped}]`)).map((part) => part.trim()).filter((part) => part.length > 0);
}

export function tokenFromText(text: string): TokenizerToken {
  const value = text.trim();
  return {id: value, label: value, value};
}

export function serializeTokens(tokens: readonly TokenizerToken[]): string {
  return JSON.stringify(tokens.map((token) => token.value));
}
