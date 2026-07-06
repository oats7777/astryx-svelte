#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-svelte-docs.mjs
 * @input Svelte package docs metadata and export barrels
 * @output Structural validation for Svelte docs coverage and examples
 * @position Shared docs typecheck script used by Svelte package variants
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';

const pkgDir = path.resolve(process.cwd(), process.argv[2] ?? '.');
const libDir = path.join(pkgDir, 'src', 'lib');
const errors = [];

function fail(message) {
  errors.push(message);
}

function findFiles(dir, predicate) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['e2e', 'internal', 'node_modules', 'test-fixtures'].includes(entry.name)) continue;
      files.push(...findFiles(fullPath, predicate));
    } else if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function collectExportedComponents() {
  const names = new Set();
  for (const indexPath of findFiles(libDir, file => path.basename(file) === 'index.ts')) {
    const source = fs.readFileSync(indexPath, 'utf-8');
    for (const match of source.matchAll(
      /export\s+\{default\s+as\s+([A-Z]\w*)\}\s+from\s+['"]\.\/[^'"]+\.svelte['"]/g,
    )) {
      names.add(match[1]);
    }
  }
  return names;
}

function hasLanguageTaggedFence(source) {
  return /```[A-Za-z][\w-]*/.test(source);
}

function hasTsxOnlyExample(code) {
  return [
    /from\s+['"]react['"]/,
    /from\s+['"]@astryxdesign\/core/,
    /\bReact\./,
    /\bReactNode\b/,
    /\bclassName=/,
    /\bon[A-Z][A-Za-z]*=\{/,
    /\bfunction\s+[A-Z]\w*\s*\([^)]*\)\s*\{/,
    /\breturn\s*\(/,
  ].some(pattern => pattern.test(code));
}

function validateString(value, where) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${where} must be a non-empty string`);
  }
}

function validateProps(props, where) {
  if (!Array.isArray(props) || props.length === 0) {
    fail(`${where} must include prop docs`);
    return;
  }
  for (const prop of props) {
    validateString(prop?.name, `${where} prop.name`);
    validateString(prop?.type, `${where} prop.type`);
    validateString(prop?.description, `${where} prop.description`);
  }
}

function validateExamples(examples, where) {
  if (!Array.isArray(examples) || examples.length === 0) {
    fail(`${where} must include at least one Svelte example`);
    return;
  }
  for (const example of examples) {
    validateString(example?.code, `${where} example.code`);
    const code = typeof example?.code === 'string' ? example.code : '';
    if (hasLanguageTaggedFence(code)) {
      fail(`${where} example uses a language-tagged code fence`);
    }
    if (hasTsxOnlyExample(code)) {
      fail(`${where} example looks like React/TSX instead of Svelte`);
    }
  }
}

function validateEntry(entry, where, documentedNames) {
  validateString(entry?.name, `${where}.name`);
  validateString(entry?.displayName, `${where}.displayName`);
  validateString(entry?.description, `${where}.description`);
  validateString(entry?.usage?.description, `${where}.usage.description`);
  validateProps(entry?.props, where);
  validateExamples(entry?.examples, where);
  if (typeof entry?.name === 'string') {
    documentedNames.add(entry.name);
  }
}

async function validateRootDocs() {
  const packageJson = readJson(path.join(pkgDir, 'package.json'));
  const docsPath = path.join(pkgDir, 'docs.mjs');
  const groupsPath = path.join(pkgDir, 'groups.doc.mjs');
  if (!fs.existsSync(docsPath)) fail(`${packageJson.name} is missing docs.mjs`);
  if (!fs.existsSync(groupsPath)) fail(`${packageJson.name} is missing groups.doc.mjs`);
  if (fs.existsSync(docsPath)) {
    const mod = await import(pathToFileURL(docsPath).href);
    validateString(mod.docs?.title, `${packageJson.name} docs.title`);
    validateString(mod.docs?.description, `${packageJson.name} docs.description`);
  }
  if (fs.existsSync(groupsPath)) {
    const mod = await import(pathToFileURL(groupsPath).href);
    if (!Array.isArray(mod.groups) || mod.groups.length === 0) {
      fail(`${packageJson.name} groups.doc.mjs must export non-empty groups`);
    }
  }
}

async function main() {
  await validateRootDocs();
  const documentedNames = new Set();
  const docFiles = findFiles(libDir, file => file.endsWith('.doc.mjs'));
  if (docFiles.length === 0) fail(`${pkgDir} has no component .doc.mjs files under src/lib`);

  for (const docPath of docFiles) {
    const source = fs.readFileSync(docPath, 'utf-8');
    if (hasLanguageTaggedFence(source)) {
      fail(`${path.relative(pkgDir, docPath)} contains a language-tagged code fence`);
    }
    const mod = await import(pathToFileURL(docPath).href);
    const doc = mod.docs;
    if (!doc) {
      fail(`${path.relative(pkgDir, docPath)} must export docs`);
      continue;
    }
    if (Array.isArray(doc.components) && doc.components.length > 0) {
      for (const component of doc.components) {
        validateEntry(component, `${path.relative(pkgDir, docPath)}:${component?.name ?? '<unnamed>'}`, documentedNames);
      }
    } else {
      validateEntry(doc, path.relative(pkgDir, docPath), documentedNames);
    }
  }

  const missing = [...collectExportedComponents()]
    .filter(name => !documentedNames.has(name))
    .sort();
  if (missing.length > 0) {
    fail(`missing docs for exported Svelte components: ${missing.join(', ')}`);
  }

  if (errors.length > 0) {
    console.error(errors.map(error => `- ${error}`).join('\n'));
    process.exit(1);
  }
  console.log(`Svelte docs metadata valid: ${documentedNames.size} documented components in ${path.relative(process.cwd(), pkgDir) || '.'}`);
}

await main();
