#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-tailwind-source.mjs
 * @input App CSS path
 * @output Exit status proving Tailwind v4 setup includes Astryx Tailwind styles and app source registration
 * @position Failure QA guard for apps/example-svelte-tailwind
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const cssPath = resolve(process.argv[2] ?? 'src/app.css');
const css = readFileSync(cssPath, 'utf8');

const requiredPatterns = [
  {
    label: 'Tailwind v4 import',
    pattern: /@import\s+["']tailwindcss["']\s*;/,
  },
  {
    label: 'Astryx Svelte Tailwind style import',
    pattern: /@import\s+["']@astryxdesign\/svelte\/tailwind\.css["']/,
  },
  {
    label: 'App Svelte and TypeScript Tailwind source',
    pattern: /@source\s+["'][^"']*\{svelte,ts\}["']\s*;/,
  },
];

const failures = requiredPatterns.filter(({pattern}) => !pattern.test(css));

if (failures.length > 0) {
  console.error(`Tailwind source contract failed for ${cssPath}`);
  for (const failure of failures) {
    console.error(`- Missing: ${failure.label}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Tailwind source contract passed for ${cssPath}`);
}
