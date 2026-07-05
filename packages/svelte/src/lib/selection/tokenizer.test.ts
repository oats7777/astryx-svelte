// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokenizer.test.ts
 * @input Tokenizer harness, text entry, delimiters, and removal events
 * @output DOM-level behavioral coverage for token creation, editing, and form serialization
 * @position Todo 10 tokenizer red-green tests for the Svelte port
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import TokenizerHarness from './test-fixtures/TokenizerHarness.svelte';
import type {TokenizerToken} from './combo-types.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function requireElement<T extends Element>(element: T | null, selector: string): T {
  if (element == null) {
    throw new Error(`Expected ${selector} to exist`);
  }
  return element;
}

function hiddenValue(target: ParentNode): string {
  return requireElement(target.querySelector<HTMLInputElement>('input[type="hidden"][name="keywords"]'), 'keywords hidden input').value;
}

describe('Svelte Tokenizer', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given free text Tokenizer When delimiters and Enter are used Then tokens and hidden serialized value update', async () => {
    // Given: a controlled tokenizer with comma and semicolon delimiters.
    const user = userEvent.setup();
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(TokenizerHarness, {target, props: {onChange}});
    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[data-testid="tokenizer"] input'), 'tokenizer input');

    // When: delimiter-only input and valid token text are entered.
    await user.click(input);
    await user.keyboard(',;');
    await tick();
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard('alpha, beta{Enter}');
    await tick();

    // Then: two tokens render, callbacks receive structured tokens, and one hidden input serializes all values.
    const expectedTokens: readonly TokenizerToken[] = [
      {id: 'alpha', label: 'alpha', value: 'alpha'},
      {id: 'beta', label: 'beta', value: 'beta'},
    ];
    expect(onChange).toHaveBeenLastCalledWith(expectedTokens, expect.any(Event));
    expect(target.textContent).toContain('alpha');
    expect(target.textContent).toContain('beta');
    expect(hiddenValue(target)).toBe('["alpha","beta"]');

    await unmount(app);
  });

  it('Given existing Tokenizer tokens When Delete, Backspace, and remove buttons run Then hidden serialization follows removals', async () => {
    // Given: a tokenizer with two tokens created through the input.
    const user = userEvent.setup();
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(TokenizerHarness, {target, props: {onChange}});
    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[data-testid="tokenizer"] input'), 'tokenizer input');
    await user.click(input);
    await user.keyboard('alpha,beta{Enter}');
    await tick();

    // When: empty-input Delete removes the last token, then Backspace removes the remaining token.
    await user.keyboard('{Delete}');
    await tick();
    expect(onChange).toHaveBeenLastCalledWith([{id: 'alpha', label: 'alpha', value: 'alpha'}], expect.any(Event));
    expect(hiddenValue(target)).toBe('["alpha"]');

    await user.keyboard('{Backspace}');
    await tick();
    expect(onChange).toHaveBeenLastCalledWith([], expect.any(Event));
    expect(target.querySelector('input[type="hidden"][name="keywords"]')).toBeNull();

    await user.keyboard('gamma{Enter}');
    await tick();
    expect(hiddenValue(target)).toBe('["gamma"]');

    await user.click(requireElement(target.querySelector<HTMLButtonElement>('button[aria-label="Remove gamma"]'), 'remove gamma'));
    await tick();

    // Then: no hidden input remains because the token collection is empty.
    expect(onChange).toHaveBeenLastCalledWith([], expect.any(Event));
    expect(target.querySelector('input[type="hidden"][name="keywords"]')).toBeNull();

    await unmount(app);
  });

  it('Given disabled or read-only Tokenizer When users type or remove Then token changes are suppressed', async () => {
    // Given: disabled and read-only tokenizer instances.
    const user = userEvent.setup();
    const target = createTarget();
    const disabledChange = vi.fn();
    const readOnlyChange = vi.fn();
    const disabledApp = mount(TokenizerHarness, {
      target,
      props: {onChange: disabledChange, isDisabled: true},
    });
    const readOnlyApp = mount(TokenizerHarness, {
      target,
      props: {onChange: readOnlyChange, isReadOnly: true},
    });
    await tick();

    const inputs = target.querySelectorAll<HTMLInputElement>('[data-testid="tokenizer"] input');
    const disabledInput = requireElement(inputs.item(0), 'disabled tokenizer input');
    const readOnlyInput = requireElement(inputs.item(1), 'read-only tokenizer input');

    // When: users attempt to type into disabled/read-only controls.
    await user.click(disabledInput);
    await user.keyboard('alpha{Enter}');
    await user.click(readOnlyInput);
    await user.keyboard('beta{Enter}');
    await tick();

    // Then: callbacks are suppressed and no serialized form values are produced.
    expect(disabledInput.disabled).toBe(true);
    expect(readOnlyInput.readOnly).toBe(true);
    expect(disabledChange).not.toHaveBeenCalled();
    expect(readOnlyChange).not.toHaveBeenCalled();
    expect(target.querySelector('input[type="hidden"][name="keywords"]')).toBeNull();

    await unmount(readOnlyApp);
    await unmount(disabledApp);
  });
});
