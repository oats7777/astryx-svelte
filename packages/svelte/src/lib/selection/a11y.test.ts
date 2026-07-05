// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file a11y.test.ts
 * @input Mounted Svelte selection, temporal, tokenizer, and PowerSearch controls
 * @output Package-local accessibility assertions for Todo 10 selection semantics
 * @position A11y command target for Svelte selection components
 */

import axe from 'axe-core';
import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {
  Calendar,
  DateRangeInput,
  PowerSearch,
  Selector,
  TimeInput,
  Typeahead,
  createPowerSearchConfig,
  type PowerSearchFilter,
  type SearchableItem,
} from './index.js';
import TokenizerHarness from './test-fixtures/TokenizerHarness.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

const people: readonly SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
];

const {config: powerSearchConfig} = createPowerSearchConfig([
  {
    key: 'status',
    type: 'enum',
    label: 'Status',
    enumValues: [{value: 'open', label: 'Open'}],
  },
], 'issues');

const filters: readonly PowerSearchFilter[] = [
  {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
];

describe('Svelte selection accessibility', () => {
  it('Given representative selection controls When rendered Then DOM roles and axe checks pass', async () => {
    const user = userEvent.setup();
    const target = createTarget();
    const apps = [
      mount(Calendar, {target, props: {id: 'due-date', value: '2026-01-12', onChange: vi.fn()}}),
      mount(DateRangeInput, {target, props: {label: 'Window', value: null, onChange: vi.fn()}}),
      mount(TimeInput, {target, props: {label: 'Start time', value: '09:30', onChange: vi.fn()}}),
      mount(Selector, {
        target,
        props: {
          label: 'Fruit',
          name: 'fruit',
          value: 'apple',
          options: ['apple', 'banana'],
          onChange: vi.fn(),
        },
      }),
      mount(Typeahead, {target, props: {label: 'Assignee', source: people, value: null, onChange: vi.fn()}}),
      mount(TokenizerHarness, {target, props: {onChange: vi.fn()}}),
      mount(PowerSearch, {
        target,
        props: {label: 'Search issues', config: powerSearchConfig, filters, onChange: vi.fn()},
      }),
    ];

    await tick();
    const tokenizerInput = target.querySelector<HTMLInputElement>('[data-testid="tokenizer"] input');
    if (tokenizerInput == null) {
      throw new Error('Expected tokenizer input to exist');
    }
    await user.click(tokenizerInput);
    await user.keyboard('urgent{Enter}');
    await tick();

    expect(target.querySelector('[role="grid"]')).toBeTruthy();
    expect(target.querySelector('[role="combobox"]')).toBeTruthy();
    expect(target.querySelector('[aria-label="Remove Status is Open"]')).toBeTruthy();
    expect(target.querySelector('input[name="fruit"]')?.getAttribute('type')).toBe('hidden');
    expect(target.querySelector('input[name="keywords"]')?.getAttribute('type')).toBe('hidden');

    const result = await axe.run(target, {
      rules: {
        'color-contrast': {enabled: false},
        region: {enabled: false},
      },
    });
    expect(result.violations).toEqual([]);

    for (const app of apps) {
      await unmount(app);
    }
  });
});
