// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file model.ts
 * @input Svelte parity guard data contracts
 * @output Shared types, constants, and boundary helpers
 * @position Internal model layer for the Svelte port parity guard
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

export const LEDGER_PATH = 'internal/svelte-port-parity-ledger.json';

export const BLOCKING_STATUSES: ReadonlySet<string> = new Set([
  'missing',
  'unclassified',
  'mvp-only',
]);

export const VALID_STATUSES: ReadonlySet<string> = new Set([
  'implemented',
  'replaced-by-equivalent',
  'deprecated-with-rationale',
]);

const SURFACE_KIND_VALUES = [
  'cli.bin',
  'cli.doc',
  'cli.package-export',
  'cli.source',
  'cli.template',
  'cli.test',
  'docs.package-entry',
  'docs.source',
  'docs.test',
  'examples.package-entry',
  'examples.source',
  'examples.test',
  'lab.package-entry',
  'lab.package-export',
  'lab.source-export',
  'lab.doc',
  'lab.source',
  'lab.test',
  'ci-release.doc',
  'ci-release.package-script',
  'ci-release.workflow',
  'release.doc',
  'release.script',
  'release.workflow',
  'storybook.e2e',
  'storybook.package-entry',
  'storybook.script',
  'storybook.source',
  'storybook.style',
  'storybook.test',
  'storybook.visual',
  'svelte.doc',
  'svelte.package-entry',
  'svelte.package-export',
  'svelte.script',
  'svelte.source',
  'svelte.source-export',
  'svelte.style',
  'svelte.test',
  'tokens.package-entry',
  'tokens.package-export',
  'tokens.script',
  'tokens.source',
  'tokens.style',
  'tokens.test',
  'vibe.package-entry',
  'vibe.source',
  'vibe.test',
  'vega.package-entry',
  'vega.package-export',
  'vega.doc',
  'vega.source',
  'vega.source-export',
  'vega.test',
] as const;

const SCOPE_VALUES = [
  'cli',
  'docs',
  'examples',
  'lab',
  'ci-release',
  'release',
  'storybook',
  'svelte',
  'tokens',
  'vega',
  'vibe',
] as const;

const SURFACE_KINDS: ReadonlySet<string> = new Set(SURFACE_KIND_VALUES);
const SCOPES: ReadonlySet<string> = new Set(SCOPE_VALUES);

export type SurfaceKind = (typeof SURFACE_KIND_VALUES)[number];

export type Scope = (typeof SCOPE_VALUES)[number];

export type Status = 'implemented' | 'replaced-by-equivalent' | 'deprecated-with-rationale';

export type SurfaceEntry = {
  readonly id: string;
  readonly kind: SurfaceKind;
  readonly source: string;
  readonly label: string;
};

export type LedgerEntry = SurfaceEntry & {
  readonly status: string;
  readonly rationale: string;
  readonly svelteTarget: string;
};

export type Report = {
  readonly ok: boolean;
  readonly generatedAt: string;
  readonly ledgerPath: string;
  readonly summary: {
    readonly sourceEntries: number;
    readonly ledgerEntries: number;
    readonly missing: number;
    readonly unclassified: number;
    readonly mvpOnly: number;
    readonly placeholderEquivalent: number;
    readonly deprecatedWithoutRationale: number;
    readonly stale: number;
    readonly requiredScopes: number;
    readonly missingRequiredScopes: number;
  };
  readonly scopes: {
    readonly required: readonly Scope[];
    readonly checked: readonly Scope[];
    readonly missing: readonly Scope[];
    readonly details: readonly {
      readonly scope: Scope;
      readonly sourceEntries: number;
      readonly ledgerEntries: number;
      readonly staleEntries: number;
    }[];
  };
  readonly missing: readonly SurfaceEntry[];
  readonly unclassified: readonly LedgerEntry[];
  readonly mvpOnly: readonly LedgerEntry[];
  readonly placeholderEquivalent: readonly LedgerEntry[];
  readonly deprecatedWithoutRationale: readonly LedgerEntry[];
  readonly stale: readonly LedgerEntry[];
};

export type CliOptions = {
  readonly failOnMissing: boolean;
  readonly failOnMvp: boolean;
  readonly failOnUnverifiedDeprecations: boolean;
  readonly families?: readonly string[];
  readonly fixturePath?: string;
  readonly requiredScopes: readonly Scope[];
  readonly writePath?: string;
  readonly writeLedgerPath?: string;
};

export class CliError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSurfaceKind(value: unknown): value is SurfaceKind {
  return typeof value === 'string' && SURFACE_KINDS.has(value);
}

export function isScope(value: unknown): value is Scope {
  return typeof value === 'string' && SCOPES.has(value);
}

export function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && VALID_STATUSES.has(value);
}

export function readJsonObject(root: string, path: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
    if (!isRecord(parsed)) {
      throw new CliError(`${path} must contain a JSON object`);
    }
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new CliError(`${path} is malformed JSON: ${error.message}`);
    }
    throw error;
  }
}

export function entry(kind: SurfaceKind, source: string, label: string): SurfaceEntry {
  return {id: `${kind}:${source}`, kind, source, label};
}

export function uniqueEntries(entries: readonly SurfaceEntry[]): readonly SurfaceEntry[] {
  return [...new Map(entries.map((item) => [item.id, item])).values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}
