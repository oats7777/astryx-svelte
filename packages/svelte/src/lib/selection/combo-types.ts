// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file combo-types.ts
 * @input Selection, typeahead, and tokenizer component contracts
 * @output Shared strict TypeScript types for Todo 10 Svelte selection controls
 * @position Local type model for packages/svelte/src/lib/selection
 */

export type ComboOptionData = {
  readonly label: string;
  readonly value: string;
  readonly description?: string;
  readonly isDisabled?: boolean;
};

export type ComboDivider = {
  readonly type: 'divider';
};

export type ComboSection = {
  readonly type: 'section';
  readonly label: string;
  readonly options: readonly (string | ComboOptionData)[];
};

export type ComboOption = string | ComboOptionData | ComboDivider | ComboSection;

export type SearchableItem = {
  readonly id: string;
  readonly label: string;
  readonly value?: string;
  readonly isDisabled?: boolean;
};

export type MaybePromise<T> = T | Promise<T>;

export type SearchSource<T extends SearchableItem = SearchableItem> = {
  readonly bootstrap?: () => MaybePromise<readonly T[]>;
  readonly search: (query: string) => MaybePromise<readonly T[]>;
  readonly cancel?: () => void;
};

export type SearchSourceInput<T extends SearchableItem = SearchableItem> =
  | readonly T[]
  | ((query: string) => MaybePromise<readonly T[]>)
  | SearchSource<T>;

export type TokenizerToken = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};

export type StringChangeHandler = (value: string | null, event: Event) => void | Promise<void>;
export type StringArrayChangeHandler = (value: readonly string[], event: Event) => void | Promise<void>;
export type TypeaheadChangeHandler = (item: SearchableItem | null, event: Event) => void | Promise<void>;
export type TokenizerChangeHandler = (tokens: readonly TokenizerToken[], event: Event) => void | Promise<void>;
