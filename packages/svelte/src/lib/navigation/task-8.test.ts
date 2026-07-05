// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file task-8.test.ts
 * @input Todo 8 Svelte navigation regression fixtures
 * @output Focused coverage for navigation pagination page-size guards and live announcements
 * @position Todo 8 latest-main parity tests for navigation
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {__resetLiveRegionsForTest} from '../actions/announce.js';
import Pagination from './Pagination.svelte';

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

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

describe('Todo 8 Svelte navigation parity', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    __resetLiveRegionsForTest();
    vi.unstubAllGlobals();
    document.body.textContent = '';
  });

  it('Given malformed page sizes When navigation pagination renders Then counts and bounds stay finite', async () => {
    const onChange = vi.fn();
    const target = createTarget();
    const zero = mount(Pagination, {
      target,
      props: {page: 1, pageSize: 0, totalItems: 4, variant: 'count', onChange},
    });
    const negative = mount(Pagination, {
      target,
      props: {page: 4, pageSize: -5, totalItems: 4, variant: 'count', onChange},
    });
    const nan = mount(Pagination, {
      target,
      props: {page: 1, pageSize: Number.NaN, totalItems: 4, variant: 'count', onChange},
    });
    await tick();

    const announcements = [...target.querySelectorAll('span')].map((item) => item.textContent?.replaceAll('\u2013', '-'));
    expect(announcements).toEqual(['1-1 of 4', '4-4 of 4', '1-1 of 4']);

    query(target, 'button[aria-label="Go to next page"]:disabled').click();
    expect(onChange).not.toHaveBeenCalled();

    await unmount(zero);
    await unmount(negative);
    await unmount(nan);
  });

  it('Given pagination mounts When no navigation has occurred Then no polite live region exists', async () => {
    const target = createTarget();
    const app = mount(Pagination, {
      target,
      props: {page: 1, totalPages: 10, onChange: () => {}},
    });
    await tick();

    expect(politeRegion()).toBeNull();

    await unmount(app);
  });

  it('Given known-total pagination When page 3 is clicked Then the polite live region announces the page and total', async () => {
    const target = createTarget();
    const app = mount(Pagination, {
      target,
      props: {page: 2, totalPages: 10, onChange: () => {}},
    });
    await tick();

    query(target, 'button[aria-label="Go to page 3"]').click();
    await tick();

    const region = politeRegion();
    expect(region?.getAttribute('role')).toBe('status');
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.textContent).toBe('Page 3 of 10');

    await unmount(app);
  });

  it('Given known-total pagination When Next is clicked Then the polite live region announces the next page', async () => {
    const target = createTarget();
    const app = mount(Pagination, {
      target,
      props: {page: 2, totalPages: 5, onChange: () => {}},
    });
    await tick();

    query(target, 'button[aria-label="Go to next page"]').click();
    await tick();

    expect(politeRegion()?.textContent).toBe('Page 3 of 5');

    await unmount(app);
  });

  it('Given cursor pagination without a known total When Next is clicked Then the polite live region announces only the page', async () => {
    const target = createTarget();
    const app = mount(Pagination, {
      target,
      props: {page: 1, hasMore: true, onChange: () => {}},
    });
    await tick();

    query(target, 'button[aria-label="Go to next page"]').click();
    await tick();

    expect(politeRegion()?.textContent).toBe('Page 2');

    await unmount(app);
  });

  it('Given disabled current and bounded pagination When no-op controls are clicked Then no live region is announced', async () => {
    const onChange = vi.fn();
    const disabledTarget = createTarget();
    const currentTarget = createTarget();
    const boundedTarget = createTarget();
    const disabled = mount(Pagination, {
      target: disabledTarget,
      props: {page: 1, totalPages: 3, disabled: true, onChange},
    });
    const current = mount(Pagination, {
      target: currentTarget,
      props: {page: 2, totalPages: 3, onChange},
    });
    const bounded = mount(Pagination, {
      target: boundedTarget,
      props: {page: 3, totalPages: 3, onChange},
    });
    await tick();

    query(disabledTarget, 'button[aria-label="Go to next page"]').click();
    query(currentTarget, 'button[aria-label="Go to page 2"]').click();
    query(boundedTarget, 'button[aria-label="Go to next page"]').click();
    await tick();

    expect(onChange).not.toHaveBeenCalled();
    expect(politeRegion()).toBeNull();

    await unmount(disabled);
    await unmount(current);
    await unmount(bounded);
  });
});
