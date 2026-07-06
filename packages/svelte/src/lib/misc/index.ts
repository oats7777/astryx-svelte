// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte context replacement helpers for miscellaneous core surfaces
 * @output Public misc exports for @astryxdesign/svelte
 * @position Todo 14 shared package integration barrel
 */

export {
  getInteractiveRoleContext,
  interactiveRoleFallback,
  normalizeInteractiveRole,
  setInteractiveRoleContext,
} from './interactive-role-context.js';
export {
  getSizeContext,
  normalizeSize,
  setSizeContext,
  sizeClass,
} from './size-context.js';
export type {InteractiveRole, InteractiveRoleAttributes} from './interactive-role-context.js';
export type {AstryxSize} from './size-context.js';
