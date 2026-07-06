<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file CodeBlock.svelte
   * @input Source code, language, line-number, and highlighted-line props
   * @output Semantic pre/code block with observable syntax token spans
   * @position Svelte port of core CodeBlock ranges surface
   */

  import {isHighlightedLine, tokenizeCode} from './code-utils.js';

  let {
    code,
    language = 'text',
    highlightedLines = [],
    showLineNumbers = false,
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly code: string;
    readonly language?: string;
    readonly highlightedLines?: readonly number[];
    readonly showLineNumbers?: boolean;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  const lines = $derived(tokenizeCode(code, language));
  const regionLabel = $derived(language.trim().length > 0 ? language : 'Code');

  function copyCode(): void {
    void navigator.clipboard?.writeText(code);
  }
</script>

<div class={['astryx-codeblock-shell', className].filter(Boolean).join(' ')} data-testid={testId}>
  <button class="astryx-codeblock__copy" type="button" aria-label="Copy code" onclick={copyCode}>
    Copy
  </button>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <pre
    class="astryx-codeblock astryx-reduced-motion-safe"
    data-language={language}
    role="region"
    tabindex="0"
    aria-label={regionLabel}
  ><code>
{#each lines as line}
<span
  class="astryx-codeblock__line"
  data-line={line.number}
  data-highlighted={isHighlightedLine(line.number, highlightedLines) ? 'true' : undefined}
>{#if showLineNumbers}<span class="astryx-codeblock__gutter" aria-hidden="true">{line.number}</span>{/if}<span class="astryx-codeblock__text">{#each line.segments as segment}{#if segment.kind === 'token'}<span data-token={segment.tokenType} class={`astryx-codeblock__token astryx-codeblock__token--${segment.tokenType}`}>{segment.text}</span>{:else}{segment.text}{/if}{/each}</span></span>{/each}</code></pre>
</div>

<style>
  .astryx-codeblock-shell {
    position: relative;
  }

  .astryx-codeblock {
    background: var(--color-syntax-background, var(--color-background-muted));
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-element);
    color: var(--color-text-primary);
    font-family: var(--font-family-code);
    font-size: var(--text-code-size, var(--font-size-sm));
    margin: 0;
    overflow: auto;
    padding: var(--spacing-3);
  }

  .astryx-codeblock__copy {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-inner);
    color: var(--color-text-secondary);
    cursor: pointer;
    font: inherit;
    inset-block-start: var(--spacing-2);
    inset-inline-end: var(--spacing-2);
    padding: var(--spacing-1) var(--spacing-2);
    position: absolute;
    z-index: 1;
  }

  .astryx-codeblock__line {
    display: block;
    min-height: 1lh;
  }

  .astryx-codeblock__line[data-highlighted='true'] {
    background: var(--color-accent-muted);
  }

  .astryx-codeblock__gutter {
    color: var(--color-text-secondary);
    display: inline-block;
    padding-inline-end: var(--spacing-3);
    text-align: end;
    user-select: none;
    width: 3ch;
  }

  .astryx-codeblock__token--comment {
    color: var(--color-syntax-comment, var(--color-text-secondary));
  }

  .astryx-codeblock__token--function {
    color: var(--color-syntax-function, var(--color-text-accent));
  }

  .astryx-codeblock__token--keyword {
    color: var(--color-syntax-keyword, var(--color-accent));
  }

  .astryx-codeblock__token--number,
  .astryx-codeblock__token--string {
    color: var(--color-syntax-string, var(--color-success));
  }
</style>
