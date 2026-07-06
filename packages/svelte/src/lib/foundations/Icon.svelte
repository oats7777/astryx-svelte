<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Icon.svelte
   * @input Icon registry name, size, color, label, and span attributes
   * @output Accessible icon wrapper backed by the Svelte icon registry
   * @position Svelte port of core Icon for foundations
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {getIcon, type IconName} from '../icon/index.js';
  import {foundationClass} from './types.js';

  export type IconSize = 'xsm' | 'sm' | 'md' | 'lg';
  export type IconColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  type Props = HTMLAttributes<HTMLSpanElement> & {
    readonly icon: IconName;
    readonly label?: string;
    readonly size?: IconSize;
    readonly color?: IconColor;
  };

  let {icon, label, size = 'md', color = 'primary', class: className, ...rest}: Props = $props();
  const source = $derived(getIcon(icon));
</script>

<span
  {...rest}
  class={foundationClass('icon', className, [
    `astryx-icon--size-${size}`,
    `astryx-icon--color-${color}`,
  ])}
  data-icon={icon}
  data-size={size}
  aria-label={label}
  aria-hidden={label == null ? 'true' : undefined}
  role={label == null ? undefined : 'img'}
>
  {#if typeof source === 'string'}
    <span class="astryx-icon__glyph" aria-hidden="true">{source}</span>
  {/if}
</span>
