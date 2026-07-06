# /internal/test-utils/src

Source code for shared testing utilities.

<!-- SYNC: When files in this directory change, update this document. -->

| File | Role | Purpose |
|------|------|---------|
| `canvas-setup.ts` | Setup | Shared jsdom canvas shim for package tests that inspect canvas-bearing DOM |
| `index.ts` | Entry | Re-exports testing utilities from @testing-library/react |
| `setup.ts` | Setup | Root Vitest setup file; extends matchers with jest-dom and root-level browser API shims |
