#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  renderDefaultTokenCSS,
  renderTailwindThemeCSS,
  renderTokenJSON,
} from '../dist/index.js';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(packageDir, 'dist');

mkdirSync(distDir, {recursive: true});
writeFileSync(resolve(distDir, 'default.css'), renderDefaultTokenCSS());
writeFileSync(resolve(distDir, 'tailwind-theme.css'), renderTailwindThemeCSS());
writeFileSync(resolve(distDir, 'tokens.json'), renderTokenJSON());

console.log('✓ emitted default.css, tailwind-theme.css, and tokens.json');
