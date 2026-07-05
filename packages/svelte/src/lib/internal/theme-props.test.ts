// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-props.test.ts
 * @input Svelte Tailwind variant and state selections
 * @output Stable class, Tailwind utility, and data-attribute reflection assertions
 * @position Tests for Svelte styling primitive props
 */

import {describe, expect, it} from 'vitest';
import {themeProps} from './theme-props.js';

const buttonTheme = {
  variants: {
    variant: {
      primary: 'bg-accent-bg text-on-accent',
      secondary: 'bg-muted text-primary',
    },
    size: {
      sm: 'h-sm px-2 text-sm',
      md: 'h-md px-3 text-base',
    },
  },
  states: {
    disabled: 'opacity-50 pointer-events-none',
    loading: 'cursor-progress',
    invalid: 'border-error text-error',
  },
} as const;

describe('themeProps', () => {
  it('Given variants and states When built Then returns Svelte class and reflected attributes', () => {
    const result = themeProps('button', buttonTheme, {
      variants: {variant: 'primary', size: 'sm'},
      states: {disabled: true, loading: true, invalid: false},
      class: ['consumer-class'],
    });

    expect(result.class).toBe(
      'astryx-button astryx-button--variant-primary bg-accent-bg text-on-accent astryx-button--size-sm h-sm px-2 text-sm astryx-button--disabled opacity-50 pointer-events-none astryx-button--loading cursor-progress consumer-class',
    );
    expect(result['data-variant']).toBe('primary');
    expect(result['data-size']).toBe('sm');
    expect(result['data-disabled']).toBe('true');
    expect(result['data-loading']).toBe('true');
    expect(result['data-invalid']).toBeUndefined();
    expect(result.disabled).toBe(true);
    expect(result['aria-disabled']).toBe('true');
    expect(result['aria-busy']).toBe('true');
  });
});
