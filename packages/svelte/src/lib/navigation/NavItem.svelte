<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file NavItem.svelte
   * @input Label, href/value, active, disabled, and selection callback
   * @output Router-free navigation item that falls disabled hrefs back to buttons
   * @position Todo 12 shared navigation item primitive
   */

  import NavigationLink from './NavigationLink.svelte';
  import {cx} from './navigation-utils.js';

  let {
    label,
    value = undefined,
    href = undefined,
    active = false,
    disabled = false,
    compact = false,
    onSelect = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label: string;
    readonly value?: string;
    readonly href?: string;
    readonly active?: boolean;
    readonly disabled?: boolean;
    readonly compact?: boolean;
    readonly onSelect?: (value: string, event: MouseEvent) => void;
    readonly 'data-testid'?: string;
  }>();

  const resolvedValue = $derived(value ?? href ?? label);
  const itemClass = $derived(
    cx(
      'astryx-nav-item',
      active && 'astryx-nav-item--active',
      disabled && 'astryx-nav-item--disabled',
      compact && 'astryx-nav-item--compact',
    ),
  );

  function handleClick(event: MouseEvent): void {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onSelect?.(resolvedValue, event);
  }
</script>

{#if href != null && !disabled}
  <NavigationLink
    class={itemClass}
    href={href}
    label={label}
    aria-current={active ? 'page' : undefined}
    data-value={resolvedValue}
    data-testid={testId}
    onclick={handleClick}
  >
    {#if !compact}{label}{/if}
  </NavigationLink>
{:else}
  <button
    type="button"
    class={itemClass}
    disabled={disabled}
    aria-disabled={disabled ? 'true' : undefined}
    aria-current={active ? 'page' : undefined}
    data-href={href}
    data-value={resolvedValue}
    data-testid={testId}
    onclick={handleClick}
  >
    {#if !compact}{label}{/if}
  </button>
{/if}
