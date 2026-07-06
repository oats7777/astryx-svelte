// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file table-plugin-utils.ts
 * @input Table plugins, columns, rows, and optional context-menu action providers
 * @output Small helpers for applying Svelte Table plugin transforms
 * @position Extracted Todo 8 helper for Table.svelte
 */

import type {
  DataDisplayRow,
  TableCellRenderProps,
  TableColumn,
  TableContextAction,
  TableContextActions,
  TablePlugin,
} from './types.js';

export function resolveContextActions(actions: TableContextActions | undefined): readonly TableContextAction[] {
  return typeof actions === 'function' ? actions() : actions ?? [];
}

export function headerCellProps(
  plugins: readonly TablePlugin[],
  column: TableColumn,
): TableCellRenderProps {
  return plugins.reduce<TableCellRenderProps>(
    (props, plugin) => plugin.transformHeaderCell?.(props, column) ?? props,
    {},
  );
}

export function bodyCellProps(
  plugins: readonly TablePlugin[],
  column: TableColumn,
  row: DataDisplayRow,
): TableCellRenderProps {
  return plugins.reduce<TableCellRenderProps>(
    (props, plugin) => plugin.transformBodyCell?.(props, column, row) ?? props,
    {},
  );
}
