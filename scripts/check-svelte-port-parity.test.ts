// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Test coverage for the Svelte full-port parity guard CLI.
 * @input Fixture data under internal/fixtures.
 * @output Assertions over process exit codes and JSON summaries.
 * @position Protects the Todo 1 scope guard from silently accepting untracked surfaces.
 */

import {spawnSync, type SpawnSyncReturns} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {describe, expect, test} from 'vitest';

import {buildReport} from '../internal/svelte-port-parity/report';
import {isRecord, type LedgerEntry, type Report, type SurfaceEntry} from '../internal/svelte-port-parity/model';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const releaseScopes = 'cli,tokens,svelte,lab,vega,docs,storybook,examples,vibe,release';
const finalReleaseScopes = 'cli,tokens,svelte,lab,vega,docs,storybook,examples,vibe,ci-release';

function runCli(args: readonly string[]): SpawnSyncReturns<string> {
  return spawnSync('pnpm', ['exec', 'tsx', 'scripts/check-svelte-port-parity.ts', ...args], {
    cwd: rootDir,
    encoding: 'utf8',
  });
}

function sourceEntry(name: string): SurfaceEntry {
  const source = `packages/svelte/src/lib/index.ts#${name}`;
  return {id: `svelte.source-export:${source}`, kind: 'svelte.source-export', source, label: `@astryxdesign/svelte source export ${name}`};
}

function writeFixture(data: {
  readonly addEntries: readonly Omit<SurfaceEntry, 'id'>[] | readonly SurfaceEntry[]; readonly addLedgerEntries: readonly LedgerEntry[];
}): {readonly fixturePath: string; readonly tempDir: string} {
  const tempDir = mkdtempSync(join(tmpdir(), 'svelte-port-parity-'));
  const fixturePath = join(tempDir, 'fixture.json');
  writeFileSync(fixturePath, `${JSON.stringify(data, null, 2)}\n`);
  return {fixturePath, tempDir};
}

function parseReportJson(output: string): Report {
  const parsed: unknown = JSON.parse(output);
  if (!isReportForTest(parsed)) throw new Error('Expected CLI output to contain a parity report');
  return parsed;
}

function isReportForTest(value: unknown): value is Report {
  if (!isRecord(value)) return false;
  const summary = value['summary'];
  const scopes = value['scopes'];
  return (
    typeof value['ok'] === 'boolean' && isRecord(summary) && isRecord(scopes) &&
    typeof summary['missing'] === 'number' && typeof summary['stale'] === 'number' &&
    typeof summary['missingRequiredScopes'] === 'number' && Array.isArray(scopes['required']) &&
    Array.isArray(scopes['missing']) && Array.isArray(value['missing']) && Array.isArray(value['stale'])
  );
}

describe('check-svelte-port-parity CLI', () => {
  test('Given a fixture export outside the ledger When fail-on-missing runs Then missing entries are reported', () => {
    const result = runCli(['--fixture', 'internal/fixtures/svelte-port-missing-export.json', '--fail-on-missing']);
    const report = parseReportJson(result.stdout);

    expect(result.status).toBe(1);
    expect(report.ok).toBe(false);
    expect(report.summary.missing).toBeGreaterThan(0);
    expect(report.missing.some((entry) => entry.id === 'svelte.package-export:fixture:packages/svelte/package.json#exports[./FixtureMissingExport]')).toBe(true);
  });

  test('Given final hardening flags When parity guard runs Then deprecated rationale accounting is emitted', () => {
    const result = runCli(['--fail-on-missing', '--fail-on-unverified-deprecations']);

    expect(result.stderr).not.toContain('Unknown option');
    expect(JSON.parse(result.stdout)).toMatchObject({summary: {deprecatedWithoutRationale: expect.any(Number)}});
  });

  test('Given final-wave F4 flags When parity guard runs Then scope coverage is written to JSON', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'svelte-port-parity-'));
    const reportPath = join(tempDir, 'report.json');
    try {
      const result = runCli([
        '--fail-on-missing',
        '--fail-on-unverified-deprecations',
        '--require-scope',
        releaseScopes,
        '--fail-on-mvp',
        '--write',
        reportPath,
      ]);

      expect(result.stderr).not.toContain('Unknown option');
      expect(parseReportJson(readFileSync(reportPath, 'utf8'))).toMatchObject({
        scopes: {required: releaseScopes.split(','), missing: []},
        summary: {missingRequiredScopes: 0},
      });
    } finally {
      rmSync(tempDir, {force: true, recursive: true});
    }
  });

  test('Given final Todo 12 scopes When parity guard runs Then required scopes are accepted and checked', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'svelte-port-parity-'));
    const reportPath = join(tempDir, 'report.json');
    try {
      const result = runCli(['--require-scope', finalReleaseScopes, '--write', reportPath]);

      expect(result.stderr).not.toContain('Unknown scope');
      expect(result.status).toBe(0);
      expect(parseReportJson(readFileSync(reportPath, 'utf8'))).toMatchObject({
        scopes: {required: finalReleaseScopes.split(','), missing: []},
        summary: {missingRequiredScopes: 0},
      });
    } finally {
      rmSync(tempDir, {force: true, recursive: true});
    }
  });

  test('Given a filtered inventory When a required new scope has no checked entries Then the CLI exits nonzero', () => {
    const result = runCli(['--families', 'vega', '--require-scope', 'svelte']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('missingRequiredScopes=svelte');
    expect(parseReportJson(result.stdout)).toMatchObject({scopes: {required: ['svelte'], missing: ['svelte']}});
  });

  test('Given a filtered inventory When a required scope has no checked entries Then the CLI exits nonzero', () => {
    const result = runCli(['--families', 'actions', '--require-scope', 'svelte,tokens']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('missingRequiredScopes=tokens');
    expect(parseReportJson(result.stdout)).toMatchObject({scopes: {required: ['svelte', 'tokens'], missing: ['tokens']}});
  });

  test('Given an MVP-only fixture entry When fail-on-mvp runs Then the CLI exits nonzero', () => {
    const source = sourceEntry('ExperimentalMvp');
    const {fixturePath, tempDir} = writeFixture({
      addEntries: [source],
      addLedgerEntries: [
        {
          ...source,
          status: 'mvp-only',
          rationale: 'MVP-only placeholder for final-wave parity.',
          svelteTarget: 'packages/svelte/src/lib/experimental/ExperimentalMvp.svelte',
        },
      ],
    });
    try {
      const result = runCli(['--fixture', fixturePath, '--fail-on-mvp']);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('mvpOnly=1');
      expect(parseReportJson(result.stdout)).toMatchObject({summary: {mvpOnly: 1}});
    } finally {
      rmSync(tempDir, {force: true, recursive: true});
    }
  });

  test('Given deprecated entries without a concrete rationale When report builds Then they are blocking', () => {
    const source = sourceEntry('LegacyThing');
    const report = buildReport([source], [
      {...source, status: 'deprecated-with-rationale', rationale: 'TODO decide later.', svelteTarget: 'planned-equivalent'},
    ]);

    expect(report.ok).toBe(false);
    expect(report.summary.deprecatedWithoutRationale).toBe(1);
    expect(report.deprecatedWithoutRationale[0]?.id).toBe(source.id);
  });

  test('Given a planned-equivalent replacement When report builds Then the placeholder is blocking', () => {
    const source = sourceEntry('PlaceholderThing');
    const report = buildReport([source], [
      {
        ...source,
        status: 'replaced-by-equivalent',
        rationale: 'Will be covered by the Svelte equivalent.',
        svelteTarget: 'planned-equivalent',
      },
    ]);

    expect(report.ok).toBe(false);
    expect(report.summary.placeholderEquivalent).toBe(1);
    expect(report.placeholderEquivalent[0]?.id).toBe(source.id);
  });

  test('Given an implemented planned-equivalent target When report builds Then the placeholder is blocking', () => {
    const source = sourceEntry('ImplementedPlaceholderThing');
    const report = buildReport([source], [
      {
        ...source,
        status: 'implemented',
        rationale: 'Implementation still points at a planned equivalent placeholder.',
        svelteTarget: 'planned-equivalent',
      },
    ]);

    expect(report.ok).toBe(false);
    expect(report.summary.placeholderEquivalent).toBe(1);
    expect(report.placeholderEquivalent[0]?.id).toBe(source.id);
  });

  test('Given a stale ledger entry When report builds Then stale rows are blocking', () => {
    const stale = {
      ...sourceEntry('StaleThing'),
      status: 'implemented',
      rationale: 'Implemented by a concrete Svelte component.',
      svelteTarget: 'packages/svelte/src/lib/StaleThing.svelte',
    };
    const report = buildReport([], [stale]);

    expect(report.ok).toBe(false);
    expect(report.summary.stale).toBe(1);
    expect(report.stale[0]?.id).toBe(stale.id);
  });

  test('Given a stale fixture row When fail gates run Then the CLI exits nonzero with stale signal', () => {
    const stale = {
      ...sourceEntry('StaleCliThing'),
      status: 'implemented',
      rationale: 'Implemented by a concrete Svelte component.',
      svelteTarget: 'packages/svelte/src/lib/StaleCliThing.svelte',
    };
    const {fixturePath, tempDir} = writeFixture({addEntries: [], addLedgerEntries: [stale]});
    try {
      const result = runCli(['--fixture', fixturePath, '--fail-on-missing']);
      const report = parseReportJson(result.stdout);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('stale=');
      expect(report.ok).toBe(false);
      expect(report.summary.stale).toBeGreaterThan(0);
      expect(report.stale.some((entry) => entry.id === stale.id)).toBe(true);
    } finally {
      rmSync(tempDir, {force: true, recursive: true});
    }
  });

  test('Given an implemented planned-equivalent fixture row When fail gates run Then the CLI exits nonzero with placeholder signal', () => {
    const source = sourceEntry('ImplementedPlaceholderCliThing');
    const {fixturePath, tempDir} = writeFixture({
      addEntries: [source],
      addLedgerEntries: [
        {
          ...source,
          status: 'implemented',
          rationale: 'Implementation still points at a planned equivalent placeholder.',
          svelteTarget: 'planned-equivalent',
        },
      ],
    });
    try {
      const result = runCli(['--fixture', fixturePath, '--fail-on-missing']);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('placeholderEquivalent=1');
      expect(parseReportJson(result.stdout)).toMatchObject({ok: false, summary: {placeholderEquivalent: 1}});
    } finally {
      rmSync(tempDir, {force: true, recursive: true});
    }
  });

  test('Given a planned-equivalent fixture row When fail gates run Then the CLI exits nonzero with placeholder signal', () => {
    const source = sourceEntry('PlaceholderCliThing');
    const {fixturePath, tempDir} = writeFixture({
      addEntries: [source],
      addLedgerEntries: [
        {
          ...source,
          status: 'replaced-by-equivalent',
          rationale: 'Will be covered by the Svelte equivalent.',
          svelteTarget: 'planned-equivalent',
        },
      ],
    });
    try {
      const result = runCli(['--fixture', fixturePath, '--fail-on-missing']);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain('placeholderEquivalent=1');
      expect(parseReportJson(result.stdout)).toMatchObject({ok: false, summary: {placeholderEquivalent: 1}});
    } finally {
      rmSync(tempDir, {force: true, recursive: true});
    }
  });
});
