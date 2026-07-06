// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file task-6-temporal.test.ts
 * @input DateInput, DateRangeInput, DateTimeInput, TimeInput, and keyboard events
 * @output Todo 6 temporal accessibility regression coverage
 * @position Focused latest-main parity tests for date and time controls
 */

import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import DateInput from './DateInput.svelte';
import DateRangeInput from './DateRangeInput.svelte';
import DateTimeInput from './DateTimeInput.svelte';
import TimeInput from './TimeInput.svelte';
import {dateToISO, formatDisplayDate, parseDateInput} from './temporal-utils.js';

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

function dayButton(target: ParentNode, date: string): HTMLButtonElement {
  return requireElement(target.querySelector<HTMLButtonElement>(`button[data-date="${date}"]`), date);
}

function alertText(target: ParentNode, text: string): HTMLElement {
  const alert = [...target.querySelectorAll<HTMLElement>('[role="alert"][aria-live="assertive"]')].find((candidate) =>
    candidate.textContent?.includes(text),
  );
  return requireElement(alert ?? null, text);
}

function optionalAlertText(target: ParentNode, text: string): HTMLElement | null {
  return [...target.querySelectorAll<HTMLElement>('[role="alert"][aria-live="assertive"]')].find((candidate) =>
    candidate.textContent?.includes(text),
  ) ?? null;
}

function changeInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

function keydown(element: Element, key: string): boolean {
  return element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

describe('Todo 6 temporal accessibility parity', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given temporal date inputs When ArrowDown opens calendars Then selections emit normalized values', async () => {
    // Given: date, range, and date-time inputs with deterministic selected months.
    const target = createTarget();
    const onDateChange = vi.fn();
    const onRangeChange = vi.fn();
    const onDateTimeChange = vi.fn();
    const dateApp = mount(DateInput, {target, props: {id: 'keyboard-date', label: 'Date', value: '2026-01-12', onChange: onDateChange}});
    const rangeApp = mount(DateRangeInput, {target, props: {id: 'keyboard-range', label: 'Trip window', value: {start: '2026-01-10', end: '2026-01-12'}, onChange: onRangeChange}});
    const dateTimeApp = mount(DateTimeInput, {target, props: {id: 'keyboard-datetime', label: 'Meeting', timeLabel: 'Hora de inicio', value: '2026-03-04T09:30', onChange: onDateTimeChange}});
    await tick();

    // When: keyboard users open each calendar and select dates.
    const dateInput = requireElement(target.querySelector<HTMLInputElement>('#keyboard-date'), 'date input');
    dateInput.focus();
    expect(keydown(dateInput, 'ArrowDown')).toBe(false);
    await tick();
    expect(document.activeElement).toBe(dateInput);
    dayButton(target, '2026-01-14').click();
    await tick();
    expect(onDateChange).toHaveBeenLastCalledWith('2026-01-14', expect.any(Event));
    const rangeStart = requireElement(target.querySelector<HTMLInputElement>('#keyboard-range-start'), 'range start');
    expect(rangeStart.getAttribute('role')).toBe('combobox');
    rangeStart.focus();
    expect(keydown(rangeStart, 'ArrowDown')).toBe(false);
    await tick();
    dayButton(target, '2026-01-10').click();
    await tick();
    dayButton(target, '2026-01-12').click();
    await tick();
    expect(onRangeChange).toHaveBeenLastCalledWith({start: '2026-01-10', end: '2026-01-12'}, expect.any(Event));
    const dateTimeDate = requireElement(target.querySelector<HTMLInputElement>('#keyboard-datetime-date'), 'datetime date');
    expect(requireElement(target.querySelector<HTMLInputElement>('#keyboard-datetime-time'), 'datetime time').getAttribute('aria-label')).toBe('Hora de inicio');
    dateTimeDate.focus();
    expect(keydown(dateTimeDate, 'ArrowDown')).toBe(false);
    await tick();
    dayButton(target, '2026-03-06').click();
    await tick();

    // Then: calendar selection combines with the current time and popovers close.
    expect(onDateTimeChange).toHaveBeenLastCalledWith('2026-03-06T09:30', expect.any(Event));
    expect(dateTimeDate.getAttribute('aria-expanded')).toBe('false');
    await unmount(dateTimeApp);
    await unmount(rangeApp);
    await unmount(dateApp);
  });

  it('Given valid prefilled date displays When calendars open and close by keyboard Then inputs remain valid', async () => {
    // Given: valid ISO values rendered through the same display formatter used by the controls.
    expect(dateToISO(parseDateInput(formatDisplayDate('2026-01-12')))).toBe('2026-01-12');
    const target = createTarget();
    const dateApp = mount(DateInput, {target, props: {id: 'prefilled-date', label: 'Date', value: '2026-01-12', onChange: vi.fn()}});
    const rangeApp = mount(DateRangeInput, {
      target,
      props: {id: 'prefilled-range', label: 'Range', value: {start: '2026-01-10', end: '2026-01-12'}, onChange: vi.fn()},
    });
    const dateTimeApp = mount(DateTimeInput, {
      target,
      props: {id: 'prefilled-datetime', label: 'Meeting', value: '2026-03-04T09:30', onChange: vi.fn()},
    });
    await tick();

    // When: users open each calendar with ArrowDown, close with Escape, and move focus away.
    const dateInput = requireElement(target.querySelector<HTMLInputElement>('#prefilled-date'), 'prefilled date');
    dateInput.focus();
    expect(keydown(dateInput, 'ArrowDown')).toBe(false);
    await tick();
    expect(keydown(dateInput, 'Escape')).toBe(false);
    dateInput.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
    await tick();

    const rangeStart = requireElement(target.querySelector<HTMLInputElement>('#prefilled-range-start'), 'prefilled range start');
    rangeStart.focus();
    expect(keydown(rangeStart, 'ArrowDown')).toBe(false);
    await tick();
    expect(keydown(rangeStart, 'Escape')).toBe(false);
    rangeStart.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
    await tick();

    const dateTimeDate = requireElement(target.querySelector<HTMLInputElement>('#prefilled-datetime-date'), 'prefilled datetime date');
    dateTimeDate.focus();
    expect(keydown(dateTimeDate, 'ArrowDown')).toBe(false);
    await tick();
    expect(keydown(dateTimeDate, 'Escape')).toBe(false);
    dateTimeDate.dispatchEvent(new FocusEvent('blur', {bubbles: true}));
    await tick();

    // Then: valid formatted values do not surface assertive invalid alerts or invalid ARIA state.
    expect(dateInput.getAttribute('aria-invalid')).not.toBe('true');
    expect(rangeStart.getAttribute('aria-invalid')).not.toBe('true');
    expect(requireElement(target.querySelector<HTMLInputElement>('#prefilled-range-end'), 'prefilled range end').getAttribute('aria-invalid')).not.toBe('true');
    expect(dateTimeDate.getAttribute('aria-invalid')).not.toBe('true');
    expect(optionalAlertText(target, 'Invalid date')).toBeNull();
    expect(optionalAlertText(target, 'Invalid date range')).toBeNull();
    expect(optionalAlertText(target, 'Invalid date or time')).toBeNull();

    await unmount(dateTimeApp);
    await unmount(rangeApp);
    await unmount(dateApp);
  });

  it('Given invalid temporal text When typed Then assertive alerts name the rejected field', async () => {
    // Given: temporal inputs with date, range, datetime, and time fields.
    const target = createTarget();
    const apps = [
      mount(DateInput, {target, props: {id: 'invalid-date', label: 'Date', onChange: vi.fn()}}),
      mount(DateRangeInput, {target, props: {id: 'invalid-range', label: 'Range', onChange: vi.fn()}}),
      mount(DateTimeInput, {target, props: {id: 'invalid-datetime', label: 'Meeting', value: '2026-03-04T09:30', onChange: vi.fn()}}),
      mount(TimeInput, {target, props: {id: 'invalid-time', label: 'Start time', onChange: vi.fn()}}),
    ];
    await tick();

    // When: malformed input is typed into each field.
    changeInputValue(requireElement(target.querySelector<HTMLInputElement>('#invalid-date'), 'date input'), '13/45/2024');
    changeInputValue(requireElement(target.querySelector<HTMLInputElement>('#invalid-range-start'), 'range start'), '2026-02-30');
    changeInputValue(requireElement(target.querySelector<HTMLInputElement>('#invalid-datetime-date'), 'datetime date'), '2026-02-30');
    changeInputValue(requireElement(target.querySelector<HTMLInputElement>('#invalid-datetime-time'), 'datetime time'), '99:99 zz');
    changeInputValue(requireElement(target.querySelector<HTMLInputElement>('#invalid-time'), 'time input'), '99:99 zz');
    await tick();

    // Then: each rejected field exposes invalid state and assertive live text.
    expect(requireElement(target.querySelector<HTMLInputElement>('#invalid-date'), 'date input').getAttribute('aria-invalid')).toBe('true');
    expect(alertText(target, 'Invalid date')).toBeTruthy();
    expect(alertText(target, 'Invalid date range')).toBeTruthy();
    expect(alertText(target, 'Invalid time')).toBeTruthy();
    for (const app of apps) {
      await unmount(app);
    }
  });
});
