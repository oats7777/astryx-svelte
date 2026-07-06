# Astryx Svelte

This repository is the Svelte-native Astryx/XDS release line.

## Quick Reference

- Package manager: pnpm 10 via Corepack.
- Public component package: `packages/svelte`.
- Token package: `packages/tokens`.
- CLI package: `packages/cli`.
- Visual review: `apps/svelte-storybook`.
- Consumer example: `apps/example-svelte-tailwind`.
- Docs shell: `apps/svelte-docs`.
- Svelte vibe target docs: `internal/vibe-tests/AGENTS.svelte.md`.

## Component Work

Before changing a component, load the branch-local CLI docs:

```bash
XDS="node packages/cli/bin/astryx.mjs"
$XDS help
$XDS docs svelte --dense
$XDS component --list
$XDS component <Name> --dense
```

Components live under `packages/svelte/src/lib/<group>/`. Keep group `index.ts` exports, docs metadata, tests, package exports, and Storybook/example usage in sync when behavior changes.

## Styling Rules

- Import `@astryxdesign/svelte/styles.css` once in apps.
- Import `@astryxdesign/tokens/tailwind-theme.css` when using Tailwind v4 utilities.
- Use token-backed semantic classes and CSS variables such as `bg-body`, `bg-card`, `text-primary`, `text-secondary`, `border-border`, `rounded-lg`, and `shadow-sm`.
- Prefer Svelte component props and documented class hooks over ad hoc CSS escape hatches.
- Do not reintroduce React/StyleX-only package dependencies in this release line.

## CLI Rules

The CLI defaults to Svelte. Useful commands:

```bash
$XDS docs
$XDS docs svelte --dense
$XDS component Button --json
$XDS template app-shell --skeleton
$XDS swizzle Button --gap
$XDS theme build ./src/theme.ts --out ./src/theme.css
$XDS doctor --json
```

## Vibe Tests

Svelte target outputs `.svelte` files. Use:

```bash
pnpm -F @astryxdesign/vibe-tests check:fairness -- --fixture fixtures/svelte-fairness.clean.json
pnpm -F @astryxdesign/vibe-tests fixture:svelte -- --iteration <id>
pnpm -F @astryxdesign/vibe-tests aggregate --iteration <id>
```

## Verification

Run focused checks before claiming a change is complete:

```bash
pnpm -F @astryxdesign/tokens build
pnpm -F @astryxdesign/svelte check
pnpm -F @astryxdesign/svelte test
pnpm -F @astryxdesign/svelte package
pnpm -F @astryxdesign/svelte-storybook build
pnpm -F @astryxdesign/example-svelte-tailwind build
pnpm check:repo
```
