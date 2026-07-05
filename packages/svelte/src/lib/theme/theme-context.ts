// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-context.ts
 * @input Svelte component tree context
 * @output Theme provider state and nesting detection helpers
 * @position Internal context bridge for Svelte theme consumers
 */

import {getContext, hasContext, setContext} from 'svelte';
import type {DefinedTheme, ThemeMode} from './theme.js';

export type ThemeContextValue = {
  readonly theme: DefinedTheme;
  readonly mode: ThemeMode;
};

const themeContextKey = Symbol('astryx-theme');
const themeNestingContextKey = Symbol('astryx-theme-nesting');

export function getThemeContext(): ThemeContextValue | null {
  if (!hasContext(themeContextKey)) {
    return null;
  }
  return getContext<ThemeContextValue>(themeContextKey);
}

export function setThemeContext(value: ThemeContextValue): void {
  setContext(themeContextKey, value);
}

export function isNestedTheme(): boolean {
  return hasContext(themeNestingContextKey);
}

export function markThemeNested(): void {
  setContext(themeNestingContextKey, true);
}
