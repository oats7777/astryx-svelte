<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ProgressBar.svelte
   * @input Progress value, bounds, label, and indeterminate state
   * @output ARIA progress meter with tokenized fill
   * @position Svelte/Tailwind port of core ProgressBar
   */

  let {
    value = 0,
    min = 0,
    max = 100,
    label,
    isIndeterminate = false,
  }: {
    readonly value?: number | null;
    readonly min?: number;
    readonly max?: number;
    readonly label: string;
    readonly isIndeterminate?: boolean;
  } = $props();

  const hasValue = $derived(!isIndeterminate && value != null);
  const clampedValue = $derived(hasValue ? Math.min(max, Math.max(min, value ?? min)) : min);
  const range = $derived(Math.max(1, max - min));
  const percent = $derived(((clampedValue - min) / range) * 100);
</script>

<div
  class="astryx-progress"
  role="progressbar"
  aria-label={label}
  aria-valuemin={hasValue ? min : undefined}
  aria-valuemax={hasValue ? max : undefined}
  aria-valuenow={hasValue ? clampedValue : undefined}
  data-indeterminate={isIndeterminate ? 'true' : undefined}
>
  <div class="astryx-progress__track">
    <div class="astryx-progress__bar" style={`inline-size: ${hasValue ? percent : 40}%`}></div>
  </div>
</div>

<style>
  .astryx-progress__track {
    background: var(--color-background-muted);
    border-radius: var(--radius-full);
    block-size: var(--spacing-2);
    overflow: hidden;
  }

  .astryx-progress__bar {
    background: var(--color-accent);
    block-size: 100%;
    border-radius: inherit;
    transition: inline-size var(--duration-fast) var(--ease-standard);
  }

  .astryx-progress[data-indeterminate='true'] .astryx-progress__bar {
    opacity: 0.7;
  }
</style>
