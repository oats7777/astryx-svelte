// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression tests for universal evaluator scoring.
 * @input Generated code samples and build-check metadata.
 * @output Vitest assertions for scoring behavior.
 * @position internal/vibe-tests/src/universal-eval.test.ts
 */

import {describe, expect, it} from 'vitest';
import {evaluate} from './universal-eval.js';

describe('evaluate correctness', () => {
  it('penalizes critical Svelte phantom props when the build check is clean', () => {
    // Given: Svelte code with a React Native event prop and clean build metadata.
    const code = `<script lang="ts">
  function save(): void {}
</script>

<Button label="Save" onPress={save} />
`;

    // When: the universal evaluator scores correctness for the Svelte target.
    const result = evaluate(code, 'astryx-svelte', {
      tscResult: {
        target: 'astryx-svelte',
        errors: [],
        errorCount: 0,
        buildSuccess: true,
      },
    });

    // Then: the phantom prop finding is visible and correctness is penalized.
    expect(result.correctness.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: 'phantom-prop',
          severity: 'critical',
        }),
      ]),
    );
    expect(result.correctness.score).toBeLessThan(100);
  });
});
