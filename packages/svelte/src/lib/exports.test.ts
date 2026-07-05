// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file exports.test.ts
 * @input @astryxdesign/svelte package metadata, docs metadata, and export verifier
 * @output Vitest coverage for Svelte package export/docs drift
 * @position Todo 6 package contract tests
 */

import {spawnSync} from 'node:child_process';
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {expectedFamilyFiles, expectedGroups} from './test-fixtures/export-contract';

type ConditionalExport = Readonly<{
  types?: string;
  svelte?: string;
  default?: string;
}>;

type PackageJson = Readonly<{
  exports: Readonly<Record<string, string | ConditionalExport>>;
  files: readonly string[];
}>;

const rootDir = resolve(__dirname, '../../../..');
const packageRoot = resolve(rootDir, 'packages/svelte');
const packageJsonPath = join(packageRoot, 'package.json');
const docsPath = join(packageRoot, 'docs.mjs');
const groupsPath = join(packageRoot, 'groups.doc.mjs');
const checkerPath = join(packageRoot, 'scripts/check-package-exports.mjs');

function readPackageJson(path = packageJsonPath): PackageJson {
  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}

function requireConditionalExport(pkg: PackageJson, subpath: string): ConditionalExport {
  const entry = pkg.exports[subpath];
  expect(entry, `${subpath} must be exported`).toBeDefined();
  expect(typeof entry, `${subpath} must be a conditional export`).toBe('object');
  expect(Array.isArray(entry), `${subpath} must not be an array`).toBe(false);
  return entry as ConditionalExport;
}

function copyPackageFixture(prefix: string): string {
  const fixtureRoot = mkdtempSync(join(tmpdir(), prefix));
  cpSync(packageRoot, fixtureRoot, {
    recursive: true,
    filter: source =>
      !source.includes('/dist/') &&
      !source.endsWith('/dist') &&
      !source.includes('/.svelte-kit/') &&
      !source.endsWith('/.svelte-kit') &&
      !source.includes('/node_modules/') &&
      !source.endsWith('/node_modules'),
  });
  return fixtureRoot;
}

function expectedPackagedFamilyFiles(): readonly string[] {
  const files: string[] = [];
  for (const [family, familyFiles] of Object.entries(expectedFamilyFiles)) {
    for (const file of familyFiles) {
      files.push(`src/lib/${family}/${file}`);
      if (file.endsWith('.svelte')) {
        files.push(`dist/${family}/${file}`);
      } else if (file === 'index.ts') {
        files.push(`dist/${family}/index.js`);
      }
    }
  }
  return files;
}

describe('Svelte package export map', () => {
  it('publishes root, CSS, theme, token, docs, and component subpaths with Svelte conditions', async () => {
    // Given: the package manifest and docs metadata are the public package contract.
    const pkg = readPackageJson();

    // When: consumers import implemented Svelte package surfaces through subpaths.
    const svelteSubpaths = [
      '.',
      './Theme.svelte',
      './theme',
      './theme/tokens',
      './tokens',
      './icon',
      './foundations',
      './actions',
      './forms',
      './overlays',
      './selection',
      './navigation',
      './data-display',
      './rich-surfaces',
      './misc',
      './utils',
    ] as const;
    const defaultSubpaths = ['./styles.css'] as const;

    // Then: Svelte component/code subpaths expose both declaration and Svelte conditions.
    for (const subpath of svelteSubpaths) {
      const entry = requireConditionalExport(pkg, subpath);
      expect(entry.types, `${subpath} must expose declaration files`).toMatch(/^\.\/dist\/.+\.d\.ts$/);
      expect(entry.svelte, `${subpath} must expose Svelte-compatible code`).toMatch(
        /^\.\/dist\/.+(\.js|\.svelte)$/,
      );
    }

    for (const subpath of defaultSubpaths) {
      const entry = requireConditionalExport(pkg, subpath);
      expect(entry.default, `${subpath} must expose a packaged asset`).toMatch(/^\.\/dist\//);
    }

    expect(pkg.exports['./docs.mjs']).toBe('./docs.mjs');
    expect(pkg.exports['./groups.doc.mjs']).toBe('./groups.doc.mjs');
    expect(pkg.exports['./package.json']).toBe('./package.json');

    const docsModule = (await import(`${docsPath}?test=${Date.now()}`)) as {
      readonly docs: {readonly packageName: string; readonly exports: readonly string[]};
    };
    const groupsModule = (await import(`${groupsPath}?test=${Date.now()}`)) as {
      readonly groups: readonly {readonly name: string; readonly canonical: string}[];
    };

    expect(docsModule.docs.packageName).toBe('@astryxdesign/svelte');
    expect(docsModule.docs.exports).toEqual(Object.keys(pkg.exports));
    expect(groupsModule.groups).toEqual(expectedGroups);
  });

  it('publishes source, built outputs, CSS, and docs without tests or fixtures', () => {
    // Given: the Svelte package has been built and npm computes the publish file list.
    const packageResult = spawnSync('pnpm', ['run', 'package'], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    expect(packageResult.status, packageResult.stderr || packageResult.stdout).toBe(0);

    const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: packageRoot,
      encoding: 'utf8',
    });

    // When: the package dry-run file list is parsed.
    expect(result.status, result.stderr).toBe(0);
    const packuments: readonly [{readonly files: readonly {readonly path: string}[]}] = JSON.parse(
      result.stdout,
    );
    const files = packuments[0].files.map(file => file.path);

    // Then: intended runtime/source/docs surfaces are present and test-only files are absent.
    expect(files).toEqual(expect.arrayContaining([
      'dist/index.js',
      'dist/styles.css',
      'docs.mjs',
      'groups.doc.mjs',
      'src/lib/index.ts',
      'src/lib/actions/index.ts',
      'src/lib/foundations/index.ts',
      'src/lib/overlays/index.ts',
      'src/lib/selection/index.ts',
      'src/lib/navigation/index.ts',
      'src/lib/data-display/index.ts',
      'src/lib/rich-surfaces/index.ts',
      'src/lib/misc/index.ts',
      'src/lib/utils/index.ts',
      'src/lib/theme/Theme.svelte',
      'src/lib/theme/tokens.ts',
      'src/lib/tokens.ts',
      ...expectedPackagedFamilyFiles(),
    ]));
    expect(
      files.filter(path => /(^|\/)(e2e|test-fixtures)(\/|$)|\.(test|spec)\./.test(path)),
    ).toEqual([]);
  });

  it('fails the package verifier when a generated component export is removed from a fixture', () => {
    // Given: a package fixture copied from the current Svelte package.
    const fixtureRoot = copyPackageFixture('astryx-svelte-exports-');
    const fixturePackagePath = join(fixtureRoot, 'package.json');
    const fixturePackageJson = readPackageJson(fixturePackagePath);
    const fixtureExports = {...fixturePackageJson.exports};
    delete fixtureExports['./Theme.svelte'];
    writeFileSync(
      fixturePackagePath,
      `${JSON.stringify({...fixturePackageJson, exports: fixtureExports}, null, 2)}\n`,
    );

    try {
      // When: the package-local verifier checks the mutated fixture.
      const result = spawnSync(process.execPath, [checkerPath, '--package-root', fixtureRoot], {
        encoding: 'utf8',
      });

      // Then: the verifier rejects the missing component subpath with a structural diagnostic.
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('missing required export: ./Theme.svelte');
    } finally {
      rmSync(fixtureRoot, {recursive: true, force: true});
    }
  });

  it('fails the package verifier when docs or groups metadata drift from package exports', () => {
    // Given: a package fixture with a stale docs export and incomplete groups metadata.
    const fixtureRoot = copyPackageFixture('astryx-svelte-docs-drift-');
    const fixtureDocsPath = join(fixtureRoot, 'docs.mjs');
    const fixtureDocsSource = readFileSync(fixtureDocsPath, 'utf8');
    writeFileSync(
      fixtureDocsPath,
      fixtureDocsSource.replace(
        "    './package.json',",
        "    './package.json',\n    './NotImplementedTodo7.svelte',",
      ),
    );
    writeFileSync(
      join(fixtureRoot, 'groups.doc.mjs'),
      `// Copyright (c) Meta Platforms, Inc. and affiliates.\n\nexport const groups = [\n  {name: 'Theme', canonical: 'Theme', description: 'stale-only fixture'},\n];\n`,
    );

    try {
      // When: the package-local verifier checks the mutated fixture.
      const result = spawnSync(process.execPath, [checkerPath, '--package-root', fixtureRoot], {
        encoding: 'utf8',
      });

      // Then: docs extras and stale groups metadata fail instead of producing false success.
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('docs.mjs exports must exactly match package.json exports');
      expect(result.stderr).toContain('groups.doc.mjs metadata must match package export groups');
    } finally {
      rmSync(fixtureRoot, {recursive: true, force: true});
    }
  });
});
