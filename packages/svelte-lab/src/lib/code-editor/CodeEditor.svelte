<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file CodeEditor.svelte
   * @input Controlled source text, editor mode, size, and accessibility labels
   * @output Editable code surface with line numbers, placeholder, and input callbacks
   * @position Private Svelte lab implementation for the experimental code editor
   */

  import type {CodeEditorProps} from './types.js';

  let {
    value,
    onChange,
    language = 'plaintext',
    hasLineNumbers = false,
    isReadOnly = false,
    placeholder,
    maxHeight,
    size = 'md',
    'aria-label': ariaLabel = 'Code editor',
  }: CodeEditorProps = $props();

  let editorElement: HTMLElement | undefined = $state();
  let focused = $state(false);
  let composing = false;
  const lines = $derived(value.split('\n'));
  const placeholderVisible = $derived(value.length === 0 && placeholder != null);
  const maxHeightStyle = $derived(
    maxHeight == null ? undefined : typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
  );
  const autoClosePairs: Readonly<Record<string, string>> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '`': '`',
  };

  $effect(() => {
    if (editorElement != null && editorElement.textContent !== value) {
      editorElement.textContent = value;
    }
  });

  function readText(): string {
    return editorElement?.textContent ?? '';
  }

  function currentSelectionRange(): Range | null {
    const selection = window.getSelection();
    if (selection == null || selection.rangeCount === 0) {
      return null;
    }
    return selection.getRangeAt(0);
  }

  function moveSelectionToTextNode(textNode: Text, offset: number): void {
    const selection = window.getSelection();
    if (selection == null) {
      return;
    }
    const range = document.createRange();
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertTextAtSelection(text: string, caretOffset = text.length): boolean {
    const range = currentSelectionRange();
    if (range == null) {
      return false;
    }
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    moveSelectionToTextNode(textNode, caretOffset);
    onChange(readText());
    return true;
  }

  function cursorOffsetFor(range: Range): number {
    if (editorElement == null) {
      return 0;
    }
    const beforeCaret = range.cloneRange();
    beforeCaret.selectNodeContents(editorElement);
    beforeCaret.setEnd(range.startContainer, range.startOffset);
    return beforeCaret.toString().length;
  }

  function handleInput(): void {
    if (!composing) {
      onChange(readText());
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (isReadOnly) {
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      insertTextAtSelection('  ');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const range = currentSelectionRange();
      if (range == null) {
        return;
      }
      const fullText = readText();
      const beforeCursor = fullText.slice(0, cursorOffsetFor(range));
      const currentLine = beforeCursor.slice(beforeCursor.lastIndexOf('\n') + 1);
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';
      insertTextAtSelection(`\n${indent}`);
      return;
    }

    const closeChar = autoClosePairs[event.key];
    if (closeChar == null) {
      return;
    }

    const range = currentSelectionRange();
    if (range == null || !range.collapsed) {
      return;
    }
    event.preventDefault();
    insertTextAtSelection(`${event.key}${closeChar}`, 1);
  }

  function handleCompositionStart(): void {
    composing = true;
  }

  function handleCompositionEnd(): void {
    composing = false;
    handleInput();
  }
</script>

<div
  class:focused
  class:size-sm={size === 'sm'}
  data-astryx-code-editor
  data-language={language}
>
  <div class="editor-scroll" style:max-height={maxHeightStyle}>
    {#if hasLineNumbers}
      <div aria-hidden="true" class="gutter" data-astryx-code-editor-gutter>
        {#each lines as _, index}
          <div>{index + 1}</div>
        {/each}
      </div>
    {/if}
    <div class="editor-wrap">
      {#if placeholderVisible}
        <div class="placeholder" data-astryx-code-editor-placeholder>{placeholder}</div>
      {/if}
      <div
        aria-label={ariaLabel}
        aria-multiline="true"
        aria-readonly={isReadOnly}
        bind:this={editorElement}
        class="editor"
        contenteditable={isReadOnly ? 'false' : 'plaintext-only'}
        onblur={() => (focused = false)}
        oncompositionend={handleCompositionEnd}
        oncompositionstart={handleCompositionStart}
        onfocus={() => (focused = true)}
        oninput={handleInput}
        onkeydown={handleKeydown}
        role="textbox"
        spellcheck="false"
        tabindex="0"
      ></div>
    </div>
  </div>
</div>

<style>
  [data-astryx-code-editor] {
    --editor-font-size: var(--font-size-base, 14px);
    background: var(--color-background-muted, #f6f7f9);
    border: 1px solid var(--color-border, #d8dde6);
    border-radius: var(--radius-element, 8px);
    color: var(--color-text-primary, #101418);
    display: flex;
    overflow: hidden;
    position: relative;
  }

  [data-astryx-code-editor].focused {
    border-color: var(--color-accent, #0a66ff);
    box-shadow: 0 0 0 1px var(--color-accent, #0a66ff);
  }

  [data-astryx-code-editor].size-sm {
    --editor-font-size: var(--font-size-sm, 12px);
  }

  .editor-scroll {
    display: flex;
    flex: 1;
    overflow: auto;
  }

  .gutter {
    border-right: 1px solid var(--color-border, #d8dde6);
    color: var(--color-text-disabled, #7a8494);
    flex-shrink: 0;
    font: var(--editor-font-size) / var(--text-code-leading, 1.6) var(--font-family-code, monospace);
    padding: var(--spacing-3, 12px) var(--spacing-3, 12px) var(--spacing-3, 12px)
      var(--spacing-4, 16px);
    text-align: end;
    user-select: none;
  }

  .editor-wrap {
    flex: 1;
    position: relative;
  }

  .editor,
  .placeholder {
    font: var(--editor-font-size) / var(--text-code-leading, 1.6) var(--font-family-code, monospace);
    padding: var(--spacing-3, 12px) var(--spacing-4, 16px);
    white-space: pre;
  }

  .editor {
    caret-color: currentColor;
    display: block;
    min-height: 3em;
    outline: none;
    overflow-wrap: normal;
    tab-size: 2;
    word-break: normal;
  }

  .placeholder {
    color: var(--color-text-disabled, #7a8494);
    inset: 0 auto auto 0;
    pointer-events: none;
    position: absolute;
    user-select: none;
  }
</style>
