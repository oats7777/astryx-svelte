// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file size-context.ts
 * @input Component size values and Svelte context boundary
 * @output Size normalization, class mapping, provider, and consumer helpers
 * @position Svelte replacement for core SizeContext
 */

import {getContext, setContext} from 'svelte';

export type AstryxSize = 'lg' | 'md' | 'sm';

const SIZE_CONTEXT = Symbol('astryx-size-context');

function isAstryxSize(value: string | undefined): value is AstryxSize {
  return value === 'sm' || value === 'md' || value === 'lg';
}

export function normalizeSize(value: string | undefined): AstryxSize {
  return isAstryxSize(value) ? value : 'md';
}

export function sizeClass(value: string | undefined): string {
  return `astryx-size-${normalizeSize(value)}`;
}

export function setSizeContext(value: string | undefined): AstryxSize {
  const normalized = normalizeSize(value);
  setContext(SIZE_CONTEXT, normalized);
  return normalized;
}

export function getSizeContext(fallback: AstryxSize = 'md'): AstryxSize {
  return getContext<AstryxSize>(SIZE_CONTEXT) ?? fallback;
}
