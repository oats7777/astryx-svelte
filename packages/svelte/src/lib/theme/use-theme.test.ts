// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file use-theme.test.ts
 * @input Svelte theme context consumers
 * @output Resolved theme name, mode, token, and default fallback assertions
 * @position Tests for Svelte consumer access to current theme state
 */

import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it} from 'vitest';
import ConsumerOnlyProbe from './test-fixtures/ConsumerOnlyProbe.svelte';
import RootSyncProbe from './test-fixtures/RootSyncProbe.svelte';
import {defineTheme} from './theme.js';

const testTheme = defineTheme({
  name: 'test',
  tokens: {
    '--color-accent': ['#AA0000', '#FF5555'],
    '--spacing-4': '20px',
  },
});

const nestedTheme = defineTheme({
  name: 'alt',
  tokens: {
    '--color-accent': ['#00AA00', '#55FF55'],
  },
});

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte useTheme', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  it('Given no provider When consumed Then returns default light token values', async () => {
    const target = createTarget();
    const app = mount(ConsumerOnlyProbe, {
      target,
      props: {testId: 'consumer'},
    });

    await tick();

    const consumer = target.querySelector('[data-testid="consumer"]');

    expect(consumer?.getAttribute('data-theme-name')).toBe('default');
    expect(consumer?.getAttribute('data-mode')).toBe('light');
    expect(consumer?.getAttribute('data-text-primary')).toBe('#0A1317');
    expect(consumer?.getAttribute('data-spacing')).toBe('4px');

    await unmount(app);
  });

  it('Given a dark theme provider When consumed Then resolves tuple tokens to dark values', async () => {
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme: testTheme, nestedTheme, mode: 'dark'},
    });

    await tick();

    const consumer = target.querySelector('[data-testid="root-consumer"]');

    expect(consumer?.getAttribute('data-theme-name')).toBe('test');
    expect(consumer?.getAttribute('data-mode')).toBe('dark');
    expect(consumer?.getAttribute('data-accent')).toBe('#FF5555');
    expect(consumer?.getAttribute('data-spacing-4')).toBe('20px');

    await unmount(app);
  });
});
