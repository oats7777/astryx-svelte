// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Data-display component configuration
 * @output Shared Svelte data-display prop and plugin types
 * @position Type model for Todo 13 data-display components
 */

export type DataDisplayRow = Readonly<Record<string, unknown>>;

export type SortDirection = 'asc' | 'desc';

export type TableSortState = {
  readonly key: string;
  readonly direction: SortDirection;
};

export type TableColumn<Row extends DataDisplayRow = DataDisplayRow> = {
  readonly key: Extract<keyof Row, string> | string;
  readonly header?: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly width?: number | string;
  readonly align?: 'start' | 'center' | 'end';
  readonly sticky?: 'start' | 'end';
  readonly resizable?: boolean;
};

export type TableContextAction = {
  readonly id: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly checked?: boolean;
  readonly group?: string;
  readonly onSelect: () => void;
};

export type TableContextActions =
  | readonly TableContextAction[]
  | (() => readonly TableContextAction[]);

export type TableCellRenderProps = {
  readonly contextMenuActions?: TableContextActions;
};

export type TablePlugin<Row extends DataDisplayRow = DataDisplayRow> = {
  readonly transformHeaderCell?: (
    props: TableCellRenderProps,
    column: TableColumn<Row>,
  ) => TableCellRenderProps;
  readonly transformBodyCell?: (
    props: TableCellRenderProps,
    column: TableColumn<Row>,
    row: Row,
  ) => TableCellRenderProps;
};

export type TableSelectionHandler = (keys: readonly string[]) => void;
export type TableSortHandler = (state: TableSortState | null) => void;
export type TableRowKeyGetter<Row extends DataDisplayRow = DataDisplayRow> = (
  row: Row,
  index: number,
) => string;

export type ListItem = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly meta?: string;
};

export type MetadataListItem = {
  readonly term: string;
  readonly description: string;
};

export type OutlineItem = {
  readonly id: string;
  readonly title: string;
  readonly level?: 2 | 3 | 4 | 5 | 6;
};

export type TreeItem = {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  readonly children?: readonly TreeItem[];
};

export type VisibleTreeItem = TreeItem & {
  readonly depth: number;
  readonly parentKey: string | undefined;
  readonly position: number;
  readonly setSize: number;
};
