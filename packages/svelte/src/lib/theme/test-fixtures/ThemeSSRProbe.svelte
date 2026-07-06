<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  import Theme from '../Theme.svelte';
  import type {DefinedTheme, ThemeMode} from '../theme.js';

  let {theme, mode} = $props<{
    readonly theme: DefinedTheme;
    readonly mode: ThemeMode;
  }>();
</script>

<Theme {theme} {mode}>
  <span>SSR child</span>
</Theme>
