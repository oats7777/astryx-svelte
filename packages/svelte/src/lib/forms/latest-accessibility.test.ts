// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file latest-accessibility.test.ts
 * @input Svelte forms rendered with labels, invalid typed values, file selections, and form names
 * @output Latest main forms accessibility parity assertions
 * @position Failing-first Todo 6 forms accessibility coverage
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {mount, tick, unmount} from 'svelte';
import {__resetLiveRegionsForTest} from '../actions/announce.js';
import {CheckboxList, FileInput, InputGroup, NumberInput, RadioList} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function createFormTarget(): HTMLFormElement {
  const target = document.createElement('form');
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

function liveRegion(politeness: 'polite' | 'assertive'): HTMLElement | null {
  return document.querySelector(`[data-astryx-live-region="${politeness}"]`);
}

function keydown(element: Element, key: string): boolean {
  return element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

function radioItems(target: ParentNode): readonly HTMLElement[] {
  return [...target.querySelectorAll<HTMLElement>('[role="radio"]')];
}

function radioAt(radios: readonly HTMLElement[], index: number): HTMLElement {
  const radio = radios[index];
  if (radio == null) {
    throw new Error(`Expected radio at index ${index} to exist`);
  }
  return radio;
}

describe('latest main Svelte forms accessibility parity', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    __resetLiveRegionsForTest();
    vi.unstubAllGlobals();
    document.body.textContent = '';
  });

  it('Given checkbox, radio, and input groups When rendered Then group names come from real label IDs', async () => {
    // Given: labeled grouped controls with descriptions and status text.
    const target = createTarget();
    const checkboxList = mount(CheckboxList, {
      target,
      props: {
        id: 'feature-flags',
        label: 'Feature flags',
        description: 'Choose active flags',
        status: {type: 'error', message: 'Select at least one flag'},
        items: [{label: 'Beta dashboard', value: 'beta'}],
      },
    });
    const radioList = mount(RadioList, {
      target,
      props: {
        id: 'release-cadence',
        label: 'Release cadence',
        description: 'Choose one cadence',
        items: [{label: 'Weekly', value: 'weekly'}],
      },
    });
    const inputGroup = mount(InputGroup, {
      target,
      props: {label: 'Repository URL', prefix: 'https://', suffix: '.git'},
    });

    await tick();

    // When: group labeling attributes are inspected.
    const checkboxGroup = requireElement(target.querySelector<HTMLElement>('#feature-flags-options'), 'checkbox group');
    const checkboxLabelId = checkboxGroup.getAttribute('aria-labelledby');
    const checkboxDescribedBy = checkboxGroup.getAttribute('aria-describedby')?.split(' ') ?? [];
    const radioGroup = requireElement(target.querySelector<HTMLElement>('[role="radiogroup"]'), 'radio group');
    const radioLabelId = radioGroup.getAttribute('aria-labelledby');
    const inputGroupElement = requireElement(target.querySelector<HTMLElement>('.astryx-input-group'), 'input group');
    const inputGroupLabelId = inputGroupElement.getAttribute('aria-labelledby');

    // Then: each group points to visible or visually hidden label content and real descriptions.
    expect(checkboxGroup.getAttribute('role')).toBe('group');
    expect(checkboxLabelId).toBe('feature-flags-label');
    expect(target.querySelector(`#${checkboxLabelId}`)?.textContent).toContain('Feature flags');
    expect(checkboxDescribedBy).toEqual(['feature-flags-desc', 'feature-flags-status']);
    for (const id of checkboxDescribedBy) {
      expect(target.querySelector(`#${id}`)).not.toBeNull();
    }
    expect(radioLabelId).toBe('release-cadence-label');
    expect(target.querySelector(`#${radioLabelId}`)?.textContent).toContain('Release cadence');
    expect(inputGroupElement.getAttribute('role')).toBe('group');
    expect(inputGroupElement.hasAttribute('aria-label')).toBe(false);
    expect(target.querySelector(`#${inputGroupLabelId}`)?.textContent).toContain('Repository URL');

    await unmount(inputGroup);
    await unmount(radioList);
    await unmount(checkboxList);
  });

  it('Given file selections When accepted or rejected Then live regions announce success and invalid status without changing form value serialization', async () => {
    // Given: a multiple file input with a native form name and validation.
    const target = createFormTarget();
    const onChange = vi.fn();
    const acceptedOne = new File(['pdf'], 'report.pdf', {type: 'application/pdf'});
    const acceptedTwo = new File(['pdf'], 'brief.pdf', {type: 'application/pdf'});
    const rejected = new File(['png'], 'avatar.png', {type: 'image/png'});
    const app = mount(FileInput, {
      target,
      props: {
        id: 'attachments',
        label: 'Attachments',
        name: 'attachments',
        accept: '.pdf',
        isMultiple: true,
        onChange,
      },
    });

    await tick();

    // When: one accepted file, multiple accepted files, and a rejected file are selected.
    const input = requireElement(target.querySelector<HTMLInputElement>('input[type="file"]'), 'file input');
    changeFiles(input, [acceptedOne]);
    await tick();
    expect(liveRegion('polite')?.textContent).toBe('1 file selected: report.pdf');
    expect(new FormData(target).has('attachments')).toBe(true);

    changeFiles(input, [acceptedOne, acceptedTwo]);
    await tick();
    expect(liveRegion('polite')?.textContent).toBe('2 files selected');

    changeFiles(input, [rejected]);
    await tick();

    // Then: rejected files use the assertive invalid status path and do not emit a success announcement.
    expect(onChange).toHaveBeenLastCalledWith(null, expect.any(Event));
    expect(target.querySelector('[role="alert"]')?.getAttribute('aria-live')).toBe('assertive');
    expect(target.querySelector('[role="alert"]')?.textContent).toContain('avatar.png is not an accepted file type');
    expect(liveRegion('polite')?.textContent).toBe('2 files selected');

    await unmount(app);
  });

  it('Given an unselected RadioList When focus and keyboard navigation run Then one deterministic tab stop and hidden form value are preserved', async () => {
    // Given: an unselected radio list with disabled options and a form name.
    const target = createFormTarget();
    const onChange = vi.fn();
    const app = mount(RadioList, {
      target,
      props: {
        id: 'support-channel',
        label: 'Support channel',
        name: 'channel',
        value: undefined,
        items: [
          {label: 'Email', value: 'email'},
          {label: 'Chat', value: 'chat', isDisabled: true},
          {label: 'Phone', value: 'phone'},
        ],
        onChange,
      },
    });

    await tick();

    // When: focus enters a later enabled radio and arrows navigate the group.
    let radios = radioItems(target);
    expect(radios.map((radio) => radio.getAttribute('tabindex'))).toEqual(['0', null, '-1']);
    radioAt(radios, 2).focus();
    await tick();

    // Then: focus normalizes to the deterministic tab stop until keyboard selection moves it.
    radios = radioItems(target);
    expect(document.activeElement).toBe(radioAt(radios, 0));
    expect(keydown(radioAt(radios, 0), 'ArrowRight')).toBe(false);
    await tick();

    radios = radioItems(target);
    expect(document.activeElement).toBe(radioAt(radios, 2));
    expect(radios.map((radio) => radio.getAttribute('tabindex'))).toEqual(['-1', null, '0']);
    expect(onChange).toHaveBeenLastCalledWith('phone', expect.any(KeyboardEvent));
    expect(new FormData(target).get('channel')).toBe('phone');

    await unmount(app);
  });

  it('Given NumberInput constraints When invalid typed input is entered Then an assertive invalid status is announced and form serialization remains native', async () => {
    // Given: an integer-only number input with a form name.
    const target = createFormTarget();
    const onChange = vi.fn();
    const app = mount(NumberInput, {
      target,
      props: {
        id: 'seats',
        label: 'Seats',
        name: 'seats',
        value: 2,
        min: 1,
        max: 10,
        isIntegerOnly: true,
        onChange,
      },
    });

    await tick();

    // When: an invalid decimal is typed.
    const input = requireElement(target.querySelector<HTMLInputElement>('#seats'), 'number input');
    changeInputValue(input, '2.5');
    await tick();

    // Then: the rejected typed value is observable to assistive tech but not emitted as a valid value.
    expect(onChange).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain('seats-invalid');
    expect(target.querySelector('#seats-invalid')?.getAttribute('role')).toBe('alert');
    expect(target.querySelector('#seats-invalid')?.getAttribute('aria-live')).toBe('assertive');
    expect(target.querySelector('#seats-invalid')?.textContent).toContain('Invalid number');
    expect(new FormData(target).get('seats')).toBe('2.5');

    // When: a valid value is typed afterward.
    changeInputValue(input, '5');
    await tick();

    // Then: invalid state clears and the valid payload emits.
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(target.querySelector('#seats-invalid')).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith(5, expect.any(Event));

    await unmount(app);
  });

  it('Given named checkbox and radio lists When rendered Then hidden form value serialization stays stable', async () => {
    // Given: selected list values rendered inside a native form.
    const target = createFormTarget();
    const checkboxList = mount(CheckboxList, {
      target,
      props: {
        id: 'roles',
        label: 'Roles',
        name: 'roles',
        value: ['admin', 'editor'],
        items: [
          {label: 'Admin', value: 'admin'},
          {label: 'Editor', value: 'editor'},
        ],
      },
    });
    const radioList = mount(RadioList, {
      target,
      props: {
        id: 'plan',
        label: 'Plan',
        name: 'plan',
        value: 'team',
        items: [{label: 'Team', value: 'team'}],
      },
    });

    await tick();

    // When: the form data is serialized through native FormData.
    const formData = new FormData(target);

    // Then: existing hidden input names and values are unchanged.
    expect(formData.getAll('roles')).toEqual(['admin', 'editor']);
    expect(formData.get('plan')).toBe('team');

    await unmount(radioList);
    await unmount(checkboxList);
  });
});
