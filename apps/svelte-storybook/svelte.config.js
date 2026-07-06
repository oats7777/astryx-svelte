// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file svelte.config.js
 * @input Svelte compiler preprocessing defaults
 * @output App-local Svelte configuration for the visual story surface
 * @position Prevents Vite from falling back to implicit Svelte defaults
 */

import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
};
