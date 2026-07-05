// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file root-sync.test.ts
 * @input Svelte Theme component mounted in jsdom
 * @output Root attribute, nested theme, cleanup, and invalid theme assertions
 * @position Behavior tests for the Svelte theme runtime
 */

import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it} from 'vitest';
import RootSyncProbe from './test-fixtures/RootSyncProbe.svelte';
import {defineTheme, generateThemeCSS, ThemeRuntimeError} from './theme.js';

const rootTheme = defineTheme({
  name: 'test',
  tokens: {
    '--color-accent': ['#AA0000', '#FF5555'],
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

function resetRootAttributes(): void {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-astryx-theme');
}

describe('Svelte Theme root sync', () => {
  beforeEach(() => {
    document.body.textContent = '';
    resetRootAttributes();
  });

  it('Given a root dark theme When mounted Then syncs html data-theme and data-astryx-theme', async () => {
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme, nestedTheme, mode: 'dark'},
    });

    await tick();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-astryx-theme')).toBe('test');

    await unmount(app);
  });

  it('Given system mode When mounted Then removes html data-theme and keeps portal theme reach', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme, nestedTheme, mode: 'system'},
    });

    await tick();

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(document.documentElement.getAttribute('data-astryx-theme')).toBe('test');

    await unmount(app);
  });

  it('Given nested themes When mounted Then nested wrappers inherit locally without overriding html', async () => {
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme, nestedTheme, mode: 'dark', showNested: true},
    });

    await tick();

    const nestedWrapper = target.querySelector('[data-astryx-theme="alt"]');
    const nestedConsumer = target.querySelector('[data-testid="nested-consumer"]');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-astryx-theme')).toBe('test');
    expect(nestedWrapper?.getAttribute('data-theme')).toBe('light');
    expect(nestedConsumer?.getAttribute('data-theme-name')).toBe('alt');
    expect(nestedConsumer?.getAttribute('data-accent')).toBe('#00AA00');

    await unmount(app);
  });

  it('Given a root theme When unmounted Then cleans html theme attributes', async () => {
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme, nestedTheme, mode: 'light'},
    });

    await tick();
    await unmount(app);

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(document.documentElement.hasAttribute('data-astryx-theme')).toBe(false);
  });

  it('Given a runtime theme When mounted Then injects theme CSS and removes it on unmount', async () => {
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme, nestedTheme, mode: 'light'},
    });

    await tick();

    const style = document.head.querySelector('style[data-astryx-theme="test"]');
    expect(style?.textContent).toContain('@layer astryx-theme');
    expect(style?.textContent).toContain('--color-accent: light-dark(#AA0000, #FF5555);');

    await unmount(app);

    expect(document.head.querySelector('style[data-astryx-theme="test"]')).toBeNull();
  });

  it('Given nested themes with component CSS When generated Then parent component rules stop at nested theme boundaries', () => {
    const componentTheme = defineTheme({
      name: 'component-parent',
      components: {
        button: {
          base: {
            color: 'var(--color-accent)',
          },
        },
      },
    });

    const css = generateThemeCSS(componentTheme);

    expect(css.component).toContain(
      '@scope ([data-astryx-theme="component-parent"]) to ([data-astryx-theme])',
    );
    expect(css.component).toContain('.astryx-button {\n  color: var(--color-accent);\n}');
    expect(css.component).not.toContain('[data-astryx-theme="component-parent"] .astryx-button');
  });

  it('Given a built theme When mounted Then skips runtime CSS injection', async () => {
    const builtTheme = defineTheme({
      name: 'built',
      built: true,
      tokens: {
        '--color-accent': ['#111111', '#EEEEEE'],
      },
    });
    const target = createTarget();
    const app = mount(RootSyncProbe, {
      target,
      props: {rootTheme: builtTheme, nestedTheme, mode: 'light'},
    });

    await tick();

    expect(document.head.querySelector('style[data-astryx-theme="built"]')).toBeNull();

    await unmount(app);
  });

  it('Given a malformed theme name When defining a theme Then throws a typed runtime error', () => {
    expect(() =>
      defineTheme({
        name: 'Invalid Theme',
        tokens: {
          '--color-accent': '#111111',
        },
      }),
    ).toThrow(ThemeRuntimeError);
  });
});
