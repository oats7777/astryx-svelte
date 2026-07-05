<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file FoundationTodo4Probe.svelte
   * @input VisuallyHidden, Stack, and StackItem props
   * @output DOM fixture for latest-main foundation parity tests
   * @position Test fixture for Todo 4 Svelte foundation accessibility work
   */

  import Stack from '../Stack.svelte';
  import StackItem from '../StackItem.svelte';
  import VisuallyHidden from '../VisuallyHidden.svelte';
</script>

<VisuallyHidden data-testid="hidden-label">Screen reader label</VisuallyHidden>
<VisuallyHidden as="div" aria-live="polite" data-testid="hidden-live">
  Updated results
</VisuallyHidden>

<Stack
  direction="horizontal"
  gap={2}
  padding={3}
  paddingInline={4}
  paddingBlock={1.5}
  isScrollable
  data-testid="scroll-stack"
>
  <StackItem size="fill" isScrollable data-testid="scroll-item">
    <div style="height: 200px">Overflowing child</div>
  </StackItem>
  <StackItem crossAlignSelf="end" data-testid="static-item">Static child</StackItem>
</Stack>
