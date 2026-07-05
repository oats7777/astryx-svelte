// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  discoverSvelteComponents,
  findSvelteComponentSource,
  resolveSvelteImportPath,
} from './component/index.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-svelte-component-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('discoverSvelteComponents', () => {
  it('reads Svelte group docs and source files', () => {
    const groupDir = path.join(tmpDir, 'src', 'lib', 'actions');
    fs.mkdirSync(groupDir, {recursive: true});
    fs.writeFileSync(path.join(groupDir, 'Button.svelte'), '');
    fs.writeFileSync(
      path.join(groupDir, 'actions.doc.mjs'),
      "export const docs = createGroupDocs({groupLabel: 'Actions', components: ['Button']});",
    );

    const result = discoverSvelteComponents(tmpDir);

    expect(result).toEqual({Actions: ['Button']});
    expect(findSvelteComponentSource(tmpDir, 'Button')).toBe(
      path.join(groupDir, 'Button.svelte'),
    );
    expect(resolveSvelteImportPath(tmpDir, 'Button')).toBe(
      '@astryxdesign/svelte/actions',
    );
  });

  it('skips Svelte internal source files without group docs', () => {
    const publicDir = path.join(tmpDir, 'src', 'lib', 'actions');
    fs.mkdirSync(publicDir, {recursive: true});
    fs.writeFileSync(path.join(publicDir, 'Button.svelte'), '');
    fs.writeFileSync(
      path.join(publicDir, 'actions.doc.mjs'),
      "export const docs = createGroupDocs({groupLabel: 'Actions', components: ['Button']});",
    );

    const internalDir = path.join(tmpDir, 'src', 'lib', 'internal');
    fs.mkdirSync(internalDir, {recursive: true});
    fs.writeFileSync(path.join(internalDir, 'PackageTopologyProbe.svelte'), '');

    const result = discoverSvelteComponents(tmpDir);

    expect(Object.values(result).flat()).toEqual(['Button']);
    expect(Object.values(result).flat()).not.toContain('PackageTopologyProbe');
  });

  it('rejects traversal component names when resolving Svelte source', () => {
    const publicDir = path.join(tmpDir, 'src', 'lib', 'actions');
    fs.mkdirSync(publicDir, {recursive: true});
    fs.writeFileSync(path.join(publicDir, 'Button.svelte'), '');
    fs.writeFileSync(
      path.join(publicDir, 'actions.doc.mjs'),
      "export const docs = createGroupDocs({groupLabel: 'Actions', components: ['Button']});",
    );

    const outsideDir = path.join(tmpDir, 'src', 'outside');
    fs.mkdirSync(outsideDir, {recursive: true});
    fs.writeFileSync(path.join(outsideDir, 'Leak.svelte'), '<script></script>');

    expect(findSvelteComponentSource(tmpDir, '../../outside/Leak')).toBeNull();
    expect(findSvelteComponentSource(tmpDir, 'actions/Button')).toBeNull();
    expect(findSvelteComponentSource(tmpDir, 'Button\\Leak')).toBeNull();
    expect(findSvelteComponentSource(tmpDir, '/tmp/Leak')).toBeNull();
    expect(findSvelteComponentSource(tmpDir, 'button')).toBeNull();
    expect(resolveSvelteImportPath(tmpDir, '../../outside/Leak')).toBe(
      '@astryxdesign/svelte',
    );
  });

  it('ignores invalid Svelte component names from group docs', () => {
    const publicDir = path.join(tmpDir, 'src', 'lib', 'actions');
    fs.mkdirSync(publicDir, {recursive: true});
    fs.writeFileSync(path.join(publicDir, 'Button.svelte'), '');
    fs.writeFileSync(
      path.join(publicDir, 'actions.doc.mjs'),
      "export const docs = createGroupDocs({groupLabel: 'Actions', components: ['Button', '../../outside/Leak', 'button', 'Bad_Name']});",
    );

    const result = discoverSvelteComponents(tmpDir);

    expect(result).toEqual({Actions: ['Button']});
  });
});
