// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.config.ts
 * @input Svelte package-local Vitest invocation and shared jsdom setup
 * @output Vitest configuration for @astryxdesign/svelte internal helpers
 * @position Test/build tooling for the Svelte package
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
    include: ['src/**/*.test.ts', 'src/**/*.test.svelte.ts'],
    exclude: ['src/**/*.ssr.test.ts'],
    setupFiles: ['../../internal/test-utils/src/canvas-setup.ts'],
  },
});
