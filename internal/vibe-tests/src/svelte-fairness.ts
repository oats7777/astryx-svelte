// Copyright (c) Meta Platforms, Inc. and affiliates.

/// <reference types="node" />
/**
 * @file Svelte-specific fairness guardrails for vibe-test task prompts
 * @input Parsed fairness task records and the representative Svelte environment
 * @output Fairness issues for stale target metadata or environment drift
 * @position Svelte extension for internal/vibe-tests/src/check-fairness.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_TESTS_DIR = path.resolve(__dirname, '..');

export const SVELTE_TARGET = 'astryx-svelte';

const SVELTE_REQUIRED_PROMPT_PHRASES = [
  'Svelte component code',
  'Astryx Svelte',
  'Your project is at',
  'AGENTS.svelte.md',
  '.svelte',
] as const;

const SVELTE_REQUIRED_CSS_SNIPPETS = [
  "@import 'tailwindcss';",
  "@import '@astryxdesign/svelte/tailwind.css';",
  '@source "./**/*.{svelte,ts}";',
] as const;

const SVELTE_REQUIRED_README_SNIPPETS = [
  'npx astryx docs svelte --dense',
  "import('@astryxdesign/svelte/docs.mjs')",
  '@astryxdesign/svelte',
  '@astryxdesign/svelte/tailwind.css',
  '@source "./**/*.{svelte,ts}"',
] as const;

export type SvelteFairnessTask = {
  readonly promptId: string;
  readonly subagentPrompt: string;
  readonly target?: string;
};

export type SvelteFairnessIssue = {
  readonly file: string;
  readonly promptId: string;
  readonly rule: string;
  readonly detail: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

export function inspectSvelteTask(
  task: SvelteFairnessTask,
  file: string,
): readonly SvelteFairnessIssue[] {
  if (task.target !== SVELTE_TARGET) {
    return [];
  }

  return SVELTE_REQUIRED_PROMPT_PHRASES.filter(
    phrase => !task.subagentPrompt.includes(phrase),
  ).map(phrase => ({
    file,
    promptId: task.promptId,
    rule: 'svelte-target-metadata',
    detail: `Svelte task prompt must include "${phrase}"`,
  }));
}

function addMissingSnippetIssues(
  issues: SvelteFairnessIssue[],
  file: string,
  promptId: string,
  rule: string,
  content: string,
  snippets: readonly string[],
): void {
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      issues.push({
        file,
        promptId,
        rule,
        detail: `Missing required Svelte environment snippet "${snippet}"`,
      });
    }
  }
}

function readPackageDependency(
  packageData: Record<string, unknown>,
  field: 'dependencies' | 'devDependencies',
  name: string,
): string | null {
  const dependencies = readRecord(packageData[field]);
  if (dependencies === null) {
    return null;
  }
  return readString(dependencies[name]);
}

function addPackageDependencyIssue(
  issues: SvelteFairnessIssue[],
  packageJsonPath: string,
  field: 'dependencies' | 'devDependencies',
  name: string,
  actual: string | null,
): void {
  if (actual !== null) {
    return;
  }

  issues.push({
    file: packageJsonPath,
    promptId: 'astryx-svelte-environment',
    rule: 'svelte-environment-package',
    detail: `Missing ${field}.${name}`,
  });
}

function inspectPackageJson(packageJsonPath: string): readonly SvelteFairnessIssue[] {
  const issues: SvelteFairnessIssue[] = [];
  const packageData = readRecord(
    JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')),
  );

  if (packageData === null) {
    return [
      {
        file: packageJsonPath,
        promptId: 'astryx-svelte-environment',
        rule: 'svelte-environment-package',
        detail: 'Svelte environment package.json must be an object',
      },
    ];
  }

  for (const name of ['@astryxdesign/svelte', '@astryxdesign/tokens', 'svelte']) {
    addPackageDependencyIssue(
      issues,
      packageJsonPath,
      'dependencies',
      name,
      readPackageDependency(packageData, 'dependencies', name),
    );
  }

  for (const name of ['@astryxdesign/cli', '@tailwindcss/vite', 'tailwindcss']) {
    addPackageDependencyIssue(
      issues,
      packageJsonPath,
      'devDependencies',
      name,
      readPackageDependency(packageData, 'devDependencies', name),
    );
  }

  return issues;
}

export function inspectSvelteEnvironment(): readonly SvelteFairnessIssue[] {
  const issues: SvelteFairnessIssue[] = [];
  const environmentDir = path.join(
    VIBE_TESTS_DIR,
    'environments',
    'project-astryx-svelte',
  );
  const readmePath = path.join(environmentDir, 'README.md');
  const packageJsonPath = path.join(environmentDir, 'package.json');
  const appCssPath = path.join(environmentDir, 'src', 'app.css');

  for (const requiredPath of [readmePath, packageJsonPath, appCssPath]) {
    if (!fs.existsSync(requiredPath)) {
      issues.push({
        file: requiredPath,
        promptId: 'astryx-svelte-environment',
        rule: 'svelte-environment-file',
        detail: 'Missing required Astryx Svelte environment file',
      });
    }
  }

  if (fs.existsSync(readmePath)) {
    addMissingSnippetIssues(
      issues,
      readmePath,
      'astryx-svelte-environment',
      'svelte-environment-readme',
      fs.readFileSync(readmePath, 'utf-8'),
      SVELTE_REQUIRED_README_SNIPPETS,
    );
  }

  if (fs.existsSync(appCssPath)) {
    addMissingSnippetIssues(
      issues,
      appCssPath,
      'astryx-svelte-environment',
      'svelte-environment-tailwind-source',
      fs.readFileSync(appCssPath, 'utf-8'),
      SVELTE_REQUIRED_CSS_SNIPPETS,
    );
  }

  if (fs.existsSync(packageJsonPath)) {
    issues.push(...inspectPackageJson(packageJsonPath));
  }

  return issues;
}
