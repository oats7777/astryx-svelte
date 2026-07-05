<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Code.svelte
   * @input Inline code content and optional class
   * @output Styled semantic code element
   * @position Svelte port of core Code
   */

  let {content = '', class: className = undefined, 'data-testid': testId = undefined} = $props<{
    readonly content?: string;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();
</script>

<code class={['astryx-code', className].filter(Boolean).join(' ')} data-testid={testId}>{content}</code>

<style>
  .astryx-code {
    background: var(--color-background-muted);
    border-radius: var(--radius-inner);
    font-family: var(--font-family-code);
    font-size: var(--text-code-size, var(--font-size-sm));
    overflow-wrap: break-word;
    padding: 0 var(--spacing-1);
    word-break: break-word;
  }
</style>
