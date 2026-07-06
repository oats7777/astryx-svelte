<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Theme.svelte
   * @input DefinedTheme, ThemeMode, and Svelte children snippet
   * @output Themed subtree, context, root attributes, runtime CSS, and icon registration
   * @position Public Svelte Theme provider component
   */

  import type {Snippet} from 'svelte';
  import {registerIcons} from '../icon/icon-registry.js';
  import {isNestedTheme, markThemeNested, setThemeContext} from './theme-context.js';
  import {syncRootTheme} from './root-sync.js';
  import {injectThemeStyles} from './style-injection.js';
  import {assertThemeMode, type DefinedTheme, type ThemeMode} from './theme.js';

  let {theme, mode = 'system', children} = $props<{
    readonly theme: DefinedTheme;
    readonly mode?: ThemeMode;
    readonly children?: Snippet;
  }>();

  const nested = isNestedTheme();
  const resolvedMode = $derived(assertThemeMode(mode));
  const wrapperMode = $derived(resolvedMode === 'system' ? undefined : resolvedMode);
  const contextValue = {
    get theme() {
      return theme;
    },
    get mode() {
      return resolvedMode;
    },
  };

  setThemeContext(contextValue);
  markThemeNested();

  $effect(() => {
    if (theme.icons != null) {
      registerIcons(theme.icons);
    }
  });
  $effect(() => syncRootTheme(nested, resolvedMode, theme.name));
  $effect(() => injectThemeStyles(theme));
</script>

<div class="astryx-theme" data-astryx-theme={theme.name} data-theme={wrapperMode}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  :global(.astryx-theme) {
    color: var(--color-text-primary);
    color-scheme: light dark;
    display: contents;
    font-family: var(--font-family-body);
  }

  :global(.astryx-theme[data-theme='light']) {
    color-scheme: light;
  }

  :global(.astryx-theme[data-theme='dark']) {
    color-scheme: dark;
  }
</style>
