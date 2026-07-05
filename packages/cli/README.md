# @astryxdesign/cli

Svelte-first CLI for the Astryx design system.

## Install

```bash
pnpm add -D @astryxdesign/cli
```

## Commands

```bash
astryx docs
astryx docs svelte --dense
astryx component --list
astryx component Button --dense
astryx template --list
astryx template app-shell --skeleton
astryx swizzle Button --gap
astryx theme build ./src/theme.ts --out ./src/theme.css
astryx doctor --json
```

The CLI defaults to Svelte. It resolves `@astryxdesign/svelte` from the current project or this monorepo, reads component docs, and emits Svelte import hints.

## JSON API

Use `--json` for agent or tool integrations:

```bash
astryx component Button --json
astryx template --list --json
astryx hook useTheme --json
astryx doctor --json
```

Stable error codes are append-only. Branch on the `code` field, not terminal text.

## Templates

Templates live in `packages/cli/templates/pages/`. Svelte page templates use `page.svelte` plus a sibling `template.doc.mjs`.

## Doctor

`astryx doctor` checks:

- Node version.
- `@astryxdesign/svelte` resolution.
- CLI/package version alignment.
- Svelte and token peer dependencies.
- `@astryxdesign/svelte/styles.css` import.
- Tailwind availability.
