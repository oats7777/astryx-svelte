// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y.test.ts
 * @input Todo 13 Svelte data-display accessibility states
 * @output ARIA and keyboard contract assertions for data-display primitives
 * @position Package-local accessibility coverage for data-display
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import ProgressBar from './ProgressBar.svelte';
import Table from './Table.svelte';
import TreeList from './TreeList.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte data-display accessibility', () => {
  it('Given progress, table, and tree widgets When rendered Then expose accessible names and structural roles', async () => {
    const target = createTarget();
    const progress = mount(ProgressBar, {
      target,
      props: {value: null, label: 'Sync progress', isIndeterminate: true},
    });
    mount(Table, {
      target,
      props: {
        caption: 'Accessible table',
        rows: [{id: 'row-1', name: 'One'}],
        columns: [{key: 'name', header: 'Name', sortable: true}],
        getRowKey: (row) => String(row.id),
      },
    });
    mount(TreeList, {
      target,
      props: {
        label: 'Accessible tree',
        items: [{key: 'root', label: 'Root', children: [{key: 'child', label: 'Child'}]}],
      },
    });

    await tick();

    const meter = target.querySelector('[role="progressbar"]');
    expect(meter?.getAttribute('aria-label')).toBe('Sync progress');
    expect(meter?.hasAttribute('aria-valuenow')).toBe(false);
    expect(target.querySelector('th')?.getAttribute('scope')).toBe('col');
    expect(target.querySelector('button[data-sort-key="name"]')?.getAttribute('aria-label')).toBe(
      'Sort by Name',
    );
    expect(target.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe('Accessible tree');
    expect(target.querySelector('[role="treeitem"]')?.getAttribute('aria-expanded')).toBe('false');

    await unmount(progress);
  });
});
