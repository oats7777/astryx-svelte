// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file async-pending.test.ts
 * @input Form controls with rejected promise-returning change handlers
 * @output Regression coverage that rejected async changes clear busy guards and allow later input
 * @position Todo 9 async pending cleanup tests for Svelte form controls
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput, CheckboxList, NumberInput, Switch, TextArea, TextInput} from './index.js';
import type {NumberChangeHandler} from './types.js';

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

function changeInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

function pressEnter(input: HTMLInputElement): void {
  input.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'Enter'}));
}

function rejectedDeferred(): {readonly promise: Promise<void>; readonly reject: () => void} {
  let rejectPromise = (): void => undefined;
  const promise = new Promise<void>((_resolve, reject) => {
    rejectPromise = () => reject(new Error('Rejected async form change'));
  });
  promise.catch(() => undefined);
  return {promise, reject: rejectPromise};
}

async function settleRejectedChange(reject: () => void): Promise<void> {
  reject();
  await new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });
  await tick();
}

describe('Svelte form async pending recovery', () => {
  it('Given rejected async TextInput change When another value is entered Then busy clears and later input is accepted', async () => {
    // Given: a text input whose first async change rejects.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(TextInput, {
      target,
      props: {id: 'workspace', label: 'Workspace', value: '', onChange},
    });

    await tick();

    // When: the first input enters pending and then rejects.
    const input = requireElement(target.querySelector<HTMLInputElement>('#workspace'), 'workspace input');
    changeInputValue(input, 'alpha');
    await tick();
    expect(input.getAttribute('aria-busy')).toBe('true');
    await settleRejectedChange(pending.reject);

    // Then: the busy guard clears and the next input is accepted.
    expect(input.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => Promise.resolve());
    changeInputValue(input, 'beta');
    expect(onChange).toHaveBeenLastCalledWith('beta', expect.any(Event));
    expect(onChange).toHaveBeenCalledTimes(2);

    await unmount(app);
  });

  it('Given rejected async NumberInput change When another value is entered Then busy clears and later input is accepted', async () => {
    // Given: a number input whose first async change rejects.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(NumberInput, {
      target,
      props: {id: 'capacity', label: 'Capacity', value: null, onChange},
    });

    await tick();

    // When: the first numeric input enters pending and then rejects.
    const input = requireElement(target.querySelector<HTMLInputElement>('#capacity'), 'capacity input');
    changeInputValue(input, '2');
    await tick();
    expect(input.getAttribute('aria-busy')).toBe('true');
    await settleRejectedChange(pending.reject);

    // Then: the busy guard clears and the next value is accepted.
    expect(input.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => Promise.resolve());
    changeInputValue(input, '3');
    expect(onChange).toHaveBeenLastCalledWith(3, expect.any(Event));
    expect(onChange).toHaveBeenCalledTimes(2);

    await unmount(app);
  });

  it('Given pending async NumberInput change When Enter is pressed Then duplicate enter and change commits are blocked until cleanup', async () => {
    // Given: a number input whose first async change is still pending.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn<NumberChangeHandler>(() => pending.promise);
    const onEnter = vi.fn();
    const app = mount(NumberInput, {
      target,
      props: {id: 'capacity-enter', label: 'Capacity', value: null, onChange, onEnter},
    });

    await tick();

    // When: Enter is pressed while the pending change keeps the input busy.
    const input = requireElement(target.querySelector<HTMLInputElement>('#capacity-enter'), 'capacity enter input');
    changeInputValue(input, '2');
    await tick();
    input.value = '3';
    pressEnter(input);

    // Then: the busy guard blocks the duplicate Enter callback and change emission.
    expect(input.getAttribute('aria-busy')).toBe('true');
    expect(onEnter).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2, expect.any(Event));
    await settleRejectedChange(pending.reject);

    // Then: after rejection cleanup, later Enter and input paths work again.
    expect(input.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => undefined);
    input.value = '4';
    pressEnter(input);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenLastCalledWith(4, expect.any(KeyboardEvent));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(4, expect.any(KeyboardEvent));

    changeInputValue(input, '5');
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith(5, expect.any(Event));

    await unmount(app);
  });

  it('Given rejected async TextArea change When another value is entered Then busy clears and later input is accepted', async () => {
    // Given: a textarea whose first async change rejects.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(TextArea, {
      target,
      props: {id: 'notes', label: 'Notes', value: '', onChange},
    });

    await tick();

    // When: the first textarea input enters pending and then rejects.
    const textarea = requireElement(target.querySelector<HTMLTextAreaElement>('#notes'), 'notes textarea');
    changeInputValue(textarea, 'draft');
    await tick();
    expect(textarea.getAttribute('aria-busy')).toBe('true');
    await settleRejectedChange(pending.reject);

    // Then: the busy guard clears and the next value is accepted.
    expect(textarea.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => Promise.resolve());
    changeInputValue(textarea, 'final');
    expect(onChange).toHaveBeenLastCalledWith('final', expect.any(Event));
    expect(onChange).toHaveBeenCalledTimes(2);

    await unmount(app);
  });

  it('Given rejected async CheckboxInput change When toggled again Then busy clears and later toggle is accepted', async () => {
    // Given: a checkbox whose first async change rejects.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(CheckboxInput, {
      target,
      props: {id: 'terms', label: 'Accept terms', value: false, onChange},
    });

    await tick();

    // When: the first toggle enters pending and then rejects.
    const checkbox = requireElement(target.querySelector<HTMLInputElement>('#terms'), 'terms checkbox');
    checkbox.checked = true;
    checkbox.dispatchEvent(new InputEvent('input', {bubbles: true}));
    await tick();
    expect(checkbox.getAttribute('aria-busy')).toBe('true');
    await settleRejectedChange(pending.reject);

    // Then: the busy guard clears and the next toggle is accepted.
    expect(checkbox.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => Promise.resolve());
    checkbox.checked = false;
    checkbox.dispatchEvent(new InputEvent('input', {bubbles: true}));
    expect(onChange).toHaveBeenLastCalledWith(false, expect.any(Event));
    expect(onChange).toHaveBeenCalledTimes(2);

    await unmount(app);
  });

  it('Given rejected async Switch change When clicked again Then busy clears and later click is accepted', async () => {
    // Given: a switch whose first async change rejects.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(Switch, {
      target,
      props: {id: 'email-alerts', label: 'Email alerts', isChecked: false, onChange},
    });

    await tick();

    // When: the first switch click enters pending and then rejects.
    const switchButton = requireElement(target.querySelector<HTMLButtonElement>('[role="switch"]'), 'email alerts switch');
    switchButton.click();
    await tick();
    expect(switchButton.getAttribute('aria-busy')).toBe('true');
    await settleRejectedChange(pending.reject);

    // Then: the busy guard clears and a later click is accepted.
    expect(switchButton.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => Promise.resolve());
    switchButton.click();
    expect(onChange).toHaveBeenLastCalledWith(true, expect.any(Event));
    expect(onChange).toHaveBeenCalledTimes(2);

    await unmount(app);
  });

  it('Given rejected async CheckboxList change When another item is clicked Then item busy clears and later input is accepted', async () => {
    // Given: a checkbox list whose first async item change rejects.
    const target = createTarget();
    const pending = rejectedDeferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(CheckboxList, {
      target,
      props: {
        id: 'roles',
        label: 'Roles',
        value: [],
        items: [
          {label: 'Admin', value: 'admin'},
          {label: 'Editor', value: 'editor'},
        ],
        onChange,
      },
    });

    await tick();

    // When: the first item enters pending and then rejects.
    const items = [...target.querySelectorAll<HTMLElement>('[role="checkbox"]')];
    const admin = requireElement(items[0] ?? null, 'admin checkbox item');
    const editor = requireElement(items[1] ?? null, 'editor checkbox item');
    admin.click();
    await tick();
    expect(admin.getAttribute('aria-busy')).toBe('true');
    await settleRejectedChange(pending.reject);

    // Then: the item busy guard clears and a later item click is accepted.
    expect(admin.getAttribute('aria-busy')).toBeNull();
    onChange.mockImplementation(() => Promise.resolve());
    editor.click();
    expect(onChange).toHaveBeenLastCalledWith(['editor'], expect.any(Event));
    expect(onChange).toHaveBeenCalledTimes(2);

    await unmount(app);
  });
});
