<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ThemeRootSyncApp.svelte
   * @input Initial theme mode from SSR and user mode toggle clicks
   * @output Hydrated theme root sync probe page
   * @position Playwright fixture for Svelte Theme SSR/hydration behavior
   */

  import {onMount} from 'svelte';
  import Theme from '../Theme.svelte';
  import {defineTheme, type ThemeMode} from '../theme.js';

  const theme = defineTheme({
    name: 'e2e',
    tokens: {
      '--color-accent': ['#1357D8', '#8BC7FF'],
    },
  });
  let mode = $state<ThemeMode>('light');
  let hydrated = $state(false);

  onMount(() => {
    hydrated = true;
  });
</script>

<Theme {theme} {mode}>
  <main data-testid="theme-root-sync" data-hydrated={String(hydrated)}>
    <p>SSR page loads and hydrates</p>
    <button type="button" data-testid="light" onclick={() => (mode = 'light')}>Light</button>
    <button type="button" data-testid="dark" onclick={() => (mode = 'dark')}>Dark</button>
    <button type="button" data-testid="system" onclick={() => (mode = 'system')}>System</button>
  </main>
</Theme>
