<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Badge.svelte
   * @input Badge variant, label, icon snippet, and span attributes
   * @output Tokenized badge element
   * @position Svelte port of core Badge
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type BadgeVariant =
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'blue'
    | 'cyan'
    | 'green'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal'
    | 'yellow';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly variant?: BadgeVariant;
    readonly label: string;
    readonly icon?: Snippet;
  };

  let {variant = 'neutral', label, icon, class: className, ...rest}: Props = $props();
</script>

<span
  {...rest}
  class={foundationClass('badge', className, [`astryx-badge--variant-${variant}`])}
  data-variant={variant}
>
  {#if icon}
    <span class="astryx-badge__icon">{@render icon()}</span>
  {/if}
  {label}
</span>
