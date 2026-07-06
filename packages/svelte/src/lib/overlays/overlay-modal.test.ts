// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file overlay-modal.test.ts
 * @input Dialog, AlertDialog, nested Popover, focus trap, and scroll lock behavior
 * @output Vitest proof for modal overlay keyboard and aria contracts
 * @position Todo 11 tests for overlay focus management
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import AlertDialog from './AlertDialog.svelte';
import DialogHarness from './test-fixtures/DialogHarness.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte modal overlays', () => {
  beforeEach(() => {
    document.body.textContent = '';
    document.body.removeAttribute('style');
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('Given an info dialog When opened Then it traps focus, locks scroll, exposes modal aria, and closes on Escape', async () => {
    // Given: a modal dialog with focusable controls and an external focus target.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(DialogHarness, {target, props: {onOpenChange}});

    await tick();
    await new Promise(requestAnimationFrame);

    const dialog = document.body.querySelector('[role="dialog"]');
    const first = document.body.querySelector<HTMLElement>('[data-testid="first-dialog-control"]');
    const last = document.body.querySelector<HTMLElement>('[data-testid="last-dialog-control"]');

    // When: keyboard focus reaches the dialog boundaries and Escape is pressed.
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.getAttribute('aria-label')).toBe('Edit settings');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(first);

    last?.focus();
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(first);

    await user.keyboard('{Escape}');

    // Then: the dialog requests close through the controlled callback.
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await unmount(app);
    expect(document.body.style.overflow).toBe('');
  });

  it('Given a required alert dialog When Escape and backdrop click occur Then dismissal is blocked', async () => {
    // Given: a required alert dialog for a mandatory decision.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(AlertDialog, {
      target,
      props: {
        open: true,
        label: 'Delete account',
        purpose: 'required',
        onOpenChange,
      },
    });

    await tick();
    const alertDialog = document.body.querySelector<HTMLElement>('[role="alertdialog"]');

    // When: the user tries Escape and backdrop dismissal.
    await user.keyboard('{Escape}');
    alertDialog?.parentElement?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    // Then: required dialogs do not request close.
    expect(alertDialog?.getAttribute('aria-modal')).toBe('true');
    expect(onOpenChange).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given nested dialog and popover layers When Escape is pressed Then only the top nested layer closes first', async () => {
    // Given: a dialog with a nested popover layer.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onNestedOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(DialogHarness, {
      target,
      props: {nestedOpen: true, onOpenChange, onNestedOpenChange},
    });

    await tick();
    await user.keyboard('{Escape}');

    // Then: the nested popover consumes the top-layer dismissal before the dialog.
    expect(onNestedOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given nested dialog and alertdialog layers When Escape is pressed Then only the top alertdialog closes first', async () => {
    // Given: a modal dialog with a nested alertdialog focus layer.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onNestedDialogOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(DialogHarness, {
      target,
      props: {nestedDialogOpen: true, onOpenChange, onNestedDialogOpenChange},
    });

    await tick();
    await new Promise(requestAnimationFrame);

    // When: the user presses Escape while the nested alertdialog is topmost.
    await user.keyboard('{Escape}');

    // Then: only the top dialog requests dismissal.
    expect(onNestedDialogOpenChange).toHaveBeenCalledOnce();
    expect(onNestedDialogOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).not.toHaveBeenCalled();

    await unmount(app);
  });

  it('Given nested dialog and alertdialog layers When focus leaves both Then focus returns to the top alertdialog', async () => {
    // Given: a modal dialog with a nested alertdialog focus layer and an outside target.
    const target = createTarget();
    const app = mount(DialogHarness, {target, props: {nestedDialogOpen: true}});

    await tick();
    await new Promise(requestAnimationFrame);

    const nestedFirst = document.body.querySelector<HTMLElement>(
      '[data-testid="first-nested-dialog-control"]',
    );
    const outside = document.body.querySelector<HTMLElement>('[data-testid="before-dialog"]');

    // When: focus attempts to leave the active dialog stack.
    outside?.focus();

    // Then: the top alertdialog owns containment.
    expect(document.activeElement).toBe(nestedFirst);

    await unmount(app);
  });

  it('Given a dialog with a non-trapping child layer When Escape is pressed Then the dialog still closes', async () => {
    // Given: a modal dialog with a visible hover-card child that does not trap focus.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(DialogHarness, {
      target,
      props: {nonTrappingNestedOpen: true, onOpenChange},
    });

    await tick();

    // When: the user presses Escape while the non-trapping child layer is present.
    await user.keyboard('{Escape}');

    // Then: the dialog keeps ownership of Escape dismissal.
    expect(onOpenChange).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await unmount(app);
  });

  it('Given an open dialog When Escape cancels IME composition Then the dialog remains open', async () => {
    // Given: an open dialog that normally closes on Escape.
    const onOpenChange = vi.fn();
    const target = createTarget();
    const app = mount(DialogHarness, {target, props: {onOpenChange}});
    await tick();

    // When: Escape is emitted as part of IME composition cancellation.
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 229,
        bubbles: true,
        cancelable: true,
      }),
    );
    await tick();

    // Then: the dialog does not request dismissal.
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await unmount(app);
  });

  it('Given a dialog with a non-trapping child layer When focus moves outside Then focus returns to the dialog', async () => {
    // Given: a modal dialog with a visible hover-card child that does not trap focus.
    const target = createTarget();
    const app = mount(DialogHarness, {target, props: {nonTrappingNestedOpen: true}});

    await tick();
    await new Promise(requestAnimationFrame);

    const first = document.body.querySelector<HTMLElement>('[data-testid="first-dialog-control"]');
    const outside = document.body.querySelector<HTMLElement>('[data-testid="before-dialog"]');

    // When: focus attempts to leave the dialog while no child focus trap owns containment.
    outside?.focus();

    // Then: the dialog focus trap remains active.
    expect(document.activeElement).toBe(first);

    await unmount(app);
  });
});
