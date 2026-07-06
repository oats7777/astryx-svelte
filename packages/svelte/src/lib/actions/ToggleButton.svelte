<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ToggleButton.svelte
   * @input Controlled pressed state and button props
   * @output Pressable toggle button with aria-pressed semantics
   * @position Svelte port of core ToggleButton
   */

  import type {Snippet} from 'svelte';
  import type {ActionSize} from './action-utils.js';
  import Button from './Button.svelte';

  type Props = {
    readonly children?: Snippet;
    readonly icon?: Snippet | string;
    readonly isDisabled?: boolean;
    readonly isIconOnly?: boolean;
    readonly isLoading?: boolean;
    readonly isPressed?: boolean;
    readonly label: string;
    readonly onPressedChange?: (isPressed: boolean, event: MouseEvent) => void;
    readonly pressedIcon?: Snippet | string;
    readonly size?: ActionSize;
    readonly tooltip?: string;
    readonly value?: string;
    readonly 'data-testid'?: string;
  };

  let {
    children = undefined,
    icon = undefined,
    isDisabled = false,
    isIconOnly = false,
    isLoading = false,
    isPressed = false,
    label,
    onPressedChange = undefined,
    pressedIcon = undefined,
    size = 'md',
    tooltip = undefined,
    value = undefined,
    'data-testid': testId = undefined,
  }: Props = $props();

  const resolvedIcon = $derived(isPressed && pressedIcon != null ? pressedIcon : icon);

  function handleClick(event: MouseEvent): void {
    if (isDisabled) {
      return;
    }
    onPressedChange?.(!isPressed, event);
  }
</script>

<Button
  label={label}
  variant="ghost"
  {size}
  icon={resolvedIcon}
  {isDisabled}
  {isLoading}
  {isIconOnly}
  {tooltip}
  data-testid={testId}
  data-value={value}
  aria-pressed={isPressed ? 'true' : 'false'}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {:else if !isIconOnly}
    {label}
  {/if}
</Button>
