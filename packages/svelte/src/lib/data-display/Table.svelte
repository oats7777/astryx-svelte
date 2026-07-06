<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Table.svelte
   * @input Row data, column config, local plugin state, and table callbacks
   * @output Semantic table with sorting, filtering, pagination, selection, resize, and sticky columns
   * @position Svelte/Tailwind port of core Table without shared export integration
   */

  import Pagination from './Pagination.svelte';
  import TableContextMenu from './TableContextMenu.svelte';
  import {
    filterRows,
    nextSortState,
    paginateRows,
    resizeColumnWidth,
    sortRows,
  } from './plugins/index.js';
  import {bodyCellProps, headerCellProps, resolveContextActions} from './table-plugin-utils.js';
  import {tableScrollRegion} from './table-scroll-region.js';
  import {
    ariaSort,
    cellStyle,
    columnLabel,
    columnWidth,
    defaultGetRowKey,
  } from './table-utils.js';
  import type {
    DataDisplayRow,
    TableColumn,
    TableContextAction,
    TableContextActions,
    TablePlugin,
    TableRowKeyGetter,
    TableSelectionHandler,
    TableSortHandler,
    TableSortState,
  } from './types.js';

  let {
    rows = [],
    columns = [],
    caption = undefined,
    filterText = '',
    filterKeys = undefined,
    pageSize = 25,
    page = 1,
    isSelectable = false,
    selectedKeys = undefined,
    sortState = undefined,
    isLoading = false,
    emptyMessage = 'No rows',
    getRowKey = defaultGetRowKey,
    onSelectionChange = undefined,
    onSortChange = undefined,
    plugins = [],
  }: {
    readonly rows?: readonly DataDisplayRow[];
    readonly columns?: readonly TableColumn[];
    readonly caption?: string;
    readonly filterText?: string;
    readonly filterKeys?: readonly string[];
    readonly pageSize?: number;
    readonly page?: number;
    readonly isSelectable?: boolean;
    readonly selectedKeys?: readonly string[];
    readonly sortState?: TableSortState | null;
    readonly isLoading?: boolean;
    readonly emptyMessage?: string;
    readonly getRowKey?: TableRowKeyGetter;
    readonly onSelectionChange?: TableSelectionHandler;
    readonly onSortChange?: TableSortHandler;
    readonly plugins?: readonly TablePlugin[];
  } = $props();

  let localPage = $state(1);
  let localSort = $state<TableSortState | null>(null);
  let localSelectedKeys = $state<readonly string[]>([]);
  let resizedWidths = $state<Readonly<Record<string, number>>>({});
  let contextMenu = $state<{
    readonly actions: readonly TableContextAction[];
    readonly x: number;
    readonly y: number;
  } | null>(null);
  let activeResize:
    | {
        readonly key: string;
        readonly startX: number;
        readonly startWidth: number;
      }
    | null = null;

  const effectiveSort = $derived(sortState === undefined ? localSort : sortState);
  const selection = $derived(selectedKeys ?? localSelectedKeys);
  const filterableKeys = $derived(filterKeys ?? columns.filter((column) => column.filterable).map((column) => column.key));
  const filteredRows = $derived(filterRows(rows, {query: filterText, keys: filterableKeys}));
  const sortedRows = $derived(sortRows(filteredRows, effectiveSort));
  const visibleRows = $derived(paginateRows(sortedRows, {page: localPage, pageSize}));
  const columnCount = $derived(columns.length + (isSelectable ? 1 : 0));

  $effect(() => {
    localPage = page;
  });

  function sortBy(column: TableColumn): void {
    if (!column.sortable) {
      return;
    }
    const next = nextSortState(effectiveSort, column.key);
    localSort = next;
    localPage = 1;
    onSortChange?.(next);
  }

  function setPage(nextPage: number): void {
    localPage = nextPage;
  }

  function setSelected(key: string, checked: boolean): void {
    const next = checked ? [key] : selection.filter((selectedKey) => selectedKey !== key);
    localSelectedKeys = next;
    onSelectionChange?.(next);
  }

  function startResize(event: PointerEvent, column: TableColumn): void {
    if (column.resizable === false) {
      return;
    }
    event.preventDefault();
    activeResize = {
      key: column.key,
      startX: event.clientX,
      startWidth: columnWidth(column, resizedWidths) ?? 120,
    };
    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', stopResize, {once: true});
  }

  function handleResizeMove(event: PointerEvent): void {
    if (activeResize == null) {
      return;
    }
    const width = resizeColumnWidth(activeResize.startWidth, event.clientX - activeResize.startX);
    resizedWidths = {...resizedWidths, [activeResize.key]: width};
  }

  function stopResize(): void {
    document.removeEventListener('pointermove', handleResizeMove);
    activeResize = null;
  }

  function openContextMenu(event: MouseEvent, actions: TableContextActions | undefined): void {
    const resolvedActions = resolveContextActions(actions);
    if (resolvedActions.length === 0) {
      return;
    }
    event.preventDefault();
    contextMenu = {actions: resolvedActions, x: event.clientX, y: event.clientY};
  }

  function selectContextAction(action: TableContextAction): void {
    if (action.disabled === true) {
      return;
    }
    action.onSelect();
    contextMenu = null;
  }
</script>

<div class="astryx-table-wrap" use:tableScrollRegion={caption ?? 'Table'}>
  <table class="astryx-table" aria-rowcount={visibleRows.length}>
    {#if caption}
      <caption>{caption}</caption>
    {/if}
    <thead>
      <tr>
        {#if isSelectable}
          <th class="astryx-table__select" scope="col">Select</th>
        {/if}
        {#each columns as column (column.key)}
          {@const headerProps = headerCellProps(plugins, column)}
          <th
            scope="col"
            data-column-key={column.key}
            data-sticky={column.sticky}
            aria-sort={ariaSort(column, effectiveSort)}
            style={cellStyle(column, resizedWidths, isSelectable)}
            oncontextmenu={(event) => openContextMenu(event, headerProps.contextMenuActions)}
          >
            {#if column.sortable}
              <button type="button" data-sort-key={column.key} aria-label={`Sort by ${columnLabel(column)}`} onclick={() => sortBy(column)}>
                {columnLabel(column)}
              </button>
            {:else}
              {columnLabel(column)}
            {/if}
            <span
              class="astryx-table__resize"
              data-resize-key={column.key}
              role="separator"
              aria-orientation="vertical"
              onpointerdown={(event) => startResize(event, column)}
            ></span>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if isLoading}
        <tr>
          <td colspan={columnCount}><div role="status">Loading rows</div></td>
        </tr>
      {:else if visibleRows.length === 0}
        <tr>
          <td colspan={columnCount} data-testid="table-empty">{emptyMessage}</td>
        </tr>
      {:else}
        {#each visibleRows as row, rowIndex (getRowKey(row, rowIndex))}
          {@const rowKey = getRowKey(row, rowIndex)}
          <tr data-row-key={rowKey} aria-selected={selection.includes(rowKey) ? 'true' : undefined}>
            {#if isSelectable}
              <td class="astryx-table__select">
                <input
                  type="checkbox"
                  aria-label={`Select row ${rowKey}`}
                  checked={selection.includes(rowKey)}
                  onchange={(event) => setSelected(rowKey, event.currentTarget.checked)}
                />
              </td>
            {/if}
            {#each columns as column (column.key)}
              {@const cellProps = bodyCellProps(plugins, column, row)}
              <td
                data-column-key={column.key}
                data-sticky={column.sticky}
                style={cellStyle(column, resizedWidths, isSelectable)}
                oncontextmenu={(event) => openContextMenu(event, cellProps.contextMenuActions)}
              >
                {String(row[column.key] ?? '')}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  <Pagination page={localPage} {pageSize} totalItems={sortedRows.length} onPageChange={setPage} />
  {#if contextMenu != null}
    <TableContextMenu
      actions={contextMenu.actions}
      x={contextMenu.x}
      y={contextMenu.y}
      onSelect={selectContextAction}
    />
  {/if}
</div>

<style src="./Table.css"></style>
