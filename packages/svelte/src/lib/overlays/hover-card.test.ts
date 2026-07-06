// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file hover-card.test.ts
 * @input HoverCard fixture with hover, focus, controlled, disabled, and timer props
 * @output Vitest proof for transient hover-card behavior and trigger aria linking
 * @position Todo 11 HoverCard transient regression tests
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import HoverCardHarness from './test-fixtures/HoverCardHarness.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function getHoverCard(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[data-testid="hover-card"]');
}

function getRequiredElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (element == null) {
    throw new Error(`Missing test element: ${selector}`);
  }
  return element;
}

describe('Svelte HoverCard transient behavior', () => {
  beforeEach(() => {
    document.body.textContent = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Given a hover card trigger When hover delay elapses and pointer leaves Then it opens and hides after hideDelay', async () => {
    // Given: a hover card with explicit show and hide delays.
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {delay: 25, hideDelay: 15},
    });
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="hover-card-anchor"]');

    // When: the anchor is hovered for the configured delay.
    anchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    vi.advanceTimersByTime(24);
    await tick();
    expect(getHoverCard()).toBeNull();

    vi.advanceTimersByTime(1);
    await tick();

    // Then: the hover card opens after delay.
    expect(getHoverCard()?.textContent).toContain('Riley Chen');

    // When: the pointer leaves before the hide delay has elapsed.
    anchor?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    vi.advanceTimersByTime(14);
    await tick();
    expect(getHoverCard()).toBeTruthy();

    vi.advanceTimersByTime(1);
    await tick();

    // Then: the hover card hides after hideDelay.
    expect(getHoverCard()).toBeNull();

    await unmount(app);
  });

  it('Given a hover card trigger When pointer leaves before delay Then pending open is cancelled', async () => {
    // Given: a hover card with a delayed hover intent timer.
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {delay: 25},
    });
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="hover-card-anchor"]');

    // When: hover ends before the open delay elapses.
    anchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    vi.advanceTimersByTime(10);
    anchor?.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    vi.advanceTimersByTime(25);
    await tick();

    // Then: the cancelled hover does not open the card.
    expect(getHoverCard()).toBeNull();

    await unmount(app);
  });

  it('Given a hover card trigger When focused and blurred Then it opens and hides', async () => {
    // Given: a hover card trigger available to keyboard focus.
    const target = createTarget();
    const app = mount(HoverCardHarness, {target});
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="hover-card-anchor"]');

    // When: focus enters the trigger.
    anchor?.focus();
    await tick();

    // Then: the hover card opens immediately for keyboard users.
    expect(getHoverCard()?.textContent).toContain('Riley Chen');

    // When: focus leaves the trigger.
    anchor?.blur();
    await tick();

    // Then: the hover card hides.
    expect(getHoverCard()).toBeNull();

    await unmount(app);
  });

  it('Given open hover card content When pointer moves from trigger into content Then it remains open until content leave hideDelay elapses', async () => {
    // Given: a hover card opened from its trigger with delayed hide semantics.
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {delay: 0, hideDelay: 20},
    });
    await tick();

    const anchor = getRequiredElement(target, '[data-testid="hover-card-anchor"]');

    anchor.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();

    const content = getRequiredElement(document.body, '.astryx-hover-card');
    expect(getHoverCard()?.textContent).toContain('Riley Chen');

    // When: the pointer leaves the trigger and enters rendered card content.
    anchor.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    content.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    vi.advanceTimersByTime(20);
    await tick();

    // Then: content hover retains the card past the trigger hide delay.
    expect(getHoverCard()).toBeTruthy();

    // When: the pointer leaves the card content.
    content.dispatchEvent(new MouseEvent('mouseleave', {bubbles: true}));
    vi.advanceTimersByTime(19);
    await tick();
    expect(getHoverCard()).toBeTruthy();

    vi.advanceTimersByTime(1);
    await tick();

    // Then: the card closes only after the content leave hide delay elapses.
    expect(getHoverCard()).toBeNull();

    await unmount(app);
  });

  it('Given focusable hover card content When focus moves from trigger into content Then it remains open', async () => {
    // Given: a hover card opened by keyboard focus.
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {hideDelay: 20},
    });
    await tick();

    const anchor = getRequiredElement(target, '[data-testid="hover-card-anchor"]');

    anchor.focus();
    await tick();

    const contentAction = getRequiredElement(document.body, '[data-testid="hover-card-content-action"]');

    // When: focus moves into a focusable element inside the rendered card.
    contentAction.focus();
    vi.advanceTimersByTime(20);
    await tick();

    // Then: focus inside content retains the card instead of closing on trigger blur.
    expect(getHoverCard()).toBeTruthy();
    expect(document.activeElement).toBe(contentAction);

    await unmount(app);
  });

  it('Given focus inside hover card content When Escape is pressed Then it closes once and refocuses trigger without reopening', async () => {
    // Given: an open hover card with focus inside interactive content.
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {delay: 0, hideDelay: 20, onOpenChange},
    });
    await tick();

    const anchor = getRequiredElement(target, '[data-testid="hover-card-anchor"]');

    anchor.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();

    const contentAction = getRequiredElement(document.body, '[data-testid="hover-card-content-action"]');
    contentAction.focus();
    await tick();
    onOpenChange.mockClear();

    // When: Escape is pressed while focus is inside card content.
    contentAction.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await tick();
    vi.advanceTimersByTime(20);
    await tick();

    // Then: the card closes once, the trigger is focused, and refocus does not reopen it.
    expect(getHoverCard()).toBeNull();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.activeElement).toBe(anchor);

    await unmount(app);
  });

  it('Given a hover card callback When it opens and closes Then onOpenChange receives true and false', async () => {
    // Given: a hover card with an open-change observer.
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {onOpenChange},
    });
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="hover-card-anchor"]');

    // When: focus opens the card and blur closes it.
    anchor?.focus();
    await tick();
    anchor?.blur();
    await tick();

    // Then: both state transitions are reported.
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);

    await unmount(app);
  });

  it('Given disabled hover cards without content When triggered Then disabled and isEnabled=false prevent opening', async () => {
    // Given: a disabled hover card.
    const disabledTarget = createTarget();
    const disabledApp = mount(HoverCardHarness, {
      target: disabledTarget,
      props: {disabled: true},
    });
    await tick();

    const disabledAnchor = disabledTarget.querySelector<HTMLElement>(
      '[data-testid="hover-card-anchor"]',
    );

    // When: the disabled anchor receives synthetic hover and focus events.
    disabledAnchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    disabledAnchor?.dispatchEvent(new FocusEvent('focus', {bubbles: false}));
    await tick();

    // Then: disabled prevents opening.
    expect(getHoverCard()).toBeNull();

    await unmount(disabledApp);

    // Given: an enabled anchor with hover-card triggers disabled.
    document.body.textContent = '';
    const disabledTriggerTarget = createTarget();
    const disabledTriggerApp = mount(HoverCardHarness, {
      target: disabledTriggerTarget,
      props: {isEnabled: false},
    });
    await tick();

    const disabledTrigger = disabledTriggerTarget.querySelector<HTMLElement>(
      '[data-testid="hover-card-anchor"]',
    );

    // When: hover and focus events fire.
    disabledTrigger?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    disabledTrigger?.focus();
    await tick();

    // Then: isEnabled=false prevents opening.
    expect(getHoverCard()).toBeNull();

    await unmount(disabledTriggerApp);
  });

  it('Given an open hover card When rendered Then the trigger receives aria-describedby for the card', async () => {
    // Given: a hover card opened by focus.
    const target = createTarget();
    const app = mount(HoverCardHarness, {target});
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="hover-card-anchor"]');

    // When: the hover card opens.
    anchor?.focus();
    await tick();

    const hoverCard = getHoverCard();

    const describedBy = anchor?.getAttribute('aria-describedby');
    const describedElement = describedBy == null ? null : document.getElementById(describedBy);

    // Then: the trigger references rendered content inside the open card.
    expect(describedElement).not.toBeNull();
    expect(hoverCard?.contains(describedElement)).toBe(true);

    // When: the hover card closes.
    anchor?.blur();
    await tick();

    // Then: the transient description is removed from the trigger.
    expect(anchor?.hasAttribute('aria-describedby')).toBe(false);

    await unmount(app);
  });

  it('Given a controlled open hover card with content When mounted Then controlled open remains supported', async () => {
    // Given: a hover card with controlled open=true.
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {open: true},
    });
    await tick();

    // When: no transient event has fired.
    const hoverCard = getHoverCard();

    // Then: the controlled card is visible with dialog semantics.
    expect(hoverCard?.getAttribute('role')).toBe('dialog');
    expect(hoverCard?.getAttribute('aria-label')).toBe('Profile preview');
    expect(hoverCard?.textContent).toContain('Riley Chen');

    await unmount(app);
  });

  it('Given a controlled closed hover card When hovered Then it requests open without rendering uncontrolled content', async () => {
    // Given: a hover card controlled closed by its parent.
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(HoverCardHarness, {
      target,
      props: {open: false, onOpenChange},
    });
    await tick();

    const anchor = target.querySelector<HTMLElement>('[data-testid="hover-card-anchor"]');

    // When: hover attempts to open the controlled card.
    anchor?.dispatchEvent(new MouseEvent('mouseenter', {bubbles: true}));
    await tick();

    // Then: the component requests the controlled transition but remains closed.
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(getHoverCard()).toBeNull();

    await unmount(app);
  });
});
