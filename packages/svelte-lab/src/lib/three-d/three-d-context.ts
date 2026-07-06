// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file three-d-context.ts
 * @input Svelte context API and computed 3D chart state
 * @output Context setters/getters for 3D descendants
 * @position Shared state channel for private Svelte lab 3D primitives
 */

import {getContext, setContext} from 'svelte';
import type {ThreeDContextValue} from './types.js';

const threeDKey = Symbol('astryx-svelte-lab-three-d');

interface ContextSource {
  read(): ThreeDContextValue;
}

export function setThreeDContext(read: () => ThreeDContextValue): void {
  setContext(threeDKey, {read});
}

export function useThreeDContext(): ThreeDContextValue {
  return getContext<ContextSource>(threeDKey).read();
}
