<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Divider.svelte
   * @input Divider label, orientation, variant, and attributes
   * @output Separator with optional label
   * @position Svelte port of core Divider
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type DividerOrientation = 'horizontal' | 'vertical';
  export type DividerVariant = 'default' | 'strong';
  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly label?: string;
    readonly orientation?: DividerOrientation;
    readonly variant?: DividerVariant;
  };

  let {
    label,
    orientation = 'horizontal',
    variant = 'default',
    class: className,
    ...rest
  }: Props = $props();
</script>

<div
  {...rest}
  class={foundationClass('divider', className, [
    `astryx-divider--${orientation}`,
    `astryx-divider--${variant}`,
  ])}
  role="separator"
  aria-orientation={orientation}
  data-variant={variant}
>
  {#if label}
    <span class="astryx-divider__label">{label}</span>
  {/if}
</div>
