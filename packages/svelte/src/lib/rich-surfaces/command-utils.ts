// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file command-utils.ts
 * @input Command search results and keyboard intents
 * @output Grouped visible command items and active-index transitions
 * @position Pure helpers for CommandPalette.svelte
 */

import type {CommandItem} from './types.js';

export type CommandGroup = {
  readonly heading: string | undefined;
  readonly items: readonly CommandItem[];
};

export function commandGroup(item: CommandItem): string | undefined {
  const group = item.auxiliaryData?.['group'];
  return typeof group === 'string' && group.length > 0 ? group : undefined;
}

export function groupCommands(items: readonly CommandItem[]): readonly CommandGroup[] {
  const groups = new Map<string, CommandItem[]>();
  const order: string[] = [];
  const ungrouped: CommandItem[] = [];

  for (const item of items) {
    const group = commandGroup(item);
    if (group == null) {
      ungrouped.push(item);
      continue;
    }
    if (!groups.has(group)) {
      groups.set(group, []);
      order.push(group);
    }
    groups.get(group)?.push(item);
  }

  const result: CommandGroup[] = order.map((heading) => ({
    heading,
    items: groups.get(heading) ?? [],
  }));
  if (ungrouped.length > 0) {
    result.push({heading: undefined, items: ungrouped});
  }
  return result;
}

export function enabledCommands(items: readonly CommandItem[]): readonly CommandItem[] {
  return items.filter((item) => item.isDisabled !== true);
}

export function nextActiveIndex(current: number, count: number, direction: 1 | -1): number {
  if (count <= 0) {
    return -1;
  }
  return (current + direction + count) % count;
}

export function commandItemId(baseId: string, item: CommandItem): string {
  return `${baseId}-item-${item.id}`;
}
