// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selector-typeahead.test.ts
 * @input Selector, MultiSelector, Typeahead, harness state, and keyboard events
 * @output DOM-level behavioral coverage for combobox selection controls
 * @position Todo 10 selector/typeahead red-green tests for the Svelte port
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import SelectorHarness from './test-fixtures/SelectorHarness.svelte';
import Typeahead from './Typeahead.svelte';
import type {SearchableItem, SearchSource} from './combo-types.js';

const people: readonly SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'alan', label: 'Alan Turing'},
  {id: 'katherine', label: 'Katherine Johnson'},
];

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function createFormTarget(): {readonly form: HTMLFormElement; readonly target: HTMLElement} {
  const form = document.createElement('form');
  const target = document.createElement('div');
  form.appendChild(target);
  document.body.appendChild(form);
  return {form, target};
}

function requireElement<T extends Element>(element: T | null, selector: string): T {
  if (element == null) {
    throw new Error(`Expected ${selector} to exist`);
  }
  return element;
}

function inputByName(target: ParentNode, name: string): HTMLInputElement {
  return requireElement(target.querySelector<HTMLInputElement>(`input[name="${name}"]`), name);
}

function activeOption(target: ParentNode, combobox: HTMLElement): HTMLElement {
  const activeId = combobox.getAttribute('aria-activedescendant');
  if (activeId == null) {
    throw new Error('Expected aria-activedescendant to point at an option');
  }
  return requireElement(target.querySelector<HTMLElement>(`#${activeId}`), activeId);
}

function staticSource(items: readonly SearchableItem[]): SearchSource<SearchableItem> {
  return {
    bootstrap: () => items,
    search: (query: string) => items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
  };
}

describe('Svelte selector and typeahead comboboxes', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given Selector options When keyboard navigation selects choices Then disabled options are skipped and hidden value follows selection', async () => {
    // Given: a controlled selector with a disabled option and an initial hidden form value.
    const user = userEvent.setup();
    const target = createTarget();
    const selectorChange = vi.fn();
    const app = mount(SelectorHarness, {
      target,
      props: {
        selectorChange,
        multiChange: vi.fn(),
        typeaheadChange: vi.fn(),
        typeaheadSource: staticSource(people),
      },
    });
    await tick();

    const trigger = requireElement(target.querySelector<HTMLElement>('[data-testid="selector"] [role="combobox"]'), 'selector trigger');

    // When: the listbox opens and keyboard navigation crosses a disabled option.
    await user.click(trigger);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    await tick();

    // Then: Banana is skipped, Citrus becomes active, and Enter selects it.
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(requireElement(document.body.querySelector('[role="listbox"]'), 'selector listbox')).toBeTruthy();
    expect(activeOption(document, trigger).textContent).toContain('Citrus');

    await user.keyboard('{End}{ArrowUp}{Home}{Enter}');
    await tick();
    expect(selectorChange).toHaveBeenLastCalledWith('apple', expect.any(Event));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(inputByName(target, 'fruit').value).toBe('apple');

    await user.click(trigger);
    await user.keyboard('{ArrowDown}{ArrowDown}{ }');
    await tick();
    expect(selectorChange).toHaveBeenLastCalledWith('citrus', expect.any(Event));
    expect(inputByName(target, 'fruit').value).toBe('citrus');

    await user.click(trigger);
    await user.keyboard('{Escape}');
    await tick();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await unmount(app);
  });

  it('Given MultiSelector grouped options When selections change Then chips, hidden values, callbacks, and disabled state stay coherent', async () => {
    // Given: a grouped multi-selector with a disabled option and divider.
    const user = userEvent.setup();
    const target = createTarget();
    const multiChange = vi.fn();
    const app = mount(SelectorHarness, {
      target,
      props: {
        selectorChange: vi.fn(),
        multiChange,
        typeaheadChange: vi.fn(),
        typeaheadSource: staticSource(people),
      },
    });
    await tick();

    const trigger = requireElement(target.querySelector<HTMLElement>('[data-testid="multi-selector"] [role="combobox"]'), 'multi trigger');

    // When: enabled grouped options are toggled and a selected chip is removed.
    await user.click(trigger);
    expect(requireElement(document.body.querySelector('[role="separator"]'), 'multi divider')).toBeTruthy();
    expect(document.body.textContent).toContain('Teams');

    await user.click(requireElement(document.body.querySelector<HTMLElement>('[data-value="design"]'), 'design option'));
    await user.click(requireElement(document.body.querySelector<HTMLElement>('[data-value="engineering"]'), 'engineering option'));
    await user.click(requireElement(document.body.querySelector<HTMLElement>('[data-value="marketing"]'), 'marketing option'));
    await tick();

    // Then: disabled Engineering remains inert, selected values emit arrays, and hidden inputs are repeated.
    expect(multiChange).toHaveBeenNthCalledWith(1, ['design'], expect.any(Event));
    expect(multiChange).toHaveBeenNthCalledWith(2, ['design', 'marketing'], expect.any(Event));
    expect(target.querySelectorAll('input[name="departments"]')).toHaveLength(2);
    expect(target.textContent).toContain('Design');
    expect(target.textContent).toContain('Marketing');

    await user.click(requireElement(target.querySelector<HTMLButtonElement>('button[aria-label="Remove Design"]'), 'remove design'));
    await tick();
    expect(multiChange).toHaveBeenLastCalledWith(['marketing'], expect.any(Event));
    expect(target.querySelectorAll('input[name="departments"]')).toHaveLength(1);

    await unmount(app);
  });

  it('Given Typeahead sources When the user types Then filtered options, active descendant, and selected hidden value update', async () => {
    // Given: a static source Typeahead plus the controlled harness callback.
    const user = userEvent.setup();
    const target = createTarget();
    const typeaheadChange = vi.fn();
    const app = mount(SelectorHarness, {
      target,
      props: {
        selectorChange: vi.fn(),
        multiChange: vi.fn(),
        typeaheadChange,
        typeaheadSource: staticSource(people),
      },
    });
    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('[data-testid="typeahead"] input[role="combobox"]'), 'typeahead input');

    // When: text is typed into the combobox.
    await user.click(input);
    await user.keyboard('ada');
    await tick();

    // Then: options are incrementally filtered and active-descendant selection is observable.
    expect(document.body.querySelectorAll('[role="option"]')).toHaveLength(1);
    expect(document.body.textContent).toContain('Ada Lovelace');
    await user.keyboard('{ArrowDown}');
    await tick();
    expect(activeOption(document, input).textContent).toContain('Ada Lovelace');

    await user.keyboard('{Enter}');
    await tick();
    expect(typeaheadChange).toHaveBeenLastCalledWith({id: 'ada', label: 'Ada Lovelace'}, expect.any(Event));
    expect(inputByName(target, 'assignee').value).toBe('ada');

    await unmount(app);
  });

  it('Given uncontrolled Typeahead with a form name When the user selects an option Then hidden value follows the selected item', async () => {
    // Given: a Typeahead mounted in a form without a parent-controlled value update.
    const user = userEvent.setup();
    const {form, target} = createFormTarget();
    const typeaheadChange = vi.fn();
    const app = mount(Typeahead, {
      target,
      props: {
        id: 'uncontrolled-assignee',
        label: 'Assignee',
        name: 'assignee',
        source: staticSource(people),
        onChange: typeaheadChange,
      },
    });
    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('input[role="combobox"]'), 'uncontrolled typeahead input');

    // When: the user filters and selects an option from the combobox.
    await user.click(input);
    await user.keyboard('gra');
    await tick();
    await user.keyboard('{Enter}');
    await tick();

    // Then: the component-owned hidden input and submit-style FormData read expose the selected id.
    expect(typeaheadChange).toHaveBeenLastCalledWith({id: 'grace', label: 'Grace Hopper'}, expect.any(Event));
    expect(inputByName(target, 'assignee').value).toBe('grace');
    expect(new FormData(form).get('assignee')).toBe('grace');

    await unmount(app);
  });

  it('Given async-like Typeahead source When search resolves Then matching options render and rejection leaves the combobox usable', async () => {
    // Given: a source function that returns promises and can reject malformed input.
    const user = userEvent.setup();
    const target = createTarget();
    const search = vi.fn((query: string) => {
      if (query === 'fail') {
        return Promise.reject(new Error('search failed'));
      }
      return Promise.resolve(people.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())));
    });
    const app = mount(Typeahead, {
      target,
      props: {
        id: 'async-assignee',
        label: 'Async assignee',
        value: null,
        source: search,
        onChange: vi.fn(),
      },
    });
    await tick();

    const input = requireElement(target.querySelector<HTMLInputElement>('input[role="combobox"]'), 'async typeahead input');

    // When: async filtering succeeds, then a later malformed query rejects.
    await user.click(input);
    await user.keyboard('gra');
    await tick();
    await tick();

    // Then: resolved options render through listbox semantics and rejection shows an empty state without throwing.
    expect(search).toHaveBeenLastCalledWith('gra');
    expect(document.body.textContent).toContain('Grace Hopper');

    await user.clear(input);
    await user.keyboard('fail');
    await tick();
    await tick();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.textContent).toContain('No results found');

    await unmount(app);
  });
});
