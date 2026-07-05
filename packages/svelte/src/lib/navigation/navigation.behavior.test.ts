// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation.behavior.test.ts
 * @input Svelte navigation components and DOM keyboard events
 * @output Vitest coverage for app shell, menus, drawers, and nav active state
 * @position Todo 12 red-first behavior tests for navigation components
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import AppShell from './AppShell.svelte';
import AppShellContentProbe from './test-fixtures/AppShellContentProbe.svelte';
import Breadcrumbs from './Breadcrumbs.svelte';
import MobileNav from './MobileNav.svelte';
import NavMenu from './NavMenu.svelte';
import NavigationLinkProviderProbe from './test-fixtures/NavigationLinkProviderProbe.svelte';
import SideNav from './SideNav.svelte';
import TopNav from './TopNav.svelte';

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

describe('Svelte navigation shell and menu behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.textContent = '';
  });

  it('Given app shell mobile defaults When rendered Then side nav starts in an SSR-safe drawer state', async () => {
    const target = createTarget();
    const app = mount(AppShell, {
      target,
      props: {
        title: 'Astryx',
        sideNavItems: [{label: 'Dashboard', href: '/dashboard', active: true}],
        mobileNav: {defaultIsMobile: true, breakpoint: 'md'},
        content: 'Main content',
      },
    });
    await tick();

    const main = query(target, 'main');
    const toggle = query(target, 'button[aria-controls="astryx-mobile-nav"]');
    const dialog = query(target, '#astryx-mobile-nav');

    expect(main.textContent).toContain('Main content');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(dialog.tagName).toBe('DIALOG');
    expect(target.querySelector('[data-astryx-inline-sidenav="true"]')).toBeNull();

    await unmount(app);
  });

  it('Given normal Svelte children When AppShell renders Then child content is inside the main landmark', async () => {
    const target = createTarget();
    const app = mount(AppShellContentProbe, {target});
    await tick();

    const main = query(target, 'main');
    const nestedContent = query(target, '[data-testid="nested-shell-content"]');

    expect(main.contains(nestedContent)).toBe(true);
    expect(main.textContent).toContain('Nested child content');
    expect(query(main, 'button').textContent).toBe('Child action');

    await unmount(app);
  });

  it('Given a nav menu When opened by keyboard Then focus moves through enabled menu items only', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const target = createTarget();
    const app = mount(NavMenu, {
      target,
      props: {
        label: 'Products',
        items: [
          {label: 'Analytics', value: 'analytics'},
          {label: 'Billing', value: 'billing', disabled: true},
          {label: 'Settings', value: 'settings'},
        ],
        onSelect,
      },
    });
    await tick();

    query(target, 'button').focus();
    await user.keyboard('{Enter}{ArrowDown}{Enter}');
    await tick();

    expect(onSelect).toHaveBeenCalledWith('settings');
    expect(target.querySelector('[role="menu"]')).toBeNull();

    await unmount(app);
  });

  it('Given top and side navigation When active and disabled items render Then states are semantic', async () => {
    const target = createTarget();
    const app = mount(AppShell, {
      target,
      props: {
        topNavItems: [
          {label: 'Home', href: '/', active: true},
          {label: 'Admin', href: '/admin', disabled: true},
        ],
        sideNavItems: [{label: 'Settings', value: 'settings', disabled: true}],
        content: 'Workspace',
      },
    });
    await tick();

    const activeLink = query(target, 'a[aria-current="page"]');
    const disabledTop = query(target, 'button[aria-disabled="true"][data-href="/admin"]');
    const disabledSide = query(target, 'button[aria-disabled="true"]');

    expect(activeLink.textContent).toContain('Home');
    expect(disabledTop.getAttribute('disabled')).toBe('');
    expect(disabledSide.getAttribute('disabled')).toBe('');

    await unmount(app);
  });

  it('Given mobile drawer When cancelled, backdrop-clicked, or content-clicked Then close semantics match native dialog', async () => {
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(MobileNav, {
      target,
      props: {open: true, title: 'Navigation', items: [{label: 'Home', href: '/'}], onOpenChange},
    });
    await tick();

    query(target, 'a').click();
    query(target, 'dialog').dispatchEvent(new Event('cancel', {cancelable: true}));
    query(target, 'dialog').click();

    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await unmount(app);
  });

  it('Given breadcrumbs When rendered Then current page and separators are accessible', async () => {
    const target = createTarget();
    const app = mount(Breadcrumbs, {
      target,
      props: {
        items: [
          {label: 'Home', href: '/'},
          {label: 'Projects', href: '/projects'},
          {label: 'Detail', current: true},
        ],
      },
    });
    await tick();

    expect(query(target, 'nav').getAttribute('aria-label')).toBe('Breadcrumb');
    expect(query(target, 'ol')).toBeTruthy();
    expect(query(target, '[aria-current="page"]').textContent).toContain('Detail');
    expect(target.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);

    await unmount(app);
  });

  it('Given a custom LinkProvider When navigation href links render Then router link components receive href and to props', async () => {
    const target = createTarget();
    const app = mount(NavigationLinkProviderProbe, {target});
    await tick();

    expect(target.querySelectorAll('[data-router-link="true"]')).toHaveLength(8);
    expect(
      target
        .querySelector('[data-testid="provider-nav-item"][data-router-link="true"]')
        ?.getAttribute('data-to'),
    ).toBe('/docs');
    expect(
      target.querySelector('[aria-label="Astryx"][data-router-link="true"]')?.getAttribute('data-to'),
    ).toBe('/');
    expect(
      target.querySelector('[aria-label="Home"][data-router-link="true"]')?.getAttribute('data-to'),
    ).toBe('/');
    expect(
      target
        .querySelector('[aria-label="Settings"][data-router-link="true"]')
        ?.getAttribute('data-to'),
    ).toBe('/settings');
    expect(
      target
        .querySelector('[aria-label="Home crumb"][data-router-link="true"]')
        ?.getAttribute('data-to'),
    ).toBe('/');
    expect(
      target
        .querySelector('[aria-label="Project crumb"][data-router-link="true"]')
        ?.getAttribute('data-to'),
    ).toBe('/projects');
    expect(
      target
        .querySelector('[aria-label="Side docs"][data-router-link="true"]')
        ?.getAttribute('data-to'),
    ).toBe('/side');
    expect(
      target
        .querySelector('[aria-label="Mobile docs"][data-router-link="true"]')
        ?.getAttribute('data-to'),
    ).toBe('/mobile');
    expect(query(target, '[data-testid="provider-disabled-nav-item"]').tagName).toBe('BUTTON');
    expect(
      target.querySelector('[data-testid="provider-disabled-nav-item"][data-router-link="true"]'),
    ).toBeNull();

    await unmount(app);
  });

  it('Given standalone top and side nav components When rendered Then they expose navigation landmarks', async () => {
    const target = createTarget();
    const top = mount(TopNav, {target, props: {label: 'Top', items: [{label: 'Home', href: '/'}]}});
    const side = mount(SideNav, {target, props: {items: [{label: 'Docs', href: '/docs'}]}});
    await tick();

    expect(target.querySelectorAll('nav[aria-label]').length).toBe(2);

    await unmount(top);
    await unmount(side);
  });
});
