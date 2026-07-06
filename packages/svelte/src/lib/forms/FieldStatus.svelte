<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file FieldStatus.svelte
   * @input Status type, message, and optional ID
   * @output Accessible form status text
   * @position Shared status primitive for Svelte form controls
   */

  import {statusLive, statusRole} from './form-utils.js';
  import type {FieldStatusType} from './types.js';

  let {id = undefined, type = 'success', message = '', class: className = undefined} = $props<{
    readonly id?: string;
    readonly type?: FieldStatusType;
    readonly message?: string;
    readonly class?: string;
  }>();

  const status = $derived({type, message});
</script>

{#if message}
  <p
    {id}
    class={['astryx-field-status', className].filter(Boolean).join(' ')}
    data-status={type}
    role={statusRole(status)}
    aria-live={statusLive(status)}
  >
    {message}
  </p>
{/if}
