// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file context-replacements.test.ts
 * @input Svelte SizeContext and InteractiveRoleContext replacement helpers
 * @output DOM-independent context helper coverage without React context APIs
 * @position Misc tests for Todo 14 Svelte context replacement slice
 */

import {describe, expect, it} from 'vitest';
import {interactiveRoleFallback, normalizeInteractiveRole} from './interactive-role-context.js';
import {normalizeSize, sizeClass} from './size-context.js';

describe('misc context replacements', () => {
  it('Given size context values When normalized Then unsupported values fall back to md and class names are stable', () => {
    expect(normalizeSize('sm')).toBe('sm');
    expect(normalizeSize('xl')).toBe('md');
    expect(sizeClass('lg')).toBe('astryx-size-lg');
  });

  it('Given interactive role context values When normalized Then button and link roles replace React context fallbacks', () => {
    expect(normalizeInteractiveRole('link')).toBe('link');
    expect(normalizeInteractiveRole('menuitem')).toBe('button');
    expect(interactiveRoleFallback(undefined)).toEqual({role: 'button', tabIndex: 0});
    expect(interactiveRoleFallback('link')).toEqual({role: 'link', tabIndex: 0});
  });
});
