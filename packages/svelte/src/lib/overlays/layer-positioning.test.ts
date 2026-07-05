// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layer-positioning.test.ts
 * @input Layer, Popover, Tooltip, HoverCard, portal, theme, and reduced-motion surfaces
 * @output Vitest proof for anchor positioning, role semantics, and theme reach
 * @position Todo 11 anchored overlay tests
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import LayerHarness from './test-fixtures/LayerHarness.svelte';
import TooltipHarness from './test-fixtures/TooltipHarness.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte anchored layers', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Given anchored layers When mounted Then they expose placement, anchor, role, and portalled theme reach', async () => {
    // Given: a themed trigger with layer, popover, tooltip, and hover-card overlays.
    const target = createTarget();
    const app = mount(LayerHarness, {target});

    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="layer-anchor"]');
    const layer = document.body.querySelector<HTMLElement>('[data-testid="layer"]');
    const popover = document.body.querySelector<HTMLElement>('[data-testid="popover"]');
    const tooltip = document.body.querySelector<HTMLElement>('[data-testid="tooltip"]');
    const hoverCard = document.body.querySelector<HTMLElement>('[data-testid="hover-card"]');
    const anchorName = anchor?.style.getPropertyValue('anchor-name');

    // When: the overlays render through the portal.
    expect(anchorName).toContain('--astryx-layer-');

    // Then: anchor positioning metadata and accessible roles survive the portal move.
    expect(layer?.style.getPropertyValue('position-anchor')).toBe(anchorName);
    expect(layer?.dataset.placement).toBe('below');
    expect(layer?.dataset.alignment).toBe('start');
    expect(popover?.getAttribute('role')).toBe('dialog');
    expect(popover?.getAttribute('aria-label')).toBe('Filter menu');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');
    expect(hoverCard?.getAttribute('role')).toBe('dialog');
    expect(hoverCard?.getAttribute('aria-label')).toBe('Profile preview');
    expect(popover?.closest('[data-astryx-theme="overlay-test"]')).toBeTruthy();
    expect(popover?.getAttribute('data-theme')).toBe('dark');
    expect(popover?.classList.contains('astryx-reduced-motion-safe')).toBe(true);

    await unmount(app);
  });

  it('Given a tooltip anchor When hover delay elapses Then it opens, links aria-describedby, and reports onOpenChange', async () => {
    // Given: a tooltip with a hover trigger, delay, and open-change callback.
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(TooltipHarness, {target, props: {delay: 25, onOpenChange}});
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="tooltip-anchor"]');

    // When: the anchor is hovered for the configured delay.
    anchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    vi.advanceTimersByTime(24);
    await tick();
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();

    vi.advanceTimersByTime(1);
    await tick();

    const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]');

    // Then: the tooltip is visible, accessible from the anchor, and change-notified once.
    expect(tooltip?.textContent).toContain('Persists changes');
    expect(anchor?.getAttribute('aria-describedby')).toBe(tooltip?.id);
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await unmount(app);
  });

  it('Given an open tooltip When focus leaves after hide delay Then it closes and reports onOpenChange', async () => {
    // Given: a tooltip opened through keyboard focus.
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(TooltipHarness, {
      target,
      props: {delay: 0, hideDelay: 20, onOpenChange},
    });
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="tooltip-anchor"]');

    anchor?.focus();
    await tick();
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();

    // When: focus leaves and the configured hide delay elapses.
    anchor?.blur();
    vi.advanceTimersByTime(19);
    await tick();
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();

    vi.advanceTimersByTime(1);
    await tick();

    // Then: the tooltip closes after the delay and emits a close transition.
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    await unmount(app);
  });

  it('Given a visible tooltip When Escape is pressed Then it dismisses without waiting for pointer leave', async () => {
    // Given: a tooltip opened by pointer hover.
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(TooltipHarness, {target, props: {delay: 0, onOpenChange}});
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="tooltip-anchor"]');
    anchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();
    onOpenChange.mockClear();

    // When: Escape is pressed globally while the tooltip is visible.
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await tick();

    // Then: the tooltip is dismissed and reports the close transition.
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await unmount(app);
  });

  it('Given pointer leaves the trigger When it enters the tooltip surface Then the tooltip remains hoverable', async () => {
    // Given: a tooltip opened by hover with no explicit hide delay.
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(TooltipHarness, {target, props: {delay: 0, onOpenChange}});
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="tooltip-anchor"]');
    anchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();
    const tooltip = document.body.querySelector<HTMLElement>('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
    onOpenChange.mockClear();

    // When: the pointer leaves the trigger but reaches the tooltip before the bridge expires.
    anchor?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    tooltip?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    vi.advanceTimersByTime(150);
    await tick();

    // Then: the tooltip stays visible instead of vanishing under the pointer.
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await unmount(app);
  });
});
