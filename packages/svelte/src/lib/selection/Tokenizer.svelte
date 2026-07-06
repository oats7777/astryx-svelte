<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Tokenizer.svelte
   * @input Token array, delimiters, form name, disabled/read-only state, and change callback
   * @output Token editing input with chip removal, Backspace deletion, and serialized hidden value
   * @position Svelte/Tailwind port selection slice for Todo 10
   */

  import type {TokenizerChangeHandler, TokenizerToken} from './combo-types.js';
  import {nextComboId, serializeTokens, splitTokenInput, tokenFromText} from './combo-utils.js';

  let {
    id = nextComboId('tokenizer'),
    label,
    value = [],
    name = undefined,
    placeholder = 'Add token',
    delimiters = [','],
    isDisabled = false,
    isReadOnly = false,
    onChange,
    'data-testid': testId = undefined,
  }: {
    readonly id?: string;
    readonly label: string;
    readonly value?: readonly TokenizerToken[];
    readonly name?: string;
    readonly placeholder?: string;
    readonly delimiters?: readonly string[];
    readonly isDisabled?: boolean;
    readonly isReadOnly?: boolean;
    readonly onChange: TokenizerChangeHandler;
    readonly 'data-testid'?: string;
  } = $props();

  let inputValue = $state('');
  let localTokens = $state<readonly TokenizerToken[] | null>(null);
  let lastPropValue: readonly TokenizerToken[] | undefined;

  const tokens = $derived(localTokens ?? value);
  const hiddenSerialized = $derived(tokens.length === 0 ? undefined : serializeTokens(tokens));

  $effect(() => {
    if (value !== lastPropValue) {
      lastPropValue = value;
      localTokens = null;
    }
  });

  function emit(nextTokens: readonly TokenizerToken[], event: Event): void {
    localTokens = nextTokens;
    void onChange(nextTokens, event);
  }

  function addTokens(parts: readonly string[], event: Event): void {
    if (isDisabled || isReadOnly || parts.length === 0) {
      return;
    }
    const existing = new Set(tokens.map((token) => token.value));
    const nextTokens = [...tokens];
    for (const part of parts) {
      const token = tokenFromText(part);
      if (!existing.has(token.value)) {
        existing.add(token.value);
        nextTokens.push(token);
      }
    }
    if (nextTokens.length !== tokens.length) {
      emit(nextTokens, event);
    }
  }

  function commitInput(event: Event): void {
    const parts = splitTokenInput(inputValue, delimiters);
    addTokens(parts, event);
    inputValue = '';
    if (event.currentTarget instanceof HTMLInputElement) {
      event.currentTarget.value = '';
    }
  }

  function removeToken(tokenValue: string, event: Event): void {
    if (isDisabled || isReadOnly) {
      return;
    }
    emit(tokens.filter((token) => token.value !== tokenValue), event);
  }

  function handleInput(event: Event): void {
    if (isDisabled || isReadOnly || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    inputValue = event.currentTarget.value;
    if (delimiters.some((delimiter) => inputValue.includes(delimiter))) {
      commitInput(event);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (isDisabled || isReadOnly) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      commitInput(event);
      return;
    }
    if ((event.key === 'Backspace' || event.key === 'Delete') && inputValue.length === 0 && tokens.length > 0) {
      event.preventDefault();
      const nextTokens = tokens.slice(0, -1);
      emit(nextTokens, event);
    }
  }
</script>

<div class="astryx-field" data-testid={testId}>
  <label id={`${id}-label`} for={id}>{label}</label>
  {#if name && hiddenSerialized}
    <input type="hidden" {name} value={hiddenSerialized} />
  {/if}
  <div class="astryx-input-shell" role="group" aria-labelledby={`${id}-label`}>
    {#each tokens as token}
      <span class="astryx-token">
        <span class="astryx-token__label">{token.label}</span>
        <button type="button" class="astryx-token__remove" aria-label={`Remove ${token.label}`} disabled={isDisabled || isReadOnly} onclick={(event) => removeToken(token.value, event)}>
          ×
        </button>
      </span>
    {/each}
    <input
      {id}
      class="astryx-text-input"
      type="text"
      value={inputValue}
      {placeholder}
      disabled={isDisabled}
      readonly={isReadOnly}
      oninput={handleInput}
      onkeydown={handleKeydown}
    />
  </div>
</div>
