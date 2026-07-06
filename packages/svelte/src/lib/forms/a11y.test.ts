// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y.test.ts
 * @input Svelte form controls rendered with required, invalid, hidden-label, and form-value states
 * @output Package-local accessibility assertions for form control semantics
 * @position A11y coverage for Todo 9 form controls
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import {CheckboxList, FileInput, RadioList, Switch, TextArea, TextInput} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte form control accessibility', () => {
  it('Given form controls When rendered Then required accessibility names, state, and descriptions are present', async () => {
    const target = createTarget();
    const textInput = mount(TextInput, {
      target,
      props: {
        id: 'a11y-name',
        label: 'Name',
        isRequired: true,
        status: {type: 'error', message: 'Name is required'},
      },
    });
    const textArea = mount(TextArea, {
      target,
      props: {id: 'a11y-bio', label: 'Bio', isLabelHidden: true, value: 'About', maxLength: 12},
    });
    const checkboxList = mount(CheckboxList, {
      target,
      props: {
        id: 'teams',
        label: 'Teams',
        name: 'teams',
        value: ['platform'],
        description: 'Choose every applicable team',
        items: [{label: 'Platform', value: 'platform'}],
      },
    });
    const radioList = mount(RadioList, {
      target,
      props: {
        label: 'Cadence',
        name: 'cadence',
        value: 'weekly',
        items: [{label: 'Weekly', value: 'weekly'}],
        isRequired: true,
      },
    });
    const switchControl = mount(Switch, {
      target,
      props: {label: 'Notifications', name: 'notifications', isChecked: true},
    });
    const fileInput = mount(FileInput, {
      target,
      props: {id: 'a11y-file', label: 'Attachment', status: {type: 'success', message: 'Ready'}},
    });

    await tick();

    const input = target.querySelector<HTMLInputElement>('#a11y-name');
    const textarea = target.querySelector<HTMLTextAreaElement>('#a11y-bio');
    const fieldset = target.querySelector('fieldset');
    const radioGroup = target.querySelector('[role="radiogroup"]');
    const switchButton = target.querySelector('[role="switch"]');
    const file = target.querySelector<HTMLInputElement>('#a11y-file');

    expect(input?.getAttribute('aria-required')).toBe('true');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(target.querySelector('[role="alert"]')?.getAttribute('aria-live')).toBe('assertive');
    expect(textarea?.getAttribute('aria-describedby')).toContain('a11y-bio-counter');
    expect(target.querySelector('label[for="a11y-bio"]')?.className).toContain('astryx-sr-only');
    expect(fieldset?.getAttribute('aria-describedby')).toContain('teams-desc');
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="teams"]')?.value).toBe('platform');
    expect(radioGroup?.getAttribute('aria-required')).toBe('true');
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="cadence"]')?.value).toBe('weekly');
    expect(switchButton?.getAttribute('aria-checked')).toBe('true');
    expect(target.querySelector<HTMLInputElement>('input[type="hidden"][name="notifications"]')?.value).toBe('true');
    expect(file?.getAttribute('aria-describedby')).toContain('a11y-file-status');
    expect(target.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');

    await unmount(fileInput);
    await unmount(switchControl);
    await unmount(radioList);
    await unmount(checkboxList);
    await unmount(textArea);
    await unmount(textInput);
  });
});
