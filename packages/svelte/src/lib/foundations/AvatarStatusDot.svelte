<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AvatarStatusDot.svelte
   * @input Status variant, accessible label, and optional icon snippet
   * @output Avatar-corner presence indicator
   * @position Svelte port of core AvatarStatusDot
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type AvatarStatusDotVariant = 'success' | 'warning' | 'error' | 'accent' | 'neutral';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly variant?: AvatarStatusDotVariant;
    readonly label: string;
    readonly icon?: Snippet;
  };

  let {variant = 'success', label, icon, class: className, ...rest}: Props = $props();
</script>

<span
  {...rest}
  class={foundationClass('avatar-status-dot', className, [
    `astryx-avatar-status-dot--variant-${variant}`,
  ])}
  data-variant={variant}
  role="img"
  aria-label={label}
>
  {#if icon}
    {@render icon()}
  {/if}
</span>
