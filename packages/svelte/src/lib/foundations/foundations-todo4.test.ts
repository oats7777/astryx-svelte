// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file foundations-todo4.test.ts
 * @input VisuallyHidden, Stack padding, and StackItem scroll fixtures
 * @output Focused DOM/accessibility regression coverage for Todo 4 foundation parity
 * @position Latest-main Svelte foundation primitive tests
 */

import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it} from 'vitest';
import FoundationTodo4Probe from './test-fixtures/FoundationTodo4Probe.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte Todo 4 foundation primitives', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  it('Given latest foundation primitives When rendered Then visually hidden and scrollable Stack semantics match Svelte accessibility contracts', async () => {
    const target = createTarget();
    const app = mount(FoundationTodo4Probe, {target});

    await tick();

    const hiddenLabel = target.querySelector('[data-testid="hidden-label"]');
    const hiddenLive = target.querySelector('[data-testid="hidden-live"]');
    const scrollStack = target.querySelector<HTMLElement>('[data-testid="scroll-stack"]');
    const scrollItem = target.querySelector<HTMLElement>('[data-testid="scroll-item"]');
    const staticItem = target.querySelector<HTMLElement>('[data-testid="static-item"]');

    expect(hiddenLabel?.tagName).toBe('SPAN');
    expect(hiddenLabel?.className).toBe('astryx-sr-only');
    expect(hiddenLabel?.textContent).toBe('Screen reader label');
    expect(hiddenLive?.tagName).toBe('DIV');
    expect(hiddenLive?.getAttribute('aria-live')).toBe('polite');
    expect(hiddenLive?.textContent?.trim()).toBe('Updated results');

    expect(scrollStack?.className).toContain('astryx-stack--scrollable');
    expect(scrollStack?.getAttribute('role')).toBe('region');
    expect(scrollStack?.getAttribute('tabindex')).toBe('0');
    expect(scrollStack?.getAttribute('style')).toContain('padding-inline: var(--spacing-4)');
    expect(scrollStack?.getAttribute('style')).toContain('padding-block: var(--spacing-1-5)');

    expect(scrollItem?.className).toContain('astryx-stack-item--size-fill');
    expect(scrollItem?.className).toContain('astryx-stack-item--scrollable');
    expect(scrollItem?.getAttribute('role')).toBe('region');
    expect(scrollItem?.getAttribute('tabindex')).toBe('0');
    expect(staticItem?.className).toContain('astryx-stack-item--align-end');
    expect(staticItem?.getAttribute('style')).toContain('align-self: end');

    await unmount(app);
  });
});
