// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file charts.doc.mjs
 * @input @astryxdesign/svelte-lab/charts Svelte component exports
 * @output Docs metadata for Charts Svelte components
 * @position Source docs consumed by docsite generation and docs typecheck
 */

import {createGroupDocs} from '../docs-factory.mjs';

export const docs = createGroupDocs({
  packageName: '@astryxdesign/svelte-lab',
  dir: 'charts',
  groupLabel: 'Charts',
  category: 'Data Visualization',
  components: ["Chart","ChartArea","ChartAxis","ChartBar","ChartDotGL","ChartDotGLInteractive","ChartGrid","ChartHeatmapGL","ChartLegend","ChartLine","ChartStreamGL","ChartTooltip","ChartV2","Radial","RadialArea","RadialGrid","RadialSlice","Sankey"],
});
