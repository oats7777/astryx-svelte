// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file link-context.ts
 * @input Svelte context API and optional router link component
 * @output Provider helpers for action-family link rendering
 * @position Svelte equivalent of core LinkProvider context
 */

import {getContext, setContext} from 'svelte';
import type {LinkComponent} from './action-utils.js';

export type LinkProviderValue = Readonly<{
  readonly component: LinkComponent;
}>;

const LINK_PROVIDER_CONTEXT = Symbol('astryx-svelte-link-provider');

export function getLinkProviderValue(): LinkProviderValue | null {
  return getContext<LinkProviderValue | null>(LINK_PROVIDER_CONTEXT) ?? null;
}

export function setLinkProviderValue(value: LinkProviderValue): void {
  setContext<LinkProviderValue>(LINK_PROVIDER_CONTEXT, value);
}
