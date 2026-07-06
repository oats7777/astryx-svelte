// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Target metadata for vibe-test generation, preview builds, and reports
 * @input Target names from the shared vibe-test type model
 * @output Centralized labels, file extensions, docs, and environment paths
 * @position Shared target configuration for internal/vibe-tests scripts
 */

import * as path from 'node:path';
import {TARGET_NAMES, type TargetName} from './types.js';

const TARGET_SET: ReadonlySet<string> = new Set(TARGET_NAMES);

export const TARGET_LABELS = {
  astryx: 'Astryx',
  'astryx-tailwind': 'XDS+TW',
  'astryx-svelte': 'Astryx Svelte',
  baseline: 'Baseline',
  html: 'HTML',
} as const satisfies Record<TargetName, string>;

export const TARGET_SHORT_LABELS = {
  astryx: 'Astryx',
  'astryx-tailwind': 'XDS+TW',
  'astryx-svelte': 'Svelte',
  baseline: 'Base',
  html: 'HTML',
} as const satisfies Record<TargetName, string>;

export const TARGET_AGENT_DOCS = {
  astryx: 'AGENTS.md',
  'astryx-tailwind': 'AGENTS.md',
  'astryx-svelte': 'AGENTS.svelte.md',
  baseline: 'AGENTS.baseline.md',
  html: 'AGENTS.html.md',
} as const satisfies Record<TargetName, string>;

export const TARGET_ENVIRONMENT_DIRS = {
  astryx: 'project-astryx',
  'astryx-tailwind': 'project-astryx-tailwind',
  'astryx-svelte': 'project-astryx-svelte',
  baseline: 'project-baseline',
  html: 'project-html',
} as const satisfies Record<TargetName, string>;

export const TARGET_RESULT_EXTENSIONS = {
  astryx: '.tsx',
  'astryx-tailwind': '.tsx',
  'astryx-svelte': '.svelte',
  baseline: '.tsx',
  html: '.tsx',
} as const satisfies Record<TargetName, '.tsx' | '.svelte'>;

export function isTargetName(value: string | undefined): value is TargetName {
  return value !== undefined && TARGET_SET.has(value);
}

export function isSvelteTarget(target: string): target is 'astryx-svelte' {
  return target === 'astryx-svelte';
}

export function getTargetResultExtension(
  target: TargetName,
): '.tsx' | '.svelte' {
  return TARGET_RESULT_EXTENSIONS[target];
}

export function getTargetEnvironmentPath(
  vibeTestsDir: string,
  target: TargetName,
): string {
  return path.join(
    vibeTestsDir,
    'environments',
    TARGET_ENVIRONMENT_DIRS[target],
  );
}
