// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Package metadata for @astryxdesign/svelte-lab
 * @output Public Svelte lab package marker value and type
 * @position Entry point for @astryxdesign/svelte-lab
 */

export const astryxSvelteLabPackage = {
  name: "@astryxdesign/svelte-lab",
  surface: "svelte-lab",
} as const;

export type AstryxSvelteLabPackage = typeof astryxSvelteLabPackage;
export * from './charts/index.js';
export * from './chat-reasoning/index.js';
export * from './circular-progress/index.js';
export * from './stepper/index.js';
export * from './schedule/index.js';
export * from './code-editor/index.js';
export * from './svg-icon/index.js';
export * from './three-d/index.js';
