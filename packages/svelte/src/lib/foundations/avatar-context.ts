// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file avatar-context.ts
 * @input Avatar group size and overlap context
 * @output Shared Svelte avatar size context helpers
 * @position Internal context for Avatar and AvatarGroup foundations
 */

import {getContext, setContext} from 'svelte';

export type AvatarSize = 'tiny' | 'xsmall' | 'small' | 'medium' | 'large' | 16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180;

export type AvatarGroupContext = {
  readonly size: AvatarSize;
};

const avatarGroupContextKey = Symbol('astryx-avatar-group');

export function resolveAvatarSize(size: AvatarSize): number {
  if (typeof size === 'number') {
    return size;
  }
  switch (size) {
    case 'tiny':
      return 20;
    case 'xsmall':
      return 24;
    case 'small':
      return 36;
    case 'medium':
      return 48;
    case 'large':
      return 128;
  }
}

export function setAvatarGroup(context: AvatarGroupContext): void {
  setContext(avatarGroupContextKey, context);
}

export function getAvatarGroup(): AvatarGroupContext | undefined {
  return getContext<AvatarGroupContext | undefined>(avatarGroupContextKey);
}
