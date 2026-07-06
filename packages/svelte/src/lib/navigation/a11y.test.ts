// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y.test.ts
 * @input Svelte navigation components rendered in jsdom
 * @output Package-local accessibility semantics coverage for navigation slice
 * @position Todo 12 a11y test target for navigation components
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it} from 'vitest';
import AppShell from './AppShell.svelte';
import Breadcrumbs from './Breadcrumbs.svelte';
import Pagination from './Pagination.svelte';
import SegmentedControl from './SegmentedControl.svelte';
import SideNav from './SideNav.svelte';
import TabList from './TabList.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function query(root: ParentNode, selector: string): HTMLElement {
  const node = root.querySelector(selector);
  if (!(node instanceof HTMLElement)) {
    throw new Error(`Missing selector: ${selector}`);
  }
  return node;
}

describe('Svelte navigation accessibility semantics', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given shell navigation When rendered Then landmarks, skip link, drawer, and current state are labeled', async () => {
    const target = createTarget();
    const app = mount(AppShell, {
      target,
      props: {
        title: 'Astryx',
        topNavItems: [{label: 'Home', href: '/', active: true}],
        sideNavItems: [{label: 'Settings', href: '/settings'}],
        mobileNav: {defaultIsMobile: true},
        content: 'Body',
      },
    });
    await tick();

    expect(query(target, 'a[href="#astryx-app-shell-main"]').textContent).toBe('Skip to content');
    expect(query(target, 'main').id).toBe('astryx-app-shell-main');
    expect(query(target, 'dialog').getAttribute('aria-label')).toBe('Navigation');
    expect(query(target, 'a[aria-current="page"]').textContent).toContain('Home');

    await unmount(app);
  });

  it('Given page and choice controls When rendered Then accessible roles and selected states are exposed', async () => {
    const target = createTarget();
    const pager = mount(Pagination, {
      target,
      props: {page: 2, totalPages: 3, onChange: () => {}},
    });
    const segments = mount(SegmentedControl, {
      target,
      props: {
        label: 'Density',
        value: 'cozy',
        options: [
          {label: 'Compact', value: 'compact'},
          {label: 'Cozy', value: 'cozy'},
        ],
        onChange: () => {},
      },
    });
    const tabs = mount(TabList, {
      target,
      props: {
        label: 'Sections',
        value: 'overview',
        tabs: [
          {label: 'Overview', value: 'overview'},
          {label: 'Activity', value: 'activity'},
        ],
        onChange: () => {},
      },
    });
    await tick();

    expect(query(target, 'nav[aria-label="Pagination"]')).toBeTruthy();
    expect(query(target, '[role="radiogroup"]').getAttribute('aria-label')).toBe('Density');
    expect(query(target, '[role="radio"][aria-checked="true"]').textContent).toContain('Cozy');
    expect(query(target, 'nav[aria-label="Sections"] button[aria-current="page"]').textContent).toContain('Overview');

    await unmount(pager);
    await unmount(segments);
    await unmount(tabs);
  });

  it('Given breadcrumb current item When rendered Then aria-current is placed only on the content element', async () => {
    const target = createTarget();
    const app = mount(Breadcrumbs, {
      target,
      props: {
        items: [
          {label: 'Home', href: '/'},
          {label: 'Projects', href: '/projects'},
          {label: 'Apollo', href: '/projects/apollo', current: true},
        ],
      },
    });
    await tick();

    const current = query(target, '[aria-current="page"]');
    expect(current.tagName).toBe('SPAN');
    expect(current.textContent).toBe('Apollo');
    expect(target.querySelector('li[aria-current="page"]')).toBeNull();
    expect(target.querySelector('nav[aria-current="page"]')).toBeNull();

    await unmount(app);
  });

  it('Given side nav split action item When current Then aria-current belongs to the primary link only', async () => {
    const target = createTarget();
    const app = mount(SideNav, {
      target,
      props: {
        items: [
          {
            label: 'Reports',
            href: '/reports',
            active: true,
            items: [{label: 'Daily', href: '/reports/daily'}],
          },
        ],
      },
    });
    await tick();

    const current = query(target, 'a[aria-current="page"]');
    expect(current.textContent).toContain('Reports');
    expect(target.querySelector('button[aria-current="page"]')).toBeNull();
    expect(target.querySelector('[data-sidenav-row][aria-current="page"]')).toBeNull();

    await unmount(app);
  });
});
