<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Collapsible.svelte
   * @input Trigger label, content, controlled/uncontrolled open state, and change callback
   * @output Disclosure button with aria-expanded and optionally rendered content
   * @position Svelte port of core Collapsible
   */

  import {untrack} from 'svelte';

  let {
    trigger,
    content = '',
    defaultOpen = true,
    open = undefined,
    onOpenChange = undefined,
    value = undefined,
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly trigger: string;
    readonly content?: string;
    readonly defaultOpen?: boolean;
    readonly open?: boolean;
    readonly onOpenChange?: (open: boolean) => void;
    readonly value?: string;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  const initialOpen = untrack(() => defaultOpen);
  let localOpen = $state(initialOpen);
  const isOpen = $derived(open ?? localOpen);
  const contentId = $derived(value == null ? undefined : `astryx-collapsible-${value}`);

  function toggle(): void {
    const next = !isOpen;
    if (open === undefined) {
      localOpen = next;
    }
    onOpenChange?.(next);
  }
</script>

<section class={['astryx-collapsible', className].filter(Boolean).join(' ')} data-testid={testId}>
  <button
    type="button"
    class="astryx-collapsible__trigger"
    aria-expanded={isOpen ? 'true' : 'false'}
    aria-controls={contentId}
    onclick={toggle}
  >
    <span>{trigger}</span>
    <span class="astryx-collapsible__chevron" data-open={isOpen ? 'true' : undefined} aria-hidden="true">⌄</span>
  </button>
  {#if isOpen}
    <div id={contentId} class="astryx-collapsible__content" data-open="true">{content}</div>
  {/if}
</section>

<style>
  .astryx-collapsible {
    width: 100%;
  }

  .astryx-collapsible__trigger {
    align-items: center;
    background: transparent;
    border: 0;
    color: var(--color-text-primary);
    cursor: pointer;
    display: flex;
    font: inherit;
    font-weight: var(--font-weight-semibold);
    justify-content: space-between;
    padding: 0;
    text-align: start;
    width: 100%;
  }

  .astryx-collapsible__chevron {
    transition: transform var(--duration-fast) var(--ease-standard);
  }

  .astryx-collapsible__chevron[data-open='true'] {
    transform: rotate(180deg);
  }

  .astryx-collapsible__content {
    color: var(--color-text-secondary);
    padding-block-start: var(--spacing-2);
  }
</style>
