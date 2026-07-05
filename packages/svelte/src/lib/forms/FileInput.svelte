<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file FileInput.svelte
   * @input File input props, selected files, validation, and clear events
   * @output Accessible file picker with live status and selected file names
   * @position File input control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {announce} from '../actions/announce.js';
  import {describedBy, fileMatchesAccept, formatFiles, isPromiseLike, nextFormId} from './form-utils.js';
  import type {FieldStatusInput, FileChangeHandler} from './types.js';

  let {
    id = nextFormId('file-input'),
    label,
    value = null,
    placeholder = undefined,
    name = undefined,
    accept = undefined,
    maxFiles = undefined,
    maxSize = undefined,
    isMultiple = false,
    isLabelHidden = false,
    isRequired = false,
    isDisabled = false,
    isLoading = false,
    status = undefined,
    description = undefined,
    onChange = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: readonly File[] | null;
    readonly placeholder?: string;
    readonly name?: string;
    readonly accept?: string;
    readonly maxFiles?: number;
    readonly maxSize?: number;
    readonly isMultiple?: boolean;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly isDisabled?: boolean;
    readonly isLoading?: boolean;
    readonly status?: FieldStatusInput;
    readonly description?: string;
    readonly onChange?: FileChangeHandler;
  }>();

  let inputElement = $state<HTMLInputElement>();
  let pending = $state(false);
  let validationMessage = $state<string | undefined>();
  const files = $derived(value ?? []);
  const displayText = $derived(files.length > 0 ? formatFiles(files) : placeholder ?? (isMultiple ? 'Choose files' : 'Choose file'));
  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const validationId = $derived(validationMessage == null ? undefined : `${id}-validation`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const busy = $derived(isLoading || pending);
  const canClear = $derived(files.length > 0 && !isDisabled && !busy);

  function validFiles(nextFiles: readonly File[]): readonly File[] {
    let accepted = nextFiles.filter((file) => {
      const matches = fileMatchesAccept(file, accept);
      if (!matches && validationMessage == null) {
        validationMessage = `${file.name} is not an accepted file type`;
      }
      return matches;
    });

    accepted = accepted.filter((file) => {
      const matches = maxSize == null || file.size <= maxSize;
      if (!matches && validationMessage == null) {
        validationMessage = `${file.name} exceeds ${maxSize} byte limit`;
      }
      return matches;
    });

    if (isMultiple && maxFiles != null && accepted.length > maxFiles) {
      validationMessage = `Maximum ${maxFiles} files allowed`;
      accepted = accepted.slice(0, maxFiles);
    }

    if (accepted.length === nextFiles.length) {
      validationMessage = undefined;
    }
    return accepted;
  }

  async function emitChange(nextFiles: readonly File[] | null, event: Event): Promise<void> {
    const result = onChange?.(nextFiles, event);
    if (isPromiseLike(result)) {
      pending = true;
      try {
        await result;
      } finally {
        pending = false;
      }
    }
  }

  function handleInput(event: Event): void {
    if (isDisabled || busy || !(event.currentTarget instanceof HTMLInputElement)) {
      return;
    }
    validationMessage = undefined;
    const nextFiles = validFiles([...Array.from(event.currentTarget.files ?? [])]);
    if (nextFiles.length > 0 && validationMessage == null) {
      announce(nextFiles.length === 1 ? `1 file selected: ${nextFiles[0]?.name ?? ''}` : `${nextFiles.length} files selected`);
    }
    void emitChange(nextFiles.length === 0 ? null : nextFiles, event);
  }

  function clear(event: MouseEvent): void {
    if (isDisabled || busy) {
      return;
    }
    if (inputElement != null) {
      inputElement.value = '';
    }
    validationMessage = undefined;
    void emitChange(null, event);
  }
</script>

<div class="astryx-field" data-invalid={status?.type === 'error'}>
  <label class={isLabelHidden ? 'astryx-sr-only' : undefined} for={id}>{label}</label>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  <div class="astryx-file-input">
    <input
      bind:this={inputElement}
      {id}
      {name}
      type="file"
      {accept}
      multiple={isMultiple}
      disabled={isDisabled}
      aria-required={isRequired ? 'true' : undefined}
      aria-invalid={status?.type === 'error' ? 'true' : undefined}
      aria-busy={busy ? 'true' : undefined}
      aria-describedby={describedBy(descriptionId, validationId, statusId)}
      onchange={handleInput}
    />
    <span class="astryx-file-summary">{displayText}</span>
    {#if canClear}
      <button class="astryx-clear-button" type="button" aria-label={`Clear ${label}`} onclick={clear}>Clear</button>
    {/if}
  </div>
  {#if validationMessage}
    <p id={validationId} class="astryx-field-status" role="alert" aria-live="assertive">{validationMessage}</p>
  {/if}
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
