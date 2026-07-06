<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChatReasoning.svelte
   * @input Reasoning content, label, duration, streaming state, and disclosure state
   * @output Compact accessible reasoning disclosure for chat surfaces
   * @position Private Svelte lab port of ChatReasoning
   */

  import type {Snippet} from 'svelte';

  type Props = {
    readonly children?: Snippet;
    readonly label?: string;
    readonly duration?: string;
    readonly isStreaming?: boolean;
    readonly isExpanded?: boolean;
    readonly defaultIsExpanded?: boolean;
    readonly onExpandedChange?: (expanded: boolean) => void;
    readonly class?: string;
    readonly 'data-testid'?: string;
  };

  let {
    children,
    label = 'Thinking',
    duration = undefined,
    isStreaming = false,
    isExpanded = undefined,
    defaultIsExpanded = false,
    onExpandedChange = undefined,
    class: className = undefined,
    'data-testid': testId = undefined,
  }: Props = $props();

  let internalExpanded = $state(false);
  let defaultExpandedApplied = $state(false);
  const expanded = $derived(isExpanded ?? internalExpanded);

  $effect.pre(() => {
    if (!defaultExpandedApplied) {
      internalExpanded = defaultIsExpanded;
      defaultExpandedApplied = true;
    }
  });

  function toggle(): void {
    const next = !expanded;
    if (isExpanded == null) {
      internalExpanded = next;
    }
    onExpandedChange?.(next);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    toggle();
  }
</script>

<div
  class={`astryx-chat-reasoning${className == null ? '' : ` ${className}`}`}
  data-astryx-chat-reasoning
  data-expanded={expanded ? 'true' : undefined}
  data-streaming={isStreaming ? 'true' : undefined}
  data-testid={testId}
>
  <div
    role="button"
    tabindex="0"
    aria-expanded={expanded ? 'true' : 'false'}
    class="astryx-chat-reasoning__header"
    onclick={toggle}
    onkeydown={handleKeydown}
  >
    <span class="astryx-chat-reasoning__icon" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2" />
        <circle cx="5.5" cy="7" r="0.75" fill="currentColor" />
        <circle cx="8.5" cy="7" r="0.75" fill="currentColor" />
      </svg>
    </span>
    <span class="astryx-chat-reasoning__label-row">
      <span class:astryx-chat-reasoning__label--streaming={isStreaming} class="astryx-chat-reasoning__label">
        {label}
      </span>
      {#if duration != null && !isStreaming}
        <span class="astryx-chat-reasoning__separator" aria-hidden="true">·</span>
        <span class="astryx-chat-reasoning__duration">{duration}</span>
      {/if}
      {#if !expanded && !isStreaming}
        <span class="astryx-chat-reasoning__separator" aria-hidden="true">-</span>
        <span class="astryx-chat-reasoning__preview">
          {#if children}
            {@render children()}
          {/if}
        </span>
      {/if}
    </span>
    <span class:astryx-chat-reasoning__chevron--expanded={expanded} class="astryx-chat-reasoning__chevron" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </div>

  <div data-astryx-chat-reasoning-content hidden={!expanded} class="astryx-chat-reasoning__content">
    <div class="astryx-chat-reasoning__content-inner">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</div>

<style>
  .astryx-chat-reasoning {
    display: flex;
    flex-direction: column;
    margin-block-start: var(--spacing-2);
  }

  .astryx-chat-reasoning__header {
    align-items: center;
    cursor: pointer;
    display: flex;
    gap: var(--spacing-1-5);
    min-block-size: var(--spacing-6);
    padding-block: var(--spacing-0-5);
    user-select: none;
  }

  .astryx-chat-reasoning__header:focus-visible {
    border-radius: var(--radius-element);
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .astryx-chat-reasoning__icon,
  .astryx-chat-reasoning__chevron {
    align-items: center;
    color: var(--color-text-disabled);
    display: inline-flex;
    flex-shrink: 0;
    justify-content: center;
  }

  .astryx-chat-reasoning__icon {
    color: var(--color-text-secondary);
    inline-size: var(--spacing-4);
  }

  .astryx-chat-reasoning__label-row {
    align-items: center;
    display: flex;
    gap: var(--spacing-1);
    min-inline-size: 0;
    overflow: hidden;
  }

  .astryx-chat-reasoning__label,
  .astryx-chat-reasoning__duration,
  .astryx-chat-reasoning__preview,
  .astryx-chat-reasoning__content-inner {
    font: var(--font-body);
    font-size: var(--text-supporting-size);
    line-height: var(--text-supporting-leading);
  }

  .astryx-chat-reasoning__label {
    color: var(--color-text-secondary);
    flex-shrink: 0;
    font-weight: var(--font-weight-medium);
  }

  .astryx-chat-reasoning__duration,
  .astryx-chat-reasoning__separator,
  .astryx-chat-reasoning__preview {
    color: var(--color-text-disabled);
  }

  .astryx-chat-reasoning__preview {
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .astryx-chat-reasoning__chevron {
    transition: transform var(--duration-fast) var(--ease-standard);
  }

  .astryx-chat-reasoning__chevron--expanded {
    transform: rotate(180deg);
  }

  .astryx-chat-reasoning__content-inner {
    color: var(--color-text-secondary);
    padding-block-start: var(--spacing-2);
    padding-inline-start: calc(var(--spacing-4) + var(--spacing-1-5));
  }

  .astryx-chat-reasoning__label--streaming {
    animation: astryx-chat-reasoning-shimmer 4s linear infinite;
    background-clip: text;
    background-image: linear-gradient(
      90deg,
      var(--color-text-secondary),
      var(--color-text-disabled),
      var(--color-text-secondary)
    );
    background-size: 200% 100%;
    color: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .astryx-chat-reasoning__label--streaming {
      animation: none;
      color: var(--color-text-secondary);
    }

    .astryx-chat-reasoning__chevron {
      transition: none;
    }
  }

  @keyframes astryx-chat-reasoning-shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }
</style>
