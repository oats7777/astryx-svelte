<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Markdown.svelte
   * @input Markdown source text and streaming state
   * @output Semantic markdown DOM with code block delegation and streaming affordance
   * @position Svelte port of core Markdown basics and streaming display
   */

  import CodeBlock from './CodeBlock.svelte';
  import InlineNodes from './InlineNodes.svelte';
  import {parseMarkdown} from './markdown-utils.js';

  let {
    content,
    isStreaming = false,
    density = 'default',
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly content: string;
    readonly isStreaming?: boolean;
    readonly density?: 'compact' | 'default';
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  const blocks = $derived(parseMarkdown(content));
</script>

<div
  class={['astryx-markdown astryx-reduced-motion-safe', density === 'compact' && 'astryx-markdown--compact', className]
    .filter(Boolean)
    .join(' ')}
  data-streaming={isStreaming ? 'true' : undefined}
  data-testid={testId}
>
  {#each blocks as block}
    {#if block.type === 'heading'}
      {#if block.level === 1}
        <h1><InlineNodes nodes={block.children} /></h1>
      {:else if block.level === 2}
        <h2><InlineNodes nodes={block.children} /></h2>
      {:else if block.level === 3}
        <h3><InlineNodes nodes={block.children} /></h3>
      {:else if block.level === 4}
        <h4><InlineNodes nodes={block.children} /></h4>
      {:else if block.level === 5}
        <h5><InlineNodes nodes={block.children} /></h5>
      {:else}
        <h6><InlineNodes nodes={block.children} /></h6>
      {/if}
    {:else if block.type === 'paragraph'}
      <p><InlineNodes nodes={block.children} /></p>
    {:else if block.type === 'codeblock'}
      <CodeBlock code={block.code} language={block.language} />
    {:else if block.type === 'blockquote'}
      <blockquote><InlineNodes nodes={block.children} /></blockquote>
    {:else if block.type === 'list' && block.ordered}
      <ol>{#each block.items as item}<li><InlineNodes nodes={item} /></li>{/each}</ol>
    {:else if block.type === 'list'}
      <ul>{#each block.items as item}<li><InlineNodes nodes={item} /></li>{/each}</ul>
    {:else if block.type === 'table'}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="astryx-markdown__table-region" role="region" tabindex="0" aria-label="Table">
        <table>
          <thead>
            <tr>{#each block.headers as header}<th scope="col"><InlineNodes nodes={header} /></th>{/each}</tr>
          </thead>
          <tbody>
            {#each block.rows as row}
              <tr>{#each row as cell}<td><InlineNodes nodes={cell} /></td>{/each}</tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else if block.type === 'hr'}
      <hr />
    {/if}
  {/each}
</div>

<style>
  .astryx-markdown {
    color: var(--color-text-primary);
    display: grid;
    font-family: var(--font-family-body);
    gap: var(--spacing-3);
  }

  .astryx-markdown--compact {
    gap: var(--spacing-2);
  }

  .astryx-markdown :global(h1),
  .astryx-markdown :global(h2),
  .astryx-markdown :global(h3),
  .astryx-markdown :global(p),
  .astryx-markdown :global(ol),
  .astryx-markdown :global(ul),
  .astryx-markdown :global(blockquote) {
    margin: 0;
  }

  .astryx-markdown :global(a) {
    color: var(--color-text-accent);
  }

  .astryx-markdown :global(blockquote) {
    border-inline-start: var(--border-width-2, 2px) solid var(--color-border);
    color: var(--color-text-secondary);
    padding-inline-start: var(--spacing-3);
  }

  .astryx-markdown__table-region {
    overflow: auto;
  }

  .astryx-markdown :global(table) {
    border-collapse: collapse;
    min-width: 100%;
  }

  .astryx-markdown :global(th),
  .astryx-markdown :global(td) {
    border: var(--border-width) solid var(--color-border);
    padding: var(--spacing-2) var(--spacing-3);
    text-align: start;
  }

  .astryx-markdown :global(th) {
    background: var(--color-background-muted);
    font-weight: var(--font-weight-semibold);
  }

  @media (prefers-reduced-motion: no-preference) {
    .astryx-markdown[data-streaming='true'] {
      animation: astryx-markdown-entry var(--duration-fast) var(--ease-standard);
    }
  }

  @keyframes astryx-markdown-entry {
    from {
      opacity: 0.72;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
