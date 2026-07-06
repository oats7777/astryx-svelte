// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte component type and package metadata for @astryxdesign/svelte
 * @output Public Svelte package marker and component helper types
 * @position Entry point for @astryxdesign/svelte
 */

import type { Component } from "svelte";
export * from './icon/index.js';
export * from './foundations/index.js';
export * from './forms/index.js';
export * from './overlays/index.js';
export * from './selection/index.js';
export * from './navigation/index.js';
export {
  DataDisplayPagination,
  List,
  MetadataList,
  Outline,
  ProgressBar,
  Table,
  TreeList,
  filterRows,
  nextSortState,
  paginateRows,
  resizeColumnWidth,
  sortRows,
} from './data-display/index.js';
export type {
  DataDisplayRow,
  ListItem,
  MetadataListItem,
  OutlineItem,
  SortDirection,
  TableColumn,
  TableColumnResizeState,
  TableFilterState,
  TablePaginationState,
  TableRowKeyGetter,
  TableSelectionHandler,
  TableSelectionState,
  TableSortHandler,
  TableSortState,
  TreeItem,
  VisibleTreeItem,
} from './data-display/index.js';
export {
  Carousel,
  Chat,
  Code,
  CodeBlock,
  Collapsible,
  CommandPalette,
  Lightbox,
  Markdown,
  Resizable,
  clampIndex,
  clampSize,
  commandGroup,
  commandItemId,
  enabledCommands,
  groupCommands,
  isHighlightedLine,
  keyboardSize,
  nextActiveIndex,
  parseInline,
  parseMarkdown,
  tokenizeCode,
  wrappedIndex,
} from './rich-surfaces/index.js';
export type {
  ChatMessage,
  ChatRole,
  CommandGroup,
  CommandItem,
  InlineNode,
  MarkdownBlock,
  MediaItem,
  ResizeOrientation,
  SearchSource as RichSurfaceSearchSource,
  TokenLine,
  TokenSegment,
} from './rich-surfaces/index.js';
export {
  getInteractiveRoleContext,
  getSizeContext,
  interactiveRoleFallback,
  normalizeInteractiveRole,
  normalizeSize,
  setInteractiveRoleContext,
  setSizeContext,
  sizeClass,
} from './misc/index.js';
export type {
  AstryxSize,
  InteractiveRole as MiscInteractiveRole,
  InteractiveRoleAttributes,
} from './misc/index.js';
export * from './theme/index.js';
export * from './tokens.js';
export * from './actions/index.js';
export {scrollLock} from './overlays/index.js';
export {
  createMediaQueryStore,
  createStreamingTextStore,
  observeResize,
  parseStyleKey,
  themeDataAttributes,
  themeProps,
  unobserveResize,
} from './utils/index.js';
export type {
  ClassProps,
  ClassValue,
  MediaQueryOptions,
  ResizeCallback,
  StreamingTextOptions,
  StreamingTextSpeed,
  StreamingTextStore,
  ThemeDataAttributes,
  ThemeProps,
} from './utils/index.js';

export const astryxSveltePackage = {
  name: "@astryxdesign/svelte",
  surface: "svelte",
} as const;

export type AstryxSveltePackage = typeof astryxSveltePackage;
export type AstryxSvelteComponent<Props extends Record<string, unknown> = Record<string, never>> =
  Component<Props>;
