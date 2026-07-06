// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focus-trap.test.ts
 * @input Nested Svelte Dialog and Popover fixture
 * @output Focus escape regression proof for Todo 11 failure QA
 * @position Exact failure scenario command target for nested overlay focus trapping
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import DialogHarness from './test-fixtures/DialogHarness.svelte';
import EscapeLayerHarness from './test-fixtures/EscapeLayerHarness.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('nested dialog and popover focus trap', () => {
  beforeEach(() => {
    document.body.textContent = '';
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('Given nested dialog and popover When tabbing past the nested layer Then focus remains inside the top overlay', async () => {
    // Given: an open dialog containing an open popover.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(DialogHarness, {target, props: {nestedOpen: true}});

    await tick();
    const nestedControl = document.body.querySelector<HTMLElement>('[data-testid="nested-popover-control"]');
    nestedControl?.focus();

    // When: keyboard users tab beyond the nested popover.
    await user.keyboard('{Tab}');

    // Then: focus wraps within the top overlay instead of escaping to the page.
    expect(document.activeElement).toBe(nestedControl);

    await unmount(app);
  });

  it('Given a focus-trapped layer When Escape bubbles through document and window Then the close callback fires once', async () => {
    // Given: a standalone focus-trapped layer with an Escape callback.
    const user = userEvent.setup();
    const onEscape = vi.fn();
    const target = createTarget();
    const app = mount(EscapeLayerHarness, {target, props: {onEscape}});

    await tick();
    document.body.querySelector<HTMLElement>('[data-testid="escape-layer-button"]')?.focus();

    // When: Escape is pressed from inside the layer.
    await user.keyboard('{Escape}');

    // Then: the layer reports exactly one dismissal request.
    expect(onEscape).toHaveBeenCalledOnce();

    await unmount(app);
  });
});
