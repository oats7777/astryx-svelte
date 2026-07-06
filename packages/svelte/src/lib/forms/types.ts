// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Form component state and item contracts
 * @output Shared Svelte form prop types
 * @position Type model for @astryxdesign/svelte form controls
 */

export type FieldStatusType = 'warning' | 'error' | 'success';

export type FieldStatusInput = {
  readonly type: FieldStatusType;
  readonly message?: string;
};

export type SelectItem = {
  readonly label: string;
  readonly value: string;
  readonly description?: string;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
};

export type InputSize = 'sm' | 'md' | 'lg';

export type FormLayoutDirection = 'vertical' | 'horizontal' | 'horizontal-labels';

export type StringChangeHandler = (value: string, event: Event) => void | Promise<void>;
export type NullableStringChangeHandler = (value: string | null, event: Event) => void | Promise<void>;
export type BooleanChangeHandler = (value: boolean, event: Event) => void | Promise<void>;
export type NumberChangeHandler = (value: number | null, event: Event) => void | Promise<void>;
export type StringArrayChangeHandler = (value: readonly string[], event: Event) => void | Promise<void>;
export type FileChangeHandler = (value: readonly File[] | null, event: Event) => void | Promise<void>;
