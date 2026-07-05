// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file action-utils.ts
 * @input Link, button, card, and token interaction props
 * @output Shared role, link, class, and click utilities for Svelte actions
 * @position Todo 8 utility layer for action-family components
 */

import type {Component} from 'svelte';
import {classNames, type ClassValue} from '../internal/class-names.js';

const BLANK_TARGET_REL_TOKENS = ['noopener', 'noreferrer'] as const;
const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[data-pressable-container]',
].join(',');

export type InteractiveRole = 'link' | 'button' | 'inert';
export type ActionSize = 'sm' | 'md' | 'lg';
export type ActionVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ActionColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';
export type LinkComponent = Component<Record<string, unknown>>;

export type TargetRel = Readonly<{
  readonly rel: string | undefined;
  readonly target: string | undefined;
}>;

export type InteractiveRoleOptions = Readonly<{
  readonly href?: string;
  readonly onClick?: ((event: MouseEvent) => void) | null;
  readonly isDisabled?: boolean;
  readonly contextRole?: InteractiveRole | null;
}>;

export function computeTargetAndRel(
  target: string | undefined,
  rel: string | undefined,
): TargetRel {
  if (target !== '_blank') {
    return {target, rel};
  }

  const tokens = rel?.split(/\s+/).filter(Boolean) ?? [];
  for (const token of BLANK_TARGET_REL_TOKENS) {
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
  }

  return {target, rel: tokens.join(' ')};
}

export function resolveInteractiveRole({
  href,
  onClick,
  isDisabled = false,
  contextRole = null,
}: InteractiveRoleOptions): InteractiveRole {
  if (href != null && !isDisabled) {
    return 'link';
  }
  if (href != null && isDisabled) {
    return 'button';
  }
  if (onClick != null) {
    return 'button';
  }
  return contextRole ?? 'inert';
}

export function actionClass(...values: readonly ClassValue[]): string {
  return classNames(...values);
}

export function hasInteractiveAncestor(
  target: EventTarget | null,
  root: EventTarget | null,
): boolean {
  if (!(target instanceof Element) || !(root instanceof Element)) {
    return false;
  }

  let current: Element | null = target;
  while (current != null && current !== root && current !== document.body) {
    if (current.matches(INTERACTIVE_SELECTOR)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export function callWhenEnabled(
  isDisabled: boolean,
  event: MouseEvent,
  handler: ((event: MouseEvent) => void) | undefined,
): void {
  if (isDisabled) {
    event.preventDefault();
    return;
  }
  handler?.(event);
}
