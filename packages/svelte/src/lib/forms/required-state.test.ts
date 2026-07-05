// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file required-state.test.ts
 * @input Svelte form field components and DOM-driven user interactions
 * @output Required, disabled, invalid, busy, label, clear, hidden input, and async state assertions
 * @position Failing-first coverage for Todo 9 form control accessibility parity
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {
  CheckboxInput,
  CheckboxList,
  Field,
  FieldStatus,
  FileInput,
  FormLayout,
  InputGroup,
  NumberInput,
  RadioList,
  Slider,
  Switch,
  TextArea,
  TextInput,
} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte form controls required and state semantics', () => {
  it('Given required invalid busy TextInput When rendered Then labels and ARIA state are exposed', async () => {
    const target = createTarget();
    const app = mount(TextInput, {
      target,
      props: {
        id: 'email',
        label: 'Email',
        value: 'ada@example.com',
        isRequired: true,
        isLoading: true,
        status: {type: 'error', message: 'Email is required'},
      },
    });

    await tick();

    const input = target.querySelector('input');
    const label = target.querySelector('label');
    const status = target.querySelector('[role="alert"]');

    expect(label?.textContent).toContain('Email');
    expect(input?.getAttribute('aria-required')).toBe('true');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-busy')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toContain(status?.id);
    expect(status?.getAttribute('aria-live')).toBe('assertive');

    await unmount(app);
  });

  it('Given hidden labels and clearable values When cleared Then visual labels stay accessible and change fires once', async () => {
    const target = createTarget();
    const onChange = vi.fn();
    const app = mount(TextInput, {
      target,
      props: {
        id: 'search',
        label: 'Search',
        value: 'draft',
        isLabelHidden: true,
        hasClear: true,
        onChange,
      },
    });

    await tick();

    const label = target.querySelector('label');
    const clear = target.querySelector('button[aria-label="Clear Search"]') as HTMLButtonElement | null;

    expect(label?.className).toContain('astryx-sr-only');
    clear?.click();

    expect(onChange).toHaveBeenCalledWith('', expect.any(Event));

    await unmount(app);
  });

  it('Given disabled and busy controls When activated Then user changes are blocked', async () => {
    const target = createTarget();
    const checkboxChange = vi.fn();
    const listChange = vi.fn();
    const formLayout = mount(FormLayout, {
      target,
      props: {direction: 'vertical'},
    });
    const checkbox = mount(CheckboxInput, {
      target,
      props: {label: 'Locked', isDisabled: true, onChange: checkboxChange},
    });
    const checkboxList = mount(CheckboxList, {
      target,
      props: {
        label: 'Permissions',
        value: [],
        isLoading: true,
        items: [{label: 'Write', value: 'write'}],
        onChange: listChange,
      },
    });

    await tick();

    target.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    target.querySelector<HTMLElement>('[role="checkbox"]')?.click();

    expect(checkboxChange).not.toHaveBeenCalled();
    expect(listChange).not.toHaveBeenCalled();
    expect(target.querySelector('[role="checkbox"]')?.getAttribute('aria-busy')).toBe('true');

    await unmount(checkboxList);
    await unmount(checkbox);
    await unmount(formLayout);
  });

  it('Given list, switch, and radio names When rendered Then form values are backed by hidden inputs', async () => {
    const target = createTarget();
    const formLayout = mount(FormLayout, {
      target,
      props: {direction: 'vertical'},
    });
    const checkboxList = mount(CheckboxList, {
      target,
      props: {
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
        label: 'Plan',
        name: 'plan',
        value: 'team',
        items: [{label: 'Team', value: 'team'}],
      },
    });
    const switchControl = mount(Switch, {
      target,
      props: {label: 'Enabled', name: 'enabled', isChecked: true},
    });

    await tick();

    expect([...target.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="roles"]')].map((input) => input.value)).toEqual([
      'admin',
      'editor',
    ]);
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="plan"]')?.value).toBe('team');
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="enabled"]')?.value).toBe('true');

    await unmount(switchControl);
    await unmount(radioList);
    await unmount(checkboxList);
    await unmount(formLayout);
  });

  it('Given file status and clear button When files are provided Then names and live status are announced', async () => {
    const target = createTarget();
    const file = new File(['hello'], 'brief.txt', {type: 'text/plain'});
    const onChange = vi.fn();
    const app = mount(FileInput, {
      target,
      props: {
        id: 'upload',
        label: 'Upload',
        value: [file],
        status: {type: 'success', message: 'File ready'},
        onChange,
      },
    });

    await tick();

    expect(target.textContent).toContain('brief.txt');
    expect(target.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');
    target.querySelector<HTMLButtonElement>('button[aria-label="Clear Upload"]')?.click();
    expect(onChange).toHaveBeenCalledWith(null, expect.any(Event));

    await unmount(app);
  });

  it('Given typed and ranged controls When interacted with Then focus and validation semantics are preserved', async () => {
    const target = createTarget();
    const numberChange = vi.fn();
    const sliderChange = vi.fn();
    const formLayout = mount(FormLayout, {
      target,
      props: {direction: 'horizontal-labels'},
    });
    const numberInput = mount(NumberInput, {
      target,
      props: {id: 'count', label: 'Count', value: 2, min: 0, max: 5, hasClear: true, onChange: numberChange},
    });
    const textArea = mount(TextArea, {
      target,
      props: {id: 'notes', label: 'Notes', value: 'draft', maxLength: 10},
    });
    const slider = mount(Slider, {
      target,
      props: {label: 'Volume', value: 3, min: 0, max: 10, name: 'volume', onChange: sliderChange},
    });

    await tick();

    const number = target.querySelector<HTMLInputElement>('input[type="number"]');
    number?.focus();
    number?.dispatchEvent(new InputEvent('input', {bubbles: true, data: '4'}));
    target.querySelector<HTMLInputElement>('input[type="range"]')?.dispatchEvent(new InputEvent('input', {bubbles: true}));

    expect(document.activeElement).toBe(number);
    expect(target.querySelector('.astryx-form-layout')?.getAttribute('data-direction')).toBe('horizontal-labels');
    expect(target.textContent).toContain('5 / 10');
    expect(numberChange).toHaveBeenCalled();
    expect(sliderChange).toHaveBeenCalled();

    await unmount(slider);
    await unmount(textArea);
    await unmount(numberInput);
    await unmount(formLayout);
  });

  it('Given Field, FieldStatus, and InputGroup When rendered Then semantics remain composable', async () => {
    const target = createTarget();
    const field = mount(Field, {
      target,
      props: {
        id: 'api-key',
        label: 'API key',
        description: 'Used for server requests',
        status: {type: 'warning', message: 'Rotates soon'},
      },
    });
    const inputGroup = mount(InputGroup, {
      target,
      props: {label: 'Endpoint', prefix: 'https://', suffix: '.internal'},
    });
    const status = mount(FieldStatus, {
      target,
      props: {type: 'success', message: 'Available'},
    });

    await tick();

    expect(target.querySelector('label')?.getAttribute('for')).toBe('api-key');
    expect(target.textContent).toContain('https://');
    expect(target.textContent).toContain('.internal');
    expect(target.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');

    await unmount(status);
    await unmount(inputGroup);
    await unmount(field);
  });
});
