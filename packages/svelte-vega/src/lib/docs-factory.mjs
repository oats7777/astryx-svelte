// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs-factory.mjs
 * @input Svelte Vega component names and docs group metadata
 * @output Component docs metadata objects with Svelte examples
 * @position Internal helper for package-local .doc.mjs metadata modules
 */

export function createGroupDocs() {
  return {
    name: 'Vega',
    displayName: 'Vega',
    group: 'Vega',
    category: 'Data Visualization',
    description: 'Vega wrapper components for Astryx Svelte charts.',
    usage: {
      description: 'Vega docs cover Svelte-first chart wrapper usage without React-only examples.',
    },
    keywords: ['svelte', 'vega', 'chart'],
    components: [
      {
        name: 'VegaChart',
        displayName: 'Vega Chart',
        description: 'Vega Chart renders Vega or Vega-Lite specifications from Svelte.',
        props: [
          {name: 'spec', type: 'VegaLiteSpec | VegaSpec', description: 'Chart specification passed to the Vega renderer.', required: true},
          {name: 'data', type: 'Record<string, unknown>[] | Record<string, unknown>', description: 'Data values bound into the chart specification.'},
          {name: 'ariaLabel', type: 'string', description: 'Accessible label announced for the chart region.'},
        ],
        usage: {
          description: 'Vega Chart is the Svelte wrapper for Astryx Vega and Vega-Lite rendering. Use it with Svelte data and schema objects rather than React wrappers.',
          bestPractices: [
            {guidance: true, description: 'Keep chart data and specs as serializable Svelte values.'},
            {guidance: true, description: 'Provide an accessible chart label for screen-reader context.'},
            {guidance: false, description: 'Do not paste TSX chart examples into Svelte Vega docs.'},
          ],
        },
        examples: [
          {
            label: 'Svelte usage',
            code: `<script>\n  import {VegaChart} from '@astryxdesign/svelte-vega';\n\n  const spec = {\n    mark: 'bar',\n    encoding: {x: {field: 'label', type: 'nominal'}, y: {field: 'value', type: 'quantitative'}},\n  };\n  const data = [{label: 'Alpha', value: 12}, {label: 'Beta', value: 18}];\n</script>\n\n<VegaChart {spec} {data} ariaLabel="Quarterly volume" />`,
          },
        ],
      },
    ],
  };
}
