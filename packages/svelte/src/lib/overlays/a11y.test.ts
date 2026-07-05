// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y.test.ts
 * @input axe-core with mounted Svelte overlay fixtures
 * @output Package-local accessibility regression coverage for overlays
 * @position Todo 11 a11y command target
 */

import axe from 'axe-core';
import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import DialogHarness from './test-fixtures/DialogHarness.svelte';
import MenuToastHarness from './test-fixtures/MenuToastHarness.svelte';
import {toastStore} from './toast-store.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte overlays accessibility', () => {
  beforeEach(() => {
    document.body.textContent = '';
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    toastStore.clear();
  });

  it('Given modal and transient overlays When scanned Then axe reports no violations for the mounted surface', async () => {
    // Given: representative modal and transient overlay surfaces.
    const dialogTarget = createTarget();
    const menuTarget = createTarget();
    const dialogApp = mount(DialogHarness, {target: dialogTarget});
    const menuApp = mount(MenuToastHarness, {target: menuTarget});

    await tick();

    // When: axe scans the package-local overlay DOM.
    const result = await axe.run(document.body, {
      rules: {
        region: {enabled: false},
      },
    });

    // Then: no accessibility violations are present in the rendered overlay semantics.
    expect(result.violations).toEqual([]);

    await unmount(dialogApp);
    await unmount(menuApp);
  });
});
