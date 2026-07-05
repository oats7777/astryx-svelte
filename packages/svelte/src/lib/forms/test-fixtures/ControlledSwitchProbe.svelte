<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file ControlledSwitchProbe.svelte
   * @input Switch change callback from behavior tests
   * @output Controlled Switch harness that mirrors accepted changes back into props
   * @position Test fixture for Switch hidden-input form value semantics
   */

  import Switch from '../Switch.svelte';
  import type {BooleanChangeHandler} from '../types.js';

  let {
    onChange,
  }: {
    readonly onChange: BooleanChangeHandler;
  } = $props();

  let checked = $state(false);

  function handleChange(nextValue: boolean, event: Event): void | Promise<void> {
    checked = nextValue;
    return onChange(nextValue, event);
  }
</script>

<Switch id="email-alerts" label="Email alerts" name="emailAlerts" isChecked={checked} onChange={handleChange} />
