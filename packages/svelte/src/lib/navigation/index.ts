// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Svelte navigation, app shell, and layout modules
 * @output Public navigation-family exports for @astryxdesign/svelte
 * @position Todo 12 shared package integration barrel
 */

export {default as AppShell} from './AppShell.svelte';
export {default as Breadcrumbs} from './Breadcrumbs.svelte';
export {default as Layout} from './Layout.svelte';
export {default as MobileNav} from './MobileNav.svelte';
export {default as NavItem} from './NavItem.svelte';
export {default as NavMenu} from './NavMenu.svelte';
export {default as OverflowList} from './OverflowList.svelte';
export {default as NavigationPagination} from './Pagination.svelte';
export {default as Pagination} from './Pagination.svelte';
export {default as SegmentedControl} from './SegmentedControl.svelte';
export {default as SideNav} from './SideNav.svelte';
export {default as TabList} from './TabList.svelte';
export {default as Toolbar} from './Toolbar.svelte';
export {default as TopNav} from './TopNav.svelte';
export {
  breakpointQuery,
  cx,
  enabledOptions,
  itemValue,
  nextNavigationId,
  nextOption,
} from './navigation-utils.js';
export type {
  ChoiceOption,
  MenuItemModel,
  MobileNavConfig,
  NavItemModel,
  NavValue,
  PageRangeItem,
  TabMenuModel,
  ToolbarAction,
} from './types.js';
