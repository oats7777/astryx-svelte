// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.config.ts
 * @input Svelte Vega package-local Vitest invocation and shared jsdom setup
 * @output Vitest configuration for @astryxdesign/svelte-vega DOM tests
 * @position Test tooling for the private Svelte Vega package
 */

import {svelte} from '@sveltejs/vite-plugin-svelte';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['../../internal/test-utils/src/canvas-setup.ts'],
  },
});
