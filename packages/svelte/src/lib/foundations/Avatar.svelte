<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Avatar.svelte
   * @input Avatar image, fallback name, alt text, size, and status snippet
   * @output Accessible avatar shell with initials fallback
   * @position Svelte port of core Avatar and AvatarStatusDot composition
   */

  import type {Snippet} from 'svelte';
  import type {HTMLAttributes} from 'svelte/elements';
  import {getAvatarGroup, resolveAvatarSize, type AvatarSize} from './avatar-context.js';
  import {foundationClass, styleEntries} from './types.js';

  type Props = HTMLAttributes<HTMLDivElement> & {
    readonly alt?: string;
    readonly fallbackSrc?: string;
    readonly name?: string;
    readonly size?: AvatarSize;
    readonly src?: string;
    readonly status?: Snippet;
  };

  let {
    alt,
    fallbackSrc,
    name,
    size = 'small',
    src,
    status,
    class: className,
    style,
    ...rest
  }: Props = $props();

  const group = getAvatarGroup();
  const resolvedSize = $derived(resolveAvatarSize(group?.size ?? size));
  const initials = $derived(
    (name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join(''),
  );
  const imageSrc = $derived(src ?? fallbackSrc);
  const accessibleName = $derived(alt ?? name);
  const isDecorative = $derived(accessibleName == null || accessibleName.trim().length === 0);
</script>

<div
  {...rest}
  class={foundationClass('avatar', className, [group ? 'astryx-avatar--grouped' : undefined])}
  data-size={group?.size ?? size}
  role={isDecorative ? undefined : 'img'}
  aria-label={isDecorative ? undefined : accessibleName}
  aria-hidden={isDecorative ? 'true' : undefined}
  style={styleEntries(style, [
    ['--astryx-avatar-size', `${resolvedSize}px`],
    ['--astryx-avatar-group-overlap', group ? `${Math.round(resolvedSize * -0.25)}px` : undefined],
  ])}
>
  <div class="astryx-avatar__content">
    {#if imageSrc}
      <img class="astryx-avatar__image" src={imageSrc} alt="" />
    {:else if initials}
      <span class="astryx-avatar__fallback" aria-hidden="true">{initials}</span>
    {:else}
      <span class="astryx-avatar__fallback" aria-hidden="true"></span>
    {/if}
  </div>
  {#if status}
    <span class="astryx-avatar__status">
      {@render status()}
    </span>
  {/if}
</div>
