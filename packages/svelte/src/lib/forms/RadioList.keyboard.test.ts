// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioList.keyboard.test.ts
 * @input Svelte RadioList rendered with no selected value, disabled options, and keyboard events
 * @output Keyboard focus, roving tabindex, aria-checked, and callback behavior assertions
 * @position Failing-first coverage for Todo 9 RadioList keyboard accessibility
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {RadioList} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function keydown(element: Element, key: string): boolean {
  return element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

function radiosIn(target: ParentNode): readonly HTMLElement[] {
  return [...target.querySelectorAll<HTMLElement>('[role="radio"]')];
}

function radioAt(radios: readonly HTMLElement[], index: number): HTMLElement {
  const radio = radios[index];
  if (radio == null) {
    throw new Error(`Missing radio at index ${index}`);
  }
  return radio;
}

describe('Svelte RadioList keyboard accessibility', () => {
  it('Given no selected value and a disabled leading option When rendered Then the first enabled radio is tabbable', async () => {
    const target = createTarget();
    const app = mount(RadioList, {
      target,
      props: {
        id: 'shipping-speed',
        label: 'Shipping speed',
        value: undefined,
        items: [
          {label: 'Unavailable', value: 'unavailable', isDisabled: true},
          {label: 'Standard', value: 'standard'},
          {label: 'Express', value: 'express'},
        ],
      },
    });

    await tick();

    const radios = radiosIn(target);
    expect(radios).toHaveLength(3);
    expect(radios[0]?.getAttribute('aria-disabled')).toBe('true');
    expect(radios[0]?.getAttribute('tabindex')).toBeNull();
    expect(radios[1]?.getAttribute('tabindex')).toBe('0');
    expect(radios[1]?.getAttribute('aria-checked')).toBe('false');
    expect(radios[2]?.getAttribute('tabindex')).toBe('-1');

    await unmount(app);
  });

  it('Given enabled and disabled radios When keyboard navigation runs Then focus, checked state, form value, and callbacks follow enabled options', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(RadioList, {
      target,
      props: {
        id: 'contact-method',
        label: 'Contact method',
        name: 'contact',
        value: undefined,
        isRequired: true,
        status: {type: 'error', message: 'Choose one'},
        items: [
          {label: 'Email', value: 'email'},
          {label: 'SMS', value: 'sms', isDisabled: true},
          {label: 'Phone', value: 'phone'},
          {label: 'Mail', value: 'mail'},
        ],
        onChange,
      },
    });

    await tick();

    const group = target.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-required')).toBe('true');
    expect(group?.getAttribute('aria-invalid')).toBe('true');

    let radios = radiosIn(target);
    radioAt(radios, 0).focus();
    expect(document.activeElement).toBe(radioAt(radios, 0));

    expect(keydown(radioAt(radios, 0), 'Enter')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 0));
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false', 'false']);
    expect(onChange).toHaveBeenLastCalledWith('email', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 0), 'ArrowRight')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 2));
    expect(radios.map((radio) => radio.getAttribute('tabindex'))).toEqual(['-1', null, '0', '-1']);
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true', 'false']);
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="contact"]')?.value).toBe('phone');
    expect(onChange).toHaveBeenLastCalledWith('phone', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 2), 'ArrowDown')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 3));
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false', 'true']);
    expect(onChange).toHaveBeenLastCalledWith('mail', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 3), 'ArrowLeft')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 2));
    expect(onChange).toHaveBeenLastCalledWith('phone', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 2), 'Home')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 0));
    expect(onChange).toHaveBeenLastCalledWith('email', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 0), 'End')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 3));
    expect(onChange).toHaveBeenLastCalledWith('mail', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 3), 'ArrowUp')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 2));
    expect(onChange).toHaveBeenLastCalledWith('phone', expect.any(KeyboardEvent));

    radioAt(radios, 3).focus();
    expect(keydown(radioAt(radios, 3), ' ')).toBe(false);
    await tick();

    radios = radiosIn(target);
    expect(document.activeElement).toBe(radioAt(radios, 3));
    expect(onChange).toHaveBeenCalledTimes(8);
    expect(onChange).toHaveBeenLastCalledWith('mail', expect.any(KeyboardEvent));

    expect(keydown(radioAt(radios, 3), 'Enter')).toBe(false);
    await tick();

    expect(onChange).toHaveBeenCalledTimes(8);

    await unmount(app);
  });
});
