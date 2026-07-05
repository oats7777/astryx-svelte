// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte Theme component and framework-neutral theme runtime helpers
 * @output Public theme subpath for @astryxdesign/svelte
 * @position Export barrel for @astryxdesign/svelte/theme
 */

export {default as Theme} from './Theme.svelte';
export {
  defineTheme,
  generateThemeCSS,
  resolveThemeTokens,
  ThemeRuntimeError,
  tokenDefaults,
} from './theme.js';
export type {
  ComponentStyleDeclaration,
  ComponentStyleMap,
  DefinedTheme,
  DefineThemeInput,
  EffectiveThemeMode,
  ResolvedTheme,
  ThemeMode,
  ThemeTokenInput,
  ThemeTokenTuple,
  ThemeTokenValue,
} from './theme.js';
export {useTheme} from './use-theme.js';
