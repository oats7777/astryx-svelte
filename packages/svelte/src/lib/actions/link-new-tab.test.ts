// Copyright (c) Meta Platforms, Inc. and affiliates.

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import Link from './Link.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte Link new-tab announcement', () => {
  it('Given external new-tab navigation When Link renders Then the accessible name announces the context change', async () => {
    const target = createTarget();
    const app = mount(Link, {
      target,
      props: {href: 'https://example.com/docs', label: 'Docs', isExternalLink: true},
    });

    await tick();

    const anchor = target.querySelector('a');
    const hiddenText = anchor?.querySelector('.astryx-sr-only');
    expect(anchor?.getAttribute('aria-label')).toBe('Docs (opens in new tab)');
    expect(hiddenText?.textContent).toBe('(opens in new tab)');

    await unmount(app);
  });

  it('Given localized external new-tab navigation When Link renders Then the new-tab label can be overridden', async () => {
    const target = createTarget();
    const app = mount(Link, {
      target,
      props: {
        href: 'https://example.com/docs',
        label: 'Docs',
        isExternalLink: true,
        newTabLabel: '(ouvre un nouvel onglet)',
      },
    });

    await tick();

    const anchor = target.querySelector('a');
    expect(anchor?.getAttribute('aria-label')).toBe('Docs (ouvre un nouvel onglet)');
    expect(anchor?.querySelector('.astryx-sr-only')?.textContent).toBe('(ouvre un nouvel onglet)');

    await unmount(app);
  });
});
