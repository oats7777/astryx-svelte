// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file key-down-composition.test.ts
 * @input Svelte Button and Link consumer keyboard, focus, blur, and hover handlers
 * @output Regression coverage for internal tooltip composition and disabled tooltip focus behavior
 * @position Todo 8 event-composition blocker tests for the actions family
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {Button, Link} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte action keydown composition', () => {
  it('Given Button receives consumer keydown When keys are pressed Then internal tooltip behavior composes with the consumer handler', async () => {
    const target = createTarget();
    let enterWasPrevented = false;
    const onKeyDown = vi.fn((event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        enterWasPrevented = event.defaultPrevented;
      }
    });
    const app = mount(Button, {
      target,
      props: {
        label: 'Explain disabled',
        tooltip: 'Requires permission',
        isDisabled: true,
        onkeydown: onKeyDown,
      },
    });

    await tick();

    const button = target.querySelector('button');
    const tooltip = target.querySelector('[role="tooltip"]');
    expect(button?.hasAttribute('disabled')).toBe(false);
    expect(button?.getAttribute('aria-disabled')).toBe('true');

    button?.focus();
    await tick();

    expect(document.activeElement).toBe(button);
    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    const enterWasNotCanceled = button?.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}),
    );
    expect(enterWasNotCanceled).toBe(false);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(enterWasPrevented).toBe(true);

    button?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await tick();

    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    await unmount(app);
  });

  it('Given Link receives consumer keydown When keys are pressed Then internal tooltip behavior composes with the consumer handler', async () => {
    const target = createTarget();
    let enterWasPrevented = false;
    const onKeyDown = vi.fn((event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        enterWasPrevented = event.defaultPrevented;
      }
    });
    const app = mount(Link, {
      target,
      props: {
        href: '/docs',
        label: 'Docs',
        tooltip: 'Requires permission',
        isDisabled: true,
        onkeydown: onKeyDown,
      },
    });

    await tick();

    const button = target.querySelector('button');
    const tooltip = target.querySelector('[role="tooltip"]');
    expect(button?.hasAttribute('disabled')).toBe(false);
    expect(button?.getAttribute('aria-disabled')).toBe('true');

    button?.focus();
    await tick();

    expect(document.activeElement).toBe(button);
    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    const enterWasNotCanceled = button?.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}),
    );
    expect(enterWasNotCanceled).toBe(false);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(enterWasPrevented).toBe(true);

    button?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await tick();

    expect(onKeyDown).toHaveBeenCalledTimes(2);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    await unmount(app);
  });
});

describe('Svelte action tooltip event composition', () => {
  it('Given Button receives consumer tooltip event handlers When the trigger is focused and hovered Then tooltip behavior composes with every handler', async () => {
    const target = createTarget();
    const onfocus = vi.fn();
    const onblur = vi.fn();
    const onmouseenter = vi.fn();
    const onmouseleave = vi.fn();
    const app = mount(Button, {
      target,
      props: {
        label: 'Save',
        tooltip: 'Save changes',
        onfocus,
        onblur,
        onmouseenter,
        onmouseleave,
      },
    });

    await tick();

    const button = target.querySelector('button');
    const tooltip = target.querySelector('[role="tooltip"]');
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    button?.focus();
    await tick();

    expect(onfocus).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    button?.blur();
    await tick();

    expect(onblur).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    button?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();

    expect(onmouseenter).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    button?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tick();

    expect(onmouseleave).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    await unmount(app);
  });

  it('Given Link receives consumer tooltip event handlers When the trigger is focused and hovered Then tooltip behavior composes with every handler', async () => {
    const target = createTarget();
    const onfocus = vi.fn();
    const onblur = vi.fn();
    const onmouseenter = vi.fn();
    const onmouseleave = vi.fn();
    const app = mount(Link, {
      target,
      props: {
        href: '/docs',
        label: 'Docs',
        tooltip: 'Open docs',
        onfocus,
        onblur,
        onmouseenter,
        onmouseleave,
      },
    });

    await tick();

    const link = target.querySelector('a');
    const tooltip = target.querySelector('[role="tooltip"]');
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    link?.focus();
    await tick();

    expect(onfocus).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    link?.blur();
    await tick();

    expect(onblur).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    link?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();

    expect(onmouseenter).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(false);

    link?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    await tick();

    expect(onmouseleave).toHaveBeenCalledTimes(1);
    expect(tooltip?.hasAttribute('hidden')).toBe(true);

    await unmount(app);
  });
});
