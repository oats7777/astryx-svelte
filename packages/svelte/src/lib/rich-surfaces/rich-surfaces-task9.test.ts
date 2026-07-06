// Copyright (c) Meta Platforms, Inc. and affiliates.

import {mount, tick, unmount} from 'svelte';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import Carousel from './Carousel.svelte';
import Chat from './Chat.svelte';
import CodeBlock from './CodeBlock.svelte';
import Lightbox from './Lightbox.svelte';
import Markdown from './Markdown.svelte';

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

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {writeText: vi.fn().mockResolvedValue(undefined)},
  });
});

describe('Svelte rich-surfaces latest main accessibility parity', () => {
  const media = [
    {id: 'one', src: '/one.jpg', alt: 'First image', caption: 'One'},
    {id: 'two', src: '/two.jpg', alt: 'Second image', caption: 'Two'},
  ] as const;

  it('Given a code block When rendered Then the scroll region is keyboard-focusable and labelled', async () => {
    const target = createTarget();
    const app = mount(CodeBlock, {
      target,
      props: {code: 'const answer = 42', language: 'ts'},
    });

    await tick();

    const region = requireElement(target.querySelector('[role="region"]'), 'code scroll region');
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('aria-label')).toBe('ts');

    await unmount(app);
  });

  it('Given a code block with copy enabled When copy is clicked Then code is copied without nesting the button in the scroll region', async () => {
    const target = createTarget();
    const app = mount(CodeBlock, {
      target,
      props: {code: 'const answer = 42', language: 'ts'},
    });

    await tick();

    const copyButton = requireElement(
      target.querySelector<HTMLButtonElement>('button[aria-label="Copy code"]'),
      'copy button',
    );
    const region = requireElement(target.querySelector('[role="region"]'), 'code scroll region');
    copyButton.click();
    await tick();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('const answer = 42');
    expect(region.contains(copyButton)).toBe(false);

    await unmount(app);
  });

  it('Given markdown with a data table When rendered Then the table is semantic and wrapped in a keyboard-focusable scroll region', async () => {
    const target = createTarget();
    const app = mount(Markdown, {
      target,
      props: {content: '| Package | Status |\n| --- | --- |\n| Svelte | Ready |'},
    });

    await tick();

    const table = requireElement(target.querySelector('table'), 'markdown table');
    const wrapper = table.closest('[role="region"][tabindex="0"]');
    expect(table.querySelectorAll('th')).toHaveLength(2);
    expect(table.querySelectorAll('td')).toHaveLength(2);
    expect(wrapper?.getAttribute('aria-label')).toBe('Table');

    await unmount(app);
  });

  it('Given malformed markdown table content When rendered Then it remains prose instead of creating a partial table', async () => {
    const target = createTarget();
    const app = mount(Markdown, {
      target,
      props: {content: '| Package | Status |\n| bad separator |\n| Svelte | Ready |'},
    });

    await tick();

    expect(target.querySelector('table')).toBeNull();
    expect(target.textContent).toContain('| Package | Status |');

    await unmount(app);
  });

  it('Given streaming chat messages When content updates Then the live log exposes aria-busy', async () => {
    const target = createTarget();
    const app = mount(Chat, {
      target,
      props: {
        messages: [
          {id: 'u1', role: 'user', content: 'Summarize'},
          {id: 'a1', role: 'assistant', content: 'The port is', isStreaming: true},
        ],
        streamingContent: 'The port is almost ready.',
      },
    });

    await tick();

    const log = requireElement(target.querySelector('[role="log"]'), 'chat log');
    expect(log.getAttribute('aria-busy')).toBe('true');

    await unmount(app);
  });

  it('Given a one-item carousel When rendered Then controls stay mounted and reduced-motion hooks remain present', async () => {
    const target = createTarget();
    const app = mount(Carousel, {
      target,
      props: {items: [media[0]], label: 'Single item gallery'},
    });

    await tick();

    const region = requireElement(target.querySelector('[role="region"]'), 'carousel region');
    expect(region.classList.contains('astryx-reduced-motion-safe')).toBe(true);
    expect(target.querySelector('button[aria-label="Previous slide"]')).toBeTruthy();
    expect(target.querySelector('button[aria-label="Next slide"]')).toBeTruthy();

    await unmount(app);
  });

  it('Given an open lightbox at a gallery edge When rendered Then controls stay mounted with disabled edge state', async () => {
    const target = createTarget();
    const app = mount(Lightbox, {target, props: {items: media, open: true, index: 0}});

    await tick();

    const dialog = requireElement(target.querySelector('[role="dialog"]'), 'lightbox dialog');
    const previous = requireElement(
      target.querySelector<HTMLButtonElement>('button[aria-label="Previous image"]'),
      'previous image button',
    );
    const next = requireElement(
      target.querySelector<HTMLButtonElement>('button[aria-label="Next image"]'),
      'next image button',
    );
    expect(dialog.classList.contains('astryx-reduced-motion-safe')).toBe(true);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    await unmount(app);
  });
});
