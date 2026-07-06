<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Chat.svelte
   * @input Chat messages and optional streaming assistant content
   * @output Accessible live chat log with role-specific message bubbles
   * @position Svelte port of core Chat streaming display basics
   */

  import Markdown from './Markdown.svelte';
  import type {ChatMessage} from './types.js';

  let {
    messages,
    streamingContent = undefined,
    label = 'Chat messages',
    class: className = undefined,
    'data-testid': testId = undefined,
  } = $props<{
    readonly messages: readonly ChatMessage[];
    readonly streamingContent?: string;
    readonly label?: string;
    readonly class?: string;
    readonly 'data-testid'?: string;
  }>();

  function messageContent(message: ChatMessage): string {
    return message.isStreaming === true && streamingContent != null ? streamingContent : message.content;
  }

  function messageIsStreaming(message: ChatMessage): boolean {
    return message.isStreaming === true;
  }

  const isStreaming = $derived(messages.some(messageIsStreaming));
</script>

<section class={['astryx-chat', className].filter(Boolean).join(' ')} data-testid={testId}>
  <div
    class="astryx-chat__log"
    role="log"
    aria-label={label}
    aria-live="polite"
    aria-relevant="additions text"
    aria-busy={isStreaming ? 'true' : undefined}
  >
    {#each messages as message (message.id)}
      <article class={`astryx-chat__message astryx-chat__message--${message.role}`} data-role={message.role}>
        <div class="astryx-chat__meta">
          <span>{message.role}</span>
          {#if message.metadata != null}<span>{message.metadata}</span>{/if}
        </div>
        <div class="astryx-chat__bubble" data-streaming={message.isStreaming ? 'true' : undefined}>
          <Markdown content={messageContent(message)} isStreaming={message.isStreaming === true} density="compact" />
        </div>
      </article>
    {/each}
  </div>
</section>

<style>
  .astryx-chat {
    color: var(--color-text-primary);
    font-family: var(--font-family-body);
  }

  .astryx-chat__log {
    display: grid;
    gap: var(--spacing-3);
  }

  .astryx-chat__message {
    display: grid;
    gap: var(--spacing-1);
  }

  .astryx-chat__message--user {
    justify-items: end;
  }

  .astryx-chat__message--assistant,
  .astryx-chat__message--system {
    justify-items: start;
  }

  .astryx-chat__meta {
    color: var(--color-text-secondary);
    display: flex;
    font-size: var(--font-size-xs);
    gap: var(--spacing-2);
    text-transform: capitalize;
  }

  .astryx-chat__bubble {
    background: var(--color-background-muted);
    border-radius: var(--radius-container);
    max-width: min(68ch, 100%);
    padding: var(--spacing-3);
  }

  .astryx-chat__message--user .astryx-chat__bubble {
    background: var(--color-accent-muted);
  }
</style>
