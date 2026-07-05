<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file SelectableCard.svelte
   * @input Controlled selected state, form identity, and card children
   * @output Card with hidden checkbox accessibility and form semantics
   * @position Svelte port of core SelectableCard
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {actionClass, hasInteractiveAncestor} from './action-utils.js';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly children?: Snippet;
    readonly isDisabled?: boolean;
    readonly isSelected: boolean;
    readonly label: string;
    readonly name?: string;
    readonly onChange: (isSelected: boolean, event: Event) => void;
    readonly value?: string;
    readonly variant?: string;
  };

  let {
    children = undefined,
    class: className = undefined,
    isDisabled = false,
    isSelected,
    label,
    name = undefined,
    onChange,
    value = 'on',
    variant = 'default',
    'data-testid': testId = 'selectable-card',
    ...rest
  }: Props = $props();

  const rootClass = $derived(
    actionClass(
      'astryx-card',
      'astryx-selectable-card',
      `astryx-card--variant-${variant}`,
      isSelected && 'astryx-selectable-card--selected',
      isDisabled && 'astryx-selectable-card--disabled',
      className,
    ),
  );

  function toggle(event: Event): void {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onChange(!isSelected, event);
  }

  function handleCardClick(event: MouseEvent): void {
    if (hasInteractiveAncestor(event.target, event.currentTarget)) {
      return;
    }
    toggle(event);
  }
</script>

<div
  {...rest}
  data-testid={testId}
  data-selected={isSelected ? 'true' : 'false'}
  data-disabled={isDisabled ? 'true' : undefined}
  data-variant={variant}
  class={rootClass}
  onclick={handleCardClick}
>
  <input
    type="checkbox"
    {name}
    {value}
    checked={isSelected}
    aria-label={label}
    disabled={isDisabled}
    class="astryx-sr-only"
    onchange={toggle}
  />
  {#if children}
    {@render children()}
  {/if}
</div>
