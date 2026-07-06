// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file task-8.test.ts
 * @input Todo 8 Svelte data-display regression fixtures and DOM events
 * @output Focused coverage for pagination guards, table menus, and APG tree metadata
 * @position Todo 8 latest-main parity tests for data-display
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import Pagination from './Pagination.svelte';
import Table from './Table.svelte';
import TreeList from './TreeList.svelte';
import {paginateRows} from './plugins/index.js';
import type {TablePlugin} from './types.js';

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

function keydown(element: Element, key: string): boolean {
  return element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

const rows = [
  {id: 'a', name: 'Atlas', status: 'active', score: 3},
  {id: 'b', name: 'Beacon', status: 'paused', score: 8},
  {id: 'c', name: 'Comet', status: 'active', score: 1},
  {id: 'd', name: 'Delta', status: 'active', score: 9},
] as const;

const columns = [
  {key: 'name', header: 'Name', sortable: true, sticky: 'start', width: 160},
  {key: 'status', header: 'Status', filterable: true},
  {key: 'score', header: 'Score', sortable: true, align: 'end'},
] as const;

describe('Todo 8 Svelte data-display parity', () => {
  it('Given malformed page sizes When pagination runs Then page counts and slices stay finite', async () => {
    expect(paginateRows(rows, {page: 1, pageSize: 0}).map((row) => row.id)).toEqual(['a']);
    expect(paginateRows(rows, {page: 1, pageSize: -5}).map((row) => row.id)).toEqual(['a']);
    expect(paginateRows(rows, {page: 1, pageSize: Number.NaN}).map((row) => row.id)).toEqual(['a']);

    const target = createTarget();
    const zero = mount(Pagination, {target, props: {page: 1, pageSize: 0, totalItems: 4}});
    const negative = mount(Pagination, {target, props: {page: 1, pageSize: -5, totalItems: 4}});
    const nan = mount(Pagination, {target, props: {page: 1, pageSize: Number.NaN, totalItems: 4}});
    await tick();

    const announcements = [...target.querySelectorAll('span[aria-live="polite"]')].map((item) => item.textContent);
    expect(announcements).toEqual(['Page 1 of 4', 'Page 1 of 4', 'Page 1 of 4']);

    await unmount(zero);
    await unmount(negative);
    await unmount(nan);
  });

  it('Given table context-menu plugins When header and row menus open Then contributed actions are selectable', async () => {
    const user = userEvent.setup();
    const onHeaderAction = vi.fn();
    const onRowAction = vi.fn();
    const plugins: readonly TablePlugin[] = [
      {
        transformHeaderCell: (cellProps, column) => ({
          ...cellProps,
          contextMenuActions:
            column.key === 'score'
              ? [{id: 'sort-score-desc', label: 'Sort score descending', onSelect: onHeaderAction}]
              : cellProps.contextMenuActions,
        }),
        transformBodyCell: (cellProps, column, row) => ({
          ...cellProps,
          contextMenuActions:
            column.key === 'name'
              ? [
                  {
                    id: `open-${String(row.id)}`,
                    label: `Open ${String(row.name)}`,
                    onSelect: () => {
                      onRowAction(row.id);
                    },
                  },
                ]
              : cellProps.contextMenuActions,
        }),
      },
    ];
    const target = createTarget();
    const app = mount(Table, {
      target,
      props: {caption: 'Services', rows, columns, pageSize: 2, plugins},
    });
    await tick();

    await user.pointer({keys: '[MouseRight]', target: query(target, 'th[data-column-key="score"]')});
    await user.click(query(target, '[role="menuitem"][data-action-id="sort-score-desc"]'));
    await user.pointer({keys: '[MouseRight]', target: query(target, 'tbody td[data-column-key="name"]')});
    await user.click(query(target, '[role="menuitem"][data-action-id="open-a"]'));

    expect(onHeaderAction).toHaveBeenCalledTimes(1);
    expect(onRowAction).toHaveBeenCalledWith('a');

    await unmount(app);
  });

  it('Given an initial table page When rendered Then page rows and pagination honor the public page prop', async () => {
    const target = createTarget();
    const app = mount(Table, {
      target,
      props: {caption: 'Services', rows, columns, page: 2, pageSize: 2},
    });
    await tick();

    const renderedRows = [...target.querySelectorAll('tbody tr')].map((row) => row.textContent);
    expect(renderedRows).toEqual(['Cometactive1', 'Deltaactive9']);
    expect(query(target, 'span[aria-live="polite"]').textContent).toBe('Page 2 of 2');

    await unmount(app);
  });

  it('Given a nested tree When rendered and keyboarded Then APG metadata and parent focus are correct', async () => {
    const target = createTarget();
    const app = mount(TreeList, {
      target,
      props: {
        label: 'Repository',
        expandedKeys: ['root', 'src'],
        selectedKey: 'lib',
        items: [
          {
            key: 'root',
            label: 'Root',
            children: [
              {
                key: 'src',
                label: 'src',
                children: [
                  {key: 'lib', label: 'lib'},
                  {key: 'routes', label: 'routes'},
                ],
              },
              {key: 'tests', label: 'tests'},
            ],
          },
        ],
      },
    });
    await tick();

    const visibleItems = () => [...target.querySelectorAll<HTMLElement>('[role="treeitem"]')];
    expect(
      visibleItems().map((item) => [
        item.dataset.treeKey,
        item.getAttribute('aria-level'),
        item.getAttribute('aria-posinset'),
        item.getAttribute('aria-setsize'),
      ]),
    ).toEqual([
      ['root', '1', '1', '1'],
      ['src', '2', '1', '2'],
      ['lib', '3', '1', '2'],
      ['routes', '3', '2', '2'],
      ['tests', '2', '2', '2'],
    ]);

    query(target, '[data-tree-key="lib"]').focus();
    expect(keydown(query(target, '[data-tree-key="lib"]'), 'ArrowLeft')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(query(target, '[data-tree-key="src"]'));

    await unmount(app);
  });

  it('Given two trees with shared keys When keyboard navigation moves focus Then focus stays inside the active tree', async () => {
    const firstTarget = createTarget();
    const secondTarget = createTarget();
    const firstTree = mount(TreeList, {
      target: firstTarget,
      props: {
        label: 'First tree',
        expandedKeys: ['root'],
        selectedKey: 'root',
        items: [
          {
            key: 'root',
            label: 'First root',
            children: [{key: 'child', label: 'First child'}],
          },
        ],
      },
    });
    const secondTree = mount(TreeList, {
      target: secondTarget,
      props: {
        label: 'Second tree',
        expandedKeys: ['root'],
        selectedKey: 'root',
        items: [
          {
            key: 'root',
            label: 'Second root',
            children: [{key: 'child', label: 'Second child'}],
          },
        ],
      },
    });
    await tick();

    query(secondTarget, '[data-tree-key="root"]').focus();
    expect(keydown(query(secondTarget, '[data-tree-key="root"]'), 'ArrowRight')).toBe(false);
    await tick();

    expect(document.activeElement).toBe(query(secondTarget, '[data-tree-key="child"]'));
    expect(document.activeElement).not.toBe(query(firstTarget, '[data-tree-key="child"]'));

    await unmount(firstTree);
    await unmount(secondTree);
  });
});
