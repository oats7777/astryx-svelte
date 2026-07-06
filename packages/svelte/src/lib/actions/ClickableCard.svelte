<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ClickableCard.svelte
   * @input Action or navigation card props, children, and provider link context
   * @output Card surface with hidden interactive element for accessibility
   * @position Svelte port of core ClickableCard
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {actionClass, callWhenEnabled, hasInteractiveAncestor} from './action-utils.js';
  import {getLinkProviderValue} from './link-context.js';

  type CardVariant =
    | 'default'
    | 'transparent'
    | 'muted'
    | 'blue'
    | 'cyan'
    | 'gray'
    | 'green'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'teal'
    | 'yellow';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly children?: Snippet;
    readonly href?: string;
    readonly isDisabled?: boolean;
    readonly label: string;
    readonly target?: string;
    readonly variant?: CardVariant;
    readonly onclick?: (event: MouseEvent) => void;
  };

  let {
    children = undefined,
    class: className = undefined,
    href = undefined,
    isDisabled = false,
    label,
    target = undefined,
    variant = 'default',
    onclick = undefined,
    'data-testid': testId = 'clickable-card',
    ...rest
  }: Props = $props();

  const provider = getLinkProviderValue();
  const CustomLink = $derived(provider?.component);
  const isLink = $derived(href != null);
  const rootClass = $derived(
    actionClass(
      'astryx-card',
      'astryx-clickable-card',
      `astryx-card--variant-${variant}`,
      isDisabled && 'astryx-clickable-card--disabled',
      className,
    ),
  );

  function handleClick(event: MouseEvent): void {
    if (isDisabled || hasInteractiveAncestor(event.target, event.currentTarget)) {
      return;
    }
    callWhenEnabled(isDisabled, event, onclick);
  }
</script>

<div
  {...rest}
  role={undefined}
  data-testid={testId}
  data-variant={variant}
  data-disabled={isDisabled ? 'true' : undefined}
  class={rootClass}
  onclick={handleClick}
>
  {#if isLink && CustomLink}
    <CustomLink
      href={href}
      to={href}
      target={target}
      aria-label={label}
      aria-disabled={isDisabled ? 'true' : undefined}
      tabindex={isDisabled ? -1 : 0}
      class="astryx-sr-only"
      data-testid={`${testId}-link`}
    />
  {:else if isLink}
    <a
      href={href}
      target={target}
      aria-label={label}
      aria-disabled={isDisabled ? 'true' : undefined}
      tabindex={isDisabled ? -1 : 0}
      class="astryx-sr-only"
      data-testid={`${testId}-link`}
    ></a>
  {:else}
    <button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      class="astryx-sr-only"
      onclick={onclick}
    ></button>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
