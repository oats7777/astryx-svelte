<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Blockquote.svelte
   * @input Quote content, cite text, and blockquote attributes
   * @output Themed blockquote with optional citation footer
   * @position Svelte port of core Blockquote
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  type Props = HTMLAttributes<HTMLQuoteElement> & {
    readonly cite?: string;
    readonly children?: Snippet;
  };

  let {cite, children, class: className, ...rest}: Props = $props();
</script>

<blockquote {...rest} class={foundationClass('blockquote', className)}>
  {#if children}
    {@render children()}
  {/if}
  {#if cite}
    <footer class="astryx-blockquote__cite">{cite}</footer>
  {/if}
</blockquote>
