<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TopNav.svelte
   * @input Top navigation label, title, item collections, and selection callback
   * @output Router-free horizontal navigation landmark
   * @position Todo 12 top navigation component
   */

  import NavigationLink from './NavigationLink.svelte';
  import NavItem from './NavItem.svelte';
  import {itemValue} from './navigation-utils.js';
  import type {NavItemModel} from './types.js';

  let {
    label = 'Main navigation',
    title = undefined,
    items = [],
    endItems = [],
    onSelect = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label?: string;
    readonly title?: string;
    readonly items?: readonly NavItemModel[];
    readonly endItems?: readonly NavItemModel[];
    readonly onSelect?: (value: string, event: MouseEvent) => void;
    readonly 'data-testid'?: string;
  }>();

  const navClass = 'astryx-top-nav';
</script>

<nav class={navClass} aria-label={label} data-testid={testId}>
  <div class="astryx-top-nav__start">
    {#if title}
      <NavigationLink
        class="astryx-top-nav__title"
        href="/"
        label={title}
      >
        {title}
      </NavigationLink>
    {/if}
    <div class="astryx-top-nav__items">
      {#each items as item}
        <NavItem
          label={item.label}
          value={itemValue(item)}
          href={item.href}
          active={item.active}
          disabled={item.disabled}
          onSelect={onSelect}
        />
      {/each}
    </div>
  </div>
  <div class="astryx-top-nav__spacer" aria-hidden="true"></div>
  <div class="astryx-top-nav__end">
    {#each endItems as item}
      <NavItem
        label={item.label}
        value={itemValue(item)}
        href={item.href}
        active={item.active}
        disabled={item.disabled}
        onSelect={onSelect}
      />
    {/each}
  </div>
</nav>
