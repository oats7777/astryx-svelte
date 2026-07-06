<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file LayerHarness.svelte
   * @input Layer, Popover, Tooltip, HoverCard, and Theme components
   * @output Anchored and portalled overlay DOM for positioning tests
   * @position Test fixture for Todo 11 layer and portal coverage
   */

  import Theme from '../../theme/Theme.svelte';
  import {defineTheme} from '../../theme/theme.js';
  import HoverCard from '../HoverCard.svelte';
  import Layer from '../Layer.svelte';
  import Popover from '../Popover.svelte';
  import Tooltip from '../Tooltip.svelte';

  const testTheme = defineTheme({
    name: 'overlay-test',
    tokens: {
      '--color-accent': ['#0055AA', '#88CCFF'],
    },
  });

  let trigger = $state<HTMLElement>();
</script>

<Theme theme={testTheme} mode="dark">
  <button bind:this={trigger} data-testid="layer-anchor">Anchor</button>
  <Layer open anchor={trigger} placement="below" alignment="start" data-testid="layer">
    Layer body
  </Layer>
  <Popover open anchor={trigger} label="Filter menu" data-testid="popover">
    <button>Apply</button>
  </Popover>
  <Tooltip open anchor={trigger} content="Helpful hint" data-testid="tooltip" />
  <HoverCard open anchor={trigger} label="Profile preview" data-testid="hover-card">
    Hover body
  </HoverCard>
</Theme>
