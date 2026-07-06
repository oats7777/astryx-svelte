// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte rich content, media, command, code, and motion modules
 * @output Public rich-surface exports for @astryxdesign/svelte
 * @position Todo 14 shared package integration barrel
 */

export {default as Carousel} from './Carousel.svelte';
export {default as Chat} from './Chat.svelte';
export {default as Code} from './Code.svelte';
export {default as CodeBlock} from './CodeBlock.svelte';
export {default as Collapsible} from './Collapsible.svelte';
export {default as CommandPalette} from './CommandPalette.svelte';
export {default as Lightbox} from './Lightbox.svelte';
export {default as Markdown} from './Markdown.svelte';
export {default as Resizable} from './Resizable.svelte';
export {clampIndex, wrappedIndex} from './media-utils.js';
export {clampSize, keyboardSize} from './resize-utils.js';
export {commandGroup, commandItemId, enabledCommands, groupCommands, nextActiveIndex} from './command-utils.js';
export {isHighlightedLine, tokenizeCode} from './code-utils.js';
export {parseInline, parseMarkdown} from './markdown-utils.js';
export type {CommandGroup} from './command-utils.js';
export type {InlineNode, MarkdownBlock} from './markdown-utils.js';
export type {ResizeOrientation} from './resize-utils.js';
export type {
  ChatMessage,
  ChatRole,
  CommandItem,
  MediaItem,
  SearchSource,
  TokenLine,
  TokenSegment,
} from './types.js';
