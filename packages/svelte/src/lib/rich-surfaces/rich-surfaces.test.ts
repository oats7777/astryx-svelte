// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rich-surfaces.test.ts
 * @input Svelte rich content, media, motion, command, chat, and resize components
 * @output Red-first DOM behavior coverage for Todo 14 rich-surfaces port
 * @position Package-local tests for Svelte/Tailwind rich-surfaces slice
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import Carousel from './Carousel.svelte';
import Chat from './Chat.svelte';
import CodeBlock from './CodeBlock.svelte';
import Collapsible from './Collapsible.svelte';
import CommandPalette from './CommandPalette.svelte';
import Lightbox from './Lightbox.svelte';
import Markdown from './Markdown.svelte';
import Resizable from './Resizable.svelte';

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

function keydown(element: Element, key: string): void {
  element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
}

function inputText(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

describe('rich-surfaces command palette and disclosure behavior', () => {
  it('Given grouped commands When searched and keyboard selected Then grouping active option and selection are preserved', async () => {
    const target = createTarget();
    const selected = vi.fn();
    const app = mount(CommandPalette, {
      target,
      props: {
        open: true,
        label: 'Global commands',
        searchSource: {
          bootstrap: () => [
            {id: 'open-file', label: 'Open File', auxiliaryData: {group: 'Navigate'}},
            {id: 'new-task', label: 'New Task', auxiliaryData: {group: 'Create'}},
          ],
          search: (query: string) =>
            [
              {id: 'open-file', label: 'Open File', auxiliaryData: {group: 'Navigate'}},
              {id: 'new-task', label: 'New Task', auxiliaryData: {group: 'Create'}},
            ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
        },
        onValueChange: selected,
      },
    });

    await tick();
    const input = requireElement(target.querySelector<HTMLInputElement>('[role="combobox"]'), 'command input');
    expect(target.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Global commands');
    expect(target.textContent).toContain('Navigate');

    inputText(input, 'task');
    await tick();
    keydown(input, 'ArrowDown');
    keydown(input, 'Enter');
    await tick();

    expect(selected).toHaveBeenCalledWith('new-task');
    expect(input.getAttribute('aria-activedescendant')).toContain('new-task');
    expect(target.querySelector('[data-selected="true"]')?.textContent).toContain('New Task');

    await unmount(app);
  });

  it('Given a collapsible section When toggled Then aria-expanded and content visibility stay in sync', async () => {
    const target = createTarget();
    const changes = vi.fn();
    const app = mount(Collapsible, {
      target,
      props: {
        trigger: 'Details',
        content: 'Hidden diagnostics',
        defaultOpen: false,
        onOpenChange: changes,
        'data-testid': 'details',
      },
    });

    await tick();
    const trigger = requireElement(target.querySelector<HTMLButtonElement>('button'), 'collapsible trigger');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(target.textContent).not.toContain('Hidden diagnostics');

    trigger.click();
    await tick();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(target.textContent).toContain('Hidden diagnostics');
    expect(changes).toHaveBeenCalledWith(true);

    await unmount(app);
  });
});

describe('rich-surfaces markdown code and chat behavior', () => {
  it('Given markdown with prose links and fenced code When rendered Then semantic markdown and highlighted code are emitted', async () => {
    const target = createTarget();
    const app = mount(Markdown, {
      target,
      props: {
        content: '# Release notes\n\nUse `pnpm test` and **ship** [docs](https://example.com).\n\n```ts\nconst answer = 42\n```',
        isStreaming: true,
      },
    });

    await tick();

    expect(target.querySelector('h1')?.textContent).toBe('Release notes');
    expect(target.querySelector('strong')?.textContent).toBe('ship');
    expect(target.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(target.querySelector('code')?.textContent).toContain('pnpm test');
    expect(target.querySelector('[data-token="keyword"]')?.textContent).toBe('const');
    expect(target.querySelector('[data-streaming="true"]')).toBeTruthy();

    await unmount(app);
  });

  it('Given unsafe markdown link destinations When rendered Then labels remain visible without unsafe anchors', async () => {
    const target = createTarget();
    const app = mount(Markdown, {
      target,
      props: {
        content:
          '[script](javascript:alert(1)) [mixed]( JaVaScRiPt:alert(1) ) [data](data:text/plain,hi) [vb](vbscript:msgbox(1)) [empty](   ) [safe](https://example.com) [relative](/docs/svelte) [hash](#anchor)',
      },
    });

    await tick();

    expect(target.textContent).toContain('script');
    expect(target.textContent).toContain('mixed');
    expect(target.textContent).toContain('data');
    expect(target.textContent).toContain('vb');
    expect(target.textContent).toContain('empty');
    expect(target.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(target.querySelector('a[href^="data:"]')).toBeNull();
    expect(target.querySelector('a[href^="vbscript:"]')).toBeNull();

    const anchors = [...target.querySelectorAll<HTMLAnchorElement>('a')];
    expect(anchors).toHaveLength(3);
    expect(anchors.map((anchor) => anchor.textContent)).toEqual(['safe', 'relative', 'hash']);
    expect(anchors[0]?.getAttribute('href')).toBe('https://example.com');
    expect(anchors[0]?.getAttribute('target')).toBe('_blank');
    expect(anchors[1]?.getAttribute('href')).toBe('/docs/svelte');
    expect(anchors[1]?.hasAttribute('target')).toBe(false);
    expect(anchors[2]?.getAttribute('href')).toBe('#anchor');
    expect(anchors[2]?.hasAttribute('target')).toBe(false);

    await unmount(app);
  });

  it('Given markdown links with browser-normalized control characters When rendered Then unsafe labels remain visible without dangerous protocol anchors', async () => {
    const target = createTarget();
    const app = mount(Markdown, {
      target,
      props: {
        content:
          '[tab](java\tscript:alert(1)) [newline](java\nscript:alert(1)) [carriage](java\rscript:alert(1)) [safe](https://example.com) [relative](/docs/svelte) [hash](#anchor)',
      },
    });

    await tick();

    expect(target.textContent).toContain('tab');
    expect(target.textContent).toContain('newline');
    expect(target.textContent).toContain('carriage');

    const renderedAnchors = [...target.querySelectorAll<HTMLAnchorElement>('a')];
    expect(renderedAnchors.map((anchor) => anchor.textContent)).toEqual(['safe', 'relative', 'hash']);
    expect(renderedAnchors.map((anchor) => anchor.getAttribute('href'))).toEqual([
      'https://example.com',
      '/docs/svelte',
      '#anchor',
    ]);
    expect(
      renderedAnchors.some((anchor) => ['javascript:', 'data:', 'vbscript:'].includes(anchor.protocol.toLowerCase())),
    ).toBe(false);

    await unmount(app);
  });

  it('Given a code block with line ranges When rendered Then tokens and highlighted lines are observable', async () => {
    const target = createTarget();
    const app = mount(CodeBlock, {
      target,
      props: {
        code: 'const answer = 42\nconsole.log(answer)',
        language: 'ts',
        highlightedLines: [2],
        showLineNumbers: true,
      },
    });

    await tick();

    expect(target.querySelector('pre')?.getAttribute('data-language')).toBe('ts');
    expect(target.querySelector('[data-line="2"]')?.getAttribute('data-highlighted')).toBe('true');
    expect(target.querySelector('[data-token="function"]')?.textContent).toBe('log');

    await unmount(app);
  });

  it('Given streaming chat messages When content updates Then the live log displays the streamed assistant content', async () => {
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
    expect(log.getAttribute('aria-live')).toBe('polite');
    expect(log.textContent).toContain('Summarize');
    expect(target.querySelector('[data-streaming="true"]')?.textContent).toContain('almost ready');

    await unmount(app);
  });
});

describe('rich-surfaces media keyboard and resize behavior', () => {
  const media = [
    {id: 'one', src: '/one.jpg', alt: 'First image', caption: 'One'},
    {id: 'two', src: '/two.jpg', alt: 'Second image', caption: 'Two'},
  ] as const;
  const resizeBounds = {defaultSize: 240, minSize: 200, maxSize: 280} as const;

  it('Given a carousel When arrow keys are pressed Then the active media and reduced-motion affordance update', async () => {
    const target = createTarget();
    const app = mount(Carousel, {target, props: {items: media, label: 'Gallery', defaultIndex: 0}});

    await tick();
    const region = requireElement(target.querySelector('[role="region"]'), 'carousel region');
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect(region.hasAttribute('tabindex')).toBe(false);
    expect(region.classList.contains('astryx-reduced-motion-safe')).toBe(true);
    expect(target.querySelector('img')?.getAttribute('alt')).toBe('First image');

    const activeTab = requireElement(target.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]'), 'active slide tab');
    keydown(activeTab, 'ArrowRight');
    await tick();

    expect(target.querySelector('img')?.getAttribute('alt')).toBe('Second image');
    expect(target.querySelector('[aria-current="true"]')?.textContent).toContain('2');

    await unmount(app);
  });

  it('Given an open lightbox When keyboard navigation and escape are used Then image selection and close callback fire', async () => {
    const target = createTarget();
    const close = vi.fn();
    const app = mount(Lightbox, {target, props: {items: media, open: true, index: 0, onOpenChange: close}});

    await tick();
    const dialog = requireElement(target.querySelector('[role="dialog"]'), 'lightbox dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    keydown(dialog, 'ArrowRight');
    await tick();
    expect(target.querySelector('img')?.getAttribute('alt')).toBe('Second image');

    keydown(dialog, 'Escape');
    expect(close).toHaveBeenCalledWith(false);

    await unmount(app);
  });

  it('Given a resizable region When dragged and adjusted by keyboard Then size is clamped and reported', async () => {
    const target = createTarget();
    const changes = vi.fn();
    const app = mount(Resizable, {
      target,
      props: {
        label: 'Navigation width',
        defaultSize: 240,
        minSize: 180,
        maxSize: 320,
        onSizeChange: changes,
      },
    });

    await tick();
    const handle = requireElement(target.querySelector('[role="slider"]'), 'resize handle');
    expect(handle.getAttribute('aria-valuenow')).toBe('240');

    handle.dispatchEvent(new PointerEvent('pointerdown', {clientX: 240, bubbles: true}));
    window.dispatchEvent(new PointerEvent('pointermove', {clientX: 360, bubbles: true}));
    window.dispatchEvent(new PointerEvent('pointerup', {clientX: 360, bubbles: true}));
    await tick();
    expect(handle.getAttribute('aria-valuenow')).toBe('320');

    keydown(handle, 'ArrowLeft');
    await tick();
    expect(handle.getAttribute('aria-valuenow')).toBe('310');
    expect(changes).toHaveBeenLastCalledWith(310);

    await unmount(app);
  });

  it('Given default horizontal resizable When inspected and adjusted by arrow keys Then slider orientation and width controls match', async () => {
    const target = createTarget();
    const app = mount(Resizable, {
      target,
      props: {label: 'Sidebar width', ...resizeBounds},
    });

    await tick();
    const handle = requireElement(target.querySelector('[role="slider"]'), 'horizontal resize handle');
    expect(handle.getAttribute('aria-orientation')).toBe('horizontal');

    keydown(handle, 'ArrowRight');
    await tick();
    expect(handle.getAttribute('aria-valuenow')).toBe('250');

    keydown(handle, 'ArrowLeft');
    await tick();
    expect(handle.getAttribute('aria-valuenow')).toBe('240');

    await unmount(app);
  });

  it('Given vertical resizable When inspected and adjusted by arrow keys Then slider orientation and height controls match', async () => {
    const target = createTarget();
    const app = mount(Resizable, {
      target,
      props: {label: 'Panel height', ...resizeBounds, orientation: 'vertical'},
    });

    await tick();
    const handle = requireElement(target.querySelector('[role="slider"]'), 'vertical resize handle');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');

    keydown(handle, 'ArrowDown');
    await tick();
    expect(handle.getAttribute('aria-valuenow')).toBe('250');

    keydown(handle, 'ArrowUp');
    await tick();
    expect(handle.getAttribute('aria-valuenow')).toBe('240');

    await unmount(app);
  });
});
