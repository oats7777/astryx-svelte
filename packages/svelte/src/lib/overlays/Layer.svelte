<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Layer.svelte
   * @input Anchor, placement, focus, portal, and snippet props
   * @output Anchored or fixed overlay layer
   * @position Core Svelte overlay layer primitive
   */

  import type {Snippet} from 'svelte';
  import {focusTrap} from './focus-trap.js';
  import {portal as portalAction} from './portal.js';
  import {ensureAnchorName, positionArea} from './positioning.js';
  import type {LayerAlignment, LayerPlacement} from './types.js';

  let {
    open = false,
    anchor = undefined,
    placement = 'above',
    alignment = 'center',
    role = undefined,
    x = undefined,
    y = undefined,
    portal = true,
    trapFocus = false,
    onEscape = undefined,
    'aria-label': ariaLabel = undefined,
    'aria-labelledby': ariaLabelledBy = undefined,
    children,
    'data-testid': testId = undefined,
    overlay = 'layer',
  } = $props<{
    readonly open?: boolean;
    readonly anchor?: HTMLElement;
    readonly placement?: LayerPlacement;
    readonly alignment?: LayerAlignment;
    readonly role?: string;
    readonly x?: number;
    readonly y?: number;
    readonly portal?: boolean;
    readonly trapFocus?: boolean;
    readonly onEscape?: () => void;
    readonly 'aria-label'?: string;
    readonly 'aria-labelledby'?: string;
    readonly children?: Snippet;
    readonly 'data-testid'?: string;
    readonly overlay?: string;
  }>();

  let node = $state<HTMLElement>();

  $effect(() => {
    if (node == null) {
      return;
    }
    if (anchor != null) {
      const anchorName = ensureAnchorName(anchor);
      node.style.setProperty('position-anchor', anchorName);
      node.style.setProperty('position-area', positionArea(placement, alignment));
      node.style.removeProperty('left');
      node.style.removeProperty('top');
    } else {
      node.style.removeProperty('position-anchor');
      node.style.removeProperty('position-area');
      if (x != null) {
        node.style.left = `${x}px`;
      }
      if (y != null) {
        node.style.top = `${y}px`;
      }
    }
  });

</script>

{#if open}
  <div
    bind:this={node}
    use:portalAction={{enabled: portal}}
    use:focusTrap={{active: trapFocus, onEscape}}
    class="astryx-layer astryx-reduced-motion-safe"
    data-astryx-overlay={overlay}
    data-testid={testId}
    data-placement={placement}
    data-alignment={alignment}
    data-astryx-focus-layer={trapFocus ? 'true' : undefined}
    {role}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}
