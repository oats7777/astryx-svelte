// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation.controls.test.ts
 * @input Svelte navigation controls and DOM keyboard events
 * @output Vitest coverage for pagination, segments, tabs, toolbar, layout, and overflow
 * @position Todo 12 red-first control tests for navigation components
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import Layout from './Layout.svelte';
import OverflowList from './OverflowList.svelte';
import Pagination from './Pagination.svelte';
import SegmentedControl from './SegmentedControl.svelte';
import TabList from './TabList.svelte';
import Toolbar from './Toolbar.svelte';
import {generatePageRange} from './navigation-utils.js';

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

describe('Svelte navigation controls', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given pagination inputs When page ranges render Then buttons, ellipses, and disabled bounds are semantic', async () => {
    const onChange = vi.fn();
    const target = createTarget();
    const app = mount(Pagination, {target, props: {page: 5, totalPages: 10, onChange}});
    await tick();

    query(target, 'button[aria-label="Go to page 6"]').click();
    await tick();

    expect(generatePageRange(5, 10, 1)).toEqual([1, '...', 4, 5, 6, '...', 10]);
    expect(onChange).toHaveBeenCalledWith(6);
    expect(query(target, 'button[aria-label="Go to page 5"]').getAttribute('aria-current')).toBe('page');
    expect(target.querySelectorAll('[data-ellipsis="true"]')).toHaveLength(2);

    await unmount(app);
  });

  it('Given disabled pagination When controls are clicked Then no navigation callback fires', async () => {
    const onChange = vi.fn();
    const target = createTarget();
    const app = mount(Pagination, {
      target,
      props: {page: 1, totalPages: 3, onChange, disabled: true},
    });
    await tick();

    query(target, 'button[aria-label="Go to next page"]').click();

    expect(target.querySelectorAll('button:disabled').length).toBeGreaterThanOrEqual(3);
    expect(onChange).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given a segmented control When arrow navigation encounters disabled items Then focus skips them', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const target = createTarget();
    const app = mount(SegmentedControl, {
      target,
      props: {
        label: 'View mode',
        value: 'grid',
        options: [
          {label: 'Grid', value: 'grid'},
          {label: 'List', value: 'list', disabled: true},
          {label: 'Table', value: 'table'},
        ],
        onChange,
      },
    });
    await tick();

    query(target, '[role="radio"][aria-checked="true"]').focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('table');
    expect(query(target, '[role="radio"][data-value="table"]')).toBe(document.activeElement);

    await unmount(app);
  });

  it('Given a segmented control with unmatched value When rendered Then only the first enabled option is tabbable', async () => {
    const target = createTarget();
    const app = mount(SegmentedControl, {
      target,
      props: {
        label: 'View mode',
        value: 'missing',
        options: [
          {label: 'Grid', value: 'grid'},
          {label: 'List', value: 'list', disabled: true},
          {label: 'Table', value: 'table'},
        ],
        onChange: () => {},
      },
    });
    await tick();

    expect(
      [...target.querySelectorAll<HTMLElement>('[role="radio"]')].map((item) => [
        item.dataset.value,
        item.getAttribute('tabindex'),
        item.getAttribute('aria-disabled'),
      ]),
    ).toEqual([
      ['grid', '0', null],
      ['list', '-1', 'true'],
      ['table', '-1', null],
    ]);

    await unmount(app);
  });

  it('Given a tab list with menu overflow When keyboard and menu selection run Then current tab updates are reported', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const target = createTarget();
    const app = mount(TabList, {
      target,
      props: {
        value: 'home',
        tabs: [
          {label: 'Home', value: 'home'},
          {label: 'Settings', value: 'settings'},
        ],
        menu: {label: 'More', options: [{label: 'Reports', value: 'reports'}]},
        onChange,
      },
    });
    await tick();

    query(target, 'button[aria-current="page"]').focus();
    await user.keyboard('{ArrowRight}');
    await user.click(query(target, 'button[aria-haspopup="menu"]'));
    await user.click(query(target, '[role="menuitem"]'));

    expect(onChange).toHaveBeenNthCalledWith(1, 'settings');
    expect(onChange).toHaveBeenNthCalledWith(2, 'reports');
    expect(query(target, '[role="menu"]').getAttribute('aria-label')).toBe('More');

    await unmount(app);
  });

  it('Given a tab list with selected second tab When rendered Then the tab strip has one roving tab stop', async () => {
    const target = createTarget();
    const app = mount(TabList, {
      target,
      props: {
        value: 'settings',
        tabs: [
          {label: 'Home', value: 'home'},
          {label: 'Settings', value: 'settings'},
          {label: 'Reports', value: 'reports', disabled: true},
        ],
        onChange: () => {},
      },
    });
    await tick();

    expect(
      [...target.querySelectorAll<HTMLButtonElement>('nav > button')].map((button) => [
        button.dataset.value,
        button.tabIndex,
      ]),
    ).toEqual([
      ['home', -1],
      ['settings', 0],
      ['reports', -1],
    ]);

    await unmount(app);
  });

  it('Given toolbar controls When arrow, Home, and End keys are pressed Then focus moves inside the toolbar', async () => {
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(Toolbar, {
      target,
      props: {
        label: 'Actions',
        actions: [
          {label: 'Cut', value: 'cut'},
          {label: 'Copy', value: 'copy'},
          {label: 'Paste', value: 'paste'},
        ],
      },
    });
    await tick();

    query(target, 'button[data-value="cut"]').focus();
    await user.keyboard('{ArrowRight}{End}{Home}');

    expect(query(target, 'button[data-value="cut"]')).toBe(document.activeElement);
    expect(query(target, '[role="toolbar"]').getAttribute('aria-orientation')).toBe('horizontal');

    await unmount(app);
  });

  it('Given toolbar controls When rendered Then only the active enabled action is in the tab order', async () => {
    const target = createTarget();
    const app = mount(Toolbar, {
      target,
      props: {
        label: 'Actions',
        actions: [
          {label: 'Cut', value: 'cut'},
          {label: 'Copy', value: 'copy', disabled: true},
          {label: 'Paste', value: 'paste'},
        ],
      },
    });
    await tick();

    expect(query(target, '[role="toolbar"]').getAttribute('tabindex')).toBe('-1');
    expect(
      [...target.querySelectorAll<HTMLButtonElement>('[role="toolbar"] button')].map((button) => [
        button.dataset.value,
        button.tabIndex,
      ]),
    ).toEqual([
      ['cut', 0],
      ['copy', -1],
      ['paste', -1],
    ]);

    await unmount(app);
  });

  it('Given layout and overflow controls When rendered Then content width, edge compensation, and collapse order are observable', async () => {
    const target = createTarget();
    const layout = mount(Layout, {
      target,
      props: {content: 'Article', contentWidth: 'narrow', edgeCompensation: true},
    });
    const overflow = mount(OverflowList, {
      target,
      props: {
        items: ['One', 'Two', 'Three', 'Four'],
        maxVisibleItems: 2,
        collapseFrom: 'start',
      },
    });
    await tick();

    expect(query(target, '[data-content-width="narrow"]').textContent).toContain('Article');
    expect(query(target, '[data-edge-compensation="true"]')).toBeTruthy();
    expect(target.querySelectorAll('[data-overflow-hidden="true"]')).toHaveLength(2);
    expect(query(target, '[data-overflow-count]').getAttribute('data-overflow-count')).toBe('2');

    await unmount(layout);
    await unmount(overflow);
  });
});
