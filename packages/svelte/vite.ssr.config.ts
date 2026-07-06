// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.ssr.config.ts
 * @input Package-local Vitest SSR invocation
 * @output Node-environment Svelte SSR test configuration
 * @position Test tooling for @astryxdesign/svelte SSR safety
 */

import {svelte} from '@sveltejs/vite-plugin-svelte';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'node',
    include: ['src/**/*.ssr.test.ts'],
  },
});
