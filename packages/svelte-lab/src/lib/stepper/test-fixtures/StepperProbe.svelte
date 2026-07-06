<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file StepperProbe.svelte
   * @input Test props for Stepper and Step composition
   * @output Rendered step sequence for DOM and interaction assertions
   * @position Vitest fixture for the private Svelte lab Stepper slice
   */

  import Step from '../Step.svelte';
  import Stepper from '../Stepper.svelte';
  import type {StepStatus, StepperDensity, StepperOrientation} from '../types.js';

  let {
    activeStep = 1,
    orientation = 'horizontal',
    label = 'Checkout progress',
    density = 'balanced',
    status = undefined,
    disabledFirst = false,
    onStepClick = undefined,
  }: {
    readonly activeStep?: number;
    readonly orientation?: StepperOrientation;
    readonly label?: string;
    readonly density?: StepperDensity;
    readonly status?: StepStatus;
    readonly disabledFirst?: boolean;
    readonly onStepClick?: (index: number) => void;
  } = $props();
</script>

<Stepper {activeStep} {orientation} {label} {density} {onStepClick}>
  <Step step={0} label="Cart" description="Review items" isDisabled={disabledFirst} />
  <Step step={1} label="Payment" status={status} isOptional indicator="number" />
  <Step step={2} label="Review">Confirm order details</Step>
</Stepper>
