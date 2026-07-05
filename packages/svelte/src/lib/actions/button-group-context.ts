// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file button-group-context.ts
 * @input Svelte context API and ButtonGroup disabled state
 * @output Provider helpers for grouped Button descendants
 * @position Svelte equivalent of core ButtonGroup context
 */

import {getContext, setContext} from 'svelte';

export type ButtonGroupValue = Readonly<{
  readonly isDisabled: boolean;
}>;

const BUTTON_GROUP_CONTEXT = Symbol('astryx-svelte-button-group');

export function getButtonGroupValue(): ButtonGroupValue | null {
  return getContext<ButtonGroupValue | null>(BUTTON_GROUP_CONTEXT) ?? null;
}

export function setButtonGroupValue(value: ButtonGroupValue): void {
  setContext<ButtonGroupValue>(BUTTON_GROUP_CONTEXT, value);
}
