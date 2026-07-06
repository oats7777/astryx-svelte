<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ButtonGroup.svelte
   * @input Group label, orientation, disabled state, and button children
   * @output Accessible grouped action container
   * @position Svelte port of core ButtonGroup
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {actionClass, type ActionSize} from './action-utils.js';
  import {setButtonGroupValue} from './button-group-context.js';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly children?: Snippet;
    readonly isDisabled?: boolean;
    readonly label: string;
    readonly orientation?: 'horizontal' | 'vertical';
    readonly size?: ActionSize;
  };

  let {
    children = undefined,
    class: className = undefined,
    isDisabled = false,
    label,
    orientation = 'horizontal',
    size = 'md',
    ...rest
  }: Props = $props();

  const rootClass = $derived(
    actionClass('astryx-button-group', `astryx-button-group--${orientation}`, className),
  );

  setButtonGroupValue({
    get isDisabled() {
      return isDisabled;
    },
  });
</script>

<div
  {...rest}
  role="group"
  aria-label={label}
  aria-disabled={isDisabled ? 'true' : undefined}
  data-size={size}
  data-orientation={orientation}
  class={rootClass}
>
  {#if children}
    {@render children()}
  {/if}
</div>
