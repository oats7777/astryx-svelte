// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file observer-actions.test.ts
 * @input DOM scroll metrics, resize observer fakes, and body lock state
 * @output Shared observer action behavior and cleanup assertions
 * @position Red-first coverage for Todo 15 observer-style Svelte actions
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {overflow} from './overflow.js';
import {scrollLock} from './scroll-lock.js';
import {scrollOverflow} from './scroll-overflow.js';
import {observeResize, unobserveResize} from '../utils/shared-resize-observer.js';

type ResizeObserverRecord = {
  readonly observe: ReturnType<typeof vi.fn>;
  readonly unobserve: ReturnType<typeof vi.fn>;
  readonly disconnect: ReturnType<typeof vi.fn>;
  dispatch: (entries: ResizeObserverEntry[]) => void;
};

const records: ResizeObserverRecord[] = [];

class FakeResizeObserver implements ResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    records.push({
      observe: this.observe,
      unobserve: this.unobserve,
      disconnect: this.disconnect,
      dispatch: (entries) => this.callback(entries, this),
    });
  }
}

function setReadonlyNumber(element: HTMLElement, key: string, value: number): void {
  Object.defineProperty(element, key, {configurable: true, value});
}

function resizeEntry(target: Element): ResizeObserverEntry {
  const rect = new DOMRectReadOnly();
  return {
    target,
    borderBoxSize: [],
    contentBoxSize: [],
    contentRect: rect,
    devicePixelContentBoxSize: [],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  records.length = 0;
  document.body.removeAttribute('style');
});

describe('shared resize observer utility', () => {
  it('Given two observed nodes When resize dispatches and both unobserve Then callbacks route and observer disconnects', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const first = document.createElement('div');
    const second = document.createElement('div');
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    observeResize(first, firstCallback);
    observeResize(second, secondCallback);
    records[0]?.dispatch([resizeEntry(second)]);
    unobserveResize(first);
    unobserveResize(second);

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(2);
    expect(records[0]?.observe).toHaveBeenCalledTimes(2);
    expect(records[0]?.unobserve).toHaveBeenCalledTimes(2);
    expect(records[0]?.disconnect).toHaveBeenCalledTimes(1);
  });
});

describe('overflow action', () => {
  it('Given measured item widths When the container is narrow Then visible count reserves indicator width', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const container = document.createElement('div');
    const measure = document.createElement('div');
    for (const width of [40, 40, 40, 24]) {
      const child = document.createElement('span');
      setReadonlyNumber(child, 'offsetWidth', width);
      measure.appendChild(child);
    }
    measure.lastElementChild?.setAttribute('data-overflow-indicator', 'true');
    setReadonlyNumber(container, 'offsetWidth', 92);
    const onChange = vi.fn();

    const action = overflow(container, {itemCount: 3, measure, gap: 4, onChange});

    expect(onChange).toHaveBeenLastCalledWith({visibleCount: 1, hasOverflow: true});
    action.destroy();
  });
});

describe('scrollOverflow action', () => {
  it('Given a horizontal scroller When scrolled Then edge state updates and listeners clean up', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const scroller = document.createElement('div');
    setReadonlyNumber(scroller, 'clientWidth', 100);
    setReadonlyNumber(scroller, 'scrollWidth', 250);
    Object.defineProperty(scroller, 'scrollLeft', {configurable: true, writable: true, value: 0});
    const onChange = vi.fn();
    const action = scrollOverflow(scroller, onChange);

    scroller.scrollLeft = 150;
    scroller.dispatchEvent(new Event('scroll'));
    action.destroy();
    scroller.scrollLeft = 0;
    scroller.dispatchEvent(new Event('scroll'));

    expect(onChange).toHaveBeenNthCalledWith(1, {
      overflowStart: false,
      overflowEnd: true,
      hasOverflow: true,
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      overflowStart: true,
      overflowEnd: false,
      hasOverflow: true,
    });
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe('scrollLock action', () => {
  it('Given overlapping scroll locks When one lock is destroyed Then body unlocks only after the last lock', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollX', 8);
    vi.stubGlobal('scrollY', 24);
    vi.stubGlobal('scrollTo', scrollTo);

    const firstLock = scrollLock(first, true);
    const secondLock = scrollLock(second, true);
    firstLock.destroy();
    expect(document.body.style.overflow).toBe('hidden');

    secondLock.destroy();

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalledWith(8, 24);
  });
});
