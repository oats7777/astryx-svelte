// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ssr.test.ts
 * @input Svelte server render of Theme
 * @output SSR-safe import/render assertions without browser globals
 * @position Node-environment tests for reusable Svelte theme runtime
 */

import {render} from 'svelte/server';
import {describe, expect, it} from 'vitest';
import ThemeSSRProbe from './test-fixtures/ThemeSSRProbe.svelte';
import {defineTheme} from './theme.js';

const ssrTheme = defineTheme({
  name: 'ssr',
  tokens: {
    '--color-accent': ['#123456', '#ABCDEF'],
  },
});

describe('Svelte Theme SSR safety', () => {
  it('Given no document or window When server rendered Then emits themed markup without browser access', () => {
    const result = render(ThemeSSRProbe, {
      props: {theme: ssrTheme, mode: 'dark'},
    });

    expect(result.body).toContain('data-astryx-theme="ssr"');
    expect(result.body).toContain('data-theme="dark"');
    expect(result.body).toContain('SSR child');
  });
});
