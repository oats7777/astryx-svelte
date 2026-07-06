// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepper-context.ts
 * @input Svelte context APIs and Stepper state
 * @output Context helpers for Stepper and Step communication
 * @position Private Svelte lab Stepper context layer
 */

import {getContext, setContext} from 'svelte';
import type {StepperDensity, StepperOrientation} from './types.js';

export type StepperContextValue = {
  readonly activeStep: number;
  readonly orientation: StepperOrientation;
  readonly onStepClick?: (index: number) => void;
  readonly density: StepperDensity;
};

type StepperContextReader = () => StepperContextValue;

const STEPPER_CONTEXT_KEY = Symbol('astryx-svelte-lab-stepper');

export function setStepperContext(readContext: StepperContextReader): void {
  setContext(STEPPER_CONTEXT_KEY, readContext);
}

export function getStepperContext(): StepperContextReader {
  const context = getContext<StepperContextReader | undefined>(STEPPER_CONTEXT_KEY);
  if (context == null) {
    throw new Error('Step must be rendered within Stepper.');
  }
  return context;
}
