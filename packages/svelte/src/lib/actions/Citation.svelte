<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Citation.svelte
   * @input Citation source, number, and variant
   * @output Inline doc-noteref citation link or label
   * @position Svelte port of core Citation
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {actionClass} from './action-utils.js';

  export type CitationSource = Readonly<{
    readonly icon?: string;
    readonly title?: string;
    readonly url?: string;
  }>;

  type Props = HTMLAttributes<HTMLElement> & {
    readonly number: number;
    readonly source: CitationSource;
    readonly variant?: 'label' | 'number';
  };

  let {
    class: className = undefined,
    number,
    source,
    variant = 'label',
    ...rest
  }: Props = $props();

  const title = $derived(source.title ?? String(number));
  const rootClass = $derived(actionClass('astryx-citation', `astryx-citation--${variant}`, className));
  const ariaLabel = $derived(`Citation ${number}: ${title}`);
</script>

{#if source.url}
  <a
    {...rest}
    href={source.url}
    target="_blank"
    rel="noopener noreferrer"
    title={title}
    role="doc-noteref"
    aria-label={ariaLabel}
    class={rootClass}
  >
    {#if variant === 'number'}
      {number}
    {:else}
      {#if source.icon}
        <span class="astryx-citation__icon"><img src={source.icon} alt="" aria-hidden="true" /></span>
      {/if}
      <span class="astryx-citation__label">{title}</span>
    {/if}
  </a>
{:else}
  <span {...rest} title={title} role="doc-noteref" aria-label={ariaLabel} class={rootClass}>
    {#if variant === 'number'}
      {number}
    {:else}
      <span class="astryx-citation__label">{title}</span>
    {/if}
  </span>
{/if}
