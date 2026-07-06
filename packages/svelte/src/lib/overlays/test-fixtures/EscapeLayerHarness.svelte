<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file EscapeLayerHarness.svelte
   * @input Focus-trapped Layer close callback
   * @output Open modal-like layer for Escape cardinality tests
   * @position Test fixture for Todo 11 layer Escape behavior
   */

  import Layer from '../Layer.svelte';

  let {onEscape = () => {}} = $props<{readonly onEscape?: () => void}>();
</script>

<Layer open trapFocus {onEscape} role="dialog" aria-label="Quick actions" data-testid="escape-layer">
  <button type="button" data-testid="escape-layer-button">Close target</button>
</Layer>
