// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Code editor public properties
 * @output Typed Svelte CodeEditor contract
 * @position Type foundation for the private Svelte lab code editor
 */

export type CodeEditorSize = 'sm' | 'md';

export interface CodeEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly language?: string;
  readonly hasLineNumbers?: boolean;
  readonly isReadOnly?: boolean;
  readonly placeholder?: string;
  readonly maxHeight?: number | string;
  readonly size?: CodeEditorSize;
  readonly 'aria-label'?: string;
}
