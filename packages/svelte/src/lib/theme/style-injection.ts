// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file style-injection.ts
 * @input Defined theme objects and generated CSS blocks
 * @output Runtime style tags plus cleanup for unbuilt themes
 * @position Browser-only style injection boundary for Svelte themes
 */

import {generateThemeCSS, type DefinedTheme} from './theme.js';

let nextStyleId = 0;

function appendStyle(attributeName: string, themeName: string, text: string, styleId: string): void {
  const style = document.createElement('style');
  style.setAttribute(attributeName, themeName);
  style.setAttribute('data-astryx-id', styleId);
  style.textContent = text;
  document.head.appendChild(style);
}

function removeStyle(attributeName: string, themeName: string, styleId: string): void {
  document
    .querySelector(`style[${attributeName}="${themeName}"][data-astryx-id="${styleId}"]`)
    ?.remove();
}

export function injectThemeStyles(theme: DefinedTheme): () => void {
  if (theme.__built || typeof document === 'undefined') {
    return () => {};
  }

  const css = generateThemeCSS(theme);
  if (!css.prose && !css.component) {
    return () => {};
  }

  nextStyleId += 1;
  const styleId = `astryx-svelte-theme-${nextStyleId}`;

  if (css.prose) {
    appendStyle('data-astryx-theme-prose', theme.name, `@layer reset {\n${css.prose}\n}`, styleId);
  }

  if (css.component) {
    appendStyle(
      'data-astryx-theme',
      theme.name,
      `@layer astryx-theme {\n${css.component}\n}`,
      styleId,
    );
  }

  return () => {
    removeStyle('data-astryx-theme-prose', theme.name, styleId);
    removeStyle('data-astryx-theme', theme.name, styleId);
  };
}
