// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation.ssr.test.ts
 * @input Svelte server render of AppShell
 * @output SSR-safe media-query default assertion without browser globals
 * @position Todo 12 navigation SSR safety coverage
 */

import {render} from 'svelte/server';
import {describe, expect, it} from 'vitest';
import AppShell from './AppShell.svelte';

describe('Svelte navigation SSR safety', () => {
  it('Given no window When AppShell server-renders Then media-query defaults do not access browser APIs', () => {
    const result = render(AppShell, {
      props: {
        title: 'SSR',
        mobileNav: {defaultIsMobile: false, breakpoint: 'lg'},
        sideNavItems: [{label: 'Docs', href: '/docs'}],
        content: 'Server content',
      },
    });

    expect(result.body).toContain('Server content');
    expect(result.body).toContain('astryx-app-shell-main');
  });
});
