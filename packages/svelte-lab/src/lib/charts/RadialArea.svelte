<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file RadialArea.svelte
   * @input Data key and radial spider context
   * @output Token-colored spider area path
   * @position Radial chart mark primitive
   */

  import {useRadialContext} from './chart-context.js';

  type Props = {
    readonly dataKey: string;
    readonly color?: string;
  };

  let {dataKey, color = 'var(--color-data-categorical-blue)'}: Props = $props();
  const radial = useRadialContext();
  const points = $derived(radial.axes.map((axis) => {
    const domain = radial.axisDomains.get(axis) ?? [0, 1];
    const max = domain[1] === domain[0] ? 1 : domain[1] - domain[0];
    const value = axis === dataKey ? domain[1] : domain[0] + max * 0.6;
    const t = (value - domain[0]) / max;
    const angle = radial.angleByAxis.get(axis) ?? 0;
    const radius = radial.innerRadius + t * (radial.radius - radial.innerRadius);
    return `${radial.cx + Math.cos(angle) * radius},${radial.cy + Math.sin(angle) * radius}`;
  }));
  const path = $derived(points.length > 0 ? `M ${points.join(' L ')} Z` : '');
</script>

<path d={path} data-astryx-radial-area fill={color} fill-opacity="0.2" stroke={color} />
