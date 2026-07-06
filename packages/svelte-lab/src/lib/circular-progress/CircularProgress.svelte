<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts" module>
  let circularProgressId = 0;
</script>

<script lang="ts">
  /**
   * @file CircularProgress.svelte
   * @input Progress value, max, label, size, variant, and optional center content
   * @output Accessible SVG circular progress indicator
   * @position Private Svelte lab port of CircularProgress
   */

  import type {Snippet} from 'svelte';
  import type {CircularProgressSize, CircularProgressVariant} from './types.js';

  const SIZE_CONFIG: Record<CircularProgressSize, {readonly diameter: number; readonly strokeWidth: number}> = {
    sm: {diameter: 32, strokeWidth: 3},
    md: {diameter: 48, strokeWidth: 4},
    lg: {diameter: 64, strokeWidth: 5},
  };

  type Props = {
    readonly value?: number;
    readonly max?: number;
    readonly label: string;
    readonly isLabelHidden?: boolean;
    readonly children?: Snippet;
    readonly size?: CircularProgressSize;
    readonly variant?: CircularProgressVariant;
    readonly class?: string;
    readonly 'data-testid'?: string;
  };

  let {
    value = undefined,
    max = 100,
    label,
    isLabelHidden = true,
    children,
    size = 'md',
    variant = 'accent',
    class: className = undefined,
    'data-testid': testId = undefined,
  }: Props = $props();

  const labelId = `astryx-circular-progress-${++circularProgressId}`;
  const metrics = $derived(SIZE_CONFIG[size]);
  const isIndeterminate = $derived(value == null);
  const radius = $derived((metrics.diameter - metrics.strokeWidth) / 2);
  const circumference = $derived(2 * Math.PI * radius);
  const clampedValue = $derived(Math.min(Math.max(0, value ?? 0), max));
  const percentage = $derived(max > 0 ? clampedValue / max : 0);
  const dashoffset = $derived(circumference * (1 - percentage));
  const rootClass = $derived(
    `astryx-circular-progress astryx-circular-progress--${variant} astryx-circular-progress--${size}${
      isLabelHidden ? '' : ' astryx-circular-progress--with-label'
    }${className == null ? '' : ` ${className}`}`,
  );
</script>

<div class={rootClass} data-astryx-circular-progress data-variant={variant} data-size={size} data-testid={testId}>
  <span id={labelId} class:astryx-circular-progress__label--hidden={isLabelHidden} class="astryx-circular-progress__label">
    {label}
  </span>

  <span class="astryx-circular-progress__ring">
    <svg
      role={isIndeterminate ? 'progressbar' : 'meter'}
      aria-labelledby={labelId}
      aria-valuenow={isIndeterminate ? undefined : clampedValue}
      aria-valuemin={isIndeterminate ? undefined : 0}
      aria-valuemax={isIndeterminate ? undefined : max}
      width={metrics.diameter}
      height={metrics.diameter}
      viewBox={`0 0 ${metrics.diameter} ${metrics.diameter}`}
      class:astryx-circular-progress__svg--indeterminate={isIndeterminate}
      class="astryx-circular-progress__svg"
    >
      <circle
        class="astryx-circular-progress__track"
        cx={metrics.diameter / 2}
        cy={metrics.diameter / 2}
        r={radius}
        stroke-width={metrics.strokeWidth}
      />
      <circle
        class:astryx-circular-progress__fill--indeterminate={isIndeterminate}
        class="astryx-circular-progress__fill"
        cx={metrics.diameter / 2}
        cy={metrics.diameter / 2}
        r={radius}
        stroke-width={metrics.strokeWidth}
        stroke-dasharray={isIndeterminate ? undefined : circumference}
        stroke-dashoffset={isIndeterminate ? undefined : dashoffset}
      />
    </svg>

    {#if children}
      <span class="astryx-circular-progress__center">{@render children()}</span>
    {/if}
  </span>
</div>

<style>
  .astryx-circular-progress {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    position: relative;
  }

  .astryx-circular-progress--with-label {
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .astryx-circular-progress__label {
    color: var(--color-text-secondary);
    font: var(--font-body);
    font-size: var(--text-supporting-size);
    font-weight: var(--font-weight-medium);
    line-height: var(--text-supporting-leading);
  }

  .astryx-circular-progress__label--hidden {
    block-size: 1px;
    border-width: 0;
    clip: rect(0, 0, 0, 0);
    inline-size: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
  }

  .astryx-circular-progress__ring {
    display: inline-flex;
    position: relative;
  }

  .astryx-circular-progress__svg {
    display: block;
    transform: rotate(-90deg);
  }

  .astryx-circular-progress__svg--indeterminate {
    animation: astryx-circular-progress-rotate 2s linear infinite;
    transform: none;
  }

  .astryx-circular-progress__track,
  .astryx-circular-progress__fill {
    fill: none;
  }

  .astryx-circular-progress__track {
    stroke: var(--color-accent-muted);
  }

  .astryx-circular-progress__fill {
    stroke: var(--color-accent);
    stroke-linecap: round;
    transition: stroke-dashoffset var(--duration-medium) var(--ease-standard);
  }

  .astryx-circular-progress--success .astryx-circular-progress__track {
    stroke: var(--color-success-muted);
  }

  .astryx-circular-progress--success .astryx-circular-progress__fill {
    stroke: var(--color-success);
  }

  .astryx-circular-progress--warning .astryx-circular-progress__track {
    stroke: var(--color-warning-muted);
  }

  .astryx-circular-progress--warning .astryx-circular-progress__fill {
    stroke: var(--color-warning);
  }

  .astryx-circular-progress--error .astryx-circular-progress__track {
    stroke: var(--color-error-muted);
  }

  .astryx-circular-progress--error .astryx-circular-progress__fill {
    stroke: var(--color-error);
  }

  .astryx-circular-progress--neutral .astryx-circular-progress__track {
    stroke: var(--color-track);
  }

  .astryx-circular-progress--neutral .astryx-circular-progress__fill {
    stroke: var(--color-text-disabled);
  }

  .astryx-circular-progress__fill--indeterminate {
    animation: astryx-circular-progress-dash 1.5s ease-in-out infinite;
  }

  .astryx-circular-progress__center {
    align-items: center;
    display: flex;
    inset: 0;
    justify-content: center;
    pointer-events: none;
    position: absolute;
  }

  @media (prefers-reduced-motion: reduce) {
    .astryx-circular-progress__svg--indeterminate,
    .astryx-circular-progress__fill--indeterminate {
      animation-duration: 4s;
    }

    .astryx-circular-progress__fill {
      transition: none;
    }
  }

  @keyframes astryx-circular-progress-rotate {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes astryx-circular-progress-dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
</style>
