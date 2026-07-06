// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte action-family components and shared interaction utilities
 * @output Public action, link, card, token, item, citation, and nav icon exports
 * @position Todo 8 action-family entrypoint for @astryxdesign/svelte
 */

export {default as Button} from './Button.svelte';
export {default as ButtonGroup} from './ButtonGroup.svelte';
export {default as Citation} from './Citation.svelte';
export type {CitationSource} from './Citation.svelte';
export {default as ClickableCard} from './ClickableCard.svelte';
export {default as IconButton} from './IconButton.svelte';
export {default as Item} from './Item.svelte';
export {default as Link} from './Link.svelte';
export {default as LinkProvider} from './LinkProvider.svelte';
export {default as NavIcon} from './NavIcon.svelte';
export {default as SelectableCard} from './SelectableCard.svelte';
export {default as ToggleButton} from './ToggleButton.svelte';
export {default as Token} from './Token.svelte';
export {
  actionClass,
  computeTargetAndRel,
  resolveInteractiveRole,
} from './action-utils.js';
export {FOCUSABLE_SELECTOR, announce} from './announce.js';
export {clickableContainer} from './clickable-container.js';
export {createTypeahead} from './typeahead.js';
export {gridNavigation} from './grid-navigation.js';
export {listNavigation} from './list-navigation.js';
export {longPress} from './long-press.js';
export {overflow} from './overflow.js';
export {scrollLock} from './scroll-lock.js';
export {scrollOverflow} from './scroll-overflow.js';
export {treeNavigation} from './tree-navigation.js';
export type {AnnounceFn, AnnouncePoliteness} from './announce.js';
export type {
  ActionColor,
  ActionSize,
  ActionVariant,
  InteractiveRole,
  LinkComponent,
  TargetRel,
} from './action-utils.js';
export type {ClickableContainerOptions} from './clickable-container.js';
export type {GridNavigationOptions} from './grid-navigation.js';
export type {ListNavigationOptions} from './list-navigation.js';
export type {LongPressOptions, LongPressPoint} from './long-press.js';
export type {OverflowOptions, OverflowState} from './overflow.js';
export type {ScrollOverflowState} from './scroll-overflow.js';
export type {TreeNavigationOptions} from './tree-navigation.js';
export type {TypeaheadController, TypeaheadOptions} from './typeahead.js';
