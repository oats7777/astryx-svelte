<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file AvatarGroup.svelte
   * @input Avatar size and child snippets
   * @output Grouped avatar layout context
   * @position Svelte port of core AvatarGroup
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {setAvatarGroup, type AvatarSize} from './avatar-context.js';
  import {foundationClass} from './types.js';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly size?: AvatarSize;
    readonly children?: Snippet;
  };

  let {size = 'small', children, class: className, ...rest}: Props = $props();
  setAvatarGroup({
    get size() {
      return size;
    },
  });
</script>

<div
  {...rest}
  class={foundationClass('avatar-group', className, [`astryx-avatar-group--size-${size}`])}
  data-size={size}
>
  {#if children}
    {@render children()}
  {/if}
</div>
