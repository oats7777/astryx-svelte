<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Token.svelte
   * @input Token label, color, link, click, remove, and hidden-label props
   * @output Token chip with link/button/inert semantics
   * @position Svelte port of core Token
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {
    actionClass,
    resolveInteractiveRole,
    type ActionColor,
    type ActionSize,
  } from './action-utils.js';
  import {getLinkProviderValue} from './link-context.js';

  type Props = HTMLAttributes<HTMLElement> & {
    readonly description?: string;
    readonly endContent?: Snippet;
    readonly href?: string;
    readonly icon?: Snippet | string;
    readonly isDisabled?: boolean;
    readonly isLabelHidden?: boolean;
    readonly label: string;
    readonly onRemove?: (event: MouseEvent) => void;
    readonly onclick?: (event: MouseEvent) => void;
    readonly color?: ActionColor;
    readonly size?: ActionSize;
  };

  let {
    class: className = undefined,
    color = 'default',
    description = undefined,
    endContent = undefined,
    href = undefined,
    icon = undefined,
    isDisabled = false,
    isLabelHidden = false,
    label,
    onRemove = undefined,
    onclick = undefined,
    size = 'md',
    'data-testid': testId = undefined,
    ...rest
  }: Props = $props();

  const provider = getLinkProviderValue();
  const CustomLink = $derived(provider?.component);
  const role = $derived(resolveInteractiveRole({href, onClick: onclick, isDisabled}));
  const rootClass = $derived(
    actionClass(
      'astryx-token',
      `astryx-token--color-${color}`,
      `astryx-token--size-${size}`,
      isDisabled && 'astryx-token--disabled',
      className,
    ),
  );
  const iconText = $derived(typeof icon === 'string' ? icon : undefined);
  const iconSnippet = $derived(typeof icon === 'function' ? icon : undefined);

  function remove(event: MouseEvent): void {
    event.stopPropagation();
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onRemove?.(event);
  }
</script>

{#snippet tokenContent()}
  {#if iconSnippet}
    <span class="astryx-token__icon">{@render iconSnippet()}</span>
  {:else if iconText}
    <span class="astryx-token__icon" aria-hidden="true">{iconText}</span>
  {/if}
  <span class={isLabelHidden ? 'astryx-sr-only' : 'astryx-token__label'}>{label}</span>
  {#if endContent}
    <span class="astryx-token__end">{@render endContent()}</span>
  {/if}
  {#if onRemove}
    <button
      type="button"
      aria-label={`Remove ${label}`}
      data-testid={testId ? `${testId}-remove` : undefined}
      class="astryx-token__remove"
      disabled={isDisabled}
      onclick={remove}
    >
      ×
    </button>
  {/if}
{/snippet}

{#if role === 'link' && CustomLink}
  <CustomLink
    {...rest}
    {href}
    to={href}
    class={rootClass}
    data-testid={testId}
    aria-label={isLabelHidden ? label : undefined}
    title={description}
    aria-disabled={isDisabled ? 'true' : undefined}
  >
    {@render tokenContent()}
  </CustomLink>
{:else if role === 'link'}
  <a
    {...rest}
    {href}
    class={rootClass}
    data-testid={testId}
    aria-label={isLabelHidden ? label : undefined}
    title={description}
    aria-disabled={isDisabled ? 'true' : undefined}
  >
    {@render tokenContent()}
  </a>
{:else if role === 'button'}
  <span
    {...rest}
    class={rootClass}
    data-testid={testId}
    aria-label={isLabelHidden ? label : undefined}
    title={description}
  >
    <button
      type="button"
      class="astryx-token__button"
      disabled={isDisabled}
      onclick={onclick}
    >
      {@render tokenContent()}
    </button>
  </span>
{:else}
  <span
    {...rest}
    class={rootClass}
    data-testid={testId}
    aria-label={isLabelHidden ? label : undefined}
    title={description}
  >
    {@render tokenContent()}
  </span>
{/if}
