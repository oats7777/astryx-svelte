<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Card.svelte
   * @input Card variant, width, child snippet, and div attributes
   * @output Tokenized content card for Svelte surfaces
   * @position Svelte port of core Card
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {formatSize, foundationClass, styleEntries} from './types.js';

  export type CardVariant = 'default' | 'muted' | 'elevated';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly variant?: CardVariant;
    readonly width?: number | string;
    readonly children?: Snippet;
  };

  let {variant = 'default', width, children, class: className, style, ...rest}: Props = $props();
</script>

<div
  {...rest}
  class={foundationClass('card', className, [`astryx-card--variant-${variant}`])}
  data-variant={variant}
  style={styleEntries(style, [['width', formatSize(width)]])}
>
  {#if children}
    {@render children()}
  {/if}
</div>
