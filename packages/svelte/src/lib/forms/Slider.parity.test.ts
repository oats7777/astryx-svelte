// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Slider.parity.test.ts
 * @input Svelte Slider component and DOM-driven range interactions
 * @output Behavior coverage for Slider single/range parity
 * @position Focused Todo 9 Slider parity tests for @astryxdesign/svelte forms
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it, vi} from 'vitest';
import Slider from './Slider.svelte';

function createTarget(): HTMLElement {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return target;
}

describe('Svelte Slider parity behavior', () => {
  it('Given a range slider with marks and text display When rendered Then both thumbs, values, marks, and field semantics are exposed', async () => {
    const target = createTarget();
    const app = mount(Slider, {
      target,
      props: {
        id: 'price',
        label: 'Price range',
        description: 'Choose a budget window',
        name: 'price',
        value: [20, 80],
        min: 0,
        max: 100,
        step: 5,
        isRequired: true,
        valueDisplay: 'text',
        marks: [
          {value: 0, label: '$0'},
          {value: 50, label: '$50'},
          {value: 100, label: '$100'},
        ],
        formatValue: (value: number) => `$${value}`,
        status: {type: 'error', message: 'Pick a valid range'},
      },
    });

    await tick();

    const sliders = target.querySelectorAll<HTMLInputElement>('input[type="range"]');
    const hiddenValues = [...target.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="price"]')].map(
      (input) => input.value,
    );

    expect(sliders).toHaveLength(2);
    expect(sliders[0]?.value).toBe('20');
    expect(sliders[1]?.value).toBe('80');
    expect(sliders[0]?.getAttribute('aria-label')).toBe('Price range, minimum value');
    expect(sliders[1]?.getAttribute('aria-label')).toBe('Price range, maximum value');
    expect(sliders[0]?.getAttribute('aria-valuetext')).toBe('$20');
    expect(sliders[1]?.getAttribute('aria-valuetext')).toBe('$80');
    expect(sliders[0]?.required).toBe(true);
    expect(sliders[0]?.getAttribute('aria-invalid')).toBe('true');
    expect(sliders[0]?.getAttribute('aria-describedby')).toContain('price-desc');
    expect(sliders[0]?.getAttribute('aria-describedby')).toContain('price-status');
    expect(hiddenValues).toEqual(['20', '80']);
    expect(target.textContent).toContain('$20 - $80');
    expect(target.textContent).toContain('$0');
    expect(target.textContent).toContain('$50');
    expect(target.textContent).toContain('$100');

    await unmount(app);
  });

  it('Given single and range sliders When input and commit events fire Then payloads match displayed DOM values', async () => {
    const target = createTarget();
    const singleChange = vi.fn();
    const singleCommit = vi.fn();
    const rangeChange = vi.fn();
    const rangeCommit = vi.fn();
    const single = mount(Slider, {
      target,
      props: {
        id: 'volume',
        label: 'Volume',
        value: 3,
        min: 0,
        max: 10,
        step: 1,
        valueDisplay: 'text',
        onChange: singleChange,
        onCommit: singleCommit,
      },
    });
    const range = mount(Slider, {
      target,
      props: {
        id: 'discount',
        label: 'Discount range',
        value: [20, 80],
        min: 0,
        max: 100,
        step: 5,
        minStepsBetweenThumbs: 3,
        valueDisplay: 'none',
        onChange: rangeChange,
        onCommit: rangeCommit,
      },
    });

    await tick();

    const singleInput = target.querySelector<HTMLInputElement>('#volume');
    const rangeInputs = [...target.querySelectorAll<HTMLInputElement>('input[type="range"]')].filter(
      (input) => input.id.startsWith('discount'),
    );

    expect(singleInput).not.toBeNull();
    if (singleInput == null) {
      throw new Error('Expected single slider input to render');
    }
    const [rangeMinimumInput, rangeMaximumInput] = rangeInputs;
    if (rangeMinimumInput == null || rangeMaximumInput == null) {
      throw new Error('Expected range slider inputs to render');
    }

    singleInput.value = '6';
    singleInput.dispatchEvent(new InputEvent('input', {bubbles: true}));
    singleInput.dispatchEvent(new Event('change', {bubbles: true}));

    rangeMinimumInput.value = '70';
    rangeMinimumInput.dispatchEvent(new InputEvent('input', {bubbles: true}));
    rangeMinimumInput.dispatchEvent(new KeyboardEvent('keyup', {bubbles: true, key: 'ArrowRight'}));
    rangeMaximumInput.value = '25';
    rangeMaximumInput.dispatchEvent(new InputEvent('input', {bubbles: true}));
    rangeMaximumInput.dispatchEvent(new Event('change', {bubbles: true}));

    expect(singleChange).toHaveBeenCalledWith(6, expect.any(Event));
    expect(singleCommit).toHaveBeenCalledWith(6, expect.any(Event));
    expect(rangeChange).toHaveBeenNthCalledWith(1, [65, 80], expect.any(Event));
    expect(rangeChange).toHaveBeenNthCalledWith(2, [20, 35], expect.any(Event));
    expect(rangeCommit).toHaveBeenCalledWith([20, 35], expect.any(Event));
    expect(rangeMinimumInput.value).toBe('65');
    expect(rangeMaximumInput.value).toBe('35');
    expect(target.textContent).not.toContain('Discount range 20');

    await unmount(range);
    await unmount(single);
  });
});
