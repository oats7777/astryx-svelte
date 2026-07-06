// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file code-editor.test.ts
 * @input Svelte CodeEditor component
 * @output Vitest DOM coverage for editable text, placeholder, line numbers, and readonly state
 * @position TDD harness for the private Svelte lab code editor slice
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import {CodeEditor} from './index.js';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

function placeCaretAtEnd(element: Element): void {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

describe('Svelte lab CodeEditor', () => {
  it('Given editable source When input changes Then the component reports text and renders editor affordances', async () => {
    const target = createTarget();
    const handleChange = vi.fn();
    const app = mount(CodeEditor, {
      target,
      props: {
        value: 'const answer = 42;',
        onChange: handleChange,
        language: 'typescript',
        hasLineNumbers: true,
        placeholder: 'Write code',
        'aria-label': 'Source editor',
      },
    });

    await tick();

    const editor = target.querySelector('[role="textbox"]');
    expect(editor?.textContent).toBe('const answer = 42;');
    expect(editor?.getAttribute('aria-multiline')).toBe('true');
    expect(target.querySelector('[data-astryx-code-editor-gutter]')?.textContent).toContain('1');

    editor?.replaceChildren(document.createTextNode('let total = 2;'));
    editor?.dispatchEvent(new InputEvent('input', {bubbles: true}));

    expect(handleChange).toHaveBeenCalledWith('let total = 2;');

    await unmount(app);
  });

  it('Given empty readonly source When rendered Then placeholder and readonly state are exposed', async () => {
    const target = createTarget();
    const app = mount(CodeEditor, {
      target,
      props: {
        value: '',
        onChange: vi.fn(),
        isReadOnly: true,
        placeholder: 'Read-only code',
      },
    });

    await tick();

    expect(target.querySelector('[data-astryx-code-editor-placeholder]')?.textContent).toBe(
      'Read-only code',
    );
    expect(target.querySelector('[role="textbox"]')?.getAttribute('aria-readonly')).toBe('true');

    await unmount(app);
  });

  it('Given an indented line When Enter is pressed Then the inserted line preserves indentation', async () => {
    const target = createTarget();
    const handleChange = vi.fn();
    const app = mount(CodeEditor, {
      target,
      props: {
        value: '  const answer = 42;',
        onChange: handleChange,
      },
    });

    await tick();

    const editor = target.querySelector('[role="textbox"]');
    if (editor == null) {
      throw new Error('Expected CodeEditor textbox.');
    }
    placeCaretAtEnd(editor);
    editor.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));

    expect(handleChange).toHaveBeenCalledWith('  const answer = 42;\n  ');

    await unmount(app);
  });

  it('Given a collapsed selection When an opening bracket is typed Then the editor inserts a balanced pair', async () => {
    const target = createTarget();
    const handleChange = vi.fn();
    const app = mount(CodeEditor, {
      target,
      props: {
        value: 'call',
        onChange: handleChange,
      },
    });

    await tick();

    const editor = target.querySelector('[role="textbox"]');
    if (editor == null) {
      throw new Error('Expected CodeEditor textbox.');
    }
    placeCaretAtEnd(editor);
    editor.dispatchEvent(new KeyboardEvent('keydown', {key: '(', bubbles: true, cancelable: true}));

    expect(handleChange).toHaveBeenCalledWith('call()');

    await unmount(app);
  });
});
