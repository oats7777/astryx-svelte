<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file VegaThemeHarness.svelte
   * @input VegaChart props for a themed DOM lifecycle test
   * @output Theme-wrapped VegaChart fixture
   * @position Test fixture for Svelte Vega theme integration
   */

  import {Theme, defineTheme} from '@astryxdesign/svelte/theme';
  import VegaChart from '../VegaChart.svelte';
  import type {AnySpec, VegaChartReadyHandler} from '../types.js';

  let {spec, onReady}: {readonly spec: AnySpec; readonly onReady?: VegaChartReadyHandler} =
    $props();

  const chartTheme = defineTheme({
    name: 'vega-test',
    tokens: {
      '--color-background-card': ['#ffffff', '#101010'],
      '--color-data-categorical-blue': '#0055ff',
      '--color-text-primary': '#111111',
      '--font-family-body': 'Inter',
    },
  });
</script>

<Theme theme={chartTheme} mode="dark">
  <VegaChart {spec} {onReady} data-testid="themed-chart" />
</Theme>
