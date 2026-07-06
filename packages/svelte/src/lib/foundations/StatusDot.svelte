<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file StatusDot.svelte
   * @input Status variant, accessible label, pulse state, and span attributes
   * @output Accessible status indicator
   * @position Svelte port of core StatusDot
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type StatusDotVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly variant?: StatusDotVariant;
    readonly label: string;
    readonly isPulsing?: boolean;
  };

  let {variant = 'neutral', label, isPulsing = false, class: className, ...rest}: Props = $props();
</script>

<span
  {...rest}
  class={foundationClass('status-dot', className, [`astryx-status-dot--variant-${variant}`])}
  data-variant={variant}
  data-pulsing={isPulsing}
  role="img"
  aria-label={label}
></span>
