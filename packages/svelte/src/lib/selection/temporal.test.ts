// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file temporal.test.ts
 * @input Svelte temporal components and parser utilities
 * @output Behavioral coverage for date/time parsing, calendar navigation, and temporal inputs
 * @position Failing-first tests for Todo 10 temporal Svelte port
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import Calendar from './Calendar.svelte';
import DateTimeInput from './DateTimeInput.svelte';
import TimeInput from './TimeInput.svelte';
import {
  dateToISO,
  parseDateInput,
  parseTimeInput,
} from './temporal-utils.js';
import TemporalHarness from './test-fixtures/TemporalHarness.svelte';

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

function keydown(element: Element, key: string): boolean {
  return element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

function dayButton(target: ParentNode, date: string): HTMLButtonElement {
  return requireElement(target.querySelector<HTMLButtonElement>(`button[data-date="${date}"]`), date);
}

describe('temporal parser utilities', () => {
  it('Given ISO-like and user-entered dates When parsed Then valid dates normalize without timezone drift', () => {
    expect(dateToISO(parseDateInput('2026-02-28'))).toBe('2026-02-28');
    expect(dateToISO(parseDateInput('Feb 29, 2024'))).toBe('2024-02-29');
    expect(dateToISO(parseDateInput('12/31/2026'))).toBe('2026-12-31');
    expect(dateToISO(parseDateInput('2026-1-5'))).toBe('2026-01-05');
  });

  it('Given malformed, impossible, and out-of-range dates When parsed Then no PlainDate is returned', () => {
    expect(parseDateInput('2026-02-30')).toBeNull();
    expect(parseDateInput('2025-02-29')).toBeNull();
    expect(parseDateInput('2026/31/31')).toBeNull();
    expect(parseDateInput('0000-01-01')).toBeNull();
    expect(parseDateInput('10000-01-01')).toBeNull();
    expect(parseDateInput('0')).toBeNull();
  });

  it('Given 24h and supported 12h times When parsed Then values normalize to ISO time', () => {
    expect(parseTimeInput('14:30')).toBe('14:30');
    expect(parseTimeInput('1430')).toBe('14:30');
    expect(parseTimeInput('2:30 PM')).toBe('14:30');
    expect(parseTimeInput('12am')).toBe('00:00');
    expect(parseTimeInput('11:59 pm')).toBe('23:59');
  });

  it('Given malformed or impossible times When parsed Then no normalized value is returned', () => {
    expect(parseTimeInput('25:00')).toBeNull();
    expect(parseTimeInput('14:60')).toBeNull();
    expect(parseTimeInput('13:00 PM')).toBeNull();
    expect(parseTimeInput('2:61pm')).toBeNull();
    expect(parseTimeInput('abc')).toBeNull();
  });
});

describe('Calendar temporal interactions', () => {
  it('Given January calendar When rendered Then day buttons expose grid roles, labels, bounds, and disabled state', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(Calendar, {
      target,
      props: {
        focusDate: '2026-01-01',
        min: '2026-01-10',
        max: '2026-01-20',
        disabledDates: ['2026-01-15'],
        onChange,
      },
    });

    await tick();

    expect(target.querySelector('[role="grid"]')).not.toBeNull();
    expect(target.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
    expect(dayButton(target, '2026-01-05').disabled).toBe(true);
    expect(dayButton(target, '2026-01-25').disabled).toBe(true);
    expect(dayButton(target, '2026-01-15').disabled).toBe(true);
    expect(dayButton(target, '2026-01-12').getAttribute('aria-label')).toContain('January 12, 2026');

    dayButton(target, '2026-01-12').click();
    await tick();
    expect(onChange).toHaveBeenCalledWith('2026-01-12', expect.any(Date));

    dayButton(target, '2026-01-15').click();
    await tick();
    expect(onChange).toHaveBeenCalledTimes(1);

    await unmount(app);
  });

  it('Given focused day When arrow, Home, End, and Page keys run Then active day follows calendar grid navigation', async () => {
    const target = createTarget();
    const app = mount(Calendar, {
      target,
      props: {
        focusDate: '2026-01-01',
        value: '2026-01-14',
      },
    });

    await tick();

    dayButton(target, '2026-01-14').focus();
    expect(keydown(dayButton(target, '2026-01-14'), 'ArrowRight')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(dayButton(target, '2026-01-15'));

    expect(keydown(dayButton(target, '2026-01-15'), 'ArrowDown')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(dayButton(target, '2026-01-22'));

    expect(keydown(dayButton(target, '2026-01-22'), 'Home')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(dayButton(target, '2026-01-18'));

    expect(keydown(dayButton(target, '2026-01-18'), 'End')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(dayButton(target, '2026-01-24'));

    expect(keydown(dayButton(target, '2026-01-24'), 'PageDown')).toBe(false);
    await tick();
    expect(target.textContent).toContain('February 2026');
    expect(document.activeElement).toBe(dayButton(target, '2026-02-24'));

    await unmount(app);
  });

  it('Given no selected value and a focus date When rendered Then one day is tabbable and arrow keys start there', async () => {
    const target = createTarget();
    const app = mount(Calendar, {
      target,
      props: {
        focusDate: '2026-01-14',
      },
    });

    await tick();

    const tabbableDays = target.querySelectorAll<HTMLButtonElement>('.astryx-calendar-day[tabindex="0"]');
    expect(tabbableDays).toHaveLength(1);
    expect(tabbableDays[0]?.dataset.date).toBe('2026-01-14');

    tabbableDays[0]?.focus();
    expect(keydown(dayButton(target, '2026-01-14'), 'ArrowRight')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(dayButton(target, '2026-01-15'));

    await unmount(app);
  });
});

describe('temporal form controls', () => {
  it('Given TimeInput with seconds When displayed, blurred, and typed Then seconds are preserved', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(TimeInput, {
      target,
      props: {
        id: 'seconds-time',
        label: 'Seconds time',
        value: '12:34:56',
        hasSeconds: true,
        hourFormat: '24h',
        onChange,
      },
    });

    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('#seconds-time'), 'seconds time');
    expect(input.value).toBe('12:34:56');

    input.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
    await tick();
    expect(onChange).toHaveBeenLastCalledWith('12:34:56', expect.any(Event));

    changeInputValue(input, '07:08:09');
    await tick();
    expect(onChange).toHaveBeenLastCalledWith('07:08:09', expect.any(Event));

    await unmount(app);
  });

  it('Given DateTimeInput with seconds When displayed and typed Then emitted datetime keeps seconds', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(DateTimeInput, {
      target,
      props: {
        id: 'seconds-meeting',
        label: 'Seconds meeting',
        value: '2026-03-04T12:34:56',
        hasSeconds: true,
        hourFormat: '24h',
        onChange,
      },
    });

    await tick();

    const dateInput = requireElement(target.querySelector<HTMLInputElement>('#seconds-meeting-date'), 'seconds meeting date');
    const timeInput = requireElement(target.querySelector<HTMLInputElement>('#seconds-meeting-time'), 'seconds meeting time');
    expect(timeInput.value).toBe('12:34:56');

    changeInputValue(dateInput, '2026-03-04');
    changeInputValue(timeInput, '12:34:56');
    await tick();
    expect(onChange).toHaveBeenLastCalledWith('2026-03-04T12:34:56', expect.any(Event));

    await unmount(app);
  });

  it('Given temporal inputs When typed Then valid values emit normalized payloads and invalid values stay local', async () => {
    const target = createTarget();
    const onDateChange = vi.fn();
    const onRangeChange = vi.fn();
    const onDateTimeChange = vi.fn();
    const onTimeChange = vi.fn();
    const app = mount(TemporalHarness, {
      target,
      props: {onDateChange, onRangeChange, onDateTimeChange, onTimeChange},
    });

    await tick();

    const dateInput = requireElement(target.querySelector<HTMLInputElement>('#event-date'), 'date input');
    changeInputValue(dateInput, 'Feb 29, 2024');
    await tick();
    expect(onDateChange).toHaveBeenLastCalledWith('2024-02-29', expect.any(Event));
    changeInputValue(dateInput, '2025-02-29');
    await tick();
    expect(dateInput.getAttribute('aria-invalid')).toBe('true');
    expect(onDateChange).toHaveBeenCalledTimes(1);

    const startInput = requireElement(target.querySelector<HTMLInputElement>('#travel-range-start'), 'range start');
    const endInput = requireElement(target.querySelector<HTMLInputElement>('#travel-range-end'), 'range end');
    changeInputValue(startInput, '2026-01-10');
    changeInputValue(endInput, '2026-01-12');
    await tick();
    expect(onRangeChange).toHaveBeenLastCalledWith({start: '2026-01-10', end: '2026-01-12'}, expect.any(Event));

    const datetimeDate = requireElement(target.querySelector<HTMLInputElement>('#meeting-date'), 'datetime date');
    const datetimeTime = requireElement(target.querySelector<HTMLInputElement>('#meeting-time'), 'datetime time');
    changeInputValue(datetimeDate, '2026-03-04');
    changeInputValue(datetimeTime, '2:30 PM');
    await tick();
    expect(onDateTimeChange).toHaveBeenLastCalledWith('2026-03-04T14:30', expect.any(Event));

    const timeInput = requireElement(target.querySelector<HTMLInputElement>('#start-time'), 'time input');
    changeInputValue(timeInput, '25:00');
    await tick();
    expect(timeInput.getAttribute('aria-invalid')).toBe('true');
    expect(onTimeChange).not.toHaveBeenCalled();
    changeInputValue(timeInput, '11:45 pm');
    await tick();
    expect(onTimeChange).toHaveBeenLastCalledWith('23:45', expect.any(Event));

    const requiredInputs = target.querySelectorAll('[aria-required="true"]');
    expect(requiredInputs.length).toBeGreaterThan(0);
    expect(target.querySelector<HTMLInputElement>('#disabled-date')?.disabled).toBe(true);
    expect(target.querySelector('[role="alert"]')?.textContent).toContain('Invalid date');

    await unmount(app);
  });
});
