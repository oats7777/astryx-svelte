// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-registry.ts
 * @input Semantic icon registrations from themes and consumers
 * @output Global Svelte icon registry snapshots and lookups
 * @position Framework-agnostic icon registry for @astryxdesign/svelte
 */

import type {Component} from 'svelte';

export const iconNames = [
  'close',
  'chevronDown',
  'chevronLeft',
  'chevronRight',
  'check',
  'success',
  'error',
  'warning',
  'info',
  'calendar',
  'clock',
  'externalLink',
  'menu',
  'moreHorizontal',
  'search',
  'arrowUp',
  'arrowDown',
  'arrowsUpDown',
  'funnel',
  'eyeSlash',
  'viewColumns',
  'copy',
  'checkDouble',
  'wrench',
  'stop',
  'microphone',
] as const;

export type IconName = (typeof iconNames)[number];
export type IconSource = string | Component<Record<string, never>>;
export type IconRegistry = Record<IconName, IconSource>;
export type IconRegistryInput = Readonly<Record<string, IconSource | null>>;

export class IconRegistryError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = 'IconRegistryError';
    this.reason = reason;
  }
}

export const defaultIcons: IconRegistry = {
  close: 'close',
  chevronDown: 'chevronDown',
  chevronLeft: 'chevronLeft',
  chevronRight: 'chevronRight',
  check: 'check',
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  calendar: 'calendar',
  clock: 'clock',
  externalLink: 'externalLink',
  menu: 'menu',
  moreHorizontal: 'moreHorizontal',
  search: 'search',
  arrowUp: 'arrowUp',
  arrowDown: 'arrowDown',
  arrowsUpDown: 'arrowsUpDown',
  funnel: 'funnel',
  eyeSlash: 'eyeSlash',
  viewColumns: 'viewColumns',
  copy: 'copy',
  checkDouble: 'checkDouble',
  wrench: 'wrench',
  stop: 'stop',
  microphone: 'microphone',
};

const validIconNames = new Set<string>(iconNames);
let globalRegistry: Partial<Record<IconName, IconSource | null>> = {};

function assertIconName(name: string): asserts name is IconName {
  if (!validIconNames.has(name)) {
    throw new IconRegistryError(`Unknown Astryx icon name "${name}".`);
  }
}

export function registerIcons(icons: IconRegistryInput): void {
  for (const name of Object.keys(icons)) {
    assertIconName(name);
  }

  globalRegistry = {...globalRegistry, ...icons};
}

export function getIcon(name: IconName): IconSource {
  return globalRegistry[name] ?? defaultIcons[name];
}

export function getIconRegistry(): Readonly<IconRegistry> {
  const registry: IconRegistry = {...defaultIcons};

  for (const name of iconNames) {
    registry[name] = globalRegistry[name] ?? defaultIcons[name];
  }

  return registry;
}

export function resetIcons(): void {
  globalRegistry = {};
}
