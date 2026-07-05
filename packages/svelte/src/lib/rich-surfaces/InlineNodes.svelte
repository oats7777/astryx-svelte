<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file InlineNodes.svelte
   * @input Parsed markdown inline nodes
   * @output Escaped semantic inline Svelte markup
   * @position Recursive inline renderer for Markdown.svelte
   */

  import type {InlineNode} from './markdown-utils.js';
  import Code from './Code.svelte';
  import InlineNodes from './InlineNodes.svelte';

  let {nodes} = $props<{readonly nodes: readonly InlineNode[]}>();
</script>

{#each nodes as node}
  {#if node.type === 'text'}
    {node.text}
  {:else if node.type === 'code'}
    <Code content={node.text} />
  {:else if node.type === 'bold'}
    <strong><InlineNodes nodes={node.children} /></strong>
  {:else if node.type === 'italic'}
    <em><InlineNodes nodes={node.children} /></em>
  {:else if node.type === 'span'}
    <InlineNodes nodes={node.children} />
  {:else if node.type === 'link'}
    <a href={node.href} rel="noreferrer" target={node.href.startsWith('http') ? '_blank' : undefined}>
      <InlineNodes nodes={node.children} />
    </a>
  {/if}
{/each}
