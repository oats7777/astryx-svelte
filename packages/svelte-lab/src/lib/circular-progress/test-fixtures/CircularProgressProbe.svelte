<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file CircularProgressProbe.svelte
   * @input Test props for the CircularProgress component
   * @output Rendered circular progress with center content
   * @position Vitest fixture for the private Svelte lab CircularProgress slice
   */

  import CircularProgress from '../CircularProgress.svelte';
  import type {CircularProgressSize, CircularProgressVariant} from '../types.js';

  let {
    value = 75,
    max = 100,
    label = 'Upload progress',
    isLabelHidden = true,
    size = 'md',
    variant = 'accent',
    center = '75%',
  }: {
    readonly value?: number;
    readonly max?: number;
    readonly label?: string;
    readonly isLabelHidden?: boolean;
    readonly size?: CircularProgressSize;
    readonly variant?: CircularProgressVariant;
    readonly center?: string;
  } = $props();
</script>

<CircularProgress {value} {max} {label} {isLabelHidden} {size} {variant}>{center}</CircularProgress>
