// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menus-toast.test.ts
 * @input DropdownMenu, ContextMenu, MoreMenu, Overlay, ToastViewport, and toast store
 * @output Vitest keyboard and transient UI behavior coverage
 * @position Todo 11 non-modal overlay and toast tests
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import MenuToastHarness from './test-fixtures/MenuToastHarness.svelte';
import {toastStore} from './toast-store.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte transient menu and toast overlays', () => {
  beforeEach(() => {
    document.body.textContent = '';
    toastStore.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    toastStore.clear();
  });

  it('Given dropdown and more menus When opened by keyboard Then menu roles and item focus are correct', async () => {
    // Given: menu triggers with data-driven items.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});

    await tick();
    const dropdownButton = target.querySelector<HTMLElement>('[data-testid="dropdown"] button');
    dropdownButton?.focus();

    // When: the menu opens from the keyboard.
    await user.keyboard('{Enter}');
    await tick();

    const menu = document.body.querySelector('[role="menu"]');
    const items = document.body.querySelectorAll<HTMLElement>('[role="menuitem"]');

    // Then: the active menu is keyboard reachable and disabled items are marked.
    expect(dropdownButton?.getAttribute('aria-haspopup')).toBe('menu');
    expect(dropdownButton?.getAttribute('aria-expanded')).toBe('true');
    expect(menu).toBeTruthy();
    expect(items[0]).toBe(document.activeElement);
    expect(items[2]?.getAttribute('aria-disabled')).toBe('true');

    await unmount(app);
  });

  it('Given a context menu When right-clicked Then it opens at fixed pointer coordinates and closes on Escape', async () => {
    // Given: a context menu trigger area.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const contextTarget = target.querySelector<HTMLElement>('[data-testid="context-target"]');

    // When: the user opens the context menu at a pointer coordinate.
    contextTarget?.dispatchEvent(
      new MouseEvent('contextmenu', {bubbles: true, cancelable: true, clientX: 32, clientY: 48}),
    );
    await tick();
    await new Promise(requestAnimationFrame);

    const contextMenu = document.body.querySelector<HTMLElement>('[data-astryx-overlay="context-menu"]');

    // Then: the menu uses fixed positioning and Escape closes it.
    expect(contextMenu?.style.left).toBe('32px');
    expect(contextMenu?.style.top).toBe('48px');
    await user.keyboard('{Escape}');
    await tick();
    expect(document.body.querySelector('[data-astryx-overlay="context-menu"]')).toBeNull();

    await unmount(app);
  });

  it('Given a context menu When invoked from the keyboard context menu event Then it opens below the trigger and restores focus on Escape', async () => {
    // Given: a focused context-menu trigger with a deterministic bounding box.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const contextTarget = target.querySelector<HTMLElement>('[data-testid="context-menu"]');
    expect(contextTarget).toBeTruthy();
    if (contextTarget == null) {
      await unmount(app);
      return;
    }
    contextTarget.focus();
    contextTarget.getBoundingClientRect = () => new DOMRect(40, 10, 60, 20);

    // When: the browser emits a keyboard-origin contextmenu event.
    contextTarget.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0,
        detail: 0,
      }),
    );
    await tick();
    await new Promise(requestAnimationFrame);

    const contextMenu = document.body.querySelector<HTMLElement>(
      '[data-astryx-overlay="context-menu"]',
    );

    // Then: it anchors to the trigger box instead of the unusable 0,0 point.
    expect(contextMenu?.style.left).toBe('40px');
    expect(contextMenu?.style.top).toBe('30px');

    await user.keyboard('{Escape}');
    await tick();
    expect(document.activeElement).toBe(contextTarget);

    await unmount(app);
  });

  it('Given a context menu When a touch long-press completes and Escape closes it Then focus returns to the trigger', async () => {
    // Given: a context menu on a touch target while another control has focus.
    vi.useFakeTimers();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const contextTarget = target.querySelector<HTMLElement>('[data-testid="context-menu"]');
    const showToast = target.querySelector<HTMLElement>('[data-testid="show-toast"]');
    showToast?.focus();

    // When: a single touch remains down through the long-press threshold.
    const touchStart = new Event('touchstart', {bubbles: true, cancelable: true});
    Object.defineProperty(touchStart, 'touches', {
      value: [{clientX: 24, clientY: 36}],
    });
    contextTarget?.dispatchEvent(touchStart);
    vi.advanceTimersByTime(499);
    await tick();
    expect(document.body.querySelector('[data-astryx-overlay="context-menu"]')).toBeNull();

    vi.advanceTimersByTime(1);
    await tick();

    // Then: the menu opens where the long press began.
    const contextMenu = document.body.querySelector<HTMLElement>(
      '[data-astryx-overlay="context-menu"]',
    );
    expect(contextMenu?.style.left).toBe('24px');
    expect(contextMenu?.style.top).toBe('36px');

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true, cancelable: true}));
    await tick();
    await tick();
    expect(document.body.querySelector('[data-astryx-overlay="context-menu"]')).toBeNull();
    expect(document.activeElement).toBe(contextTarget);

    await unmount(app);
  });

  it('Given a closed context menu When global Escape is pressed Then default handling is not captured', async () => {
    // Given: a mounted context menu that has not been opened.
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });

    // When: Escape is dispatched globally while the context menu is closed.
    const defaultAllowed = window.dispatchEvent(escape);

    // Then: the closed context menu is inert and does not prevent page-level Escape handling.
    expect(defaultAllowed).toBe(true);
    expect(escape.defaultPrevented).toBe(false);
    expect(document.body.querySelector('[data-astryx-overlay="context-menu"]')).toBeNull();

    await unmount(app);
  });

  it('Given overlay media and toast viewport When active Then scrim and live-region semantics are exposed', async () => {
    // Given: a media overlay and toast trigger.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});

    await tick();

    // When: a toast is shown.
    const showToast = target.querySelector('[data-testid="show-toast"]');
    expect(showToast).toBeInstanceOf(HTMLElement);
    if (!(showToast instanceof HTMLElement)) {
      await unmount(app);
      return;
    }
    await user.click(showToast);
    await tick();

    // Then: overlay and toast semantics are available to assistive tech.
    expect(target.querySelector('[data-testid="media-overlay"] [data-astryx-overlay-scrim]')).toBeTruthy();
    const toast = document.body.querySelector('[role="status"]');
    expect(toast?.getAttribute('aria-live')).toBe('polite');
    expect(toast?.textContent).toContain('Saved changes');

    await unmount(app);
  });

  it('Given an open dropdown menu When Tab is pressed Then the menu closes', async () => {
    // Given: an open dropdown menu.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const dropdownButton = target.querySelector<HTMLElement>('[data-testid="dropdown"] button');
    dropdownButton?.focus();
    await user.keyboard('{Enter}');
    await tick();
    expect(document.body.querySelector('[data-astryx-overlay="dropdown-menu"]')).toBeTruthy();

    // When: Tab is pressed from inside the APG menu.
    await user.keyboard('{Tab}');
    await tick();

    // Then: the popup is closed instead of trapping or leaving the menu open.
    expect(document.body.querySelector('[data-astryx-overlay="dropdown-menu"]')).toBeNull();
    expect(dropdownButton?.getAttribute('aria-expanded')).toBe('false');

    await unmount(app);
  });

  it('Given a dropdown menu with disabled matches When typeahead runs Then disabled items are skipped', async () => {
    // Given: an open dropdown whose first "D" item is disabled.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const dropdownButton = target.querySelector<HTMLElement>('[data-testid="dropdown"] button');
    dropdownButton?.focus();
    await user.keyboard('{Enter}');
    await tick();

    // When: the user types the first character for the disabled item.
    await user.keyboard('d');
    await tick();

    // Then: focus lands on the enabled "Download" item, not disabled "Delete".
    expect(document.activeElement?.textContent).toBe('Download');

    await unmount(app);
  });

  it('Given a default auto-hide toast When its duration elapses Then it dismisses and reports the auto reason', async () => {
    // Given: a toast viewport and an info toast with a short auto-hide duration.
    vi.useFakeTimers();
    const onHide = vi.fn();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});

    toastStore.show({body: 'Synced', type: 'info', autoHideDuration: 25, onHide});
    await tick();

    // When: the auto-hide timer elapses.
    vi.advanceTimersByTime(25);
    await tick();

    // Then: the toast leaves the DOM and reports an automatic dismissal.
    expect(document.body.querySelector('[role="status"]')).toBeNull();
    expect(onHide).toHaveBeenCalledOnce();
    expect(onHide).toHaveBeenCalledWith('auto');

    await unmount(app);
  });

  it('Given visible toasts When F6 is pressed Then focus moves into the newest toast', async () => {
    // Given: a viewport with a visible toast and focus outside it.
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});
    await tick();

    const showToast = target.querySelector<HTMLElement>('[data-testid="show-toast"]');
    showToast?.focus();
    showToast?.click();
    await tick();
    expect(document.activeElement).toBe(showToast);

    // When: the user presses the standard notification-region shortcut.
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'F6', bubbles: true, cancelable: true}));
    await tick();

    // Then: focus lands on an interactive control inside the newest toast.
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Dismiss notification');

    await unmount(app);
  });

  it('Given an auto-hide toast When the window is blurred Then the timer pauses until focus returns', async () => {
    // Given: a visible auto-hide toast.
    vi.useFakeTimers();
    const onHide = vi.fn();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});

    toastStore.show({body: 'Paused toast', type: 'info', autoHideDuration: 25, onHide});
    await tick();
    expect(document.body.querySelector('[role="status"]')).toBeTruthy();
    expect(document.body.querySelector('[role="status"]')?.textContent).toContain('Paused toast');

    // When: the page blurs for longer than the toast duration.
    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(50);
    await tick();

    // Then: the toast remains until the page focuses and the timer can resume.
    expect(document.body.querySelector('[role="status"]')).toBeTruthy();
    expect(document.body.querySelector('[role="status"]')?.textContent).toContain('Paused toast');
    expect(onHide).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('focus'));
    vi.advanceTimersByTime(25);
    await tick();
    expect(document.body.querySelector('[role="status"]')).toBeNull();
    expect(onHide).toHaveBeenCalledWith('auto');

    await unmount(app);
  });

  it('Given autoHide false When the configured duration elapses Then the toast remains visible', async () => {
    // Given: a toast viewport and a toast that opts out of auto-hide.
    vi.useFakeTimers();
    const onHide = vi.fn();
    const target = createTarget();
    const app = mount(MenuToastHarness, {target});

    toastStore.show({body: 'Pinned', type: 'info', autoHide: false, autoHideDuration: 25, onHide});
    await tick();

    // When: more than the configured duration elapses.
    vi.advanceTimersByTime(50);
    await tick();

    // Then: the toast remains available until manual dismissal.
    expect(document.body.querySelector('[role="status"]')?.textContent).toContain('Pinned');
    expect(onHide).not.toHaveBeenCalled();

    await unmount(app);
  });
});
