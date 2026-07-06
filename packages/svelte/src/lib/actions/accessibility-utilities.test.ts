// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file accessibility-utilities.test.ts
 * @input DOM fixtures and keyboard/touch events for shared accessibility utilities
 * @output Regression coverage for live announcements, focus selectors, typeahead, tree focus, and long press
 * @position Todo 4 latest-main accessibility utility parity tests
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  FOCUSABLE_SELECTOR,
  __resetLiveRegionsForTest,
  announce,
} from './announce.js';
import {listNavigation} from './list-navigation.js';
import {longPress} from './long-press.js';
import {createTypeahead} from './typeahead.js';
import {treeNavigation} from './tree-navigation.js';

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

function touchEvent(type: string, point: {readonly x: number; readonly y: number}): Event {
  const event = new Event(type, {bubbles: true, cancelable: true});
  Object.defineProperty(event, 'touches', {
    configurable: true,
    value: [{clientX: point.x, clientY: point.y}],
  });
  return event;
}

describe('shared accessibility utilities', () => {
  beforeEach(() => {
    document.body.textContent = '';
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
  });

  afterEach(() => {
    __resetLiveRegionsForTest();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('Given live announcements When polite and assertive messages are sent Then persistent hidden regions update by urgency', () => {
    announce('Saved changes');
    announce('Connection lost', 'assertive');

    const polite = document.querySelector('[data-astryx-live-region="polite"]');
    const assertive = document.querySelector('[data-astryx-live-region="assertive"]');

    expect(polite?.getAttribute('role')).toBe('status');
    expect(polite?.getAttribute('aria-live')).toBe('polite');
    expect(polite?.textContent).toBe('Saved changes');
    expect(assertive?.getAttribute('role')).toBe('alert');
    expect(assertive?.getAttribute('aria-live')).toBe('assertive');
    expect(assertive?.textContent).toBe('Connection lost');

    announce('', 'assertive');
    expect(assertive?.textContent).toBe('');
  });

  it('Given the canonical focusable selector When querying rich interactive content Then non-native focus targets are included', () => {
    const root = appendElement('div');
    root.innerHTML = `
      <button disabled>Disabled</button>
      <a href="/docs">Docs</a>
      <div contenteditable="true">Editable</div>
      <video controls></video>
      <details open><summary>Details</summary></details>
    `;

    const labels = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).map(element => {
      const text = element.textContent?.trim();
      return text == null || text.length === 0 ? element.tagName : text;
    });

    expect(labels).toContain('Docs');
    expect(labels).toContain('Editable');
    expect(labels).toContain('VIDEO');
    expect(labels).toContain('Details');
    expect(labels).not.toContain('Disabled');
  });

  it('Given list navigation owns roving tabindex When arrows move focus Then disabled items are skipped and one tab stop remains', () => {
    const list = appendElement('div');
    list.innerHTML = `
      <button role="menuitem">Alpha</button>
      <button role="menuitem" disabled>Beta</button>
      <button role="menuitem">Gamma</button>
    `;
    const action = listNavigation(list, {hasRovingTabIndex: true});
    const items = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));

    items[0]?.focus();
    list.dispatchEvent(keyboard('ArrowDown'));

    expect(document.activeElement).toBe(items[2]);
    expect(items.map(item => item.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    action.destroy();
    list.remove();
  });

  it('Given typeahead labels When the same key repeats Then matching enabled items cycle from the current index', () => {
    const onMatch = vi.fn();
    let currentIndex = -1;
    const typeahead = createTypeahead({
      getCurrentIndex: () => currentIndex,
      getItemLabels: () => ['Alpha', 'Alpine', 'Beta'],
      isDisabled: index => index === 2,
      onMatch: index => {
        currentIndex = index;
        onMatch(index);
      },
    });

    expect(typeahead.onKeyDown(keyboard('a'))).toBe(true);
    expect(typeahead.onKeyDown(keyboard('a'))).toBe(true);

    expect(onMatch).toHaveBeenNthCalledWith(1, 0);
    expect(onMatch).toHaveBeenNthCalledWith(2, 1);
  });

  it('Given tree navigation When ArrowRight and ArrowLeft are pressed Then expansion and parent focus follow the APG model', () => {
    const tree = appendElement('ul');
    tree.innerHTML = `
      <li role="treeitem" aria-level="1" aria-expanded="false" data-tree-id="parent" tabindex="0">Parent</li>
      <li role="treeitem" aria-level="2" data-tree-id="child" tabindex="-1">Child</li>
    `;
    const toggles: string[] = [];
    const action = treeNavigation(tree, {onToggleExpand: id => toggles.push(id)});
    const items = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'));

    items[0]?.focus();
    tree.dispatchEvent(keyboard('ArrowRight'));
    expect(toggles).toEqual(['parent']);

    items[0]?.setAttribute('aria-expanded', 'true');
    tree.dispatchEvent(keyboard('ArrowRight'));
    expect(document.activeElement).toBe(items[1]);

    tree.dispatchEvent(keyboard('ArrowLeft'));
    expect(document.activeElement).toBe(items[0]);
    action.destroy();
    tree.remove();
  });

  it('Given a long press action When a single touch is held Then the callback receives the start point', () => {
    const node = appendElement('div');
    const onLongPress = vi.fn();
    const action = longPress(node, {delayMs: 500, onLongPress});

    node.dispatchEvent(touchEvent('touchstart', {x: 12, y: 34}));
    vi.advanceTimersByTime(500);

    expect(onLongPress).toHaveBeenCalledWith({x: 12, y: 34});
    action.destroy();
    node.remove();
  });
});
