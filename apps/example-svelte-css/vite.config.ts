// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.config.ts
 * @input Svelte Vite plugin
 * @output Production and development Vite configuration for the plain CSS example
 * @position App-local build entry for apps/example-svelte-css
 */

import {svelte} from '@sveltejs/vite-plugin-svelte';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
});

