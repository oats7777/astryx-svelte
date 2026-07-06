// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FormLayoutContext.ts
 * @input Svelte form layout direction values
 * @output Context helpers for field alignment
 * @position Context bridge for Svelte form layout components
 */

import {getContext, setContext} from 'svelte';
import type {FormLayoutDirection} from './types.js';

type DirectionReader = () => FormLayoutDirection;

const FORM_LAYOUT_CONTEXT = Symbol('astryx-form-layout');

export function setFormLayoutDirection(direction: DirectionReader): void {
  setContext(FORM_LAYOUT_CONTEXT, direction);
}

export function getFormLayoutDirection(): FormLayoutDirection {
  return getContext<DirectionReader>(FORM_LAYOUT_CONTEXT)?.() ?? 'vertical';
}
