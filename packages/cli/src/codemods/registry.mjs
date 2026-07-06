// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Core codemod version registry
 *
 * The Svelte-native release line does not bundle legacy React/XDS transform
 * manifests. Integration packages may still expose their own codemods via the
 * integration discovery API, but core upgrades intentionally return no
 * transforms.
 */

const registry = new Map();

// Re-export from the shared utility so registry callers and other consumers
// (upgrade gate, update-check) all use the same comparator.
import {semverCompare} from '../utils/semver.mjs';

/**
 * All registered versions, sorted ascending.
 */
export const versions = [...registry.keys()].sort(semverCompare);

/**
 * The latest version in the registry.
 */
export const latestVersion = versions[versions.length - 1] ?? null;

/**
 * Get all transform manifests between two versions (exclusive of `from`, inclusive of `to`).
 * Returns an array of {version, transforms} objects sorted ascending.
 *
 * @param {string} from - Current version (exclusive)
 * @param {string} to - Target version (inclusive)
 * @returns {Promise<Array<{version: string, transforms: Array<{name: string, module: Function}>}>>}
 */
export async function getTransformsBetween(from, to) {
  const applicable = versions.filter(
    v => semverCompare(v, from) > 0 && semverCompare(v, to) <= 0,
  );
  const results = [];

  for (const version of applicable) {
    const loader = registry.get(version);
    const manifest = await loader();
    results.push({
      version,
      transforms: manifest.default,
    });
  }

  return results;
}
