// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Stepper and Step Svelte component modules plus shared types
 * @output Local Stepper exports for the private Svelte lab package
 * @position Directory-level exports for Todo 17 Stepper slice
 */

export {default as Step} from './Step.svelte';
export {default as Stepper} from './Stepper.svelte';
export type {
  StepIndicatorPreset,
  StepProgress,
  StepStatus,
  StepperDensity,
  StepperOrientation,
} from './types.js';
