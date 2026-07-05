// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme-props.invalid.test.ts
 * @input Malformed variant and state selections
 * @output Runtime contract failures for invalid Svelte styling props
 * @position Failure-mode tests for Svelte styling primitive props
 */

import {describe, expect, it} from 'vitest';
import {themeProps, ThemePropsError} from './theme-props.js';

const fieldTheme = {
  variants: {
    tone: {
      neutral: 'border-border',
      danger: 'border-error',
    },
  },
} as const;

describe('themeProps invalid input', () => {
  it('Given an unknown variant name When built Then throws a typed theme props error', () => {
    expect(() =>
      themeProps('field', fieldTheme, {
        variants: {density: 'compact'},
      }),
    ).toThrow(ThemePropsError);
  });

  it('Given an unknown variant value When built Then throws a typed theme props error', () => {
    expect(() =>
      themeProps('field', fieldTheme, {
        variants: {tone: 'warning'},
      }),
    ).toThrow('Unknown value "warning" for variant "tone" on "field".');
  });

  it('Given malformed state values When built Then throws a typed theme props error', () => {
    const states: Record<string, unknown> = {disabled: 'yes'};

    expect(() =>
      themeProps('field', fieldTheme, {
        states,
      }),
    ).toThrow('State "disabled" on "field" must be boolean.');
  });
});
