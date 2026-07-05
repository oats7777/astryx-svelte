// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file data-display.test.ts
 * @input Todo 13 Svelte data-display components and DOM events
 * @output Table, tree, progress, pagination, and list behavior assertions
 * @position Failing-first coverage for the Svelte data-display component family
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import List from './List.svelte';
import MetadataList from './MetadataList.svelte';
import Outline from './Outline.svelte';
import Pagination from './Pagination.svelte';
import ProgressBar from './ProgressBar.svelte';
import Table from './Table.svelte';
import TreeList from './TreeList.svelte';
import {filterRows, paginateRows, sortRows} from './plugins/index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function click(element: Element | null): void {
  if (!(element instanceof HTMLElement)) {
    throw new Error('Missing clickable element');
  }
  element.click();
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

describe('Svelte data-display components', () => {
  it('Given list, metadata, outline, pagination, and progress states When rendered Then expose empty, loading, and meter semantics', async () => {
    const target = createTarget();
    const list = mount(List, {target, props: {items: [], emptyTitle: 'No alerts'}});
    mount(MetadataList, {
      target,
      props: {items: [{term: 'Owner', description: 'Data platform'}]},
    });
    mount(Outline, {target, props: {items: [], isLoading: true, loadingLabel: 'Loading outline'}});
    mount(Pagination, {target, props: {page: 2, pageSize: 10, totalItems: 35}});
    mount(ProgressBar, {target, props: {value: 35, label: 'Migration progress'}});
    mount(Table, {target, props: {rows: [], columns: [{key: 'name', header: 'Name'}]}});

    await tick();

    expect(target.querySelector('[data-testid="list-empty"]')?.textContent).toContain('No alerts');
    expect(target.querySelector('dl')?.textContent).toContain('Owner');
    expect(target.querySelector('[role="status"]')?.textContent).toContain('Loading outline');
    expect(target.querySelector('nav[aria-label="Pagination"]')?.textContent).toContain('Page 2 of 4');
    expect(target.querySelector('[data-testid="table-empty"]')?.textContent).toContain('No rows');

    const meter = target.querySelector('[role="progressbar"]');
    expect(meter?.getAttribute('aria-label')).toBe('Migration progress');
    expect(meter?.getAttribute('aria-valuemin')).toBe('0');
    expect(meter?.getAttribute('aria-valuemax')).toBe('100');
    expect(meter?.getAttribute('aria-valuenow')).toBe('35');

    await unmount(list);
  });

  it('Given table plugins When used directly Then sorting, filtering, and pagination preserve row identity', () => {
    const sorted = sortRows(rows, {key: 'score', direction: 'asc'});
    expect(sorted.map((row) => row.id)).toEqual(['c', 'a', 'b', 'd']);

    const filtered = filterRows(rows, {query: 'active', keys: ['status']});
    expect(filtered.map((row) => row.id)).toEqual(['a', 'c', 'd']);

    const page = paginateRows(rows, {page: 2, pageSize: 2});
    expect(page.map((row) => row.id)).toEqual(['c', 'd']);
  });

  it('Given a selectable sortable table When headers, filters, pagination, and resize handles are used Then DOM semantics update', async () => {
    const target = createTarget();
    const onSelectionChange = vi.fn();
    const onSortChange = vi.fn();
    const app = mount(Table, {
      target,
      props: {
        caption: 'Services',
        rows,
        columns,
        pageSize: 2,
        isSelectable: true,
        filterText: 'active',
        selectedKeys: ['a'],
        onSelectionChange,
        onSortChange,
      },
    });

    await tick();

    expect(target.querySelector('table')?.getAttribute('aria-rowcount')).toBe('2');
    expect(target.querySelector('caption')?.textContent).toBe('Services');
    expect(target.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(target.querySelector('th[scope="col"][data-sticky="start"]')?.getAttribute('style')).toContain(
      'position: sticky',
    );
    expect(target.querySelector('tbody td[data-sticky="start"]')?.textContent).toContain('Atlas');
    expect(target.querySelector<HTMLInputElement>('tbody input[type="checkbox"]')?.checked).toBe(true);

    click(target.querySelector('button[data-sort-key="score"]'));
    await tick();

    expect(onSortChange).toHaveBeenLastCalledWith({key: 'score', direction: 'asc'});
    expect(target.querySelector('th[data-column-key="score"]')?.getAttribute('aria-sort')).toBe('ascending');
    expect(target.querySelector('tbody tr')?.textContent).toContain('Comet');

    click(target.querySelector('tbody input[type="checkbox"]'));
    await tick();
    expect(onSelectionChange).toHaveBeenLastCalledWith(['c']);

    click(target.querySelector('button[aria-label="Next page"]'));
    await tick();
    expect(target.querySelectorAll('tbody tr')).toHaveLength(1);
    expect(target.querySelector('tbody tr')?.textContent).toContain('Delta');

    const handle = target.querySelector<HTMLElement>('[data-resize-key="name"]');
    handle?.dispatchEvent(new PointerEvent('pointerdown', {clientX: 0, bubbles: true}));
    document.dispatchEvent(new PointerEvent('pointermove', {clientX: 40, bubbles: true}));
    document.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
    await tick();

    expect(target.querySelector('th[data-column-key="name"]')?.getAttribute('style')).toContain('width: 200px');

    await unmount(app);
  });

  it('Given a tree list When keyboard navigation runs Then roving focus, expansion, and selection follow visible items', async () => {
    const target = createTarget();
    const onSelectionChange = vi.fn();
    const app = mount(TreeList, {
      target,
      props: {
        label: 'Repository',
        selectedKey: 'src',
        expandedKeys: ['root'],
        onSelectionChange,
        items: [
          {
            key: 'root',
            label: 'Root',
            children: [
              {key: 'src', label: 'src', children: [{key: 'lib', label: 'lib'}]},
              {key: 'tests', label: 'tests'},
            ],
          },
        ],
      },
    });

    await tick();

    const tree = target.querySelector('[role="tree"]');
    const visibleItems = () => [...target.querySelectorAll<HTMLElement>('[role="treeitem"]')];
    expect(tree?.getAttribute('aria-label')).toBe('Repository');
    expect(visibleItems().map((item) => item.textContent?.trim())).toEqual(['Root', 'src', 'tests']);
    expect(visibleItems().map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    visibleItems()[1]?.focus();
    expect(keydown(visibleItems()[1] as HTMLElement, 'ArrowRight')).toBe(false);
    await tick();
    expect(visibleItems().map((item) => item.textContent?.trim())).toEqual(['Root', 'src', 'lib', 'tests']);

    expect(keydown(visibleItems()[1] as HTMLElement, 'ArrowDown')).toBe(false);
    await tick();
    expect(document.activeElement?.textContent?.trim()).toBe('lib');

    expect(keydown(document.activeElement as Element, 'Enter')).toBe(false);
    await tick();
    expect(onSelectionChange).toHaveBeenLastCalledWith('lib');

    await unmount(app);
  });

});
