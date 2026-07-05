<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Carousel.svelte
   * @input Media items, label, initial/controlled index, and change callback
   * @output Keyboard-accessible carousel with image, captions, and indicators
   * @position Svelte port of core Carousel media affordance
   */

  import {untrack} from 'svelte';
  import {clampIndex, wrappedIndex} from './media-utils.js';
  import type {MediaItem} from './types.js';

  let {
    items,
    label = 'Carousel',
    defaultIndex = 0,
    index = undefined,
    onIndexChange = undefined,
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly items: readonly MediaItem[];
    readonly label?: string;
    readonly defaultIndex?: number;
    readonly index?: number;
    readonly onIndexChange?: (index: number) => void;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  const initialIndex = untrack(() => defaultIndex);
  let localIndex = $state(initialIndex);
  const activeIndex = $derived(clampIndex(index ?? localIndex, items.length));
  const activeItem = $derived(items[activeIndex]);

  function select(nextIndex: number): void {
    const next = clampIndex(nextIndex, items.length);
    if (index === undefined) {
      localIndex = next;
    }
    onIndexChange?.(next);
  }

  function move(direction: 1 | -1): void {
    select(wrappedIndex(activeIndex, items.length, direction));
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      select(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      select(items.length - 1);
    }
  }
</script>

<div
  class={['astryx-carousel astryx-reduced-motion-safe', className].filter(Boolean).join(' ')}
  role="region"
  aria-label={label}
  aria-roledescription="carousel"
  data-testid={testId}
>
  {#if activeItem != null}
    <figure class="astryx-carousel__figure">
      <img src={activeItem.src} alt={activeItem.alt} />
      {#if activeItem.caption != null}<figcaption>{activeItem.caption}</figcaption>{/if}
    </figure>
  {/if}
  <div class="astryx-carousel__controls">
    <button type="button" aria-label="Previous slide" onclick={() => move(-1)} onkeydown={handleKeydown} disabled={items.length < 2}>‹</button>
    <div class="astryx-carousel__indicators" role="tablist" aria-label="Slides">
      {#each items as item, itemIndex}
        <button
          type="button"
          role="tab"
          aria-label={`Show slide ${itemIndex + 1}`}
          aria-current={itemIndex === activeIndex ? 'true' : undefined}
          aria-selected={itemIndex === activeIndex ? 'true' : 'false'}
          onclick={() => select(itemIndex)}
          onkeydown={handleKeydown}
        >
          {itemIndex + 1}
        </button>
      {/each}
    </div>
    <button type="button" aria-label="Next slide" onclick={() => move(1)} onkeydown={handleKeydown} disabled={items.length < 2}>›</button>
  </div>
</div>

<style>
  .astryx-carousel {
    display: grid;
    gap: var(--spacing-3);
  }

  .astryx-carousel__figure {
    background: var(--color-background-muted);
    border-radius: var(--radius-container);
    display: grid;
    margin: 0;
    overflow: hidden;
  }

  .astryx-carousel__figure img {
    aspect-ratio: 16 / 9;
    display: block;
    object-fit: cover;
    width: 100%;
  }

  .astryx-carousel__figure figcaption {
    color: var(--color-text-secondary);
    padding: var(--spacing-2) var(--spacing-3);
  }

  .astryx-carousel__controls,
  .astryx-carousel__indicators {
    align-items: center;
    display: flex;
    gap: var(--spacing-2);
    justify-content: center;
  }

  .astryx-carousel button {
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--radius-inner);
    color: var(--color-text-primary);
    min-height: var(--size-element-sm);
    min-width: var(--size-element-sm);
  }
</style>
