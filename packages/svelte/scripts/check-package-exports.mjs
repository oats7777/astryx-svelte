// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Verifies the published Svelte package export surface.
 *
 * @input packages/svelte/package.json, docs metadata, and required source files.
 * @output Exits non-zero with missing export/source/docs diagnostics.
 * @position Svelte package topology guard run by @astryxdesign/svelte check:exports.
 */

import {existsSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {
  requiredDefaultExports,
  requiredGroups,
  requiredStringExports,
  requiredSvelteExports,
} from './package-export-contract.mjs';

const defaultPackageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function readPackageJson(packageRoot) {
  return JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
}

function parseArgs(args) {
  let packageRoot = defaultPackageRoot;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg !== '--package-root') {
      throw new Error(`Unknown option: ${arg}`);
    }
    const value = args[index + 1];
    if (value == null || value.startsWith('--')) {
      throw new Error('--package-root requires a path');
    }
    packageRoot = value;
    index += 1;
  }
  return packageRoot;
}

function isObjectRecord(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function requireExportsObject(packageJson) {
  if (!isObjectRecord(packageJson.exports)) {
    return {exportsMap: null, errors: ['package.json exports must be an object.']};
  }
  return {exportsMap: packageJson.exports, errors: []};
}

function compareConditionalExport(exportsMap, subpath, expected) {
  const entry = exportsMap[subpath];
  if (!isObjectRecord(entry)) {
    return [`missing required export: ${subpath}`];
  }
  const errors = [];
  for (const [condition, value] of Object.entries(expected)) {
    if (condition === 'source') {
      continue;
    }
    if (entry[condition] !== value) {
      errors.push(`invalid ${subpath}.${condition}: expected ${value}`);
    }
  }
  return errors;
}

function compareStringExport(exportsMap, subpath, expected) {
  if (exportsMap[subpath] !== expected) {
    return [`invalid ${subpath}: expected ${expected}`];
  }
  return [];
}

function sourceErrors(packageRoot, entries) {
  const errors = [];
  for (const [subpath, expected] of Object.entries(entries)) {
    if (!existsSync(join(packageRoot, expected.source))) {
      errors.push(`missing source for ${subpath}: ${expected.source}`);
    }
  }
  return errors;
}

function arraysEqual(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function groupsEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

async function docsErrors(packageRoot, exportsMap) {
  const errors = [];
  const docsPath = join(packageRoot, 'docs.mjs');
  const groupsPath = join(packageRoot, 'groups.doc.mjs');
  if (!existsSync(docsPath)) {
    errors.push('missing docs metadata: docs.mjs');
    return errors;
  }
  if (!existsSync(groupsPath)) {
    errors.push('missing group metadata: groups.doc.mjs');
    return errors;
  }

  const docsModule = await import(`${pathToFileURL(docsPath).href}?t=${Date.now()}`);
  const groupsModule = await import(`${pathToFileURL(groupsPath).href}?t=${Date.now()}`);
  if (docsModule.docs?.packageName !== '@astryxdesign/svelte') {
    errors.push('docs.mjs must describe @astryxdesign/svelte');
  }
  const docsExports = docsModule.docs?.exports;
  if (!Array.isArray(docsExports)) {
    errors.push('docs.mjs must list package exports');
  } else if (!arraysEqual(docsExports, Object.keys(exportsMap))) {
    errors.push('docs.mjs exports must exactly match package.json exports');
  }
  if (!Array.isArray(groupsModule.groups)) {
    errors.push('groups.doc.mjs must export groups');
  } else if (!groupsEqual(groupsModule.groups, requiredGroups)) {
    errors.push('groups.doc.mjs metadata must match package export groups');
  }
  return errors;
}

export async function checkPackageExports(packageRoot = defaultPackageRoot) {
  const packageJson = readPackageJson(packageRoot);
  const {exportsMap, errors} = requireExportsObject(packageJson);
  if (exportsMap == null) {
    return errors;
  }

  for (const [subpath, expected] of Object.entries(requiredSvelteExports)) {
    errors.push(...compareConditionalExport(exportsMap, subpath, expected));
  }
  for (const [subpath, expected] of Object.entries(requiredDefaultExports)) {
    errors.push(...compareConditionalExport(exportsMap, subpath, expected));
  }
  for (const [subpath, expected] of Object.entries(requiredStringExports)) {
    errors.push(...compareStringExport(exportsMap, subpath, expected));
  }
  errors.push(...sourceErrors(packageRoot, requiredSvelteExports));
  errors.push(...sourceErrors(packageRoot, requiredDefaultExports));
  errors.push(...(await docsErrors(packageRoot, exportsMap)));
  return errors;
}

async function main() {
  const packageRoot = parseArgs(process.argv.slice(2));
  const errors = await checkPackageExports(packageRoot);
  if (errors.length > 0) {
    for (const error of errors) {
      process.stderr.write(`${error}\n`);
    }
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
