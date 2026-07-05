// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepper.test.ts
 * @input Stepper Svelte fixture, DOM events, and callback props
 * @output Vitest coverage for sequence semantics, progress states, status color, and selection
 * @position Red-first tests for Todo 17 Stepper Svelte lab slice
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import StepperProbe from './test-fixtures/StepperProbe.svelte';
import {Step, Stepper} from './index.js';

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

describe('Svelte lab Stepper', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given steps When rendered Then an ordered progress list exposes current and complete states', async () => {
    const target = createTarget();
    const app = mount(StepperProbe, {target});
    await tick();

    const list = query(target, 'ol[aria-label="Checkout progress"]');
    const items = target.querySelectorAll('li');
    expect(Stepper).toBeDefined();
    expect(Step).toBeDefined();
    expect(list.getAttribute('data-orientation')).toBe('horizontal');
    expect(items).toHaveLength(3);
    expect(items[0]?.getAttribute('data-progress')).toBe('completed');
    expect(items[1]?.getAttribute('aria-current')).toBe('step');
    expect(items[1]?.getAttribute('data-progress')).toBe('in-progress');
    expect(items[2]?.getAttribute('data-progress')).toBe('not-started');
    expect(target.textContent).toContain('Optional');
    expect(target.textContent).toContain('Confirm order details');

    await unmount(app);
  });

  it('Given vertical orientation and status When rendered Then orientation changes and status remains color-only', async () => {
    const target = createTarget();
    const app = mount(StepperProbe, {target, props: {orientation: 'vertical', status: 'error'}});
    await tick();

    const statusStep = query(target, 'li[data-status="error"]');
    expect(query(target, 'ol').getAttribute('data-orientation')).toBe('vertical');
    expect(statusStep.getAttribute('aria-current')).toBe('step');
    expect(statusStep.getAttribute('data-progress')).toBe('in-progress');

    await unmount(app);
  });

  it('Given non-linear steps When clicked and keyboard selected Then callbacks receive the step index', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    const target = createTarget();
    const app = mount(StepperProbe, {target, props: {activeStep: 0, onStepClick}});
    await tick();

    await user.click(query(target, 'button[aria-label="Go to step 3: Review"]'));
    query(target, 'button[aria-label="Go to step 1: Cart"]').focus();
    await user.keyboard('{Enter}');

    expect(onStepClick).toHaveBeenNthCalledWith(1, 2);
    expect(onStepClick).toHaveBeenNthCalledWith(2, 0);

    await unmount(app);
  });

  it('Given a disabled step in non-linear mode When rendered Then that step is not selectable', async () => {
    const target = createTarget();
    const app = mount(StepperProbe, {
      target,
      props: {activeStep: 2, disabledFirst: true, onStepClick: () => {}},
    });
    await tick();

    expect(target.querySelector('button[aria-label="Go to step 1: Cart"]')).toBeNull();
    expect(query(target, 'li[data-disabled="true"]').textContent).toContain('Cart');

    await unmount(app);
  });
});
