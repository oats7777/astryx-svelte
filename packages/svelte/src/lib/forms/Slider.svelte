<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  /**
   * @file Slider.svelte
   * @input Range bounds, single or tuple value, label, marks, and change handlers
   * @output Accessible single or range slider inputs with hidden form value support
   * @position Slider control for @astryxdesign/svelte forms
   */

  import FieldStatus from './FieldStatus.svelte';
  import {clamp, describedBy, nextFormId} from './form-utils.js';
  import type {FieldStatusInput} from './types.js';

  type SliderValue = number | readonly [number, number];
  type SliderValueDisplay = 'tooltip' | 'text' | 'none';
  type SliderMark = {
    readonly value: number;
    readonly label?: string;
  };

  let {
    id = nextFormId('slider'),
    label,
    value = 0,
    min = 0,
    max = 100,
    step = 1,
    name = undefined,
    description = undefined,
    isLabelHidden = false,
    isRequired = false,
    orientation = 'horizontal',
    isDisabled = false,
    status = undefined,
    formatValue = undefined,
    valueDisplay = 'tooltip',
    marks = undefined,
    minStepsBetweenThumbs = 0,
    onChange = undefined,
    onCommit = undefined,
    onChangeEnd = undefined,
  } = $props<{
    readonly id?: string;
    readonly label: string;
    readonly value?: SliderValue;
    readonly min?: number;
    readonly max?: number;
    readonly step?: number;
    readonly name?: string;
    readonly description?: string;
    readonly isLabelHidden?: boolean;
    readonly isRequired?: boolean;
    readonly orientation?: 'horizontal' | 'vertical';
    readonly isDisabled?: boolean;
    readonly status?: FieldStatusInput;
    readonly formatValue?: (value: number) => string;
    readonly valueDisplay?: SliderValueDisplay;
    readonly marks?: readonly SliderMark[];
    readonly minStepsBetweenThumbs?: number;
    readonly onChange?: (value: SliderValue, event: Event) => void;
    readonly onCommit?: (value: SliderValue, event: Event) => void;
    readonly onChangeEnd?: (value: SliderValue, event: Event) => void;
  }>();

  const descriptionId = $derived(description == null ? undefined : `${id}-desc`);
  const statusId = $derived(status?.message == null ? undefined : `${id}-status`);
  const isRange = $derived(Array.isArray(value));
  const effectiveStep = $derived(step > 0 ? step : 1);
  const singleValue = $derived(clamp(typeof value === 'number' ? value : min, min, max));
  const rangeValue = $derived(normalizeRangeValue(value, min, max, effectiveStep, minStepsBetweenThumbs));
  const renderedValues = $derived(isRange ? rangeValue : [singleValue]);
  const displayedValue = $derived(formatDisplayValue(renderedValues));
  const shouldDisplayValue = $derived(valueDisplay !== 'none');

  function snapToStep(nextValue: number): number {
    const steps = Math.round((nextValue - min) / effectiveStep);
    return min + steps * effectiveStep;
  }

  function normalizedNumber(nextValue: number): number {
    return clamp(snapToStep(nextValue), min, max);
  }

  function normalizeRangeValue(
    nextValue: SliderValue | undefined,
    minValue: number,
    maxValue: number,
    stepValue: number,
    minSteps: number,
  ): [number, number] {
    const fallback: readonly [number, number] = [minValue, maxValue];
    const source = Array.isArray(nextValue) ? nextValue : fallback;
    const minGap = Math.max(0, minSteps) * stepValue;
    let low = clamp(source[0], minValue, maxValue);
    let high = clamp(source[1], minValue, maxValue);

    if (low > high) {
      [low, high] = [high, low];
    }
    if (high - low < minGap) {
      high = clamp(low + minGap, minValue, maxValue);
      low = clamp(high - minGap, minValue, maxValue);
    }
    return [low, high];
  }

  function constrainedRangeValue(thumb: 'min' | 'max', nextValue: number): [number, number] {
    const minGap = Math.max(0, minStepsBetweenThumbs) * effectiveStep;
    const [currentLow, currentHigh] = rangeValue;
    if (thumb === 'min') {
      return [clamp(Math.min(normalizedNumber(nextValue), currentHigh - minGap), min, max), currentHigh];
    }
    return [currentLow, clamp(Math.max(normalizedNumber(nextValue), currentLow + minGap), min, max)];
  }

  function formatNumber(nextValue: number): string {
    return formatValue?.(nextValue) ?? String(nextValue);
  }

  function formatDisplayValue(nextValues: readonly number[]): string {
    return nextValues.length === 2 ? `${formatNumber(nextValues[0])} - ${formatNumber(nextValues[1])}` : formatNumber(nextValues[0]);
  }

  function valueForInput(event: Event, thumb: 'single' | 'min' | 'max'): SliderValue | null {
    if (!(event.currentTarget instanceof HTMLInputElement)) {
      return null;
    }
    if (thumb === 'single') {
      const nextValue = normalizedNumber(Number(event.currentTarget.value));
      event.currentTarget.value = String(nextValue);
      return nextValue;
    }
    const nextValue = constrainedRangeValue(thumb, Number(event.currentTarget.value));
    event.currentTarget.value = String(thumb === 'min' ? nextValue[0] : nextValue[1]);
    return nextValue;
  }

  function handleInput(event: Event, thumb: 'single' | 'min' | 'max'): void {
    if (isDisabled) {
      return;
    }
    const nextValue = valueForInput(event, thumb);
    if (nextValue != null) {
      onChange?.(nextValue, event);
    }
  }

  function handleCommit(event: Event, thumb: 'single' | 'min' | 'max'): void {
    if (isDisabled) {
      return;
    }
    const nextValue = valueForInput(event, thumb);
    if (nextValue != null) {
      onCommit?.(nextValue, event);
      onChangeEnd?.(nextValue, event);
    }
  }
</script>

<div class="astryx-field" data-invalid={status?.type === 'error'}>
  <label class:astryx-sr-only={isLabelHidden} for={isRange ? `${id}-min` : id}>{label}</label>
  {#if description}
    <p id={descriptionId} class="astryx-field-description">{description}</p>
  {/if}
  {#if name}
    {#each renderedValues as hiddenValue}
      <input type="hidden" {name} value={String(hiddenValue)} />
    {/each}
  {/if}
  <div class="astryx-slider-group" data-orientation={orientation}>
    {#if isRange}
      <input
        id={`${id}-min`}
        class="astryx-slider"
        type="range"
        {min}
        {max}
        step={effectiveStep}
        value={rangeValue[0]}
        disabled={isDisabled}
        required={isRequired}
        aria-label={`${label}, minimum value`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={rangeValue[0]}
        aria-valuetext={formatNumber(rangeValue[0])}
        aria-orientation={orientation}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        oninput={(event) => handleInput(event, 'min')}
        onchange={(event) => handleCommit(event, 'min')}
        onkeyup={(event) => handleCommit(event, 'min')}
      />
      <input
        id={`${id}-max`}
        class="astryx-slider"
        type="range"
        {min}
        {max}
        step={effectiveStep}
        value={rangeValue[1]}
        disabled={isDisabled}
        required={isRequired}
        aria-label={`${label}, maximum value`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={rangeValue[1]}
        aria-valuetext={formatNumber(rangeValue[1])}
        aria-orientation={orientation}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        oninput={(event) => handleInput(event, 'max')}
        onchange={(event) => handleCommit(event, 'max')}
        onkeyup={(event) => handleCommit(event, 'max')}
      />
    {:else}
      <input
        {id}
        class="astryx-slider"
        type="range"
        {min}
        {max}
        step={effectiveStep}
        value={singleValue}
        disabled={isDisabled}
        required={isRequired}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={singleValue}
        aria-valuetext={formatNumber(singleValue)}
        aria-orientation={orientation}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-describedby={describedBy(descriptionId, statusId)}
        oninput={(event) => handleInput(event, 'single')}
        onchange={(event) => handleCommit(event, 'single')}
        onkeyup={(event) => handleCommit(event, 'single')}
      />
    {/if}
  </div>
  {#if marks && marks.length > 0}
    <div class="astryx-slider-marks" aria-label={`${label} marks`}>
      {#each marks as mark}
        <span class="astryx-slider-mark" data-mark-value={mark.value}>{mark.label ?? String(mark.value)}</span>
      {/each}
    </div>
  {/if}
  {#if shouldDisplayValue}
    <output class="astryx-slider-value" data-display={valueDisplay} for={isRange ? `${id}-min ${id}-max` : id}>
      {displayedValue}
    </output>
  {/if}
  {#if status?.message}
    <FieldStatus id={statusId} type={status.type} message={status.message} />
  {/if}
</div>
