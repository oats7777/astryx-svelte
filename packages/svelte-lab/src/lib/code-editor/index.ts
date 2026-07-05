// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Private Svelte lab CodeEditor module
 * @output Local CodeEditor exports without root package integration
 * @position Package-local barrel for the experimental Svelte code editor
 */

export {default as CodeEditor} from './CodeEditor.svelte';
export type {CodeEditorProps, CodeEditorSize} from './types.js';
