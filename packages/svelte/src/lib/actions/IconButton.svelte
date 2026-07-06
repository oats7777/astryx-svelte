<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file IconButton.svelte
   * @input Icon-only button props
   * @output Button with icon-only semantics
   * @position Svelte wrapper over Button
   */

  import Button from './Button.svelte';
  import type {Snippet} from 'svelte';
  import type {ActionSize, ActionVariant, LinkComponent} from './action-utils.js';

  type Props = {
    readonly as?: LinkComponent;
    readonly class?: string;
    readonly href?: string;
    readonly icon: Snippet | string;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly label: string;
    readonly rel?: string;
    readonly size?: ActionSize;
    readonly target?: string;
    readonly tooltip?: string;
    readonly tooltipId?: string;
    readonly variant?: ActionVariant;
    readonly onClick?: (event: MouseEvent) => void;
    readonly onclick?: (event: MouseEvent) => void;
    readonly 'data-testid'?: string;
  };

  let {
    as = undefined,
    class: className = undefined,
    href = undefined,
    icon,
    isDisabled = false,
    isLoading = false,
    label,
    rel = undefined,
    size = 'md',
    target = undefined,
    tooltip = undefined,
    tooltipId = undefined,
    variant = 'secondary',
    onClick = undefined,
    onclick = undefined,
    'data-testid': testId = undefined,
  }: Props = $props();
</script>

<Button
  {as}
  class={className}
  {href}
  {icon}
  {isDisabled}
  {isLoading}
  {label}
  {rel}
  {size}
  {target}
  {tooltip}
  {tooltipId}
  {variant}
  {onClick}
  {onclick}
  data-testid={testId}
  isIconOnly
/>
