// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.config.ts
 * @input Svelte plugin, Astryx Svelte source packages, and token CSS artifacts
 * @output Vite app build that resolves the local Svelte visual surface packages
 * @position Build config for the private @astryxdesign/svelte-storybook app
 */

import {svelte} from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import {defineConfig} from 'vite';

const workspaceRoot = path.resolve(__dirname, '../..');
const svelteSource = path.join(workspaceRoot, 'packages/svelte/src/lib');
const svelteLabSource = path.join(workspaceRoot, 'packages/svelte-lab/src/lib');
const svelteVegaSource = path.join(workspaceRoot, 'packages/svelte-vega/src/lib');
const tokenSource = path.join(workspaceRoot, 'packages/tokens/src');

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: [
      {
        find: '@astryxdesign/svelte/styles.css',
        replacement: path.join(workspaceRoot, 'packages/svelte/dist/styles.css'),
      },
      {
        find: '@astryxdesign/tokens/default.css',
        replacement: path.join(workspaceRoot, 'packages/tokens/dist/default.css'),
      },
      {
        find: '@astryxdesign/tokens/tailwind-theme.css',
        replacement: path.join(workspaceRoot, 'packages/tokens/dist/tailwind-theme.css'),
      },
      {
        find: /^@astryxdesign\/svelte\/(.+)$/,
        replacement: `${svelteSource}/$1`,
      },
      {
        find: '@astryxdesign/svelte',
        replacement: path.join(svelteSource, 'index.ts'),
      },
      {
        find: /^@astryxdesign\/svelte-lab\/(.+)$/,
        replacement: `${svelteLabSource}/$1`,
      },
      {
        find: '@astryxdesign/svelte-lab',
        replacement: path.join(svelteLabSource, 'index.ts'),
      },
      {
        find: /^@astryxdesign\/svelte-vega\/(.+)$/,
        replacement: `${svelteVegaSource}/$1`,
      },
      {
        find: '@astryxdesign/svelte-vega',
        replacement: path.join(svelteVegaSource, 'index.ts'),
      },
      {
        find: '@astryxdesign/tokens',
        replacement: path.join(tokenSource, 'index.ts'),
      },
    ],
  },
  server: {
    host: '127.0.0.1',
  },
  preview: {
    host: '127.0.0.1',
  },
});
