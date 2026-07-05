// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XLE component registry — built from @astryxdesign/svelte .doc.mjs metadata.
 *
 * Everything the layout language knows about components (valid names,
 * aliases, props, enums, slots) is derived from the same .doc.mjs files
 * that power `xds component`, so the notation can never drift from the
 * branch's actual API. The pure pieces (alias table, enum parsing,
 * resolution, serialize/hydrate) live in registry-core.mjs so they can
 * run in the browser; this module adds the fs-bound builder.
 *
 * @input  packages/svelte/src/lib/(group)/(star).doc.mjs via component-discovery
 * @output buildRegistry() → { components, aliases, componentNames }
 * @position lib/xle — shared by parse/validate/expand; no CLI concerns here
 */

import {findSvelteDir} from '../../utils/paths.mjs';
import {
  discoverSvelteComponents,
  findSvelteComponentDoc,
  resolveSvelteImportPath,
} from '../component-discovery.mjs';
import {loadDocs} from '../component-loader.mjs';
import {
  ALIAS_TABLE,
  normalizeName,
  toComponentEntry,
} from './registry-core.mjs';

// Re-export the pure surface so existing importers (and tests) keep working.
export {
  ALIAS_TABLE,
  SPACING_STEPS,
  parseEnumValues,
  resolveComponent,
  serializeRegistry,
  hydrateRegistry,
} from './registry-core.mjs';

function findDirFor(grouped, member) {
  for (const [dir, members] of Object.entries(grouped)) {
    if (members.includes(member)) return dir;
  }
  return null;
}

let cachedRegistry = null;

/**
 * Build (and cache) the registry: every documented component keyed by its
 * un-prefixed name, plus the validated alias map.
 *
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @returns {Promise<{components: Map<string, object>, aliases: Map<string, string>, componentNames: string[]}>}
 */
export async function buildRegistry({cwd = process.cwd()} = {}) {
  if (cachedRegistry) return cachedRegistry;

  const svelteDir = findSvelteDir(cwd);
  if (!svelteDir) {
    throw new Error('Could not find @astryxdesign/svelte package — run from an Astryx Svelte workspace');
  }

  const components = new Map();
  const grouped = discoverSvelteComponents(svelteDir);
  const dirNames = [...new Set(Object.values(grouped).flat())];

  for (const dirName of dirNames) {
    const readme = findSvelteComponentDoc(svelteDir, dirName);
    if (!readme || !readme.endsWith('.doc.mjs')) continue;
    let docs;
    try {
      docs = await loadDocs(readme, {});
    } catch {
      continue; // a malformed doc must not take down the whole language
    }
    const importPath = resolveSvelteImportPath(svelteDir, dirName);

    const register = (rawName, props) => {
      const name = normalizeName(rawName);
      const entry = toComponentEntry(name, props, dirName, importPath);
      const existing = components.get(name);
      // Some docs list related components with empty prop arrays
      // (e.g. Layout's references to Card) — prefer the richer entry.
      if (!existing || entry.props.size > existing.props.size) {
        components.set(name, entry);
      }
    };

    if (docs.props) register(docs.name || dirName, docs.props);
    for (const sub of docs.components || []) {
      if (sub?.name) register(sub.name, sub.props);
    }
  }

  const registerUndocumented = (name, dirName) => {
    if (components.has(name)) return;
    const entry = toComponentEntry(name, [], dirName, resolveSvelteImportPath(svelteDir, name));
    entry.undocumented = true;
    components.set(name, entry);
  };

  for (const [, members] of Object.entries(grouped)) {
    for (const member of members) {
      registerUndocumented(normalizeName(member), findDirFor(grouped, member) || member);
    }
  }

  const aliases = new Map();
  for (const [alias, target] of Object.entries(ALIAS_TABLE)) {
    if (components.has(target)) aliases.set(alias, target);
  }

  cachedRegistry = {
    components,
    aliases,
    componentNames: [...components.keys()].sort(),
  };
  return cachedRegistry;
}

/** Test seam — drop the module-level cache. */
export function resetRegistryCache() {
  cachedRegistry = null;
}
