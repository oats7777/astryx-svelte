<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Spinner.svelte
   * @input Spinner label, size, and span attributes
   * @output Accessible loading indicator
   * @position Svelte port of core Spinner
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  export type SpinnerSize = 'sm' | 'md' | 'lg';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly label: string;
    readonly size?: SpinnerSize;
  };

  let {label, size = 'md', class: className, ...rest}: Props = $props();
</script>

<span
  {...rest}
  class={foundationClass('spinner', className, [`astryx-spinner--size-${size}`])}
  data-size={size}
  role="status"
  aria-label={label}
></span>
