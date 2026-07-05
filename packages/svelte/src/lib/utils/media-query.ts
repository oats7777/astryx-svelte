// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file media-query.ts
 * @input CSS media query string and optional SSR default
 * @output Svelte readable store for matchMedia state
 * @position Todo 15 shared store replacement for React useMediaQuery
 */

import {readable, type Readable} from 'svelte/store';

export type MediaQueryOptions = {
  readonly serverDefault?: boolean;
};

function canMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

export function createMediaQueryStore(
  query: string,
  options: MediaQueryOptions = {},
): Readable<boolean> {
  const fallback = options.serverDefault ?? false;

  return readable(canMatchMedia() ? window.matchMedia(query).matches : fallback, (set) => {
    if (!canMatchMedia()) {
      set(fallback);
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const sync = (): void => set(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  });
}
