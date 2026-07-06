// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared framework option registry for CLI APIs and commands.
 *
 * Keeps Svelte as the only public target for this package while giving CLI
 * commands one append-only place for framework validation and user-facing
 * choices.
 */

export const DEFAULT_FRAMEWORK = 'svelte';
export const SUPPORTED_FRAMEWORKS = Object.freeze(['svelte']);

export function supportedFrameworksLabel() {
  return SUPPORTED_FRAMEWORKS.join(', ');
}

export function resolveFramework(framework) {
  const value = framework ?? DEFAULT_FRAMEWORK;
  return SUPPORTED_FRAMEWORKS.includes(value) ? value : null;
}
