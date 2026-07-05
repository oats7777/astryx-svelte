<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Resizable.svelte
   * @input Size bounds, orientation, label, and size callback
   * @output Resizable panel with pointer dragging and keyboard slider controls
   * @position Svelte port of core Resizable surface
   */

  import {untrack, type Snippet} from 'svelte';
  import {clampSize, keyboardSize, type ResizeOrientation} from './resize-utils.js';

  let {
    label,
    defaultSize = 240,
    minSize = 120,
    maxSize = 640,
    orientation = 'horizontal',
    onSizeChange = undefined,
    children = undefined,
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly label: string;
    readonly defaultSize?: number;
    readonly minSize?: number;
    readonly maxSize?: number;
    readonly orientation?: ResizeOrientation;
    readonly onSizeChange?: (size: number) => void;
    readonly children?: Snippet;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  const initialSize = untrack(() => clampSize(defaultSize, minSize, maxSize));
  let size = $state(initialSize);
  let dragStartPointer = 0;
  let dragStartSize = 0;
  const isHorizontal = $derived(orientation === 'horizontal');
  const sizeStyle = $derived(isHorizontal ? `width: ${size}px` : `height: ${size}px`);

  function setSize(nextSize: number): void {
    size = clampSize(nextSize, minSize, maxSize);
    onSizeChange?.(size);
  }

  function handlePointerMove(event: PointerEvent): void {
    const pointer = isHorizontal ? event.clientX : event.clientY;
    setSize(dragStartSize + pointer - dragStartPointer);
  }

  function handlePointerUp(): void {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  function handlePointerDown(event: PointerEvent): void {
    dragStartPointer = isHorizontal ? event.clientX : event.clientY;
    dragStartSize = size;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function handleKeydown(event: KeyboardEvent): void {
    const next = keyboardSize(event.key, size, minSize, maxSize, orientation);
    if (next !== size) {
      event.preventDefault();
      setSize(next);
    }
  }
</script>

<section
  class={['astryx-resizable', isHorizontal ? 'astryx-resizable--horizontal' : 'astryx-resizable--vertical', className]
    .filter(Boolean)
    .join(' ')}
  style={sizeStyle}
  data-testid={testId}
>
  <div class="astryx-resizable__content">{#if children}{@render children()}{/if}</div>
  <div
    class="astryx-resizable__handle"
    role="slider"
    tabindex="0"
    aria-label={label}
    aria-orientation={orientation}
    aria-valuemin={minSize}
    aria-valuemax={maxSize}
    aria-valuenow={size}
    onpointerdown={handlePointerDown}
    onkeydown={handleKeydown}
  ></div>
</section>

<style>
  .astryx-resizable {
    background: var(--color-background-surface);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    display: flex;
    min-height: var(--size-element-lg);
    overflow: hidden;
  }

  .astryx-resizable--vertical {
    flex-direction: column;
  }

  .astryx-resizable__content {
    flex: 1;
    min-width: 0;
    padding: var(--spacing-3);
  }

  .astryx-resizable__handle {
    background: var(--color-border);
    border: 0;
    cursor: col-resize;
    flex: 0 0 8px;
    padding: 0;
  }

  .astryx-resizable--vertical .astryx-resizable__handle {
    cursor: row-resize;
    min-height: 8px;
  }

  .astryx-resizable__handle:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
