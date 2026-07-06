// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file client.ts
 * @input Server-rendered ThemeRootSyncApp HTML
 * @output Hydrated Svelte client app
 * @position Browser entry for Svelte theme root sync E2E
 */

import {hydrate} from 'svelte';
import ThemeRootSyncApp from './ThemeRootSyncApp.svelte';

const target = document.getElementById('app');

if (target == null) {
  throw new Error('Missing #app hydration target.');
}

hydrate(ThemeRootSyncApp, {
  target,
});
