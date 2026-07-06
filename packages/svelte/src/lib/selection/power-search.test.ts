// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search.test.ts
 * @input Svelte PowerSearch rendered through a controlled harness
 * @output Failing-first integration coverage for tokens, editors, keyboard selection, and safe malformed values
 * @position DOM tests for Todo 10 PowerSearch Svelte component
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import PowerSearchHarness from './test-fixtures/PowerSearchHarness.svelte';
import {createPowerSearchConfig} from './power-search-utils.js';
import type {PowerSearchConfig, PowerSearchFilter} from './power-search-types.js';

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

function inputText(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

function keydown(element: Element, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

function findButtonByText(target: ParentNode, text: string): HTMLButtonElement | undefined {
  return Array.from(target.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent === text);
}

function parseChanges(target: ParentNode): readonly {
  readonly type: string;
  readonly index: number;
  readonly filters: readonly PowerSearchFilter[];
}[] {
  const output = requireElement(target.querySelector<HTMLOutputElement>('[data-testid="changes-json"]'), 'changes output');
  return JSON.parse(output.value);
}

const {config: baseConfig} = createPowerSearchConfig(
  [
    {key: 'title', type: 'string', label: 'Title'},
    {key: 'archived', type: 'boolean', label: 'Archived'},
    {
      key: 'status',
      type: 'enum',
      label: 'Status',
      enumValues: [
        {value: 'open', label: 'Open'},
        {value: 'closed', label: 'Closed'},
      ],
    },
  ],
  'Issues',
);

const config: PowerSearchConfig = {...baseConfig, contentSearchFieldKey: 'title'};

describe('PowerSearch', () => {
  it('Given existing filters When rendered Then editable and removable tokens are shown safely', async () => {
    const target = createTarget();
    const filters = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {field: 'missing', operator: 'unknown', value: {type: 'string', value: '<script>alert(1)</script>'}},
    ] satisfies readonly PowerSearchFilter[];
    const app = mount(PowerSearchHarness, {target, props: {config, initialFilters: filters}});

    await tick();

    expect(target.querySelector('[data-testid="filter-0"]')?.textContent).toContain('Status is Open');
    expect(target.querySelector('[data-testid="filter-1"]')?.textContent).toContain('missing unknown <script>alert(1)</script>');
    expect(target.querySelector('script')).toBeNull();
    expect(target.querySelector('[data-testid="filter-0-remove"]')).toBeInstanceOf(HTMLButtonElement);

    await unmount(app);
  });

  it('Given a rendered control When keyboard selects a value suggestion Then structured add/remove/clear changes are emitted', async () => {
    const target = createTarget();
    const app = mount(PowerSearchHarness, {target, props: {config}});

    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'search input');
    input.focus();
    inputText(input, 'status op');
    await tick();

    const listbox = requireElement(target.querySelector('[role="listbox"]'), 'suggestions listbox');
    expect(listbox.textContent).toContain('Status is Open');
    keydown(input, 'ArrowDown');
    keydown(input, 'Enter');
    await tick();

    expect(target.querySelector('[data-testid="filter-0"]')?.textContent).toContain('Status is Open');
    expect(parseChanges(target)).toEqual([
      {type: 'add', index: 0, filters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}}]},
    ]);

    requireElement(target.querySelector<HTMLButtonElement>('[data-testid="filter-0-remove"]'), 'remove button').click();
    await tick();
    expect(parseChanges(target)).toEqual([
      {type: 'add', index: 0, filters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}}]},
      {type: 'remove', index: 0, filters: []},
    ]);

    inputText(input, 'title roadmap');
    keydown(input, 'Enter');
    await tick();
    requireElement(target.querySelector<HTMLButtonElement>('[data-testid="power-search-clear"]'), 'clear button').click();
    await tick();
    expect(parseChanges(target).at(-1)).toEqual({type: 'clear', index: -1, filters: []});

    await unmount(app);
  });

  it('Given a field suggestion When selected Then the value picker opens and can add a structured filter', async () => {
    const target = createTarget();
    const app = mount(PowerSearchHarness, {target, props: {config}});

    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'search input');
    input.focus();
    inputText(input, 'stat');
    await tick();

    requireElement(findButtonByText(target, 'Status') ?? null, 'status field suggestion').click();
    await tick();

    const dialog = requireElement(target.querySelector('[role="dialog"][aria-label="Edit filter"]'), 'add dialog');
    expect(dialog.textContent).toContain('Status');
    requireElement(dialog.querySelector<HTMLButtonElement>('[role="option"]'), 'open value').click();
    await tick();

    expect(parseChanges(target)).toEqual([
      {type: 'add', index: 0, filters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}}]},
    ]);

    await unmount(app);
  });

  it('Given an operator suggestion When selected Then the value picker opens and can add a structured filter', async () => {
    const target = createTarget();
    const app = mount(PowerSearchHarness, {target, props: {config}});

    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'search input');
    inputText(input, 'status is');
    await tick();

    requireElement(findButtonByText(target, 'Status is') ?? null, 'status operator suggestion').click();
    await tick();

    const dialog = requireElement(target.querySelector('[role="dialog"][aria-label="Edit filter"]'), 'add dialog');
    expect(dialog.textContent).toContain('Status');
    requireElement(dialog.querySelector<HTMLButtonElement>('[role="option"]'), 'open value').click();
    await tick();

    expect(parseChanges(target)).toEqual([
      {type: 'add', index: 0, filters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}}]},
    ]);

    await unmount(app);
  });

  it('Given a boolean field suggestion When selected Then an empty-value filter is added', async () => {
    const target = createTarget();
    const app = mount(PowerSearchHarness, {target, props: {config}});

    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'search input');
    inputText(input, 'arch');
    await tick();

    requireElement(findButtonByText(target, 'Archived') ?? null, 'archived field suggestion').click();
    await tick();

    expect(parseChanges(target)).toEqual([
      {type: 'add', index: 0, filters: [{field: 'archived', operator: 'is_true', value: {type: 'empty'}}]},
    ]);

    await unmount(app);
  });

  it('Given an existing token When edited through dialog keyboard controls Then structured edit change is emitted', async () => {
    const target = createTarget();
    const app = mount(PowerSearchHarness, {
      target,
      props: {
        config,
        initialFilters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}}],
      },
    });

    await tick();

    requireElement(target.querySelector<HTMLButtonElement>('[data-testid="filter-0"]'), 'status token').click();
    await tick();

    const dialog = requireElement(target.querySelector('[role="dialog"][aria-label="Edit filter"]'), 'edit dialog');
    expect(dialog.textContent).toContain('Status');
    keydown(requireElement(dialog.querySelector('[role="listbox"]'), 'value listbox'), 'ArrowDown');
    keydown(requireElement(dialog.querySelector('[role="listbox"]'), 'value listbox'), 'Enter');
    await tick();

    expect(target.querySelector('[data-testid="filter-0"]')?.textContent).toContain('Status is Closed');
    expect(parseChanges(target)).toEqual([
      {type: 'edit', index: 0, filters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'closed'}}]},
    ]);

    await unmount(app);
  });

  it('Given a read-only token When remove clear or edit are attempted Then it remains unchanged', async () => {
    const target = createTarget();
    const app = mount(PowerSearchHarness, {
      target,
      props: {
        config,
        initialFilters: [
          {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}, isReadOnly: true},
          {field: 'title', operator: 'contains', value: {type: 'string', value: 'roadmap'}},
        ],
      },
    });

    await tick();

    const readOnlyRemove = requireElement(
      target.querySelector<HTMLButtonElement>('[data-testid="filter-0-remove"]'),
      'read-only remove button',
    );
    expect(readOnlyRemove.disabled).toBe(true);
    readOnlyRemove.click();
    await tick();

    requireElement(target.querySelector<HTMLButtonElement>('[data-testid="filter-0"]'), 'read-only token').click();
    await tick();
    expect(target.querySelector('[role="dialog"][aria-label="Edit filter"]')).toBeNull();

    requireElement(target.querySelector<HTMLButtonElement>('[data-testid="power-search-clear"]'), 'clear button').click();
    await tick();

    expect(parseChanges(target)).toEqual([
      {
        type: 'clear',
        index: -1,
        filters: [{field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}, isReadOnly: true}],
      },
    ]);

    await unmount(app);
  });
});
