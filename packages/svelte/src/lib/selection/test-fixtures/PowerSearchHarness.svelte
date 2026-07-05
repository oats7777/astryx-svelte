<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file PowerSearchHarness.svelte
   * @input Initial filters and PowerSearch config
   * @output Controlled PowerSearch test harness with callback log
   * @position DOM fixture for Todo 10 PowerSearch integration tests
   */

  import PowerSearch from '../PowerSearch.svelte';
  import type {
    PowerSearchChangeType,
    PowerSearchConfig,
    PowerSearchFilter,
  } from '../power-search-types.js';

  let {
    config,
    initialFilters = [],
  }: {
    readonly config: PowerSearchConfig;
    readonly initialFilters?: readonly PowerSearchFilter[];
  } = $props();

  let filters = $state<readonly PowerSearchFilter[]>([]);
  let log = $state<
    readonly {
      readonly type: PowerSearchChangeType;
      readonly index: number;
      readonly filters: readonly PowerSearchFilter[];
    }[]
  >([]);
  let hasSeeded = $state(false);

  $effect(() => {
    if (!hasSeeded) {
      filters = initialFilters;
      hasSeeded = true;
    }
  });

  function handleChange(
    nextFilters: readonly PowerSearchFilter[],
    type: PowerSearchChangeType,
    index: number,
  ): void {
    filters = nextFilters;
    log = [...log, {type, index, filters: nextFilters}];
  }
</script>

<PowerSearch {config} {filters} onChange={handleChange} />
<output data-testid="filters-json">{JSON.stringify(filters)}</output>
<output data-testid="changes-json">{JSON.stringify(log)}</output>
