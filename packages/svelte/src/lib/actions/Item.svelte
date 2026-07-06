<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Item.svelte
   * @input Item label, description, slots, link, click, selected, and disabled props
   * @output Universal list/menu row primitive
   * @position Svelte port of core Item
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {actionClass, computeTargetAndRel, hasInteractiveAncestor} from './action-utils.js';
  import {getLinkProviderValue} from './link-context.js';

  type Props = HTMLAttributes<HTMLElement> & {
    readonly align?: 'center' | 'start';
    readonly as?: 'div' | 'li' | 'span';
    readonly description?: string;
    readonly density?: 'compact' | 'balanced' | 'spacious';
    readonly endContent?: Snippet;
    readonly href?: string;
    readonly isDisabled?: boolean;
    readonly isHighlighted?: boolean;
    readonly isSelected?: boolean;
    readonly label: string;
    readonly marker?: Snippet;
    readonly rel?: string;
    readonly startContent?: Snippet;
    readonly target?: string;
    readonly onclick?: (event: MouseEvent) => void;
  };

  let {
    align = 'center',
    as = 'div',
    class: className = undefined,
    density = 'balanced',
    description = undefined,
    endContent = undefined,
    href = undefined,
    isDisabled = false,
    isHighlighted = false,
    isSelected = false,
    label,
    marker = undefined,
    rel: relFromProps = undefined,
    startContent = undefined,
    target: targetFromProps = undefined,
    onclick = undefined,
    ...rest
  }: Props = $props();

  const provider = getLinkProviderValue();
  const CustomLink = $derived(provider?.component);
  const linkMeta = $derived(computeTargetAndRel(targetFromProps, relFromProps));
  const rootClass = $derived(
    actionClass(
      'astryx-item',
      `astryx-item--density-${density}`,
      `astryx-item--align-${align}`,
      (href != null || onclick != null) && 'astryx-item--interactive',
      isHighlighted && 'astryx-item--highlighted',
      isSelected && 'astryx-item--selected',
      isDisabled && 'astryx-item--disabled',
      className,
    ),
  );

  function handleRootClick(event: MouseEvent): void {
    if (isDisabled || hasInteractiveAncestor(event.target, event.currentTarget)) {
      return;
    }
    onclick?.(event);
  }

  function handleDisabledLinkClick(event: MouseEvent): void {
    if (isDisabled) {
      event.preventDefault();
    }
  }
</script>

<svelte:element
  this={as}
  {...rest}
  class={rootClass}
  aria-selected={isSelected ? 'true' : undefined}
  aria-disabled={isDisabled ? 'true' : undefined}
  onclick={onclick ? handleRootClick : undefined}
>
  {#if marker}
    <span class="astryx-item__marker">{@render marker()}</span>
  {/if}
  {#if startContent}
    <span class="astryx-item__start">{@render startContent()}</span>
  {/if}
  {#if href && CustomLink}
    <CustomLink
      href={href}
      to={href}
      target={linkMeta.target}
      rel={linkMeta.rel}
      class="astryx-item__content"
      aria-disabled={isDisabled ? 'true' : undefined}
      tabindex={isDisabled ? -1 : undefined}
      onclick={handleDisabledLinkClick}
    >
      <span class="astryx-item__label">{label}</span>
      {#if description}
        <span class="astryx-item__description">{description}</span>
      {/if}
    </CustomLink>
  {:else if href}
    <a
      href={href}
      target={linkMeta.target}
      rel={linkMeta.rel}
      class="astryx-item__content"
      aria-disabled={isDisabled ? 'true' : undefined}
      tabindex={isDisabled ? -1 : undefined}
      onclick={handleDisabledLinkClick}
    >
      <span class="astryx-item__label">{label}</span>
      {#if description}
        <span class="astryx-item__description">{description}</span>
      {/if}
    </a>
  {:else if onclick}
    <button type="button" class="astryx-item__content" disabled={isDisabled} onclick={onclick}>
      <span class="astryx-item__label">{label}</span>
      {#if description}
        <span class="astryx-item__description">{description}</span>
      {/if}
    </button>
  {:else}
    <span class="astryx-item__content">
      <span class="astryx-item__label">{label}</span>
      {#if description}
        <span class="astryx-item__description">{description}</span>
      {/if}
    </span>
  {/if}
  {#if endContent}
    <span class="astryx-item__end">{@render endContent()}</span>
  {/if}
</svelte:element>
