// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circular-progress.test.ts
 * @input CircularProgress Svelte component and DOM queries
 * @output Vitest coverage for ARIA value states, clamping, variants, and slots
 * @position Red-first tests for Todo 17 CircularProgress Svelte lab slice
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it} from 'vitest';
import CircularProgress from './CircularProgress.svelte';
import CircularProgressProbe from './test-fixtures/CircularProgressProbe.svelte';
import {type CircularProgressVariant, CircularProgress as CircularProgressExport} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function query(root: ParentNode, selector: string): Element {
  const node = root.querySelector(selector);
  if (node == null) {
    throw new Error(`Missing selector: ${selector}`);
  }
  return node;
}

describe('Svelte lab CircularProgress', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given a determinate value When rendered Then ARIA meter state and center content are observable', async () => {
    const target = createTarget();
    const app = mount(CircularProgressProbe, {target});
    await tick();

    const meter = query(target, '[role="meter"]');
    expect(CircularProgressExport).toBeDefined();
    expect(meter.getAttribute('aria-valuenow')).toBe('75');
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('100');
    expect(target.textContent).toContain('75%');
    expect(target.textContent).toContain('Upload progress');

    await unmount(app);
  });

  it('Given malformed progress values When rendered Then the value is clamped and zero max remains stable', async () => {
    const target = createTarget();
    const app = mount(CircularProgress, {
      target,
      props: {value: 150, max: 100, label: 'Over progress'},
    });
    await tick();
    expect(query(target, '[role="meter"]').getAttribute('aria-valuenow')).toBe('100');

    await unmount(app);
    document.body.textContent = '';

    const zeroApp = mount(CircularProgress, {
      target: createTarget(),
      props: {value: -10, max: 0, label: 'Empty progress'},
    });
    await tick();
    expect(query(document, '[role="meter"]').getAttribute('aria-valuenow')).toBe('0');
    expect(query(document, '[role="meter"]').getAttribute('aria-valuemax')).toBe('0');

    await unmount(zeroApp);
  });

  it('Given no value When rendered Then indeterminate progressbar omits numeric ARIA bounds', async () => {
    const target = createTarget();
    const app = mount(CircularProgress, {target, props: {label: 'Loading data'}});
    await tick();

    const progressbar = query(target, '[role="progressbar"]');
    expect(progressbar.getAttribute('aria-valuenow')).toBeNull();
    expect(progressbar.getAttribute('aria-valuemin')).toBeNull();
    expect(progressbar.getAttribute('aria-valuemax')).toBeNull();

    await unmount(app);
  });

  it('Given all variants When rendered Then semantic data attributes are stable', async () => {
    const variants: readonly CircularProgressVariant[] = ['accent', 'success', 'warning', 'error', 'neutral'];

    for (const variant of variants) {
      const target = createTarget();
      const app = mount(CircularProgress, {target, props: {value: 5, max: 10, label: variant, variant}});
      await tick();
      expect(query(target, '[data-astryx-circular-progress]').getAttribute('data-variant')).toBe(variant);
      await unmount(app);
    }
  });
});
