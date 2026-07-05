// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file root-sync.ts
 * @input Theme root/nested state, mode, and theme name
 * @output Browser document root data attributes and cleanup callback
 * @position DOM boundary for Svelte theme portal reach
 */

import type {ThemeMode} from './theme.js';

export function syncRootTheme(isNested: boolean, mode: ThemeMode, themeName: string): () => void {
  if (isNested || typeof document === 'undefined') {
    return () => {};
  }

  if (mode === 'light' || mode === 'dark') {
    document.documentElement.setAttribute('data-theme', mode);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  document.documentElement.setAttribute('data-astryx-theme', themeName);

  return () => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-astryx-theme');
  };
}
