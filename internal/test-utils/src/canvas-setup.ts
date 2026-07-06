// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file canvas-setup.ts
 * @input jsdom HTMLCanvasElement test environment
 * @output Quiet canvas context fallback for tests that inspect canvas-bearing DOM
 * @position Shared Vitest setup shim for Svelte package tests
 */

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value() {
      return null;
    },
  });
}
