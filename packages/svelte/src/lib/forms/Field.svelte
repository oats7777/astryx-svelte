<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Field.svelte
   * @input Label, description, status, layout, and child snippet props
   * @output Labelled form field shell with accessible helper text
   * @position Shared field wrapper for Svelte form controls
   */

  import type {Snippet} from 'svelte';
  import {getFormLayoutDirection} from './FormLayoutContext.js';
  import FieldStatus from './FieldStatus.svelte';
  import {nextFormId} from './form-utils.js';
  import type {FieldStatusInput} from './types.js';

  type FieldControlIds = {
    readonly id: string;
    readonly descriptionId?: string;
    readonly statusId?: string;
    readonly describedBy?: string;
  };

  let {
    id = nextFormId('field'),
    label,
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    isOptional = false,
    status = undefined,
    width = undefined,
    children = undefined,
    class: className = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isOptional?: boolean;
    readonly status?: FieldStatusInput;
    readonly width?: string | number;
    readonly children?: Snippet<[FieldControlIds]>;
    readonly class?: string;
  }>();

  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const controlIds = $derived({
    id,
    descriptionId,
    statusId,
    describedBy: [descriptionId, statusId].filter(Boolean).join(' ') || undefined,
  });
  const direction = getFormLayoutDirection();
  const style = $derived(
    width == null ? undefined : `width: ${typeof width === 'number' ? `${width}px` : width}`,
  );
</script>

<div
  class={['astryx-field', className].filter(Boolean).join(' ')}
  data-layout={direction}
  data-invalid={status?.type === 'error'}
  {style}
>
  <label class:astryx-sr-only={isLabelHidden} for={id}>
    {label}
    {#if isRequired}
      <span class="astryx-field-indicator">Required</span>
    {:else if isOptional}
      <span class="astryx-field-indicator">Optional</span>
    {/if}
  </label>
  <div class="astryx-field-control">
    {#if children}
      {@render children(controlIds)}
    {/if}
  </div>
  {#if description}
    <p id={descriptionId} class={isLabelHidden ? 'astryx-sr-only' : 'astryx-field-description'}>{description}</p>
  {/if}
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
