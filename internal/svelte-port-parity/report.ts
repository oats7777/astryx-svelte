// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file report.ts
 * @input Source inventory and checked-in parity ledger
 * @output Guard report plus JSON write helpers
 * @position Report layer for the Svelte port parity guard
 */

import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';

import {
  BLOCKING_STATUSES,
  CliError,
  LEDGER_PATH,
  entry,
  isRecord,
  isScope,
  isStatus,
  isSurfaceKind,
  readJsonObject,
  type LedgerEntry,
  type Report,
  type Scope,
  type SurfaceEntry,
} from './model';

function parseLedgerEntry(value: unknown): LedgerEntry {
  if (!isRecord(value)) {
    return {
      ...entry('svelte.package-export', 'invalid-ledger-entry', 'invalid ledger entry'),
      status: 'unclassified',
      rationale: 'Ledger entry is not an object.',
      svelteTarget: 'invalid',
    };
  }
  const id = value['id'];
  const kind = value['kind'];
  const source = value['source'];
  const label = value['label'];
  const status = value['status'];
  const rationale = value['rationale'];
  const svelteTarget = value['svelteTarget'];
  if (
    typeof id !== 'string' ||
    !isSurfaceKind(kind) ||
    typeof source !== 'string' ||
    typeof label !== 'string' ||
    typeof status !== 'string' ||
    typeof rationale !== 'string' ||
    typeof svelteTarget !== 'string'
  ) {
    return {
      id: String(id),
      kind: 'svelte.package-export',
      source: String(source),
      label: String(label),
      status: 'unclassified',
      rationale: 'Ledger entry is missing required typed fields.',
      svelteTarget: 'invalid',
    };
  }
  return {id, kind, source, label, status, rationale, svelteTarget};
}

export function readLedger(root: string): readonly LedgerEntry[] {
  const json = readJsonObject(root, LEDGER_PATH);
  const entries = json['entries'];
  if (!Array.isArray(entries)) {
    throw new CliError(`${LEDGER_PATH} must contain an entries array`);
  }
  return entries.map(parseLedgerEntry);
}

export function buildReport(
  sourceEntries: readonly SurfaceEntry[],
  ledgerEntries: readonly LedgerEntry[],
  requiredScopes: readonly Scope[] = [],
): Report {
  const ledgerById = new Map(ledgerEntries.map((item) => [item.id, item]));
  const sourceById = new Map(sourceEntries.map((item) => [item.id, item]));
  const missing = sourceEntries.filter((item) => !ledgerById.has(item.id));
  const unclassified = ledgerEntries.filter(
    (item) => !isStatus(item.status) || BLOCKING_STATUSES.has(item.status),
  );
  const mvpOnly = ledgerEntries.filter(
    (item) => item.status === 'mvp-only' || item.rationale.toLowerCase().includes('mvp-only'),
  );
  const placeholderEquivalent = ledgerEntries.filter(isPlaceholderEquivalent);
  const deprecatedWithoutRationale = ledgerEntries.filter(
    (item) => item.status === 'deprecated-with-rationale' && !hasVerifiedDeprecationRationale(item),
  );
  const stale = ledgerEntries.filter((item) => !sourceById.has(item.id));
  const scopes = buildScopeReport(sourceEntries, ledgerEntries, stale, requiredScopes);
  return {
    ok:
      missing.length === 0 &&
      unclassified.length === 0 &&
      mvpOnly.length === 0 &&
      placeholderEquivalent.length === 0 &&
      deprecatedWithoutRationale.length === 0 &&
      stale.length === 0 &&
      scopes.missing.length === 0,
    generatedAt: new Date().toISOString(),
    ledgerPath: LEDGER_PATH,
    summary: {
      sourceEntries: sourceEntries.length,
      ledgerEntries: ledgerEntries.length,
      missing: missing.length,
      unclassified: unclassified.length,
      mvpOnly: mvpOnly.length,
      placeholderEquivalent: placeholderEquivalent.length,
      deprecatedWithoutRationale: deprecatedWithoutRationale.length,
      stale: stale.length,
      requiredScopes: scopes.required.length,
      missingRequiredScopes: scopes.missing.length,
    },
    scopes,
    missing,
    unclassified,
    mvpOnly,
    placeholderEquivalent,
    deprecatedWithoutRationale,
    stale,
  };
}

function buildScopeReport(
  sourceEntries: readonly SurfaceEntry[],
  ledgerEntries: readonly LedgerEntry[],
  staleEntries: readonly LedgerEntry[],
  requiredScopes: readonly Scope[],
): Report['scopes'] {
  const checked = uniqueScopes(sourceEntries.map(scopeForEntry).filter(isScope));
  const required = uniqueScopes(requiredScopes);
  const missing = required.filter((scope) => !checked.includes(scope));
  const detailScopes = uniqueScopes([...checked, ...required]);
  return {
    required,
    checked,
    missing,
    details: detailScopes.map((scope) => ({
      scope,
      sourceEntries: sourceEntries.filter((entry) => scopeForEntry(entry) === scope).length,
      ledgerEntries: ledgerEntries.filter((entry) => scopeForEntry(entry) === scope).length,
      staleEntries: staleEntries.filter((entry) => scopeForEntry(entry) === scope).length,
    })),
  };
}

function uniqueScopes(scopes: readonly Scope[]): readonly Scope[] {
  return [...new Set(scopes)];
}

function scopeForEntry(entry: SurfaceEntry): Scope | undefined {
  const [scope] = entry.kind.split('.');
  return isScope(scope) ? scope : undefined;
}

function hasVerifiedDeprecationRationale(entry: LedgerEntry): boolean {
  const rationale = entry.rationale.trim().toLowerCase();
  const target = entry.svelteTarget.trim().toLowerCase();
  return rationale.length > 0 && !rationale.includes('todo') && target.length > 0 && target !== 'planned-equivalent';
}

function isPlaceholderEquivalent(entry: LedgerEntry): boolean {
  return entry.svelteTarget.trim().toLowerCase() === 'planned-equivalent';
}

export function writeJson(root: string, path: string, data: unknown): void {
  const absolutePath = resolve(root, path);
  mkdirSync(dirname(absolutePath), {recursive: true});
  writeFileSync(absolutePath, `${JSON.stringify(data, null, 2)}\n`);
}
