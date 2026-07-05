<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TabList.svelte
   * @input Tab items, selected value, optional menu, and change callback
   * @output Navigation tab list with keyboard movement and menu roles
   * @position Todo 12 tab list component
   */

  import {enabledOptions, nextNavigationId, nextOption} from './navigation-utils.js';
  import type {ChoiceOption, TabMenuModel} from './types.js';

  let {
    label = 'Tabs',
    value,
    tabs = [],
    menu = undefined,
    onChange,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label?: string;
    readonly value: string;
    readonly tabs?: readonly ChoiceOption[];
    readonly menu?: TabMenuModel;
    readonly onChange: (value: string) => void;
    readonly 'data-testid'?: string;
  }>();

  const menuId = nextNavigationId('tab-menu');
  let menuOpen = $state(false);
  const tabbableValue = $derived(
    enabledOptions(tabs).find((tab) => tab.value === value)?.value ?? enabledOptions(tabs)[0]?.value,
  );

  function choose(option: ChoiceOption): void {
    if (option.disabled === true || option.value === value) {
      return;
    }
    onChange(option.value);
  }

  function focusValue(root: HTMLElement, nextValue: string): void {
    root.querySelector<HTMLElement>(`button[data-value="${nextValue}"]`)?.focus();
  }

  function handleTabKeydown(option: ChoiceOption, event: KeyboardEvent): void {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const root = event.currentTarget instanceof HTMLElement ? event.currentTarget.closest('nav') : null;
    if (!(root instanceof HTMLElement)) {
      return;
    }
    const target = nextOption(tabs, option.value, event.key);
    if (target == null) {
      return;
    }
    focusValue(root, target.value);
    choose(target);
  }
</script>

<nav class="flex items-center gap-1" aria-label={label} data-testid={testId}>
  {#each tabs as tab}
    <button
      type="button"
      class="rounded-md px-3 py-2 text-sm"
      data-value={tab.value}
      aria-current={tab.value === value ? 'page' : undefined}
      aria-disabled={tab.disabled ? 'true' : undefined}
      disabled={tab.disabled}
      tabindex={tab.value === tabbableValue ? 0 : -1}
      onclick={() => choose(tab)}
      onkeydown={(event) => handleTabKeydown(tab, event)}
    >
      {tab.label}
    </button>
  {/each}
  {#if menu}
    <span class="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen ? 'true' : 'false'}
        aria-controls={menuId}
        class="rounded-md px-3 py-2 text-sm"
        onclick={() => {
          menuOpen = !menuOpen;
        }}
      >
        {menu.options.find((option: ChoiceOption) => option.value === value)?.label ?? menu.label}
      </button>
      <div id={menuId} role="menu" aria-label={menu.label} hidden={!menuOpen} class="absolute top-full mt-1">
        {#each menu.options as option}
          <button
            type="button"
            role="menuitem"
            data-value={option.value}
            aria-current={option.value === value ? 'true' : undefined}
            aria-disabled={option.disabled ? 'true' : undefined}
            disabled={option.disabled}
            onclick={() => choose(option)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </span>
  {/if}
</nav>
