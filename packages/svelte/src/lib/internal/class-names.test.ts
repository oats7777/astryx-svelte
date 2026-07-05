// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file class-names.test.ts
 * @input Class composition values used by Svelte component internals
 * @output Observable class string ordering and filtering assertions
 * @position Tests for Svelte class composition primitives
 */

import {describe, expect, it} from 'vitest';
import {classNames} from './class-names.js';

describe('classNames', () => {
  it('Given nested class values When composed Then preserves order and drops empty states', () => {
    const result = classNames(
      'astryx-button',
      '',
      false,
      ['inline-flex', undefined, ['items-center', null]],
      {active: true, disabled: false},
      4,
      'text-primary',
    );

    expect(result).toBe('astryx-button inline-flex items-center active 4 text-primary');
  });
});
