<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file RadialSankeyProbe.svelte
   * @input Fixed radial and sankey data for DOM tests
   * @output Rendered data-viz primitives with stable test hooks
   * @position Test fixture for private Svelte lab data-viz surfaces
   */

  import {Radial, RadialArea, RadialGrid, RadialSlice, Sankey} from '../index.js';

  const radialData = [
    {name: 'Quality', value: 30, speed: 0.7, safety: 0.9},
    {name: 'Reach', value: 20, speed: 0.4, safety: 0.5},
    {name: 'Cost', value: 10, speed: 0.8, safety: 0.3},
  ] as const;

  const sankeyNodes = [
    {id: 'source', label: 'Source', value: 30},
    {id: 'build', label: 'Build', value: 20},
    {id: 'ship', label: 'Ship', value: 10},
  ] as const;

  const sankeyLinks = [
    {source: 'source', target: 'build', value: 20},
    {source: 'build', target: 'ship', value: 10},
  ] as const;
</script>

<Radial
  aria-label="Portfolio allocation"
  data={radialData}
  height={260}
  labelKey="name"
  valueKey="value"
>
  <RadialGrid />
  <RadialSlice />
</Radial>

<Radial
  aria-label="Capability score"
  axes={['speed', 'safety']}
  data={radialData}
  height={260}
>
  <RadialArea dataKey="speed" />
</Radial>

<Sankey
  aria-label="Delivery flow"
  columns={[['source'], ['build'], ['ship']]}
  height={260}
  links={sankeyLinks}
  nodes={sankeyNodes}
/>
