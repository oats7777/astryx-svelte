// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file test.mjs
 * @input Package-local test arguments passed through pnpm
 * @output Vitest invocation that preserves path filters after npm script separators
 * @position Test command adapter for @astryxdesign/svelte-lab
 */

import {spawnSync} from 'node:child_process';

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const result = spawnSync('vitest', ['run', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exitCode = result.status ?? 1;
