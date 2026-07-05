// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-registry.test.ts
 * @input Global Svelte icon registry mutations
 * @output Register, get, reset, fallback, and invalid input assertions
 * @position Framework-agnostic icon registry tests for @astryxdesign/svelte
 */

import {beforeEach, describe, expect, it} from 'vitest';
import {
  defaultIcons,
  getIcon,
  getIconRegistry,
  IconRegistryError,
  registerIcons,
  resetIcons,
} from './icon-registry.js';

describe('Svelte icon registry', () => {
  beforeEach(() => {
    resetIcons();
  });

  it('Given no registrations When reading registry Then returns a default snapshot', () => {
    const registry = getIconRegistry();

    expect(Object.keys(registry)).toEqual(Object.keys(defaultIcons));
    expect(registry).toEqual(defaultIcons);
    expect(registry).not.toBe(defaultIcons);
  });

  it('Given custom icons When registered Then custom values override defaults', () => {
    registerIcons({close: 'custom-close'});

    expect(getIcon('close')).toBe('custom-close');
    expect(getIconRegistry().close).toBe('custom-close');
    expect(getIconRegistry().check).toBe(defaultIcons.check);
  });

  it('Given multiple registrations When read Then later values win and missing values fall back', () => {
    registerIcons({close: 'close-v1'});
    registerIcons({check: 'check-v1'});
    registerIcons({close: 'close-v2'});

    expect(getIcon('close')).toBe('close-v2');
    expect(getIcon('check')).toBe('check-v1');
    expect(getIcon('calendar')).toBe(defaultIcons.calendar);
  });

  it('Given a null registration When read Then default icon is returned', () => {
    registerIcons({close: null});

    expect(getIcon('close')).toBe(defaultIcons.close);
    expect(getIconRegistry().close).toBe(defaultIcons.close);
  });

  it('Given an invalid icon name When registered Then throws a typed registry error', () => {
    expect(() => registerIcons({'not-real': 'broken'})).toThrow(IconRegistryError);
  });

  it('Given mixed valid and invalid icons When registered Then throws without changing the registry', () => {
    expect(() => registerIcons({close: 'custom-close', 'not-real': 'broken'})).toThrow(
      IconRegistryError,
    );

    expect(getIcon('close')).toBe(defaultIcons.close);
    expect(getIconRegistry()).toEqual(defaultIcons);
  });

  it('Given overrides When reset Then registry falls back to defaults', () => {
    registerIcons({close: 'custom-close'});
    resetIcons();

    expect(getIcon('close')).toBe(defaultIcons.close);
  });
});
