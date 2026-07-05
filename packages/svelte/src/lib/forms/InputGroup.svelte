<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file InputGroup.svelte
   * @input Prefix, suffix, label, and optional children
   * @output Grouped input adornment shell
   * @position Input grouping primitive for @astryxdesign/svelte forms
   */

  import type {Snippet} from 'svelte';
  import {nextFormId} from './form-utils.js';

  let {id = nextFormId('input-group'), label = undefined, prefix = undefined, suffix = undefined, children = undefined} = $props<{
    readonly id?: string;
    readonly label?: string;
    readonly prefix?: string;
    readonly suffix?: string;
    readonly children?: Snippet;
  }>();

  const labelId = $derived(label == null ? undefined : `${id}-label`);
</script>

{#if label}
  <span id={labelId} class="astryx-sr-only">{label}</span>
{/if}
<div class="astryx-input-group" role="group" aria-labelledby={labelId}>
  {#if prefix}
    <span class="astryx-input-group-text">{prefix}</span>
  {/if}
  {#if children}
    {@render children()}
  {:else}
    <span class="astryx-input-group-control" aria-hidden="true"></span>
  {/if}
  {#if suffix}
    <span class="astryx-input-group-text">{suffix}</span>
  {/if}
</div>
