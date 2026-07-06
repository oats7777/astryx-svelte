// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file table-utils.ts
 * @input Table row, column, selection, and width state
 * @output Presentation helpers for Table.svelte
 * @position Pure table formatting helpers for Todo 13 data-display
 */

import type {DataDisplayRow, TableColumn, TableSortState} from './types.js';

export function defaultGetRowKey(row: DataDisplayRow, index: number): string {
  const id = row.id ?? row.key;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : String(index);
}

export function columnLabel(column: TableColumn): string {
  return column.header ?? column.key;
}

export function columnWidth(
  column: TableColumn,
  resizedWidths: Readonly<Record<string, number>>,
): number | undefined {
  const resized = resizedWidths[column.key];
  if (resized != null) {
    return resized;
  }
  return typeof column.width === 'number' ? column.width : undefined;
}

export function cellStyle(
  column: TableColumn,
  resizedWidths: Readonly<Record<string, number>>,
  isSelectable: boolean,
): string | undefined {
  const declarations: string[] = [];
  const width = columnWidth(column, resizedWidths);
  if (width != null) {
    declarations.push(`width: ${width}px`);
  }
  if (typeof column.width === 'string') {
    declarations.push(`width: ${column.width}`);
  }
  if (column.align === 'end') {
    declarations.push('text-align: end');
  }
  if (column.align === 'center') {
    declarations.push('text-align: center');
  }
  if (column.sticky === 'start') {
    declarations.push('position: sticky', `left: ${isSelectable ? 44 : 0}px`, 'z-index: 1');
  }
  if (column.sticky === 'end') {
    declarations.push('position: sticky', 'right: 0px', 'z-index: 1');
  }
  return declarations.length === 0 ? undefined : declarations.join('; ');
}

export function ariaSort(
  column: TableColumn,
  sortState: TableSortState | null | undefined,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) {
    return undefined;
  }
  if (sortState?.key !== column.key) {
    return 'none';
  }
  return sortState.direction === 'asc' ? 'ascending' : 'descending';
}
