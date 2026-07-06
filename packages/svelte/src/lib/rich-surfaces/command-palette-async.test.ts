// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file command-palette-async.test.ts
 * @input CommandPalette asynchronous search sources and multiple open instances
 * @output Regression coverage for stale search results, rejected searches, and ARIA ids
 * @position Todo 9 async correctness tests for CommandPalette
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import CommandPalette from './CommandPalette.svelte';
import type {CommandItem} from './types.js';

type Deferred<T> = {
  readonly promise: Promise<T>;
  readonly reject: (reason: Error) => void;
  readonly resolve: (value: T) => void;
};

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function deferred<T>(): Deferred<T> {
  let rejectPromise = (_reason: Error): void => undefined;
  let resolvePromise = (_value: T): void => undefined;
  const promise = new Promise<T>((resolve, reject) => {
    rejectPromise = reject;
    resolvePromise = resolve;
  });
  return {promise, reject: rejectPromise, resolve: resolvePromise};
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

describe('CommandPalette async search correctness', () => {
  it('Given two pending Promise searches When the newer search resolves first Then stale results do not replace it', async () => {
    const target = createTarget();
    const slow = deferred<readonly CommandItem[]>();
    const fast = deferred<readonly CommandItem[]>();
    const search = vi.fn((query: string) => (query === 'slow' ? slow.promise : fast.promise));
    const app = mount(CommandPalette, {
      target,
      props: {
        open: true,
        searchSource: {
          bootstrap: () => [],
          search,
        },
      },
    });

    await tick();
    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'command input');

    inputText(input, 'slow');
    await tick();
    inputText(input, 'fast');
    await tick();
    fast.resolve([{id: 'fast-result', label: 'Fast result'}]);
    await fast.promise;
    await tick();

    expect(target.textContent).toContain('Fast result');
    expect(input.getAttribute('aria-busy')).toBeNull();

    slow.resolve([{id: 'slow-result', label: 'Slow result'}]);
    await slow.promise;
    await tick();

    expect(target.textContent).toContain('Fast result');
    expect(target.textContent).not.toContain('Slow result');

    await unmount(app);
  });

  it('Given a rejected Promise search When the rejection settles Then aria-busy clears', async () => {
    const target = createTarget();
    const rejected = deferred<readonly CommandItem[]>();
    const app = mount(CommandPalette, {
      target,
      props: {
        open: true,
        searchSource: {
          bootstrap: () => [],
          search: () => rejected.promise,
        },
      },
    });

    await tick();
    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'command input');

    inputText(input, 'broken');
    await tick();
    expect(input.getAttribute('aria-busy')).toBe('true');

    rejected.reject(new Error('Search failed'));
    await rejected.promise.catch(() => undefined);
    await tick();

    expect(input.getAttribute('aria-busy')).toBeNull();

    await unmount(app);
  });

  it('Given two open CommandPalette instances When rendered together Then listbox and option ids are unique', async () => {
    const target = createTarget();
    const first = mount(CommandPalette, {
      target,
      props: {
        open: true,
        label: 'First commands',
        searchSource: {
          bootstrap: () => [{id: 'shared', label: 'Shared first'}],
          search: () => [],
        },
      },
    });
    const second = mount(CommandPalette, {
      target,
      props: {
        open: true,
        label: 'Second commands',
        searchSource: {
          bootstrap: () => [{id: 'shared', label: 'Shared second'}],
          search: () => [],
        },
      },
    });

    await tick();
    const listboxes = [...target.querySelectorAll('[role="listbox"]')];
    const options = [...target.querySelectorAll('[role="option"]')];
    const listboxIds = listboxes.map((listbox) => listbox.id);
    const optionIds = options.map((option) => option.id);

    expect(new Set(listboxIds).size).toBe(listboxIds.length);
    expect(new Set(optionIds).size).toBe(optionIds.length);

    await unmount(first);
    await unmount(second);
  });
});
