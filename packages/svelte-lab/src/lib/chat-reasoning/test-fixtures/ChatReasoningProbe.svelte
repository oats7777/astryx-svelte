<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ChatReasoningProbe.svelte
   * @input Test props for the ChatReasoning component
   * @output Rendered reasoning disclosure surface for DOM assertions
   * @position Vitest fixture for the private Svelte lab ChatReasoning slice
   */

  import ChatReasoning from '../ChatReasoning.svelte';

  let {
    label = 'Thinking',
    duration = '12s',
    isStreaming = false,
    isExpanded = undefined,
    defaultIsExpanded = false,
    text = 'First inspect constraints, then produce the smallest fix.',
    onExpandedChange = undefined,
  }: {
    readonly label?: string;
    readonly duration?: string;
    readonly isStreaming?: boolean;
    readonly isExpanded?: boolean;
    readonly defaultIsExpanded?: boolean;
    readonly text?: string;
    readonly onExpandedChange?: (expanded: boolean) => void;
  } = $props();
</script>

<ChatReasoning
  {label}
  {duration}
  {isStreaming}
  {isExpanded}
  {defaultIsExpanded}
  {onExpandedChange}
>
  {text}
</ChatReasoning>
