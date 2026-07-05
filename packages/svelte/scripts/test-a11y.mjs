// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file test-a11y.mjs
 * @input Package-local accessibility family argument
 * @output Vitest accessibility run for Svelte component families
 * @position A11y command adapter for @astryxdesign/svelte
 */

import {spawnSync} from 'node:child_process';

const family = process.argv.slice(2).filter((arg) => arg !== '--')[0];
const familyTargets = {
  forms: 'src/lib/forms/a11y.test.ts',
  overlays: 'src/lib/overlays/a11y.test.ts',
  selection: 'src/lib/selection/a11y.test.ts',
};

const target = family == null ? familyTargets.forms : (familyTargets[family] ?? family);
const result = spawnSync('vitest', ['run', target], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exitCode = result.status ?? 1;
