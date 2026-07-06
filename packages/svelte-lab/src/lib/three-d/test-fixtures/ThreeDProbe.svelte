<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThreeDProbe.svelte
   * @input Fixed 3D data for DOM and accessibility tests
   * @output Rendered 3D primitives with stable test hooks
   * @position Test fixture for private Svelte lab 3D surfaces
   */

  import {
    ThreeDAxis,
    ThreeDBar,
    ThreeDChart,
    ThreeDGrid,
    ThreeDScatter,
    ThreeDSurface,
  } from '../index.js';

  const scatterData = [
    {x: 0, y: 0, z: 0},
    {x: 1, y: 2, z: 1},
    {x: 2, y: 1, z: 2},
  ] as const;

  const surfaceData = [
    {x: 0, y: 0, z: 0},
    {x: 1, y: 1, z: 0},
    {x: 0, y: 1, z: 1},
    {x: 1, y: 2, z: 1},
  ] as const;
</script>

<ThreeDChart
  aria-label="3D operations chart"
  data={scatterData}
  height={320}
  width={480}
  xKey="x"
  yKey="y"
  zKey="z"
>
  <ThreeDGrid divisions={2} />
  <ThreeDAxis />
  <ThreeDScatter color="var(--color-data-categorical-blue)" />
  <ThreeDBar color="var(--color-data-categorical-orange)" />
</ThreeDChart>

<ThreeDChart
  aria-label="3D surface chart"
  data={surfaceData}
  height={320}
  width={480}
  xKey="x"
  yKey="y"
  zKey="z"
>
  <ThreeDSurface colorRange={['var(--color-data-blue-1)', 'var(--color-data-blue-5)']} />
</ThreeDChart>
