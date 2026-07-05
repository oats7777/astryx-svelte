// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y.test.ts
 * @input axe-core with representative rich-surfaces Svelte components
 * @output Package-local accessibility regression coverage for Todo 14 surfaces
 * @position A11y command target for rich-surfaces
 */

import axe from 'axe-core';
import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import AccessibilityHarness from './test-fixtures/AccessibilityHarness.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte rich-surfaces accessibility', () => {
  it('Given representative rich surfaces When scanned Then axe reports no violations', async () => {
    const target = createTarget();
    const app = mount(AccessibilityHarness, {target});

    await tick();

    const result = await axe.run(target, {
      rules: {
        region: {enabled: false},
      },
    });

    expect(result.violations).toEqual([]);

    await unmount(app);
  });
});
