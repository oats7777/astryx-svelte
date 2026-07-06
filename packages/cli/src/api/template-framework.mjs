// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Framework-specific template source resolution.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {
  resolveFramework as resolveFrameworkOption,
  supportedFrameworksLabel,
} from '../lib/frameworks.mjs';
import {AstryxError} from './error.mjs';

const SOURCE_EXTENSIONS = ['.svelte'];

export function resolveTemplateFramework(framework) {
  const value = resolveFrameworkOption(framework);
  if (!value) {
    throw new AstryxError(
      `Invalid --framework value "${framework}". Valid frameworks: ${supportedFrameworksLabel()}`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  return value;
}

export function docFramework(doc, sourcePath) {
  if (doc?.framework === 'svelte') return 'svelte';
  if (sourcePath?.endsWith('.svelte')) return 'svelte';
  return 'svelte';
}

export function resolveTemplateSourceFile(dirPath, baseName) {
  const preferred = ['.svelte'];
  for (const ext of preferred) {
    const sourcePath = path.join(dirPath, `${baseName}${ext}`);
    if (fs.existsSync(sourcePath)) return sourcePath;
  }
  for (const ext of SOURCE_EXTENSIONS) {
    const sourcePath = path.join(dirPath, `${baseName}${ext}`);
    if (fs.existsSync(sourcePath)) return sourcePath;
  }
  return null;
}
