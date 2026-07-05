<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Thumbnail.svelte
   * @input Image source, alt text, ratio, loading state, and div attributes
   * @output Compact image thumbnail with loading hooks
   * @position Svelte port of core Thumbnail
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass, styleEntries} from './types.js';
  import Skeleton from './Skeleton.svelte';
  import Spinner from './Spinner.svelte';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly src?: string;
    readonly alt?: string;
    readonly label?: string;
    readonly ratio?: number;
    readonly isLoading?: boolean;
    readonly isDisabled?: boolean;
  };

  let {
    src,
    alt,
    label,
    ratio = 1,
    isLoading = false,
    isDisabled = false,
    class: className,
    style,
    ...rest
  }: Props = $props();
</script>

<div
  {...rest}
  class={foundationClass('thumbnail', className)}
  data-loading={isLoading}
  data-disabled={isDisabled}
  aria-label={label}
  style={styleEntries(style, [['aspect-ratio', `${ratio} / 1`]])}
>
  {#if isLoading && !src}
    <Skeleton width="100%" height="100%" />
  {:else}
    {#if src}
      <img class="astryx-thumbnail__image" {src} alt={alt ?? ''} />
    {:else}
      <span class="astryx-thumbnail__placeholder" aria-hidden="true"></span>
    {/if}
    {#if isLoading}
      <span class="astryx-thumbnail__overlay">
        <Spinner label="Loading thumbnail" size="sm" />
      </span>
    {/if}
  {/if}
</div>
