// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file main.ts
 * @input Browser DOM mount point and root Svelte app component
 * @output Mounted Astryx Svelte storybook visual app
 * @position Client entrypoint for @astryxdesign/svelte-storybook
 */

import {mount} from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-astryx-theme', 'svelte-storybook');

if (target == null) {
  throw new Error('Missing #app mount node for Astryx Svelte Storybook.');
}

mount(App, {target});
