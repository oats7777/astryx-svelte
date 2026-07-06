<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Lightbox.svelte
   * @input Media items, open state, selected index, and close/change callbacks
   * @output Modal image viewer with keyboard navigation and captions
   * @position Svelte port of core Lightbox
   */

  import {clampIndex} from './media-utils.js';
  import type {MediaItem} from './types.js';

  let {
    items,
    open = false,
    index = 0,
    label = 'Image preview',
    onOpenChange = undefined,
    onIndexChange = undefined,
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly items: readonly MediaItem[];
    readonly open?: boolean;
    readonly index?: number;
    readonly label?: string;
    readonly onOpenChange?: (open: boolean) => void;
    readonly onIndexChange?: (index: number) => void;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  let localIndex = $state(0);
  const activeIndex = $derived(clampIndex(localIndex, items.length));
  const activeItem = $derived(items[activeIndex]);
  const canPrevious = $derived(items.length > 1 && activeIndex > 0);
  const canNext = $derived(items.length > 1 && activeIndex < items.length - 1);

  $effect(() => {
    localIndex = clampIndex(index, items.length);
  });

  function close(): void {
    onOpenChange?.(false);
  }

  function select(nextIndex: number): void {
    const next = clampIndex(nextIndex, items.length);
    localIndex = next;
    onIndexChange?.(next);
  }

  function move(direction: 1 | -1): void {
    select(activeIndex + direction);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
  }
</script>

{#if open}
  <div
    class={['astryx-lightbox astryx-reduced-motion-safe', className].filter(Boolean).join(' ')}
    role="dialog"
    aria-modal="true"
    aria-label={label}
    tabindex="-1"
    data-testid={testId}
    onkeydown={handleKeydown}
  >
    <button class="astryx-lightbox__close" type="button" aria-label="Close preview" onclick={close}>×</button>
    {#if activeItem != null}
      <figure class="astryx-lightbox__figure">
        <img src={activeItem.src} alt={activeItem.alt} />
        {#if activeItem.caption != null}<figcaption>{activeItem.caption}</figcaption>{/if}
      </figure>
    {/if}
    <div class="astryx-lightbox__controls">
      <button type="button" aria-label="Previous image" onclick={() => move(-1)} disabled={!canPrevious}>‹</button>
      <span>{activeIndex + 1} / {items.length}</span>
      <button type="button" aria-label="Next image" onclick={() => move(1)} disabled={!canNext}>›</button>
    </div>
  </div>
{/if}

<style>
  .astryx-lightbox {
    background: color-mix(in srgb, var(--color-background-surface), transparent 5%);
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-container);
    box-shadow: var(--shadow-overlay);
    color: var(--color-text-primary);
    display: grid;
    gap: var(--spacing-3);
    max-width: min(760px, 100%);
    padding: var(--spacing-4);
  }

  .astryx-lightbox__close {
    justify-self: end;
  }

  .astryx-lightbox__figure {
    display: grid;
    gap: var(--spacing-2);
    margin: 0;
  }

  .astryx-lightbox__figure img {
    border-radius: var(--radius-element);
    max-height: 70vh;
    object-fit: contain;
    width: 100%;
  }

  .astryx-lightbox__controls {
    align-items: center;
    display: flex;
    gap: var(--spacing-3);
    justify-content: center;
  }
</style>
