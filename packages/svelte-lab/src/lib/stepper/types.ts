// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None
 * @output Stepper public prop literal types
 * @position Shared types for private Svelte lab Stepper
 */

export type StepStatus = 'accent' | 'success' | 'warning' | 'error';
export type StepProgress = 'completed' | 'in-progress' | 'not-started';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperDensity = 'compact' | 'balanced' | 'spacious';
export type StepIndicatorPreset = 'auto' | 'number' | 'none';
