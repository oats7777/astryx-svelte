// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file interactive-role-context.ts
 * @input Interactive role values and Svelte context boundary
 * @output Role normalization, provider, consumer, and fallback attributes
 * @position Svelte replacement for core InteractiveRoleContext
 */

import {getContext, setContext} from 'svelte';

export type InteractiveRole = 'button' | 'link';

export type InteractiveRoleAttributes = {
  readonly role: InteractiveRole;
  readonly tabIndex: 0;
};

const ROLE_CONTEXT = Symbol('astryx-interactive-role-context');

export function normalizeInteractiveRole(value: string | undefined): InteractiveRole {
  return value === 'link' ? 'link' : 'button';
}

export function interactiveRoleFallback(value: string | undefined): InteractiveRoleAttributes {
  return {role: normalizeInteractiveRole(value), tabIndex: 0};
}

export function setInteractiveRoleContext(value: string | undefined): InteractiveRole {
  const normalized = normalizeInteractiveRole(value);
  setContext(ROLE_CONTEXT, normalized);
  return normalized;
}

export function getInteractiveRoleContext(fallback: InteractiveRole = 'button'): InteractiveRole {
  return getContext<InteractiveRole>(ROLE_CONTEXT) ?? fallback;
}
