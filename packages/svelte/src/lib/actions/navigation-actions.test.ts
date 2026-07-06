// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigation-actions.test.ts
 * @input DOM keyboard and pointer events for shared Svelte actions
 * @output Focus navigation and clickable-container behavior assertions
 * @position Red-first coverage for Todo 15 shared action ports
 */

import {describe, expect, it, vi} from 'vitest';
import {clickableContainer} from './clickable-container.js';
import {gridNavigation} from './grid-navigation.js';
import {listNavigation} from './list-navigation.js';

function appendElement(tagName: string): HTMLElement {
  const element = document.createElement(tagName);
  document.body.appendChild(element);
  return element;
}

function keyboard(key: string, options: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ...options,
  });
}

describe('clickableContainer action', () => {
  it('Given nested interactive controls When clicked Then container activation is skipped', () => {
    const container = appendElement('article');
    const nested = document.createElement('button');
    nested.textContent = 'Nested';
    container.appendChild(nested);
    const onClick = vi.fn();
    const action = clickableContainer(container, {onClick});

    nested.click();
    container.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.getAttribute('data-pressable-container')).toBe('true');
    action.destroy();
    container.remove();
  });

  it('Given a disabled container When clicked Then no activation occurs', () => {
    const container = appendElement('article');
    const onClick = vi.fn();
    const action = clickableContainer(container, {isDisabled: true, onClick});

    container.click();

    expect(onClick).not.toHaveBeenCalled();
    action.destroy();
    container.remove();
  });
});

describe('listNavigation action', () => {
  it('Given a vertical list When arrow and home/end keys are pressed Then focus roves through items', () => {
    const list = appendElement('div');
    list.innerHTML = '<button role="menuitem">One</button><button role="menuitem">Two</button><button role="menuitem">Three</button>';
    const escape = vi.fn();
    const action = listNavigation(list, {onEscape: escape});
    const items = Array.from(list.querySelectorAll<HTMLElement>('[role="menuitem"]'));

    items[0]?.focus();
    list.dispatchEvent(keyboard('ArrowDown'));
    expect(document.activeElement).toBe(items[1]);

    list.dispatchEvent(keyboard('End'));
    expect(document.activeElement).toBe(items[2]);

    list.dispatchEvent(keyboard('ArrowDown'));
    expect(document.activeElement).toBe(items[0]);

    list.dispatchEvent(keyboard('Escape'));
    expect(escape).toHaveBeenCalledTimes(1);
    action.destroy();
    list.remove();
  });

  it('Given horizontal navigation without wrap When the end is reached Then focus stays on the last item', () => {
    const list = appendElement('div');
    list.innerHTML = '<button role="tab">One</button><button role="tab">Two</button>';
    const action = listNavigation(list, {
      itemSelector: '[role="tab"]',
      orientation: 'horizontal',
      wrap: false,
    });
    const items = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));

    items[1]?.focus();
    list.dispatchEvent(keyboard('ArrowRight'));

    expect(document.activeElement).toBe(items[1]);
    action.destroy();
    list.remove();
  });
});

describe('gridNavigation action', () => {
  it('Given a grid When arrows and row keys are pressed Then focus moves by row and column', () => {
    const grid = appendElement('div');
    grid.innerHTML = Array.from({length: 6}, (_item, index) => `<button>${index}</button>`).join('');
    const after = vi.fn();
    const action = gridNavigation(grid, {columns: 3, onNavigateAfter: after});
    const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>('button'));

    cells[1]?.focus();
    grid.dispatchEvent(keyboard('ArrowDown'));
    expect(document.activeElement).toBe(cells[4]);

    grid.dispatchEvent(keyboard('Home'));
    expect(document.activeElement).toBe(cells[3]);

    grid.dispatchEvent(keyboard('End', {ctrlKey: true}));
    expect(document.activeElement).toBe(cells[5]);

    grid.dispatchEvent(keyboard('ArrowDown'));
    expect(after).toHaveBeenCalledWith(2, 3);
    action.destroy();
    grid.remove();
  });
});
