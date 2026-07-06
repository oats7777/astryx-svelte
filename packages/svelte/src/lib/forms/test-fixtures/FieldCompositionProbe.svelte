<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file FieldCompositionProbe.svelte
   * @input Field child-snippet association contract
   * @output Realistic labelled input composed from Field-provided IDs
   * @position Test fixture for Todo 9 Field accessibility coverage
   */

  import Field from '../Field.svelte';
</script>

<Field
  id="profile-email"
  label="Profile email"
  description="Used for account recovery"
  status={{type: 'error', message: 'Enter a valid email'}}
>
  {#snippet children(ids)}
    <input
      id={ids.id}
      type="email"
      aria-describedby={ids.describedBy}
      aria-invalid={ids.statusId == null ? undefined : 'true'}
    />
  {/snippet}
</Field>
