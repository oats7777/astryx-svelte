<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts" module>
  let tooltipSequence = 0;
</script>

<script lang="ts">
  /**
   * @file Link.svelte
   * @input Link href, label, disabled, external, provider, and tooltip props
   * @output Accessible anchor or button with Astryx action styling
   * @position Svelte port of core Link
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAnchorAttributes, HTMLButtonAttributes} from 'svelte/elements';
  import {
    actionClass,
    computeTargetAndRel,
    resolveInteractiveRole,
    type ActionColor,
    type LinkComponent,
  } from './action-utils.js';
  import {getLinkProviderValue} from './link-context.js';

  type Props = Omit<HTMLAnchorAttributes & HTMLButtonAttributes, 'color'> & {
    readonly as?: LinkComponent;
    readonly children?: Snippet;
    readonly color?: ActionColor | 'accent' | 'inherit' | 'secondary';
    readonly hasUnderline?: boolean;
    readonly href?: string;
    readonly isDisabled?: boolean;
    readonly isExternalLink?: boolean;
    readonly isStandalone?: boolean;
    readonly label: string;
    readonly newTabLabel?: string;
    readonly rel?: string;
    readonly target?: string;
    readonly tooltip?: string;
    readonly tooltipId?: string;
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
    color = 'accent',
    hasUnderline = false,
    href = undefined,
    isDisabled = false,
    isExternalLink = false,
    isStandalone = false,
    label,
    newTabLabel = '(opens in new tab)',
    rel: relFromProps = undefined,
    target: targetFromProps = undefined,
    tooltip = undefined,
    tooltipId = undefined,
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
  const blurHandler = $derived(onblur ?? onBlur);
  const clickHandler = $derived(onclick ?? onClick);
  const focusHandler = $derived(onfocus ?? onFocus);
  const keyDownHandler = $derived(onkeydown ?? onKeyDown);
  const mouseEnterHandler = $derived(onmouseenter ?? onMouseEnter);
  const mouseLeaveHandler = $derived(onmouseleave ?? onMouseLeave);
  const role = $derived(resolveInteractiveRole({href, onClick: clickHandler, isDisabled}));
  const renderAsButton = $derived(role === 'button' || (role === 'inert' && href == null));
  const linkMeta = $derived(
    computeTargetAndRel(isExternalLink ? '_blank' : targetFromProps, relFromProps),
  );
  const CustomLink = $derived(as ?? provider?.component);
  const useAriaDisabled = $derived(tooltip != null && isDisabled);
  const showsNewTabAnnouncement = $derived(isExternalLink && !renderAsButton);
  const accessibleLabel = $derived(
    showsNewTabAnnouncement ? `${label} ${newTabLabel}` : label,
  );
  const generatedTooltipId = `astryx-link-tooltip-${++tooltipSequence}`;
  const resolvedTooltipId = $derived(
    tooltip == null ? undefined : (tooltipId ?? generatedTooltipId),
  );
  const rootClass = $derived(
    actionClass(
      'astryx-link',
      `astryx-link--color-${color}`,
      hasUnderline && 'astryx-link--underlined',
      isStandalone && 'astryx-link--standalone',
      isDisabled && 'astryx-link--disabled',
      className,
    ),
  );
  let isTooltipOpen = $state(false);

  function handleButtonClick(event: MouseEvent): void {
    if (isDisabled) {
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

{#if renderAsButton}
  <button
    {...rest}
    type="button"
    class={rootClass}
    aria-label={label}
    aria-disabled={isDisabled ? 'true' : undefined}
    aria-describedby={resolvedTooltipId}
    disabled={useAriaDisabled ? undefined : isDisabled}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
    onclick={handleButtonClick}
  >
    {#if children}
      {@render children()}
    {:else}
      {label}
    {/if}
  </button>
{:else if CustomLink}
  <CustomLink
    {...rest}
    {href}
    to={href}
    target={linkMeta.target}
    rel={linkMeta.rel}
    class={rootClass}
    aria-label={accessibleLabel}
    aria-disabled={isDisabled ? 'true' : undefined}
    aria-describedby={resolvedTooltipId}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
    onclick={clickHandler}
  >
    {#if children}
      {@render children()}
    {:else}
      {label}
    {/if}
    {#if showsNewTabAnnouncement}
      <span class="astryx-sr-only">{newTabLabel}</span>
    {/if}
  </CustomLink>
{:else}
  <a
    {...rest}
    {href}
    target={linkMeta.target}
    rel={linkMeta.rel}
    class={rootClass}
    aria-label={accessibleLabel}
    aria-disabled={isDisabled ? 'true' : undefined}
    aria-describedby={resolvedTooltipId}
    onfocus={handleFocus}
    onblur={handleBlur}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    onkeydown={handleKeyDown}
    onclick={clickHandler}
  >
    {#if children}
      {@render children()}
    {:else}
      {label}
    {/if}
    {#if showsNewTabAnnouncement}
      <span class="astryx-sr-only">{newTabLabel}</span>
    {/if}
  </a>
{/if}

{#if tooltip && resolvedTooltipId}
  <span id={resolvedTooltipId} role="tooltip" class="astryx-tooltip" hidden={!isTooltipOpen}>
    {tooltip}
  </span>
{/if}
