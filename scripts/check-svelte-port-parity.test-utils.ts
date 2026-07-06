// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared test helpers for the Svelte port parity CLI guard.
 * @input Fixture patch data and CLI arguments.
 * @output Temporary fixture paths, parsed reports, and source entries.
 * @position Keeps parity CLI scenario tests focused on behavior assertions.
 */

import {spawnSync, type SpawnSyncReturns} from 'node:child_process';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {isRecord, type LedgerEntry, type Report, type SurfaceEntry} from '../internal/svelte-port-parity/model';

export const releaseScopes = 'cli,tokens,svelte,lab,vega,docs,storybook,examples,vibe,release';
export const finalReleaseScopes = 'cli,tokens,svelte,lab,vega,docs,storybook,examples,vibe,ci-release';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function runCli(args: readonly string[]): SpawnSyncReturns<string> {
  return spawnSync('pnpm', ['exec', 'tsx', 'scripts/check-svelte-port-parity.ts', ...args], {
    cwd: rootDir,
    encoding: 'utf8',
  });
}

export function sourceEntry(name: string): SurfaceEntry {
  const source = `packages/svelte/src/lib/index.ts#${name}`;
  return {id: `svelte.source-export:${source}`, kind: 'svelte.source-export', source, label: `@astryxdesign/svelte source export ${name}`};
}

export function writeFixture(data: {
  readonly addEntries: readonly Omit<SurfaceEntry, 'id'>[] | readonly SurfaceEntry[];
  readonly addLedgerEntries: readonly LedgerEntry[];
}): {readonly fixturePath: string; readonly tempDir: string} {
  const tempDir = mkdtempSync(join(tmpdir(), 'svelte-port-parity-'));
  const fixturePath = join(tempDir, 'fixture.json');
  writeFileSync(fixturePath, `${JSON.stringify(data, null, 2)}\n`);
  return {fixturePath, tempDir};
}

export function parseReportJson(output: string): Report {
  const parsed: unknown = JSON.parse(output);
  if (!isReportForTest(parsed)) {
    throw new Error('Expected CLI output to contain a parity report');
  }
  return parsed;
}

function isReportForTest(value: unknown): value is Report {
  if (!isRecord(value)) {
    return false;
  }
  const summary = value['summary'];
  const scopes = value['scopes'];
  return (
    typeof value['ok'] === 'boolean' &&
    isRecord(summary) &&
    isRecord(scopes) &&
    typeof summary['missing'] === 'number' &&
    typeof summary['stale'] === 'number' &&
    typeof summary['missingRequiredScopes'] === 'number' &&
    Array.isArray(scopes['required']) &&
    Array.isArray(scopes['missing']) &&
    Array.isArray(value['missing']) &&
    Array.isArray(value['stale'])
  );
}
