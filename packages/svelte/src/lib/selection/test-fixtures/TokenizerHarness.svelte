<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file TokenizerHarness.svelte
   * @input Tokenizer change callback from Vitest
   * @output Controlled tokenizer fixture that mirrors accepted tokens into props
   * @position Test fixture for Todo 10 tokenizer behavior
   */

  import Tokenizer from '../Tokenizer.svelte';
  import type {TokenizerToken} from '../combo-types.js';

  let {
    onChange,
    isDisabled = false,
    isReadOnly = false,
  }: {
    readonly onChange: (tokens: readonly TokenizerToken[], event: Event) => void;
    readonly isDisabled?: boolean;
    readonly isReadOnly?: boolean;
  } = $props();

  let tokens = $state<readonly TokenizerToken[]>([]);

  function handleChange(nextTokens: readonly TokenizerToken[], event: Event): void {
    tokens = nextTokens;
    onChange(nextTokens, event);
  }
</script>

<Tokenizer
  id="keywords"
  label="Keywords"
  name="keywords"
  placeholder="Add keyword"
  value={tokens}
  delimiters={[',', ';']}
  {isDisabled}
  {isReadOnly}
  onChange={handleChange}
  data-testid="tokenizer"
/>
