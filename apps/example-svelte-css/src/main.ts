// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file main.ts
 * @input Browser DOM root and Svelte App component
 * @output Mounted Astryx Svelte plain CSS example app
 * @position Client entrypoint for apps/example-svelte-css
 */

import {mount} from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');

if (!(target instanceof HTMLElement)) {
  throw new Error('Missing #app mount target for the Astryx Svelte plain CSS example.');
}

mount(App, {target});

