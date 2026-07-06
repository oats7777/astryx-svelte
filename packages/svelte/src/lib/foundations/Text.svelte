<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Text.svelte
   * @input Semantic text type, color, max lines, child snippet, and span attributes
   * @output Tokenized text element
   * @position Svelte port of core Text
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass, styleEntries} from './types.js';

  export type TextType = 'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3';
  export type TextColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'accent' | 'inherit';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly type?: TextType;
    readonly color?: TextColor;
    readonly maxLines?: number;
    readonly children?: Snippet;
  };

  let {
    type = 'body',
    color = type === 'supporting' ? 'secondary' : 'primary',
    maxLines = 0,
    children,
    class: className,
    style,
    ...rest
  }: Props = $props();
</script>

<span
  {...rest}
  class={foundationClass('text', className, [
    `astryx-text--type-${type}`,
    `astryx-text--color-${color}`,
  ])}
  data-type={type}
  data-color={color}
  data-max-lines={maxLines > 0 ? maxLines : undefined}
  style={styleEntries(style, [['--astryx-text-max-lines', maxLines > 0 ? String(maxLines) : undefined]])}
>
  {#if children}
    {@render children()}
  {/if}
</span>
