// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Svelte component discovery helpers for the CLI.
 *
 * Svelte components are discovered from package-local `.doc.mjs` metadata and
 * `.svelte` source files under `packages/svelte/src/lib`.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const SKIP_DIRS = new Set(['hooks', 'utils', 'internal', '__tests__', 'node_modules']);
const SVELTE_COMPONENT_NAME_RE = /^[A-Z][A-Za-z0-9]*$/;
const SVELTE_COMPONENT_FILE_RE = /^[A-Z][A-Za-z0-9]*\.svelte$/;
const SVELTE_DOC_FILE_RE = /\.doc\.mjs$/;
const SVELTE_GROUP_LABEL_RE = /\bgroupLabel:\s*['"]([^'"]+)['"]/;
const SVELTE_COMPONENTS_RE = /\bcomponents:\s*\[([\s\S]*?)\]/;

function isWithinPath(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return (
    relative === '' ||
    (relative.length > 0 &&
      !relative.startsWith('..') &&
      !path.isAbsolute(relative))
  );
}

export function normalizeSvelteComponentName(name) {
  if (typeof name !== 'string') return null;
  const componentName = name.replace(/^XDS/, '');
  return SVELTE_COMPONENT_NAME_RE.test(componentName) ? componentName : null;
}

function resolveSvelteSourceCandidate(srcDir, candidatePath) {
  const resolved = path.resolve(candidatePath);
  const resolvedSrcDir = path.resolve(srcDir);
  if (!isWithinPath(resolved, resolvedSrcDir)) return null;
  if (!fs.existsSync(resolved)) return null;

  const realSrcDir = fs.realpathSync(resolvedSrcDir);
  const realCandidate = fs.realpathSync(resolved);
  if (!isWithinPath(realCandidate, realSrcDir)) return null;

  return resolved;
}

function svelteComponentNameFromFile(fileName) {
  return fileName.replace(/\.svelte$/, '');
}

function readSvelteDocMeta(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    const groupMatch = SVELTE_GROUP_LABEL_RE.exec(content);
    const componentsMatch = SVELTE_COMPONENTS_RE.exec(content);
    const components = componentsMatch
      ? [...componentsMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1])
      : [];
    return {
      group: groupMatch ? groupMatch[1] : null,
      components,
    };
  } catch {
    return {group: null, components: []};
  }
}

export function discoverSvelteComponents(svelteDir) {
  const srcDir = path.join(path.resolve(svelteDir), 'src', 'lib');
  const componentGroups = new Map();
  if (!fs.existsSync(srcDir)) return {};

  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    const dirPath = path.join(srcDir, entry.name);
    const docFile = fs
      .readdirSync(dirPath, {withFileTypes: true})
      .find(file => file.isFile() && SVELTE_DOC_FILE_RE.test(file.name));
    if (!docFile) continue;

    const meta = readSvelteDocMeta(path.join(dirPath, docFile.name));

    for (const file of fs.readdirSync(dirPath, {withFileTypes: true})) {
      if (!file.isFile() || !SVELTE_COMPONENT_FILE_RE.test(file.name)) continue;
      if (file.name.includes('.test.')) continue;
      const componentName = svelteComponentNameFromFile(file.name);
      const group = meta.group || entry.name;
      componentGroups.set(componentName, group);
    }

    for (const rawComponentName of meta.components) {
      const componentName = normalizeSvelteComponentName(rawComponentName);
      if (!componentName) continue;
      if (!componentGroups.has(componentName)) {
        componentGroups.set(componentName, meta.group || entry.name);
      }
    }
  }

  const groups = new Map();
  for (const [name, group] of componentGroups) {
    const groupName = group || name;
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName).push(name);
  }

  const entries = [...groups.entries()]
    .map(([key, values]) => ({key, values: [...new Set(values)].sort()}))
    .sort((a, b) => a.key.localeCompare(b.key));

  const ordered = {};
  for (const {key, values} of entries) {
    ordered[key] = values;
  }
  return ordered;
}

export function findSvelteComponentDoc(svelteDir, name) {
  const componentName = normalizeSvelteComponentName(name);
  if (!componentName) return null;

  const sourcePath = findSvelteComponentSource(svelteDir, componentName);
  if (sourcePath) {
    const dirPath = path.dirname(sourcePath);
    const doc = fs
      .readdirSync(dirPath, {withFileTypes: true})
      .find(file => file.isFile() && SVELTE_DOC_FILE_RE.test(file.name));
    if (doc) return path.join(dirPath, doc.name);
  }

  const srcDir = path.join(path.resolve(svelteDir), 'src', 'lib');
  if (!fs.existsSync(srcDir)) return null;
  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
    const dirPath = path.join(srcDir, entry.name);
    for (const file of fs.readdirSync(dirPath, {withFileTypes: true})) {
      if (!file.isFile() || !SVELTE_DOC_FILE_RE.test(file.name)) continue;
      const docPath = path.join(dirPath, file.name);
      const meta = readSvelteDocMeta(docPath);
      if (
        meta.components
          .map(rawComponentName => normalizeSvelteComponentName(rawComponentName))
          .includes(componentName)
      ) {
        return docPath;
      }
    }
  }
  return null;
}

export function findSvelteComponentSource(svelteDir, name) {
  const componentName = normalizeSvelteComponentName(name);
  if (!componentName) return null;

  const srcDir = path.join(path.resolve(svelteDir), 'src', 'lib');

  function searchDir(dirPath) {
    if (!fs.existsSync(dirPath)) return null;
    const exact = resolveSvelteSourceCandidate(
      srcDir,
      path.join(dirPath, `${componentName}.svelte`),
    );
    if (exact) return exact;

    for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const found = searchDir(path.join(dirPath, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  return searchDir(srcDir);
}

export function resolveSvelteImportPath(svelteDir, componentName) {
  const sourcePath = findSvelteComponentSource(svelteDir, componentName);
  if (!sourcePath) return '@astryxdesign/svelte';

  const srcDir = path.join(path.resolve(svelteDir), 'src', 'lib');
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];
  if (!topDir || topDir.startsWith('..')) return '@astryxdesign/svelte';

  if (topDir === 'theme') return '@astryxdesign/svelte/theme';
  return `@astryxdesign/svelte/${topDir}`;
}
