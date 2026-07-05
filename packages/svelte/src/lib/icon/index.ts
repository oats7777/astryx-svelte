// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte icon registry implementation
 * @output Public icon registry subpath for @astryxdesign/svelte
 * @position Export barrel for @astryxdesign/svelte/icon
 */

export {
  defaultIcons,
  getIcon,
  getIconRegistry,
  IconRegistryError,
  iconNames,
  registerIcons,
  resetIcons,
} from './icon-registry.js';
export type {IconName, IconRegistry, IconRegistryInput, IconSource} from './icon-registry.js';
