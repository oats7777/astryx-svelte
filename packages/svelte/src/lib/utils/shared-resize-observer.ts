// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file shared-resize-observer.ts
 * @input ResizeObserver-capable elements and callbacks
 * @output Shared singleton resize observation with immediate measurement callback
 * @position Todo 15 internal utility for Svelte actions and stores
 */

export type ResizeCallback = (entry: ResizeObserverEntry) => void;

let observer: ResizeObserver | undefined;
const callbacks = new Map<Element, ResizeCallback>();

function getObserver(): ResizeObserver | undefined {
  if (typeof ResizeObserver === 'undefined') {
    return undefined;
  }
  observer ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      callbacks.get(entry.target)?.(entry);
    }
  });
  return observer;
}

function syntheticEntry(element: Element): ResizeObserverEntry {
  return {
    target: element,
    borderBoxSize: [],
    contentBoxSize: [],
    contentRect: element.getBoundingClientRect(),
    devicePixelContentBoxSize: [],
  };
}

export function observeResize(element: Element, callback: ResizeCallback): void {
  callbacks.set(element, callback);
  getObserver()?.observe(element);
  callback(syntheticEntry(element));
}

export function unobserveResize(element: Element): void {
  callbacks.delete(element);
  if (observer == null) {
    return;
  }
  observer.unobserve(element);
  if (callbacks.size === 0) {
    observer.disconnect();
    observer = undefined;
  }
}
