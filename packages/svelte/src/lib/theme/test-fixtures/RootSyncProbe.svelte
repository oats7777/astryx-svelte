<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  import Theme from '../Theme.svelte';
  import ConsumerOnlyProbe from './ConsumerOnlyProbe.svelte';
  import type {DefinedTheme, ThemeMode} from '../theme.js';

  let {
    rootTheme,
    nestedTheme,
    mode = 'system',
    showNested = false,
  } = $props<{
    readonly rootTheme: DefinedTheme;
    readonly nestedTheme: DefinedTheme;
    readonly mode?: ThemeMode;
    readonly showNested?: boolean;
  }>();
</script>

<Theme theme={rootTheme} {mode}>
  <ConsumerOnlyProbe testId="root-consumer" />
  {#if showNested}
    <Theme theme={nestedTheme} mode="light">
      <ConsumerOnlyProbe testId="nested-consumer" />
    </Theme>
  {/if}
</Theme>
