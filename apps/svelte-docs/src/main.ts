// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file main.ts
 * @input Browser document and Svelte docs app root
 * @output Mounted docs application
 * @position Entry point for apps/svelte-docs
 */

import './app.css';
import App from './App.svelte';
import {mount} from 'svelte';

mount(App, {
  target: document.getElementById('app') ?? document.body,
});
