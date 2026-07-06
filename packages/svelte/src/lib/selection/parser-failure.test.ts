// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file parser-failure.test.ts
 * @input Malformed temporal text, range limits, and disabled dates
 * @output Regression coverage for parser failure behavior and constrained controls
 * @position Failing-first adversarial parser tests for Todo 10
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import Calendar from './Calendar.svelte';
import DateInput from './DateInput.svelte';
import TimeInput from './TimeInput.svelte';
import {parseDateInput, parseTimeInput} from './temporal-utils.js';

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

function changeInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

describe('temporal parser failure probes', () => {
  it('Given leap days and range edges When parsed Then only real in-range local dates survive', () => {
    expect(parseDateInput('2024-02-29')).toEqual({year: 2024, month: 2, day: 29});
    expect(parseDateInput('2023-02-29')).toBeNull();
    expect(parseDateInput('2026-04-31')).toBeNull();
    expect(parseDateInput('2026-13-01')).toBeNull();
    expect(parseDateInput('2026-00-01')).toBeNull();
  });

  it('Given compact and meridiem time failures When parsed Then impossible times do not normalize', () => {
    expect(parseTimeInput('2360')).toBeNull();
    expect(parseTimeInput('2400')).toBeNull();
    expect(parseTimeInput('12:00 XM')).toBeNull();
    expect(parseTimeInput('0pm')).toBeNull();
    expect(parseTimeInput('2:30:61 PM', true)).toBeNull();
  });

  it('Given constrained DateInput and TimeInput When invalid text is typed Then callbacks are not emitted', async () => {
    const target = createTarget();
    const onDateChange = vi.fn();
    const onTimeChange = vi.fn();
    const dateApp = mount(DateInput, {
      target,
      props: {
        id: 'limited-date',
        label: 'Limited date',
        min: '2026-01-10',
        max: '2026-01-20',
        onChange: onDateChange,
      },
    });
    const timeApp = mount(TimeInput, {
      target,
      props: {
        id: 'limited-time',
        label: 'Limited time',
        min: '09:00',
        max: '17:00',
        onChange: onTimeChange,
      },
    });

    await tick();

    const dateInput = requireElement(target.querySelector<HTMLInputElement>('#limited-date'), 'limited date');
    changeInputValue(dateInput, '2026-01-05');
    changeInputValue(dateInput, '2026-01-21');
    changeInputValue(dateInput, 'January 12, 2026');
    await tick();
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenLastCalledWith('2026-01-12', expect.any(Event));

    const timeInput = requireElement(target.querySelector<HTMLInputElement>('#limited-time'), 'limited time');
    changeInputValue(timeInput, '8:59 AM');
    changeInputValue(timeInput, '5:01 PM');
    changeInputValue(timeInput, '4:30 PM');
    await tick();
    expect(onTimeChange).toHaveBeenCalledTimes(1);
    expect(onTimeChange).toHaveBeenLastCalledWith('16:30', expect.any(Event));

    await unmount(timeApp);
    await unmount(dateApp);
  });

  it('Given disabled calendar day When clicked Then selection callback is not invoked', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(Calendar, {
      target,
      props: {
        focusDate: '2026-01-01',
        disabledDates: ['2026-01-12'],
        onChange,
      },
    });

    await tick();

    requireElement(target.querySelector<HTMLButtonElement>('button[data-date="2026-01-12"]'), 'disabled day').click();
    requireElement(target.querySelector<HTMLButtonElement>('button[data-date="2026-01-13"]'), 'enabled day').click();
    await tick();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('2026-01-13', expect.any(Date));

    await unmount(app);
  });
});
