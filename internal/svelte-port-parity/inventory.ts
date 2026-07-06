// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inventory.ts
 * @input Current core, lab, Vega package source files
 * @output Live source inventory and initial ledger entries
 * @position Source enumeration layer for the Svelte port parity guard
 */

import {existsSync, readdirSync} from 'node:fs';
import {join, relative, resolve} from 'node:path';

import * as ts from 'typescript';

import {
  CliError,
  entry,
  isRecord,
  isSurfaceKind,
  readJsonObject,
  uniqueEntries,
  type LedgerEntry,
  type SurfaceEntry,
  type SurfaceKind,
} from './model';

type FileMatchRequest = {
  readonly dirPath: string;
  readonly kind: SurfaceKind;
  readonly pattern: RegExp;
  readonly label: string;
};

type PackageScriptRequest = {
  readonly packageJsonPath: string;
  readonly kind: SurfaceKind;
  readonly packageName: string;
  readonly scripts: readonly string[];
};

export type FixtureEntries = {
  readonly sourceEntries: readonly SurfaceEntry[];
  readonly ledgerEntries: readonly LedgerEntry[];
};

function packageExports(root: string, packageJsonPath: string, kind: SurfaceKind, packageName: string) {
  const packageJson = readJsonObject(root, packageJsonPath);
  const exportsValue = packageJson['exports'];
  if (!isRecord(exportsValue)) {
    return [];
  }
  return Object.keys(exportsValue)
    .sort()
    .map((exportKey) =>
      entry(kind, `${packageJsonPath}#exports[${exportKey}]`, `${packageName} export ${exportKey}`),
    );
}

function packageEntries(root: string, packageJsonPath: string, kind: SurfaceKind, packageName: string) {
  const packageJson = readJsonObject(root, packageJsonPath);
  return ['main', 'types']
    .filter((field) => typeof packageJson[field] === 'string')
    .map((field) => entry(kind, `${packageJsonPath}#${field}`, `${packageName} ${field}`));
}

function packageBins(root: string, packageJsonPath: string, kind: SurfaceKind, packageName: string) {
  const packageJson = readJsonObject(root, packageJsonPath);
  const bin = packageJson['bin'];
  if (typeof bin === 'string') {
    return [entry(kind, `${packageJsonPath}#bin`, `${packageName} bin`)];
  }
  if (!isRecord(bin)) {
    return [];
  }
  return Object.keys(bin)
    .sort()
    .filter((field) => typeof bin[field] === 'string')
    .map((field) => entry(kind, `${packageJsonPath}#bin[${field}]`, `${packageName} bin ${field}`));
}

function packageScripts(root: string, request: PackageScriptRequest) {
  const packageJson = readJsonObject(root, request.packageJsonPath);
  const scripts = packageJson['scripts'];
  if (!isRecord(scripts)) {
    return [];
  }
  return request.scripts
    .filter((scriptName) => typeof scripts[scriptName] === 'string')
    .map((scriptName) =>
      entry(
        request.kind,
        `${request.packageJsonPath}#scripts[${scriptName}]`,
        `${request.packageName} script ${scriptName}`,
      ),
    );
}

function sourceExports(root: string, sourcePath: string, kind: SurfaceKind, packageName: string) {
  const absolutePath = resolve(root, sourcePath);
  const program = ts.createProgram([absolutePath], {
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  });
  const source = program.getSourceFile(absolutePath);
  if (source == null) {
    throw new CliError(`Unable to read ${sourcePath}`);
  }
  const symbol = program.getTypeChecker().getSymbolAtLocation(source);
  if (symbol == null) {
    throw new CliError(`Unable to inspect exports for ${sourcePath}`);
  }
  return program
    .getTypeChecker()
    .getExportsOfModule(symbol)
    .map((exported) => exported.getName())
    .sort()
    .map((name) => entry(kind, `${sourcePath}#${name}`, `${packageName} source export ${name}`));
}

function walkFiles(root: string, dirPath: string): readonly string[] {
  const absoluteDir = resolve(root, dirPath);
  if (!existsSync(absoluteDir)) {
    return [];
  }
  return readdirSync(absoluteDir, {withFileTypes: true}).flatMap((item) => {
    const child = join(absoluteDir, item.name);
    const childPath = relative(root, child);
    return item.isDirectory() ? walkFiles(root, childPath) : [childPath];
  });
}

function matchedFiles(root: string, request: FileMatchRequest): readonly SurfaceEntry[] {
  return walkFiles(root, request.dirPath)
    .filter((filePath) => request.pattern.test(filePath))
    .sort()
    .map((filePath) => entry(request.kind, filePath, `${request.label} ${filePath}`));
}

function matchedFileGroups(root: string, requests: readonly FileMatchRequest[]): readonly SurfaceEntry[] {
  return requests.flatMap((request) => matchedFiles(root, request));
}

function existingFiles(root: string, files: readonly {readonly path: string; readonly kind: SurfaceKind; readonly label: string}[]) {
  return files
    .filter((file) => existsSync(resolve(root, file.path)))
    .map((file) => entry(file.kind, file.path, file.label));
}

export function sourceInventory(root: string): readonly SurfaceEntry[] {
  return uniqueEntries([
    ...packageExports(root, 'packages/cli/package.json', 'cli.package-export', '@astryxdesign/cli'),
    ...packageBins(root, 'packages/cli/package.json', 'cli.bin', '@astryxdesign/cli'),
    ...matchedFileGroups(root, [
      {dirPath: 'packages/cli/docs', kind: 'cli.doc', pattern: /\.doc(?:\.[a-z]+)?\.mjs$/, label: '@astryxdesign/cli doc'},
      {dirPath: 'packages/cli/src', kind: 'cli.source', pattern: /^(?!.*\.test\.).*\.(mjs|ts)$/, label: '@astryxdesign/cli source'},
      {dirPath: 'packages/cli/src', kind: 'cli.test', pattern: /\.test\.(mjs|ts)$/, label: '@astryxdesign/cli test'},
      {dirPath: 'packages/cli/templates', kind: 'cli.template', pattern: /\.(json|mjs|svelte|ts)$/, label: '@astryxdesign/cli template'},
    ]),
    ...packageEntries(root, 'apps/svelte-docs/package.json', 'docs.package-entry', '@astryxdesign/svelte-docs'),
    ...matchedFileGroups(root, [
      {dirPath: 'apps/svelte-docs/src', kind: 'docs.source', pattern: /\.(css|svelte|ts)$/, label: '@astryxdesign/svelte-docs source'},
      {dirPath: 'apps/svelte-docs/src', kind: 'docs.test', pattern: /\.(?:test|spec)\.ts$/, label: '@astryxdesign/svelte-docs test'},
    ]),
    ...packageEntries(root, 'apps/example-svelte-tailwind/package.json', 'examples.package-entry', '@astryxdesign/example-svelte-tailwind'),
    ...matchedFileGroups(root, [
      {dirPath: 'apps/example-svelte-tailwind/src', kind: 'examples.source', pattern: /\.(css|svelte|ts)$/, label: '@astryxdesign/example-svelte-tailwind source'},
      {dirPath: 'apps/example-svelte-tailwind/scripts', kind: 'examples.test', pattern: /\.mjs$/, label: '@astryxdesign/example-svelte-tailwind script'},
    ]),
    ...matchedFileGroups(root, [
      {dirPath: 'apps/example-svelte-css/src', kind: 'examples.source', pattern: /\.(css|svelte|ts)$/, label: '@astryxdesign/example-svelte-css source'},
    ]),
    ...packageEntries(root, 'internal/vibe-tests/package.json', 'vibe.package-entry', '@astryxdesign/vibe-tests'),
    ...packageBins(root, 'internal/vibe-tests/package.json', 'vibe.package-entry', '@astryxdesign/vibe-tests'),
    ...matchedFileGroups(root, [
      {dirPath: 'internal/vibe-tests/src', kind: 'vibe.source', pattern: /^(?!.*\.test\.).*\.(mjs|py|ts)$/, label: '@astryxdesign/vibe-tests source'},
      {dirPath: 'internal/vibe-tests/src', kind: 'vibe.test', pattern: /\.test\.ts$/, label: '@astryxdesign/vibe-tests test'},
    ]),
    ...existingFiles(root, [
      {path: '.github/workflows/release.yml', kind: 'release.workflow', label: 'release workflow'},
      {path: '.github/workflows/deploy.yml', kind: 'release.workflow', label: 'deploy workflow'},
      {path: 'docs/release.md', kind: 'release.doc', label: 'release documentation'},
      {path: 'docs/svelte-port-rollback.md', kind: 'release.doc', label: 'Svelte rollback documentation'},
      {path: 'scripts/npm/setup-trusted-publishing.mjs', kind: 'release.script', label: 'trusted publishing setup script'},
    ]),
    ...existingFiles(root, [
      {path: '.github/workflows/ci.yml', kind: 'ci-release.workflow', label: 'CI workflow'},
      {path: '.github/workflows/lint.yml', kind: 'ci-release.workflow', label: 'lint workflow'},
      {path: '.github/workflows/release.yml', kind: 'ci-release.workflow', label: 'release workflow'},
      {path: '.github/workflows/cli-smoke-test.yml', kind: 'ci-release.workflow', label: 'CLI smoke workflow'},
      {path: '.github/workflows/vibe-screenshots.yml', kind: 'ci-release.workflow', label: 'vibe screenshots workflow'},
    ]),
    ...packageScripts(root, {
      packageJsonPath: 'package.json',
      kind: 'ci-release.package-script',
      packageName: 'root',
      scripts: ['build:svelte', 'check:svelte', 'check:svelte:parity'],
    }),
    ...packageEntries(root, 'packages/tokens/package.json', 'tokens.package-entry', '@astryxdesign/tokens'),
    ...packageExports(root, 'packages/tokens/package.json', 'tokens.package-export', '@astryxdesign/tokens'),
    ...matchedFileGroups(root, [
      {dirPath: 'packages/tokens/src', kind: 'tokens.source', pattern: /^(?!.*\.test\.).*\.ts$/, label: '@astryxdesign/tokens source'},
      {dirPath: 'packages/tokens/src', kind: 'tokens.test', pattern: /\.test\.ts$/, label: '@astryxdesign/tokens test'},
      {dirPath: 'packages/tokens/scripts', kind: 'tokens.script', pattern: /\.mjs$/, label: '@astryxdesign/tokens script'},
    ]),
    ...existingFiles(root, [
      {path: 'packages/svelte/package.json', kind: 'svelte.package-entry', label: '@astryxdesign/svelte package manifest'},
      {path: 'packages/svelte/docs.mjs', kind: 'svelte.doc', label: '@astryxdesign/svelte docs entry'},
      {path: 'packages/svelte/groups.doc.mjs', kind: 'svelte.doc', label: '@astryxdesign/svelte groups docs'},
      {path: 'packages/svelte/src/lib/styles.css', kind: 'svelte.style', label: '@astryxdesign/svelte root styles'},
    ]),
    ...packageExports(root, 'packages/svelte/package.json', 'svelte.package-export', '@astryxdesign/svelte'),
    ...sourceExports(root, 'packages/svelte/src/lib/index.ts', 'svelte.source-export', '@astryxdesign/svelte'),
    ...matchedFileGroups(root, [
      {dirPath: 'packages/svelte/src/lib', kind: 'svelte.doc', pattern: /\.doc\.mjs$/, label: '@astryxdesign/svelte doc'},
      {dirPath: 'packages/svelte/src/lib', kind: 'svelte.source', pattern: /^(?!.*(?:\.doc\.mjs$|\.(?:test|spec)\.|test-fixtures\/)).*\.(?:mjs|svelte|ts)$/, label: '@astryxdesign/svelte source'},
      {dirPath: 'packages/svelte/src/lib', kind: 'svelte.style', pattern: /\.css$/, label: '@astryxdesign/svelte style'},
      {dirPath: 'packages/svelte/src/lib', kind: 'svelte.test', pattern: /\.(?:test|spec)\.ts$/, label: '@astryxdesign/svelte test'},
      {dirPath: 'packages/svelte/scripts', kind: 'svelte.script', pattern: /\.mjs$/, label: '@astryxdesign/svelte script'},
    ]),
    ...existingFiles(root, [
      {
        path: 'apps/svelte-storybook/package.json',
        kind: 'storybook.package-entry',
        label: '@astryxdesign/svelte-storybook package manifest',
      },
    ]),
    ...packageScripts(root, {
      packageJsonPath: 'apps/svelte-storybook/package.json',
      kind: 'storybook.script',
      packageName: '@astryxdesign/svelte-storybook',
      scripts: ['build', 'dev', 'preview'],
    }),
    ...packageScripts(root, {
      packageJsonPath: 'apps/svelte-storybook/package.json',
      kind: 'storybook.visual',
      packageName: '@astryxdesign/svelte-storybook',
      scripts: ['test:visual'],
    }),
    ...packageScripts(root, {
      packageJsonPath: 'apps/svelte-storybook/package.json',
      kind: 'storybook.e2e',
      packageName: '@astryxdesign/svelte-storybook',
      scripts: ['test:e2e'],
    }),
    ...matchedFileGroups(root, [
      {dirPath: 'apps/svelte-storybook/src', kind: 'storybook.source', pattern: /\.(?:svelte|ts)$/, label: '@astryxdesign/svelte-storybook source'},
      {dirPath: 'apps/svelte-storybook/src', kind: 'storybook.style', pattern: /\.css$/, label: '@astryxdesign/svelte-storybook style'},
      {dirPath: 'apps/svelte-storybook/scripts', kind: 'storybook.visual', pattern: /test-visual\.mjs$/, label: '@astryxdesign/svelte-storybook visual test'},
      {dirPath: 'apps/svelte-storybook/scripts', kind: 'storybook.e2e', pattern: /test-e2e\.mjs$/, label: '@astryxdesign/svelte-storybook e2e test'},
      {dirPath: 'apps/svelte-storybook/scripts', kind: 'storybook.script', pattern: /^(?!.*test-(?:e2e|visual)\.mjs$).*\.mjs$/, label: '@astryxdesign/svelte-storybook script'},
    ]),
    ...packageEntries(root, 'packages/svelte-lab/package.json', 'lab.package-entry', '@astryxdesign/svelte-lab'),
    ...packageExports(root, 'packages/svelte-lab/package.json', 'lab.package-export', '@astryxdesign/svelte-lab'),
    ...sourceExports(root, 'packages/svelte-lab/src/lib/index.ts', 'lab.source-export', '@astryxdesign/svelte-lab'),
    ...matchedFileGroups(root, [
      {dirPath: 'packages/svelte-lab/src/lib', kind: 'lab.doc', pattern: /\.doc\.mjs$/, label: '@astryxdesign/svelte-lab doc'},
      {dirPath: 'packages/svelte-lab/src/lib', kind: 'lab.source', pattern: /^(?!.*(?:\.doc\.mjs$|\.(?:test|spec)\.|test-fixtures\/)).*\.(?:mjs|svelte|ts)$/, label: '@astryxdesign/svelte-lab source'},
      {dirPath: 'packages/svelte-lab/src/lib', kind: 'lab.test', pattern: /\.(?:test|spec)\.ts$/, label: '@astryxdesign/svelte-lab test'},
    ]),
    ...packageEntries(root, 'packages/svelte-vega/package.json', 'vega.package-entry', '@astryxdesign/svelte-vega'),
    ...packageExports(root, 'packages/svelte-vega/package.json', 'vega.package-export', '@astryxdesign/svelte-vega'),
    ...sourceExports(root, 'packages/svelte-vega/src/lib/index.ts', 'vega.source-export', '@astryxdesign/svelte-vega'),
    ...matchedFileGroups(root, [
      {dirPath: 'packages/svelte-vega/src/lib', kind: 'vega.doc', pattern: /\.doc\.mjs$/, label: '@astryxdesign/svelte-vega doc'},
      {dirPath: 'packages/svelte-vega/src/lib', kind: 'vega.source', pattern: /^(?!.*(?:\.doc\.mjs$|\.(?:test|spec)\.|test-fixtures\/)).*\.(?:mjs|svelte|ts)$/, label: '@astryxdesign/svelte-vega source'},
      {dirPath: 'packages/svelte-vega/src/lib', kind: 'vega.test', pattern: /\.(?:test|spec)\.ts$/, label: '@astryxdesign/svelte-vega test'},
    ]),
  ]);
}

export function readFixture(root: string, path: string): FixtureEntries {
  const json = readJsonObject(root, path);
  const additions = json['addEntries'];
  if (!Array.isArray(additions)) {
    throw new CliError(`${path} must contain an addEntries array`);
  }
  const sourceEntries = additions.map((item) => {
    if (!isRecord(item)) {
      throw new CliError(`${path} contains a non-object fixture entry`);
    }
    const kind = item['kind'];
    const source = item['source'];
    const label = item['label'];
    if (!isSurfaceKind(kind) || typeof source !== 'string' || typeof label !== 'string') {
      throw new CliError(`${path} fixture entries require kind, source, and label strings`);
    }
    return entry(kind, source, label);
  });
  const ledgerAdditions = json['addLedgerEntries'];
  if (ledgerAdditions == null) {
    return {sourceEntries, ledgerEntries: []};
  }
  if (!Array.isArray(ledgerAdditions)) {
    throw new CliError(`${path} addLedgerEntries must be an array`);
  }
  return {sourceEntries, ledgerEntries: ledgerAdditions.map((item) => parseFixtureLedgerEntry(path, item))};
}

function parseFixtureLedgerEntry(path: string, value: unknown): LedgerEntry {
  if (!isRecord(value)) {
    throw new CliError(`${path} contains a non-object fixture ledger entry`);
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
    throw new CliError(`${path} fixture ledger entries require id, kind, source, label, status, rationale, and svelteTarget`);
  }
  return {id, kind, source, label, status, rationale, svelteTarget};
}

export function buildInitialLedger(entries: readonly SurfaceEntry[]): readonly LedgerEntry[] {
  return entries.map((item) => ({
    ...item,
    status: 'implemented',
    rationale: 'Tracked current Svelte-native release surface.',
    svelteTarget: item.source,
  }));
}
