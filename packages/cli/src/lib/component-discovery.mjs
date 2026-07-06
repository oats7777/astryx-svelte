// Copyright (c) Meta Platforms, Inc. and affiliates.
// allow: SIZE_OK — legacy React/integration discovery remains an upstream parity module; Svelte discovery is extracted to svelte-component-discovery.mjs.

/**
 * @file Component discovery — find, list, and resolve Astryx components
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export {
  discoverSvelteComponents,
  findSvelteComponentDoc,
  findSvelteComponentSource,
  normalizeSvelteComponentName,
  resolveSvelteImportPath,
} from './svelte-component-discovery.mjs';

const SKIP_DIRS = new Set(['hooks', 'utils', 'internal', '__tests__', 'node_modules']);

/** The owner package name for built-in Svelte components. */
export const CORE_PACKAGE = '@astryxdesign/svelte';

/** Conventional doc-file suffixes for integration components (same-stem). */
const INTEGRATION_DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

// Component source files are named `XDS{Name}.tsx` today. The XDS-prefix
// migration (P2380608025, P4) renames them to the bare `{Name}.tsx` form, so
// discovery must recognize BOTH. The `XDS` prefix has historically doubled as
// a "this is a top-level component" marker, so naively matching all PascalCase
// `.tsx` files would surface internal helpers that happen to be PascalCase
// (`OverlayScrim.tsx`, `PowerSearchEditPopover.tsx`, ...). To avoid that
// regression, a BARE-named file is only treated as a component when a matching
// doc file exists for it (`{Name}.doc.mjs` or `XDS{Name}.doc.mjs` in the same
// directory). Prefixed `XDS{Name}.tsx` files keep their existing behavior.
const PREFIXED_COMPONENT_FILE_RE = /^XDS[A-Z]\w+\.tsx$/;
const BARE_COMPONENT_FILE_RE = /^[A-Z]\w+\.tsx$/;

function resolveCoreDir(coreDir) {
  const resolved = path.resolve(coreDir);
  if (fs.existsSync(path.join(resolved, 'src'))) {
    return resolved;
  }

  if (!path.isAbsolute(coreDir)) {
    let dir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const candidate = path.resolve(dir, coreDir);
      if (fs.existsSync(path.join(candidate, 'src'))) {
        return candidate;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  return resolved;
}

/**
 * Whether a filename looks like a component source file, excluding tests,
 * Context files, and (implicitly, via the uppercase-first match) `use*` hooks.
 *
 * Recognizes both the current `XDSButton.tsx` form and the post-migration
 * bare `Button.tsx` form. Bare matches additionally require a sibling doc file
 * so internal PascalCase helpers are not misclassified as components.
 *
 * @param {string} fileName
 * @param {string} dirPath — directory containing the file (for the bare-name doc check)
 * @returns {boolean}
 */
function isComponentSourceFile(fileName, dirPath) {
  if (fileName.includes('.test.') || fileName.includes('Context.')) {
    return false;
  }
  if (PREFIXED_COMPONENT_FILE_RE.test(fileName)) {
    return true;
  }
  if (BARE_COMPONENT_FILE_RE.test(fileName)) {
    const base = fileName.replace(/\.tsx$/, '');
    return (
      fs.existsSync(path.join(dirPath, `${base}.doc.mjs`)) ||
      fs.existsSync(path.join(dirPath, `XDS${base}.doc.mjs`))
    );
  }
  return false;
}

/**
 * Strip the optional `XDS` prefix and `.tsx` suffix to get the bare component
 * name. Works for both `XDSButton.tsx` and `Button.tsx`.
 *
 * @param {string} fileName
 * @returns {string}
 */
function componentNameFromFile(fileName) {
  return fileName.replace(/^XDS/, '').replace(/\.tsx$/, '');
}

// Matches the top-level `group: 'GroupName'` field in a .doc.mjs file.
// Only matches at shallow indentation (≤ 4 spaces from line start) to avoid
// picking up nested `group:` fields inside prop descriptions.
const GROUP_RE = /(?:^|\n) {0,4}group:\s*['"]([^'"]+)['"]/;
const HIDDEN_COMPONENTS_RE = /(?:^|\n) {0,4}hiddenComponents:\s*\[([^\]]*)\]/;
const HIDDEN_RE = /(?:^|\n) {0,4}hidden:\s*true/;

/**
 * Read the `group`, `hiddenComponents`, and `hidden` fields from a
 * component's .doc.mjs file (synchronous).
 */
function readDocMeta(docPath) {
  try {
    const content = fs.readFileSync(docPath, 'utf-8');
    const groupMatch = GROUP_RE.exec(content);
    const hiddenCompsMatch = HIDDEN_COMPONENTS_RE.exec(content);
    const hiddenSet = new Set();
    if (hiddenCompsMatch) {
      for (const m of hiddenCompsMatch[1].matchAll(/['"]([^'"]+)['"]/g)) {
        hiddenSet.add(m[1]);
      }
    }
    const hidden = HIDDEN_RE.test(content);
    return {
      group: groupMatch ? groupMatch[1] : null,
      hiddenComponents: hiddenSet,
      hidden,
    };
  } catch {
    return {group: null, hiddenComponents: new Set(), hidden: false};
  }
}

/**
 * Auto-discover components by scanning for Astryx*.tsx files in core/src/.
 *
 * Returns an ordered Record where:
 * - Grouped components use the group name as key: `'Buttons': ['Button', 'IconButton']`
 * - Ungrouped components use their own name as key: `'Avatar': ['Avatar']`
 *
 * Keys are sorted alphabetically (groups and ungrouped components interleaved).
 * Components within each group are also sorted alphabetically.
 */
export function discoverComponents(coreDir) {
  coreDir = resolveCoreDir(coreDir);
  const srcDir = path.join(coreDir, 'src');
  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  function collectXDSFiles(dirPath) {
    const results = [];
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.isDirectory()) {
        results.push(...collectXDSFiles(path.join(dirPath, entry.name)));
      } else if (isComponentSourceFile(entry.name, dirPath)) {
        results.push(entry.name);
      }
    }
    return results;
  }

  const topEntries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of topEntries) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const dirPath = path.join(srcDir, entry.name);
    const xdsFiles = collectXDSFiles(dirPath);

    // Read the group from the directory's .doc.mjs file (if it exists)
    // Check both {Name}.doc.mjs and Astryx{Name}.doc.mjs naming conventions
    let docFile = path.join(dirPath, `${entry.name}.doc.mjs`);
    if (!fs.existsSync(docFile)) {
      docFile = path.join(dirPath, `XDS${entry.name}.doc.mjs`);
    }
    const {group, hiddenComponents, hidden} = fs.existsSync(docFile)
      ? readDocMeta(docFile)
      : {group: null, hiddenComponents: new Set(), hidden: false};

    // Skip entire directory if the doc is marked hidden
    if (hidden) continue;

    for (const fileName of xdsFiles) {
      const componentName = componentNameFromFile(fileName);
      if (hiddenComponents.has(componentName)) continue;

      // Check for a per-component doc file that overrides the directory group
      let compGroup = group;
      let compDoc = path.join(dirPath, `${componentName}.doc.mjs`);
      if (!fs.existsSync(compDoc)) {
        compDoc = path.join(dirPath, `XDS${componentName}.doc.mjs`);
      }
      const hasComponentDoc = fs.existsSync(compDoc);
      if (hasComponentDoc) {
        const compMeta = readDocMeta(compDoc);
        if (compMeta.group) compGroup = compMeta.group;
      }

      // Skip components without any .doc.mjs file (directory-level or
      // component-level). They can't be documented, so surfacing them in
      // the component list leads to broken docs-site links.
      if (!fs.existsSync(docFile) && !hasComponentDoc) continue;

      if (!componentGroups.has(componentName)) {
        componentGroups.set(componentName, compGroup);
      }
    }
  }

  // Build the result: group name → sorted members, or component name → [self]
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  /** @type {string[]} ungrouped component names */
  const ungrouped = [];

  for (const [name, group] of componentGroups) {
    if (group) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(name);
    } else {
      ungrouped.push(name);
    }
  }

  // Sort members within each group
  for (const members of groups.values()) {
    members.sort();
  }

  // Merge groups and ungrouped into a single alphabetically-ordered record
  /** @type {Array<{key: string, values: string[]}>} */
  const entries = [];
  for (const [groupName, members] of groups) {
    entries.push({key: groupName, values: members});
  }
  for (const name of ungrouped) {
    entries.push({key: name, values: [name]});
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));

  /** @type {Record<string, string[]>} */
  const ordered = {};
  for (const {key, values} of entries) {
    ordered[key] = values;
  }

  return ordered;
}

/**
 * Find the .doc.mjs file for a component.
 * For sub-components (e.g. StackItem), returns the parent's .doc.mjs
 * if the sub-component is documented there.
 */
export function findComponentReadme(coreDir, name) {
  coreDir = resolveCoreDir(coreDir);
  const srcDir = path.join(coreDir, 'src');
  const exactDoc = `${name}.doc.mjs`;
  const xdsDoc = `XDS${name}.doc.mjs`;

  // Direct match: src/{name}/{Name}.doc.mjs or src/{name}/Astryx{Name}.doc.mjs
  const direct = path.join(srcDir, name, exactDoc);
  if (fs.existsSync(direct)) return direct;
  const directXds = path.join(srcDir, name, xdsDoc);
  if (fs.existsSync(directXds)) return directXds;

  // Nested match: src/*/{name}/{Name}.doc.mjs or src/*/{name}/Astryx{Name}.doc.mjs
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = path.join(srcDir, entry.name, name, exactDoc);
    if (fs.existsSync(nested)) return nested;
    const nestedXds = path.join(srcDir, entry.name, name, xdsDoc);
    if (fs.existsSync(nestedXds)) return nestedXds;
  }

  // Per-component doc in a parent directory: src/*/{Name}.doc.mjs or src/*/Astryx{Name}.doc.mjs
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const perComp = path.join(srcDir, entry.name, exactDoc);
    if (fs.existsSync(perComp)) return perComp;
    const perCompXds = path.join(srcDir, entry.name, xdsDoc);
    if (fs.existsSync(perCompXds)) return perCompXds;
  }

  // Sub-component fallback: find the source file, then walk up
  // looking for any .doc.mjs in the same or parent directories
  const sourcePath = findComponentSource(coreDir, name);
  if (sourcePath) {
    let dir = path.dirname(sourcePath);
    while (dir.startsWith(srcDir)) {
      const dirEntries = fs.readdirSync(dir);
      for (const f of dirEntries) {
        if (f.endsWith('.doc.mjs')) return path.join(dir, f);
      }
      dir = path.dirname(dir);
    }
  }

  return null;
}

/**
 * Find the main source file for a component (Astryx*.tsx, excluding tests).
 * For "Button" finds src/Button/XDSButton.tsx
 * For "Layout" finds src/Layout/XDSLayout/XDSLayout.tsx
 * For "Card" finds src/Layout/Container/XDSCard.tsx (deep search fallback)
 */
export function findComponentSource(coreDir, name) {
  coreDir = resolveCoreDir(coreDir);
  const srcDir = path.join(coreDir, 'src');
  // Try the prefixed form (`XDSButton.tsx`) first since that is the current
  // on-disk convention, then the bare form (`Button.tsx`) that the Astryx-prefix
  // migration (P4) renames to. Listing the prefixed name first keeps behavior
  // identical until files are actually renamed.
  const candidateFiles = [`XDS${name}.tsx`, `${name}.tsx`];

  function searchDir(dirPath) {
    if (!fs.existsSync(dirPath)) return null;
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});

    // Check for an exact match (prefixed or bare) first
    for (const candidate of candidateFiles) {
      const exact = path.join(dirPath, candidate);
      if (fs.existsSync(exact)) return exact;
    }

    // Recurse into subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const found = searchDir(path.join(dirPath, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  // Search in the component's directory
  const directDir = path.join(srcDir, name);
  if (fs.existsSync(directDir)) {
    const found = searchDir(directDir);
    if (found) return found;
  }

  // Search nested (component might be under a parent dir)
  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nestedDir = path.join(srcDir, entry.name, name);
    if (fs.existsSync(nestedDir)) {
      const found = searchDir(nestedDir);
      if (found) return found;
    }
  }

  // Fallback: search entire src tree for the file
  return searchDir(srcDir);
}

/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Used for fuzzy-matching component names. Dependency-free.
 */
export function resolveImportPath(coreDir, componentName) {
  coreDir = resolveCoreDir(coreDir);
  const srcDir = path.join(coreDir, 'src');
  const pkgPath = path.join(coreDir, 'package.json');
  const pkg = fs.existsSync(pkgPath)
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : null;

  // Priority 1: exact subpath export matching the component name (e.g. ./Heading)
  // This allows convenience re-export directories to win over the source directory.
  if (pkg?.exports?.[`./${componentName}`]) {
    return `@astryxdesign/svelte/${componentName}`;
  }

  const sourcePath = findComponentSource(coreDir, componentName);
  if (!sourcePath) return '@astryxdesign/svelte';

  // Priority 2: subpath export matching the top-level source directory
  const relToSrc = path.relative(srcDir, sourcePath);
  const topDir = relToSrc.split(path.sep)[0];

  if (pkg?.exports?.[`./${topDir}`]) {
    return `@astryxdesign/svelte/${topDir}`;
  }

  const lowerTopDirExport = `./${topDir.toLowerCase()}`;
  for (const exportPath of Object.keys(pkg?.exports ?? {})) {
    if (exportPath.toLowerCase() === lowerTopDirExport) {
      return `@astryxdesign/svelte/${exportPath.slice(2)}`;
    }
  }

  return '@astryxdesign/svelte';
}

// ── External package discovery ───────────────────────────────────────

/**
 * Discover components from an external package's docs directory.
 * Scans for *.doc.mjs files and returns their names as a flat array.
 *
 * @deprecated Use discoverExternalComponentsGrouped for group-aware discovery.
 */
export function discoverExternalComponents(docsDir) {
  if (!fs.existsSync(docsDir)) return [];
  const components = [];

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.doc.mjs')) {
        components.push(entry.name.replace('.doc.mjs', ''));
      }
    }
  }

  scanDir(docsDir);
  return components.sort();
}

/**
 * Discover components from an external package's docs directory,
 * reading `group:` fields from each .doc.mjs for subcategories.
 *
 * Returns a Record<string, string[]> matching the shape of discoverComponents():
 * - Grouped components: `{ 'App Chrome': ['AppShell', 'SideNav', 'TopNav'] }`
 * - Ungrouped components: `{ 'Diff': ['Diff'] }`
 */
export function discoverExternalComponentsGrouped(docsDir) {
  if (!fs.existsSync(docsDir)) return {};

  /** @type {Map<string, string|null>} componentName → group */
  const componentGroups = new Map();

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.doc.mjs')) {
        const name = entry.name.replace('.doc.mjs', '');
        const {group, hidden} = readDocMeta(fullPath);
        if (!hidden) {
          componentGroups.set(name, group);
        }
      }
    }
  }

  scanDir(docsDir);

  // Build grouped result (same algorithm as discoverComponents)
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  /** @type {string[]} */
  const ungrouped = [];

  for (const [name, group] of componentGroups) {
    if (group) {
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(name);
    } else {
      ungrouped.push(name);
    }
  }

  for (const members of groups.values()) {
    members.sort();
  }

  /** @type {Array<{key: string, values: string[]}>} */
  const entries = [];
  for (const [groupName, members] of groups) {
    entries.push({key: groupName, values: members});
  }
  for (const name of ungrouped) {
    entries.push({key: name, values: [name]});
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));

  /** @type {Record<string, string[]>} */
  const ordered = {};
  for (const {key, values} of entries) {
    ordered[key] = values;
  }

  return ordered;
}

/**
 * Find a component's doc file in an external package's docs directory.
 * Returns the path to {Name}.doc.mjs or null.
 */
export function findExternalComponentDoc(docsDir, name) {
  if (!fs.existsSync(docsDir)) return null;
  const target = `${name}.doc.mjs`;

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const found = scanDir(fullPath);
        if (found) return found;
      } else if (entry.name === target) {
        return fullPath;
      }
    }
    return null;
  }

  return scanDir(docsDir);
}

// ── Integration component discovery (ownership-aware) ────────────────
//
// Integration packages contribute a `components` root (resolved absolute path
// in `loadedIntegrations`, see lib/integrations.mjs). Each component uses a
// same-stem source/doc convention — e.g. `MetaAppShell.svelte` next to
// `MetaAppShell.doc.{ts,mjs,js}`. The doc file is authoritative for discovery;
// the sibling `.svelte` (if present) is the swizzleable source.

/**
 * Given an integration component doc path, return the sibling component source
 * (`{Name}.svelte`) if one exists, else null.
 *
 * @param {string} docPath absolute path to a `{Name}.doc.{ts,mjs,js}` file
 * @returns {string|null}
 */
function integrationSourceForDoc(docPath) {
  const dir = path.dirname(docPath);
  const base = path.basename(docPath).replace(/\.doc\.(ts|mjs|js)$/, '');
  const candidate = path.join(dir, `${base}.svelte`);
  return fs.existsSync(candidate) ? candidate : null;
}

/**
 * Discover ownership records for the components contributed by a single loaded
 * integration. Scans the integration's resolved `components` dir for same-stem
 * doc files and records each with owner package + issuesUrl + sourcePath.
 *
 * @param {{name: string, components?: string, issuesUrl?: string}} integration
 * @returns {Array<{name: string, package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, group: string|null}>}
 */
export function discoverIntegrationComponents(integration) {
  const componentsDir = integration?.components;
  if (!componentsDir || !fs.existsSync(componentsDir)) return [];

  /** @type {Map<string, {name: string, package: string, docPath: string, sourcePath: string|null, issuesUrl: string|undefined, group: string|null}>} */
  const byName = new Map();

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
        continue;
      }
      const suffix = INTEGRATION_DOC_SUFFIXES.find(s => entry.name.endsWith(s));
      if (!suffix) continue;
      const name = entry.name.slice(0, -suffix.length);
      const {group, hidden} = readDocMeta(fullPath);
      if (hidden) continue;
      if (byName.has(name)) continue;
      byName.set(name, {
        name,
        package: integration.name,
        docPath: fullPath,
        sourcePath: integrationSourceForDoc(fullPath),
        issuesUrl: integration.issuesUrl,
        group: group ?? null,
      });
    }
  }

  scanDir(componentsDir);
  return [...byName.values()];
}

/**
 * Find an integration component's doc file by name within a loaded
 * integration's resolved `components` dir.
 *
 * @param {{components?: string}} integration
 * @param {string} name bare component name (no `XDS`/`Astryx` prefix)
 * @returns {string|null}
 */
export function findIntegrationComponentDoc(integration, name) {
  const componentsDir = integration?.components;
  if (!componentsDir || !fs.existsSync(componentsDir)) return null;

  function scanDir(dirPath) {
    const entries = fs.readdirSync(dirPath, {withFileTypes: true});
    for (const suffix of INTEGRATION_DOC_SUFFIXES) {
      const candidate = path.join(dirPath, `${name}${suffix}`);
      if (fs.existsSync(candidate)) return candidate;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      if (entry.isDirectory()) {
        const found = scanDir(path.join(dirPath, entry.name));
        if (found) return found;
      }
    }
    return null;
  }

  return scanDir(componentsDir);
}

/**
 * Find an integration component's swizzleable source file (`{Name}.svelte`) by
 * name within a loaded integration's resolved `components` dir.
 *
 * @param {{components?: string}} integration
 * @param {string} name bare component name
 * @returns {string|null}
 */
export function findIntegrationComponentSource(integration, name) {
  const docPath = findIntegrationComponentDoc(integration, name);
  if (!docPath) return null;
  return integrationSourceForDoc(docPath);
}

/**
 * Build a flat list of ownership records for all discoverable components:
 * core plus every loaded integration.
 *
 * @param {string} coreDir
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} [loadedIntegrations]
 * @returns {Array<{name: string, package: string, group: string|null, docPath: string|null, sourcePath: string|null, issuesUrl: string|undefined}>}
 */
export function discoverOwnedComponents(coreDir, loadedIntegrations = []) {
  /** @type {Array<{name: string, package: string, group: string|null, docPath: string|null, sourcePath: string|null, issuesUrl: string|undefined}>} */
  const records = [];

  const grouped = discoverComponents(coreDir);
  /** @type {Map<string, string|null>} */
  const coreGroup = new Map();
  for (const [key, members] of Object.entries(grouped)) {
    const isUngrouped = members.length === 1 && members[0] === key;
    for (const name of members) {
      coreGroup.set(name, isUngrouped ? null : key);
    }
  }
  for (const [name, group] of coreGroup) {
    records.push({
      name,
      package: CORE_PACKAGE,
      group,
      docPath: findComponentReadme(coreDir, name),
      sourcePath: findComponentSource(coreDir, name),
      issuesUrl: undefined,
    });
  }

  for (const integration of loadedIntegrations) {
    records.push(...discoverIntegrationComponents(integration));
  }

  return records;
}

// ── Legacy markdown-parsing functions ────────────────────────────────
// These are kept for backward compatibility with existing tests.
// The CLI action handler uses the new format functions below instead.

/**
 * Minimal cleanup for full docs (default mode).
 * Strips SYNC comments, rewrites title, collapses blank lines.
 */
