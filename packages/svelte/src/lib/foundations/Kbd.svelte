<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Kbd.svelte
   * @input Keyboard shortcut keys and kbd attributes
   * @output Formatted keyboard shortcut
   * @position Svelte port of core Kbd
   */

  import type {HTMLAttributes} from 'svelte/elements';
  import {foundationClass} from './types.js';

  type Props = HTMLAttributes<HTMLElement> & {
    readonly keys: readonly string[];
  };

  const keyDisplay: Readonly<Record<string, string>> = {
    alt: 'Alt',
    command: '⌘',
    control: 'Ctrl',
    ctrl: 'Ctrl',
    enter: 'Enter',
    option: '⌥',
    shift: '⇧',
  };
  const keyLabel: Readonly<Record<string, string>> = {
    alt: 'Alt',
    command: 'Command',
    control: 'Control',
    ctrl: 'Control',
    enter: 'Enter',
    option: 'Option',
    shift: 'Shift',
  };

  let {keys, class: className, ...rest}: Props = $props();

  function normalizeKey(key: string): string {
    return key.trim().toLowerCase();
  }

  function fallbackKey(key: string): string {
    const trimmed = key.trim();
    return trimmed.length === 1 ? trimmed.toUpperCase() : trimmed;
  }

  const displayLabel = $derived(
    keys.map((key) => keyDisplay[normalizeKey(key)] ?? fallbackKey(key)).join(''),
  );
  const spokenLabel = $derived(
    keys.map((key) => keyLabel[normalizeKey(key)] ?? fallbackKey(key)).join(' + '),
  );
</script>

<span {...rest} class={foundationClass('kbd', className)} role="img" aria-label={spokenLabel}>
  <kbd aria-hidden="true">{displayLabel}</kbd>
</span>
