// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chat-reasoning.test.ts
 * @input ChatReasoning Svelte fixture, DOM events, and callback props
 * @output Vitest coverage for disclosure, streaming, preview, and keyboard behavior
 * @position Red-first tests for Todo 17 ChatReasoning Svelte lab slice
 */

import userEvent from '@testing-library/user-event';
import {mount, tick, unmount} from 'svelte';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ChatReasoningProbe from './test-fixtures/ChatReasoningProbe.svelte';
import {ChatReasoning} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function query(root: ParentNode, selector: string): HTMLElement {
  const node = root.querySelector(selector);
  if (!(node instanceof HTMLElement)) {
    throw new Error(`Missing selector: ${selector}`);
  }
  return node;
}

describe('Svelte lab ChatReasoning', () => {
  afterEach(() => {
    document.body.textContent = '';
  });

  it('Given reasoning text When rendered collapsed Then a labelled disclosure exposes a one-line preview', async () => {
    const target = createTarget();
    const app = mount(ChatReasoningProbe, {target});
    await tick();

    const button = query(target, '[role="button"]');
    expect(ChatReasoning).toBeDefined();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.textContent).toContain('Thinking');
    expect(button.textContent).toContain('12s');
    expect(button.textContent).toContain('First inspect constraints');
    expect(query(target, '[data-astryx-chat-reasoning-content]').hidden).toBe(true);

    await unmount(app);
  });

  it('Given a reasoning disclosure When clicked and keyboard toggled Then expanded state and callback stay in sync', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    const target = createTarget();
    const app = mount(ChatReasoningProbe, {target, props: {onExpandedChange}});
    await tick();

    const button = query(target, '[role="button"]');
    await user.click(button);
    await tick();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(onExpandedChange).toHaveBeenLastCalledWith(true);

    button.focus();
    await user.keyboard('{Enter}');
    await tick();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);

    await unmount(app);
  });

  it('Given streaming reasoning When rendered Then duration and preview are hidden while label remains accessible', async () => {
    const target = createTarget();
    const app = mount(ChatReasoningProbe, {target, props: {isStreaming: true}});
    await tick();

    const button = query(target, '[role="button"]');
    expect(button.textContent).toContain('Thinking');
    expect(button.textContent).not.toContain('12s');
    expect(button.textContent).not.toContain('First inspect constraints');
    expect(query(target, '[data-astryx-chat-reasoning]').getAttribute('data-streaming')).toBe('true');

    await unmount(app);
  });
});
