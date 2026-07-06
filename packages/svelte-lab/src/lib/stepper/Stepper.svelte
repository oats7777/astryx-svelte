<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Stepper.svelte
   * @input Active step, orientation, density, label, click callback, and Step children
   * @output Ordered step progress sequence with Svelte context
   * @position Private Svelte lab port of Stepper
   */

  import type {Snippet} from 'svelte';
  import {setStepperContext} from './stepper-context.js';
  import type {StepperDensity, StepperOrientation} from './types.js';

  type Props = {
    readonly activeStep: number;
    readonly children?: Snippet;
    readonly orientation?: StepperOrientation;
    readonly onStepClick?: (index: number) => void;
    readonly label?: string;
    readonly density?: StepperDensity;
    readonly class?: string;
    readonly 'data-testid'?: string;
  };

  let {
    activeStep,
    children,
    orientation = 'horizontal',
    onStepClick = undefined,
    label = 'Progress',
    density = 'balanced',
    class: className = undefined,
    'data-testid': testId = undefined,
  }: Props = $props();

  setStepperContext(() => ({activeStep, orientation, onStepClick, density}));
  const rootClass = $derived(`astryx-stepper astryx-stepper--${orientation}${className == null ? '' : ` ${className}`}`);
</script>

<ol class={rootClass} aria-label={label} data-astryx-stepper data-orientation={orientation} data-testid={testId}>
  {#if children}
    {@render children()}
  {/if}
</ol>

<style>
  .astryx-stepper {
    display: flex;
    gap: 2px;
    inline-size: 100%;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .astryx-stepper--horizontal {
    align-items: flex-start;
    flex-direction: row;
  }

  .astryx-stepper--vertical {
    flex-direction: column;
  }
</style>
