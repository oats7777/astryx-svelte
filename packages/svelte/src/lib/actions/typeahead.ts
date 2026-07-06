// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file typeahead.ts
 * @input Item labels, active index, disabled predicate, and keyboard events
 * @output Collection-agnostic type-to-focus controller
 * @position Shared Svelte accessibility utility for menus, listboxes, trees, and grids
 */

export type TypeaheadOptions = {
  readonly getItemLabels: () => readonly (string | null | undefined)[];
  readonly onMatch: (index: number) => void;
  readonly getCurrentIndex?: () => number;
  readonly resetMs?: number;
  readonly isDisabled?: (index: number) => boolean;
};

export type TypeaheadController = {
  readonly onKeyDown: (event: KeyboardEvent) => boolean;
  readonly reset: () => void;
};

function isPrintableCharacter(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== ' ';
}

export function createTypeahead(options: TypeaheadOptions): TypeaheadController {
  const {getItemLabels, onMatch, getCurrentIndex, resetMs = 750, isDisabled} = options;
  let buffer = '';
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  function reset(): void {
    buffer = '';
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  }

  function scheduleReset(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      buffer = '';
      timeoutId = undefined;
    }, resetMs);
  }

  function onKeyDown(event: KeyboardEvent): boolean {
    const isSpaceMidType = event.key === ' ' && buffer.length > 0;
    if (!isPrintableCharacter(event) && !isSpaceMidType) {
      return false;
    }

    const labels = getItemLabels();
    if (labels.length === 0) {
      return false;
    }

    const character = event.key.toLowerCase();
    const isRepeatSameCharacter =
      buffer.length > 0 && Array.from(buffer).every(value => value === character);
    const query = isRepeatSameCharacter ? character : buffer + character;
    buffer = query;
    scheduleReset();

    const start = getCurrentIndex?.() ?? -1;
    const offset = isRepeatSameCharacter ? 1 : 0;

    for (let step = 0; step < labels.length; step += 1) {
      const index = (start + offset + step + labels.length) % labels.length;
      if (isDisabled?.(index)) {
        continue;
      }

      const label = labels[index];
      if (label != null && label.trim().toLowerCase().startsWith(query)) {
        onMatch(index);
        return true;
      }
    }

    return true;
  }

  return {onKeyDown, reset};
}
