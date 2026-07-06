// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file use-theme.ts
 * @input Nearest Svelte Theme context and default token metadata
 * @output Resolved theme name, effective mode, and token lookup API
 * @position Consumer access helper for non-CSS Svelte theme integrations
 */

import {getThemeContext} from './theme-context.js';
import {
  assertThemeMode,
  resolveThemeTokens,
  type EffectiveThemeMode,
  type ResolvedTheme,
  type ThemeMode,
} from './theme.js';

function resolveSystemMode(): EffectiveThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function effectiveMode(mode: ThemeMode): EffectiveThemeMode {
  return mode === 'system' ? resolveSystemMode() : mode;
}

export function useTheme(): ResolvedTheme {
  const context = getThemeContext();

  return {
    get name() {
      return context?.theme.name ?? 'default';
    },
    get mode() {
      return effectiveMode(assertThemeMode(context?.mode ?? 'system'));
    },
    token(name: string) {
      return this.tokens[name] ?? '';
    },
    get tokens() {
      return resolveThemeTokens(context?.theme ?? null, {mode: this.mode});
    },
  };
}
