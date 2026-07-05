<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Step.svelte
   * @input Step index, label, description, status, indicator, and optional content
   * @output List item with progress-derived state and optional non-linear button
   * @position Private Svelte lab port of Step
   */

  import type {Snippet} from 'svelte';
  import {getStepperContext} from './stepper-context.js';
  import type {StepIndicatorPreset, StepProgress, StepStatus, StepperDensity} from './types.js';

  type Props = {
    readonly step: number;
    readonly label: string;
    readonly description?: string;
    readonly children?: Snippet;
    readonly icon?: Snippet;
    readonly status?: StepStatus;
    readonly isDisabled?: boolean;
    readonly isOptional?: boolean;
    readonly endContent?: Snippet;
    readonly indicator?: StepIndicatorPreset;
    readonly density?: StepperDensity;
    readonly class?: string;
    readonly 'data-testid'?: string;
  };

  let {
    step,
    label,
    description = undefined,
    children,
    icon,
    status = undefined,
    isDisabled = false,
    isOptional = false,
    endContent,
    indicator = 'auto',
    density = undefined,
    class: className = undefined,
    'data-testid': testId = undefined,
  }: Props = $props();

  const readContext = getStepperContext();
  const context = $derived(readContext());
  const resolvedDensity = $derived(density ?? context.density);
  const progress: StepProgress = $derived(
    step === context.activeStep ? 'in-progress' : step < context.activeStep ? 'completed' : 'not-started',
  );
  const active = $derived(progress === 'in-progress');
  const clickable = $derived(!isDisabled && context.onStepClick != null);
  const showIndicator = $derived(indicator !== 'none');
  const showNumber = $derived(showIndicator && (indicator === 'number' || (indicator === 'auto' && progress === 'not-started')) && icon == null);
  const orientationClass = $derived(`astryx-step astryx-step--${context.orientation} astryx-step--${progress}`);
  const rootClass = $derived(`${orientationClass} astryx-step--density-${resolvedDensity}${className == null ? '' : ` ${className}`}`);

  function choose(): void {
    context.onStepClick?.(step);
  }
</script>

<li
  class={rootClass}
  aria-current={active ? 'step' : undefined}
  data-astryx-step
  data-progress={progress}
  data-status={status}
  data-disabled={isDisabled ? 'true' : undefined}
  data-testid={testId}
>
  <span class="astryx-step__bar" aria-hidden="true"></span>

  <span class="astryx-step__body">
    {#if clickable}
      <button type="button" class="astryx-step__control" aria-label={`Go to step ${step + 1}: ${label}`} onclick={choose}>
        {#snippet stepLabel()}
          {#if showIndicator}
            <span class:astryx-step__indicator--number={showNumber} class="astryx-step__indicator" aria-hidden="true">
              {#if icon}
                {@render icon()}
              {:else if showNumber}
                {step + 1}
              {:else if progress === 'completed'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill="currentColor" />
                  <path d="M5 8.5l2 2 4-4" stroke="var(--color-background-surface)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              {:else}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2" />
                  <circle cx="8" cy="8" r="4" fill="currentColor" />
                </svg>
              {/if}
            </span>
          {/if}
          <span class="astryx-step__label">{label}</span>
          {#if isOptional}
            <span class="astryx-step__optional-dot" aria-hidden="true">•</span>
            <span class="astryx-step__optional">Optional</span>
          {/if}
          {#if endContent}
            {@render endContent()}
          {/if}
        {/snippet}
        <span class="astryx-step__label-row">{@render stepLabel()}</span>
        {#if description != null}
          <span class="astryx-step__description">{description}</span>
        {/if}
      </button>
    {:else}
      <span class="astryx-step__static">
        {#if showIndicator}
          <span class:astryx-step__indicator--number={showNumber} class="astryx-step__indicator" aria-hidden="true">
            {#if icon}
              {@render icon()}
            {:else if showNumber}
              {step + 1}
            {:else if progress === 'completed'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="currentColor" />
                <path d="M5 8.5l2 2 4-4" stroke="var(--color-background-surface)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2" />
                <circle cx="8" cy="8" r="4" fill="currentColor" />
              </svg>
            {/if}
          </span>
        {/if}
        <span class="astryx-step__label">{label}</span>
        {#if isOptional}
          <span class="astryx-step__optional-dot" aria-hidden="true">•</span>
          <span class="astryx-step__optional">Optional</span>
        {/if}
        {#if endContent}
          {@render endContent()}
        {/if}
      </span>
      {#if description != null}
        <span class="astryx-step__description">{description}</span>
      {/if}
    {/if}

    {#if children}
      <span class="astryx-step__content">{@render children()}</span>
    {/if}
  </span>
</li>

<style>
  .astryx-step {
    display: flex;
    flex: 1;
    gap: var(--spacing-0-5);
    position: relative;
  }

  .astryx-step--horizontal { align-items: flex-start; flex-direction: column; }
  .astryx-step--vertical { align-items: stretch; flex-direction: row; }

  .astryx-step__bar {
    background: var(--color-border);
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .astryx-step--horizontal .astryx-step__bar {
    block-size: 4px;
    inline-size: 100%;
    margin-block-end: var(--spacing-0-5);
  }

  .astryx-step--vertical .astryx-step__bar { align-self: stretch; inline-size: 4px; }
  .astryx-step--completed .astryx-step__bar,
  .astryx-step--in-progress .astryx-step__bar { background: var(--color-accent); }
  .astryx-step[data-status='accent'] .astryx-step__bar,
  .astryx-step[data-status='accent'] .astryx-step__indicator { background: var(--color-accent); color: var(--color-on-accent); }
  .astryx-step[data-status='success'] .astryx-step__bar,
  .astryx-step[data-status='success'] .astryx-step__indicator { background: var(--color-success); color: var(--color-on-success); }
  .astryx-step[data-status='warning'] .astryx-step__bar,
  .astryx-step[data-status='warning'] .astryx-step__indicator { background: var(--color-warning); color: var(--color-on-warning); }
  .astryx-step[data-status='error'] .astryx-step__bar,
  .astryx-step[data-status='error'] .astryx-step__indicator { background: var(--color-error); color: var(--color-on-error); }

  .astryx-step__body,
  .astryx-step__control {
    display: flex;
    flex: 1;
    flex-direction: column;
    inline-size: 100%;
  }

  .astryx-step__control {
    all: unset;
    border-radius: var(--radius-element);
    cursor: pointer;
  }

  .astryx-step__control:active { background: var(--color-overlay-pressed); }
  .astryx-step__control:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .astryx-step__static,
  .astryx-step__label-row { align-items: center; display: flex; gap: var(--spacing-2); }
  .astryx-step__control,
  .astryx-step__static { padding: var(--spacing-2); }
  .astryx-step--density-compact .astryx-step__control,
  .astryx-step--density-compact .astryx-step__static { padding: var(--spacing-1) var(--spacing-2); }
  .astryx-step--density-spacious .astryx-step__control,
  .astryx-step--density-spacious .astryx-step__static { padding: var(--spacing-3); }

  .astryx-step__indicator {
    align-items: center;
    color: var(--color-accent);
    display: inline-flex;
    flex-shrink: 0;
    justify-content: center;
  }

  .astryx-step--not-started .astryx-step__indicator { color: var(--color-icon-secondary); }
  .astryx-step[data-disabled='true'] .astryx-step__indicator,
  .astryx-step[data-disabled='true'] .astryx-step__label { color: var(--color-text-disabled); opacity: 0.5; }
  .astryx-step__indicator--number {
    background: var(--color-background-muted);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
    inline-size: var(--spacing-5);
    line-height: 1;
    min-block-size: var(--spacing-5);
  }

  .astryx-step--completed .astryx-step__indicator--number,
  .astryx-step--in-progress .astryx-step__indicator--number { background: var(--color-accent); color: var(--color-on-accent); }
  .astryx-step__label {
    color: var(--color-text-primary);
    font: var(--font-body);
    font-size: var(--text-body-size);
    line-height: var(--text-body-leading);
  }

  .astryx-step--in-progress .astryx-step__label { font-weight: var(--font-weight-semibold); }
  .astryx-step--not-started .astryx-step__label,
  .astryx-step__optional,
  .astryx-step__optional-dot,
  .astryx-step__description { color: var(--color-text-secondary); }
  .astryx-step__description,
  .astryx-step__content {
    display: block;
    font-size: var(--text-supporting-size);
    line-height: var(--text-supporting-leading);
    padding-inline-start: var(--spacing-7);
  }

  @media (hover: hover) {
    .astryx-step__control:hover { background: var(--color-overlay-hover); }
  }
</style>
