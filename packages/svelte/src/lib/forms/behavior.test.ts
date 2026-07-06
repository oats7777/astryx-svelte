// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file behavior.test.ts
 * @input Svelte non-radio/non-slider form controls and DOM events
 * @output Behavioral coverage for payloads, validation, pending state, and ARIA associations
 * @position Todo 9 hardening tests for forms coverage review blocker
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {
  CheckboxInput,
  FileInput,
  NumberInput,
  TextInput,
} from './index.js';
import ControlledSwitchProbe from './test-fixtures/ControlledSwitchProbe.svelte';
import FieldCompositionProbe from './test-fixtures/FieldCompositionProbe.svelte';

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

function changeFiles(input: HTMLInputElement, files: readonly File[]): void {
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: files,
  });
  input.dispatchEvent(new Event('change', {bubbles: true}));
}

function deferred(): {readonly promise: Promise<void>; readonly resolve: () => void} {
  let resolvePromise = (): void => undefined;
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });
  return {promise, resolve: resolvePromise};
}

describe('Svelte form behavior coverage', () => {
  it('Given bounded integer NumberInput When values change Then only valid callback payloads are emitted', async () => {
    // Given: a bounded integer-only number input.
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(NumberInput, {
      target,
      props: {
        id: 'quantity',
        label: 'Quantity',
        value: null,
        min: 1,
        max: 5,
        isIntegerOnly: true,
        onChange,
      },
    });

    await tick();

    // When: valid, out-of-range, decimal, and empty values are entered.
    const input = requireElement(target.querySelector<HTMLInputElement>('input[type="number"]'), 'quantity input');
    changeInputValue(input, '4');
    changeInputValue(input, '6');
    changeInputValue(input, '0');
    changeInputValue(input, '3.5');
    changeInputValue(input, '');

    // Then: callbacks receive the accepted number and nullable clear payload only.
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 4, expect.any(Event));
    expect(onChange).toHaveBeenNthCalledWith(2, null, expect.any(Event));

    await unmount(app);
  });

  it('Given async NumberInput change When pending Then busy state blocks stale input until resolution', async () => {
    // Given: a number input whose change handler resolves later.
    const target = createTarget();
    const pending = deferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(NumberInput, {
      target,
      props: {
        id: 'capacity',
        label: 'Capacity',
        value: null,
        onChange,
      },
    });

    await tick();

    // When: a second input event fires while the first callback is pending.
    const input = requireElement(target.querySelector<HTMLInputElement>('input[type="number"]'), 'capacity input');
    changeInputValue(input, '2');
    await tick();
    changeInputValue(input, '3');

    // Then: the control reports busy and does not emit a stale second payload.
    expect(input.getAttribute('aria-busy')).toBe('true');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(2, expect.any(Event));

    pending.resolve();
    await pending.promise;
    await tick();

    expect(input.getAttribute('aria-busy')).toBeNull();
    changeInputValue(input, '4');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(4, expect.any(Event));

    await unmount(app);
  });

  it('Given FileInput validation When files are selected Then status text and callback payloads match accepted files', async () => {
    // Given: a file input with type, size, and count validation.
    const target = createTarget();
    const onChange = vi.fn();
    const validPdf = new File(['ok'], 'resume.pdf', {type: 'application/pdf'});
    const validDoc = new File(['ok'], 'brief.pdf', {type: 'application/pdf'});
    const tooMany = new File(['ok'], 'extra.pdf', {type: 'application/pdf'});
    const invalidType = new File(['bad'], 'photo.png', {type: 'image/png'});
    const oversized = new File(['large'], 'large.pdf', {type: 'application/pdf'});
    const app = mount(FileInput, {
      target,
      props: {
        id: 'resume',
        label: 'Resume',
        value: null,
        accept: '.pdf',
        maxFiles: 2,
        maxSize: 4,
        isMultiple: true,
        onChange,
      },
    });

    await tick();

    // When: invalid type, oversized, and over-count selections are chosen.
    const input = requireElement(target.querySelector<HTMLInputElement>('input[type="file"]'), 'resume file input');
    changeFiles(input, [invalidType]);
    await tick();
    changeFiles(input, [oversized]);
    await tick();
    changeFiles(input, [validPdf, validDoc, tooMany]);
    await tick();

    // Then: invalid selections emit null, over-count emits the accepted subset, and validation status is announced.
    expect(onChange).toHaveBeenNthCalledWith(1, null, expect.any(Event));
    expect(onChange).toHaveBeenNthCalledWith(2, null, expect.any(Event));
    expect(onChange).toHaveBeenNthCalledWith(3, [validPdf, validDoc], expect.any(Event));
    expect(target.querySelector('[role="alert"]')?.textContent).toContain('Maximum 2 files allowed');

    await unmount(app);
  });

  it('Given selected FileInput When cleared or changed asynchronously Then rendered names, busy state, and payloads update', async () => {
    // Given: a selected file and an async change callback.
    const target = createTarget();
    const file = new File(['ok'], 'invoice.pdf', {type: 'application/pdf'});
    const pending = deferred();
    const onChange = vi.fn(() => pending.promise);
    const app = mount(FileInput, {
      target,
      props: {
        id: 'attachment',
        label: 'Attachment',
        value: [file],
        onChange,
      },
    });

    await tick();

    // When: the selected file is rendered and then cleared.
    const input = requireElement(target.querySelector<HTMLInputElement>('input[type="file"]'), 'attachment file input');
    const clear = target.querySelector<HTMLButtonElement>('button[aria-label="Clear Attachment"]');
    expect(target.textContent).toContain('invoice.pdf');
    clear?.click();
    await tick();

    // Then: clear emits null, marks the control busy, and blocks additional selection until resolution.
    expect(onChange).toHaveBeenCalledWith(null, expect.any(Event));
    expect(input.getAttribute('aria-busy')).toBe('true');
    changeFiles(input, [new File(['new'], 'replacement.pdf', {type: 'application/pdf'})]);
    expect(onChange).toHaveBeenCalledTimes(1);

    pending.resolve();
    await pending.promise;
    await tick();

    expect(input.getAttribute('aria-busy')).toBeNull();

    await unmount(app);
  });

  it('Given Field, FieldStatus, and TextInput composition When rendered Then controls are labelled and described by real IDs', async () => {
    // Given: standalone TextInput plus a Field-composed native input.
    const target = createTarget();
    const textInput = mount(TextInput, {
      target,
      props: {
        id: 'workspace',
        label: 'Workspace',
        description: 'Shown in URLs',
        status: {type: 'warning', message: 'Changing this affects links'},
      },
    });
    const fieldProbe = mount(FieldCompositionProbe, {target});

    await tick();

    // When: the controls are inspected through their label and described-by contracts.
    const workspace = target.querySelector<HTMLInputElement>('#workspace');
    const profileEmail = target.querySelector<HTMLInputElement>('#profile-email');
    const profileLabel = target.querySelector<HTMLLabelElement>('label[for="profile-email"]');
    const profileDescribedBy = profileEmail?.getAttribute('aria-describedby')?.split(' ') ?? [];

    // Then: label, description, and status IDs point at real DOM nodes.
    expect(workspace?.getAttribute('aria-describedby')).toBe('workspace-desc workspace-status');
    expect(target.querySelector('#workspace-desc')?.textContent).toContain('Shown in URLs');
    expect(target.querySelector('#workspace-status')?.textContent).toContain('Changing this affects links');
    expect(profileLabel?.textContent).toContain('Profile email');
    expect(profileEmail?.getAttribute('aria-invalid')).toBe('true');
    expect(profileDescribedBy).toEqual(['profile-email-desc', 'profile-email-status']);
    for (const id of profileDescribedBy) {
      expect(target.querySelector(`#${id}`)).not.toBeNull();
    }

    await unmount(fieldProbe);
    await unmount(textInput);
  });

  it('Given controlled Switch and CheckboxInput When toggled Then hidden input and callback payloads reflect form state', async () => {
    // Given: named switch and checkbox controls, with Switch controlled by a parent harness.
    const target = createTarget();
    const switchChange = vi.fn();
    const checkboxChange = vi.fn();
    const switchApp = mount(ControlledSwitchProbe, {
      target,
      props: {onChange: switchChange},
    });
    const checkboxApp = mount(CheckboxInput, {
      target,
      props: {
        id: 'terms',
        label: 'Accept terms',
        name: 'terms',
        value: false,
        onChange: checkboxChange,
      },
    });

    await tick();

    // When: each control is toggled.
    target.querySelector<HTMLButtonElement>('[role="switch"]')?.click();
    await tick();
    const checkbox = requireElement(target.querySelector<HTMLInputElement>('input[type="checkbox"]'), 'terms checkbox');
    checkbox.checked = true;
    checkbox.dispatchEvent(new InputEvent('input', {bubbles: true}));

    // Then: payloads carry booleans and hidden/native form values are present.
    expect(switchChange).toHaveBeenCalledWith(true, expect.any(Event));
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="emailAlerts"]')?.value).toBe('true');
    expect(checkboxChange).toHaveBeenCalledWith(true, expect.any(Event));
    expect(checkbox.name).toBe('terms');

    await unmount(checkboxApp);
    await unmount(switchApp);
  });
});
