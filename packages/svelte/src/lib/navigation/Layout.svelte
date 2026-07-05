<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Layout.svelte
   * @input Content string, content-width mode, edge compensation, and height mode
   * @output Layout container with observable width and edge compensation state
   * @position Todo 12 layout primitive
   */

  import {cx} from './navigation-utils.js';

  let {
    content = '',
    contentWidth = 'wide',
    edgeCompensation = false,
    height = 'auto',
    'data-testid': testId = undefined,
  } = $props<{
    readonly content?: string;
    readonly contentWidth?: 'narrow' | 'standard' | 'wide' | 'full';
    readonly edgeCompensation?: boolean;
    readonly height?: 'auto' | 'fill';
    readonly 'data-testid'?: string;
  }>();

  const widthClass = $derived(
    contentWidth === 'narrow'
      ? 'max-w-3xl'
      : contentWidth === 'standard'
        ? 'max-w-5xl'
        : contentWidth === 'wide'
          ? 'max-w-7xl'
          : 'max-w-none',
  );
</script>

<section
  class={cx('mx-auto w-full px-4', widthClass, height === 'fill' && 'min-h-dvh')}
  data-content-width={contentWidth}
  data-edge-compensation={edgeCompensation ? 'true' : 'false'}
  data-testid={testId}
>
  {content}
</section>
