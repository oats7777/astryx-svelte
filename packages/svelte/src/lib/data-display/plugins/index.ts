// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Table rows plus local sort, filter, pagination, selection, resize, and sticky configs
 * @output Pure plugin helpers for the Svelte Table port
 * @position Local replacement APIs for core Table plugins without shared export integration
 */

import type {DataDisplayRow, TableSortState} from '../types.js';

export type TableFilterState = {
  readonly query?: string;
  readonly keys?: readonly string[];
};

export type TablePaginationState = {
  readonly page: number;
  readonly pageSize: number;
};

export type TableColumnResizeState = Readonly<Record<string, number>>;
export type TableSelectionState = readonly string[];

function comparableValue(value: unknown): string | number {
  if (typeof value === 'number') {
    return value;
  }
  if (value == null) {
    return '';
  }
  return String(value).toLocaleLowerCase();
}

export function sortRows<Row extends DataDisplayRow>(
  rows: readonly Row[],
  sortState: TableSortState | null | undefined,
): readonly Row[] {
  if (sortState == null) {
    return rows;
  }

  return [...rows].sort((left, right) => {
    const leftValue = comparableValue(left[sortState.key]);
    const rightValue = comparableValue(right[sortState.key]);
    const direction = sortState.direction === 'asc' ? 1 : -1;

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

export function filterRows<Row extends DataDisplayRow>(
  rows: readonly Row[],
  filterState: TableFilterState,
): readonly Row[] {
  const query = filterState.query?.trim().toLocaleLowerCase();
  if (!query) {
    return rows;
  }

  return rows.filter((row) => {
    const values =
      filterState.keys == null || filterState.keys.length === 0
        ? Object.values(row)
        : filterState.keys.map((key) => row[key]);
    return values.some((value) => String(value ?? '').toLocaleLowerCase().includes(query));
  });
}

export function paginateRows<Row extends DataDisplayRow>(
  rows: readonly Row[],
  pagination: TablePaginationState,
): readonly Row[] {
  const page = Math.max(1, pagination.page);
  const pageSize = Number.isFinite(pagination.pageSize)
    ? Math.max(1, Math.floor(pagination.pageSize))
    : 1;
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function nextSortState(current: TableSortState | null, key: string): TableSortState {
  if (current?.key !== key) {
    return {key, direction: 'asc'};
  }
  return {key, direction: current.direction === 'asc' ? 'desc' : 'asc'};
}

export function resizeColumnWidth(width: number, delta: number, minimum = 48): number {
  return Math.max(minimum, width + delta);
}
