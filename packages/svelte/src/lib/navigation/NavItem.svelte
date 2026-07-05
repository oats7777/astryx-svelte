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
      'inline-flex min-h-9 min-w-0 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none transition-colors',
      'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-muted)] focus-visible:ring-2',
      active && 'bg-[var(--color-background-muted)] text-[var(--color-text-primary)]',
      disabled && 'cursor-not-allowed text-[var(--color-text-disabled)]',
      compact && 'justify-center px-2',
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
