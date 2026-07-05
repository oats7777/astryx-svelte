<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts" module>
  let tooltipSequence = 0;
</script>

<script lang="ts">
  /**
   * @file Button.svelte
   * @input Button label, variant, size, icon, link, loading, and disabled props
   * @output Tokenized button or router-aware link button
   * @position Svelte port of core Button
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAnchorAttributes, HTMLButtonAttributes} from 'svelte/elements';
  import {
    actionClass,
    computeTargetAndRel,
    type ActionSize,
    type ActionVariant,
    type LinkComponent,
  } from './action-utils.js';
  import ButtonContent from './ButtonContent.svelte';
  import {getButtonGroupValue} from './button-group-context.js';
  import {getLinkProviderValue} from './link-context.js';

  type Props = HTMLButtonAttributes &
    HTMLAnchorAttributes & {
      readonly as?: LinkComponent;
      readonly children?: Snippet;
      readonly endContent?: Snippet;
      readonly href?: string;
      readonly icon?: Snippet | string;
      readonly isDisabled?: boolean;
      readonly isIconOnly?: boolean;
      readonly isLoading?: boolean;
      readonly label: string;
      readonly rel?: string;
      readonly size?: ActionSize;
      readonly target?: string;
      readonly tooltip?: string;
      readonly tooltipId?: string;
      readonly type?: 'button' | 'submit' | 'reset';
      readonly variant?: ActionVariant;
      readonly onBlur?: (event: FocusEvent) => void;
      readonly onClick?: (event: MouseEvent) => void;
      readonly onFocus?: (event: FocusEvent) => void;
      readonly onKeyDown?: (event: KeyboardEvent) => void;
      readonly onMouseEnter?: (event: MouseEvent) => void;
      readonly onMouseLeave?: (event: MouseEvent) => void;
      readonly onblur?: (event: FocusEvent) => void;
      readonly onclick?: (event: MouseEvent) => void;
      readonly onfocus?: (event: FocusEvent) => void;
      readonly onkeydown?: (event: KeyboardEvent) => void;
      readonly onmouseenter?: (event: MouseEvent) => void;
      readonly onmouseleave?: (event: MouseEvent) => void;
    };

  let {
    as = undefined,
    children = undefined,
    class: className = undefined,
    endContent = undefined,
    href = undefined,
    icon = undefined,
    isDisabled = false,
    isIconOnly = false,
    isLoading = false,
    label,
    rel: relFromProps = undefined,
    size = 'md',
    target = undefined,
    tooltip = undefined,
    tooltipId = undefined,
    type = 'button',
    variant = 'secondary',
    onBlur = undefined,
    onClick = undefined,
    onFocus = undefined,
    onKeyDown = undefined,
    onMouseEnter = undefined,
    onMouseLeave = undefined,
    onblur = undefined,
    onclick = undefined,
    onfocus = undefined,
    onkeydown = undefined,
    onmouseenter = undefined,
    onmouseleave = undefined,
    ...rest
  }: Props = $props();

  const provider = getLinkProviderValue();
  const group = getButtonGroupValue();
  const blurHandler = $derived(onblur ?? onBlur);
  const clickHandler = $derived(onclick ?? onClick);
  const focusHandler = $derived(onfocus ?? onFocus);
  const keyDownHandler = $derived(onkeydown ?? onKeyDown);
  const mouseEnterHandler = $derived(onmouseenter ?? onMouseEnter);
  const mouseLeaveHandler = $derived(onmouseleave ?? onMouseLeave);
  const CustomLink = $derived(as ?? provider?.component);
  const isDisabledState = $derived(isDisabled || isLoading || group?.isDisabled === true);
  const useAriaDisabled = $derived(tooltip != null && isDisabledState);
  const renderAsLink = $derived(href != null && !isDisabledState);
  const linkMeta = $derived(computeTargetAndRel(target, relFromProps));
  const generatedTooltipId = `astryx-button-tooltip-${++tooltipSequence}`;
  const resolvedTooltipId = $derived(
    tooltip == null ? undefined : (tooltipId ?? generatedTooltipId),
  );
  const rootClass = $derived(
    actionClass(
      'astryx-button',
      `astryx-button--variant-${variant}`,
      `astryx-button--size-${size}`,
      isIconOnly && 'astryx-button--icon-only',
      isDisabledState && 'astryx-button--disabled',
      className,
    ),
  );
  const iconText = $derived(typeof icon === 'string' ? icon : undefined);
  const iconSnippet = $derived(typeof icon === 'function' ? icon : undefined);
  const ariaLabel = $derived(isIconOnly || isLoading || children != null ? label : undefined);
  let isTooltipOpen = $state(false);

  function handleClick(event: MouseEvent): void {
    if (isDisabledState) {
      event.preventDefault();
      return;
    }
    clickHandler?.(event);
  }

  function showTooltip(): void {
    if (tooltip != null) {
      isTooltipOpen = true;
    }
  }

  function hideTooltip(): void {
    isTooltipOpen = false;
  }

  function handleFocus(event: FocusEvent): void {
    showTooltip();
    focusHandler?.(event);
  }

  function handleBlur(event: FocusEvent): void {
    hideTooltip();
    blurHandler?.(event);
  }

  function handleMouseEnter(event: MouseEvent): void {
    showTooltip();
    mouseEnterHandler?.(event);
  }

  function handleMouseLeave(event: MouseEvent): void {
    hideTooltip();
    mouseLeaveHandler?.(event);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (useAriaDisabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
    if (event.key === 'Escape') {
      hideTooltip();
    }
    keyDownHandler?.(event);
  }
</script>

{#if renderAsLink && CustomLink}
  <CustomLink
    {...rest}
    {href}
    to={href}
    target={linkMeta.target}
    rel={linkMeta.rel}
    class={rootClass}
    aria-label={ariaLabel}
    data-variant={variant}
    data-size={size}
    data-disabled={isDisabledState ? 'true' : undefined}
    data-loading={isLoading ? 'true' : undefined}
    aria-describedby={resolvedTooltipId}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
    onclick={handleClick}
  >
    <ButtonContent {children} {endContent} {iconSnippet} {iconText} {isIconOnly} {label} />
  </CustomLink>
{:else if renderAsLink}
  <a
    {...rest}
    {href}
    target={linkMeta.target}
    rel={linkMeta.rel}
    class={rootClass}
    aria-label={ariaLabel}
    data-variant={variant}
    data-size={size}
    data-disabled={isDisabledState ? 'true' : undefined}
    data-loading={isLoading ? 'true' : undefined}
    aria-describedby={resolvedTooltipId}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
    onclick={handleClick}
  >
    <ButtonContent {children} {endContent} {iconSnippet} {iconText} {isIconOnly} {label} />
  </a>
{:else}
  <button
    {...rest}
    {type}
    class={rootClass}
    disabled={useAriaDisabled ? undefined : isDisabledState}
    aria-label={ariaLabel}
    aria-busy={isLoading ? 'true' : undefined}
    aria-describedby={resolvedTooltipId}
    aria-disabled={useAriaDisabled ? 'true' : undefined}
    data-variant={variant}
    data-size={size}
    data-disabled={isDisabledState ? 'true' : undefined}
    data-loading={isLoading ? 'true' : undefined}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
    onclick={handleClick}
  >
    <ButtonContent
      {children}
      {endContent}
      {iconSnippet}
      {iconText}
      {isIconOnly}
      {isLoading}
      {label}
    />
  </button>
{/if}

{#if tooltip && resolvedTooltipId}
  <span id={resolvedTooltipId} role="tooltip" class="astryx-tooltip" hidden={!isTooltipOpen}>
    {tooltip}
  </span>
{/if}
