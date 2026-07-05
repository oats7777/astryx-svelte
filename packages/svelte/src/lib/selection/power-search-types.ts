// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file power-search-types.ts
 * @input None
 * @output Typed PowerSearch config, filter, and source contracts
 * @position Self-contained Todo 10 PowerSearch type model for @astryxdesign/svelte
 */

export type PowerSearchFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'enum_list'
  | 'string_list';

export type PowerSearchFilterValue =
  | {readonly type: 'empty'}
  | {readonly type: 'string'; readonly value: string}
  | {readonly type: 'string_list'; readonly value: readonly string[]}
  | {readonly type: 'integer'; readonly value: number}
  | {readonly type: 'float'; readonly value: number}
  | {readonly type: 'date_absolute'; readonly unixSeconds: number}
  | {readonly type: 'enum'; readonly value: string}
  | {readonly type: 'enum_list'; readonly value: readonly string[]};

export type PowerSearchOperatorValue =
  | {readonly type: 'empty'}
  | {readonly type: 'string'}
  | {readonly type: 'string_list'}
  | {readonly type: 'integer'}
  | {readonly type: 'float'}
  | {readonly type: 'date_absolute'}
  | {readonly type: 'enum'; readonly values: readonly PowerSearchEnumItem[]}
  | {readonly type: 'enum_list'; readonly values: readonly PowerSearchEnumItem[]};

export type PowerSearchChangeType = 'add' | 'edit' | 'remove' | 'clear';

export interface PowerSearchProps {
  readonly label?: string;
  readonly placeholder?: string;
  readonly config: PowerSearchConfig;
  readonly filters: readonly PowerSearchFilter[];
  readonly onChange: (
    filters: readonly PowerSearchFilter[],
    changeType: PowerSearchChangeType,
    index: number,
  ) => void;
}

export interface PowerSearchEnumItem {
  readonly value: string;
  readonly label: string;
}

export interface PowerSearchFieldDefinition {
  readonly key: string;
  readonly type: PowerSearchFieldType;
  readonly label?: string;
  readonly enumValues?: readonly PowerSearchEnumItem[];
}

export interface PowerSearchOperator {
  readonly key: string;
  readonly label: string;
  readonly value: PowerSearchOperatorValue;
}

export interface PowerSearchField {
  readonly key: string;
  readonly label: string;
  readonly operators: readonly PowerSearchOperator[];
  readonly defaultOperator?: string;
  readonly typeaheadAliases?: readonly string[];
  readonly typeaheadMinQueryLength?: number;
  readonly isValueMatchAllowed?: boolean;
}

export interface PowerSearchConfig {
  readonly name: string;
  readonly fields: readonly PowerSearchField[];
  readonly contentSearchFieldKey?: string;
}

export interface PowerSearchFilter {
  readonly field: string;
  readonly operator: string;
  readonly value: PowerSearchFilterValue;
  readonly isReadOnly?: boolean;
}

export interface PowerSearchAuxData {
  readonly fieldKey: string;
  readonly operatorKey?: string;
  readonly filterValue?: PowerSearchFilterValue;
  readonly filterIndex?: number;
}

export interface PowerSearchItem {
  readonly id: string;
  readonly label: string;
  readonly auxiliaryData?: PowerSearchAuxData;
}

export interface PowerSearchSource<T extends PowerSearchItem = PowerSearchItem> {
  search(query: string): Promise<readonly T[]> | readonly T[];
  bootstrap(): Promise<readonly T[]> | readonly T[];
  cancel?(): void;
}
