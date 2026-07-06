<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  import {useTheme} from '../use-theme.js';

  let {testId = 'consumer'} = $props<{
    readonly testId?: string;
  }>();

  const currentTheme = useTheme();
</script>

<output
  data-testid={testId}
  data-theme-name={currentTheme.name}
  data-mode={currentTheme.mode}
  data-accent={currentTheme.token('--color-accent')}
  data-text-primary={currentTheme.token('--color-text-primary')}
  data-spacing={currentTheme.token('--spacing-1')}
  data-spacing-4={currentTheme.token('--spacing-4')}
></output>
