// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Navigation component prop models
 * @output Shared readonly TypeScript contracts for Svelte navigation components
 * @position Todo 12 navigation type layer
 */

export type NavValue = string;

export type NavItemModel = {
  readonly label: string;
  readonly value?: NavValue;
  readonly href?: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly items?: readonly NavItemModel[];
};

export type MenuItemModel = {
  readonly label: string;
  readonly value: NavValue;
  readonly disabled?: boolean;
};

export type ChoiceOption = {
  readonly label: string;
  readonly value: NavValue;
  readonly disabled?: boolean;
};

export type MobileNavConfig = {
  readonly breakpoint?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  readonly defaultIsMobile?: boolean;
};

export type TabMenuModel = {
  readonly label: string;
  readonly options: readonly ChoiceOption[];
};

export type ToolbarAction = {
  readonly label: string;
  readonly value: NavValue;
  readonly disabled?: boolean;
};

export type PageRangeItem = number | '...';
