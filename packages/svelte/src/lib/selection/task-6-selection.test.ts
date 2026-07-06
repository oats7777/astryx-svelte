// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file task-6-selection.test.ts
 * @input Selector, MultiSelector, Typeahead, Tokenizer, and temporal inputs
 * @output Todo 6 selection/date-time accessibility regression coverage
 * @position Focused latest-main parity tests for selection and temporal controls
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {__resetLiveRegionsForTest} from '../actions/announce.js';
import SelectorHarness from './test-fixtures/SelectorHarness.svelte';
import type {SearchableItem, SearchSource} from './combo-types.js';

const people: readonly SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'alan', label: 'Alan Turing'},
];

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

function inputByName(target: ParentNode, name: string): HTMLInputElement {
  return requireElement(target.querySelector<HTMLInputElement>(`input[name="${name}"]`), name);
}

function inputsByName(target: ParentNode, name: string): readonly HTMLInputElement[] {
  return [...target.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];
}

function activeOption(target: ParentNode, combobox: HTMLElement): HTMLElement {
  const activeId = combobox.getAttribute('aria-activedescendant');
  if (activeId == null) {
    throw new Error('Expected aria-activedescendant to point at an option');
  }
  return requireElement(target.querySelector<HTMLElement>(`#${activeId}`), activeId);
}

function liveRegion(): HTMLElement {
  return requireElement(document.querySelector<HTMLElement>('[data-astryx-live-region="polite"]'), 'polite live region');
}

async function flushAnnouncements(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function staticSource(items: readonly SearchableItem[]): SearchSource<SearchableItem> {
  return {
    bootstrap: () => items,
    search: (query: string) => items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
  };
}

describe('Todo 6 selection accessibility parity', () => {
  afterEach(() => {
    document.body.textContent = '';
    __resetLiveRegionsForTest();
  });

  it('Given selected Selector value When Delete and Backspace run on the focused combobox Then selection and hidden form value clear', async () => {
    // Given: a controlled selector with an initial selected hidden form value.
    const user = userEvent.setup();
    const target = createTarget();
    const selectorChange = vi.fn();
    const app = mount(SelectorHarness, {
      target,
      props: {selectorChange, multiChange: vi.fn(), typeaheadChange: vi.fn(), typeaheadSource: staticSource(people)},
    });
    await tick();
    const trigger = requireElement(target.querySelector<HTMLElement>('[data-testid="selector"] [role="combobox"]'), 'selector trigger');
    expect(inputByName(target, 'fruit').value).toBe('apple');

    // When: Delete clears the focused closed combobox.
    trigger.focus();
    await user.keyboard('{Delete}');
    await tick();

    // Then: the value clears and no stale hidden form value remains.
    expect(selectorChange).toHaveBeenLastCalledWith(null, expect.any(Event));
    expect(target.querySelector('input[name="fruit"]')).toBeNull();

    await user.click(trigger);
    await user.keyboard('{ArrowDown}{Enter}');
    await tick();
    trigger.focus();
    await user.keyboard('{Backspace}');
    await tick();
    expect(selectorChange).toHaveBeenLastCalledWith(null, expect.any(Event));
    expect(target.querySelector('input[name="fruit"]')).toBeNull();
    await unmount(app);
  });

  it('Given selected MultiSelector values When toggling and keyboard clearing Then live count and hidden repeated values stay coherent', async () => {
    // Given: a multiselect with two selectable options and one disabled option.
    const user = userEvent.setup();
    const target = createTarget();
    const multiChange = vi.fn();
    const app = mount(SelectorHarness, {
      target,
      props: {selectorChange: vi.fn(), multiChange, typeaheadChange: vi.fn(), typeaheadSource: staticSource(people)},
    });
    await tick();
    const trigger = requireElement(target.querySelector<HTMLElement>('[data-testid="multi-selector"] [role="combobox"]'), 'multi trigger');

    // When: options are toggled with the menu open.
    await user.click(trigger);
    await user.click(requireElement(document.body.querySelector<HTMLElement>('[data-value="design"]'), 'design option'));
    await flushAnnouncements();

    // Then: assistive tech gets count updates and hidden form values remain exact.
    expect(liveRegion().textContent).toBe('1 of 2 selected');
    expect(inputsByName(target, 'departments').map((input) => input.value)).toEqual(['design']);
    await user.click(requireElement(document.body.querySelector<HTMLElement>('[data-value="marketing"]'), 'marketing option'));
    await flushAnnouncements();
    expect(liveRegion().textContent).toBe('All selected');
    expect(inputsByName(target, 'departments').map((input) => input.value)).toEqual(['design', 'marketing']);

    await user.click(trigger);
    trigger.focus();
    await user.keyboard('{Delete}');
    await flushAnnouncements();
    await tick();
    expect(multiChange).toHaveBeenLastCalledWith([], expect.any(Event));
    expect(liveRegion().textContent).toBe('Selection cleared');
    expect(target.querySelectorAll('input[name="departments"]')).toHaveLength(0);
    await unmount(app);
  });

  it('Given selection comboboxes When options are navigated Then focus stays on the combobox that owns aria-activedescendant', async () => {
    // Given: selector, multiselect, and typeahead controls.
    const user = userEvent.setup();
    const target = createTarget();
    const app = mount(SelectorHarness, {
      target,
      props: {selectorChange: vi.fn(), multiChange: vi.fn(), typeaheadChange: vi.fn(), typeaheadSource: staticSource(people)},
    });
    await tick();
    const selector = requireElement(target.querySelector<HTMLElement>('[data-testid="selector"] [role="combobox"]'), 'selector trigger');
    const multi = requireElement(target.querySelector<HTMLElement>('[data-testid="multi-selector"] [role="combobox"]'), 'multi trigger');
    const typeahead = requireElement(target.querySelector<HTMLInputElement>('[data-testid="typeahead"] input[role="combobox"]'), 'typeahead input');

    // When: each combobox opens and highlights an option.
    await user.click(selector);
    await user.keyboard('{ArrowDown}');
    await tick();

    // Then: focus stays on the combobox reporting the active option.
    expect(document.activeElement).toBe(selector);
    expect(activeOption(document, selector).getAttribute('role')).toBe('option');
    await user.keyboard('{Escape}');
    await user.click(multi);
    await user.keyboard('{ArrowDown}');
    await tick();
    expect(document.activeElement).toBe(multi);
    expect(activeOption(document, multi).getAttribute('role')).toBe('option');
    await user.keyboard('{Escape}');
    await user.click(typeahead);
    await user.keyboard('ada');
    await tick();
    expect(document.activeElement).toBe(typeahead);
    expect(typeahead.getAttribute('aria-autocomplete')).toBe('list');
    expect(activeOption(document, typeahead).textContent).toContain('Ada Lovelace');
    await unmount(app);
  });
});
