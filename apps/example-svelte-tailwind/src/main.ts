// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file main.ts
 * @input Browser DOM root and Svelte App component
 * @output Mounted Astryx Svelte Tailwind example app
 * @position Client entrypoint for apps/example-svelte-tailwind
 */

import {mount} from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app');

if (!(target instanceof HTMLElement)) {
  throw new Error('Missing #app mount target for the Astryx Svelte Tailwind example.');
}

mount(App, {target});
