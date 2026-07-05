// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Shared rich-surfaces data contracts
 * @output Typed command, media, chat, code, and markdown shapes
 * @position Shared type definitions for Todo 14 rich-surfaces components
 */

export type CommandItem = {
  readonly id: string;
  readonly label: string;
  readonly value?: string;
  readonly isDisabled?: boolean;
  readonly auxiliaryData?: Readonly<Record<string, unknown>>;
};

export type SearchSource = {
  readonly bootstrap?: () => readonly CommandItem[] | Promise<readonly CommandItem[]>;
  readonly search: (query: string) => readonly CommandItem[] | Promise<readonly CommandItem[]>;
};

export type MediaItem = {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
};

export type ChatRole = 'assistant' | 'system' | 'user';

export type ChatMessage = {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly isStreaming?: boolean;
  readonly metadata?: string;
};

export type TokenSegment = {
  readonly kind: 'text' | 'token';
  readonly text: string;
  readonly tokenType?: string;
};

export type TokenLine = {
  readonly number: number;
  readonly segments: readonly TokenSegment[];
};
