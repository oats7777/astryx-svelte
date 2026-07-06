<!-- SYNC CONTRACT: Architecture changes require documentation updates. -->

# Astryx Svelte

Astryx Svelte is a Svelte 5 implementation of the Astryx/XDS design system with plain CSS and optional Tailwind v4 entrypoints. It keeps the component, token, CLI, template, documentation metadata, and AI-agent workflows aligned with the original system while making Svelte the primary runtime.

## Status

This repository is the Svelte-native release line. The old React/StyleX packages, docs app, Storybook, sandbox, and theme package workspaces have been removed from this history. Public consumers should start from:

```bash
pnpm add @astryxdesign/svelte @astryxdesign/tokens
pnpm add -D @astryxdesign/cli
```

For plain CSS or CSS Modules users, import the package CSS once in your app entry:

```css
@import "@astryxdesign/svelte/styles.css";
```

For Tailwind v4 users, import Tailwind and the Astryx Tailwind bridge:

```css
@import "tailwindcss";
@import "@astryxdesign/svelte/tailwind.css";

@source "./**/*.{svelte,ts}";
```

The lower-level token bridge remains available for custom Tailwind pipelines:

```css
@import "@astryxdesign/tokens/tailwind-theme.css";
```

Then use components from the Svelte package:

```svelte
<script lang="ts">
  import {Button, Theme, defineTheme} from '@astryxdesign/svelte';

  const theme = defineTheme({name: 'product'});
</script>

<Theme {theme} mode="light">
  <Button label="Create report" variant="primary" />
</Theme>
```

## Packages

| Package | Purpose |
| --- | --- |
| [`@astryxdesign/svelte`](packages/svelte) | Public Svelte 5 component package, theme runtime, plain CSS/Tailwind CSS entrypoints, utilities, and docs metadata |
| [`@astryxdesign/tokens`](packages/tokens) | Framework-neutral design tokens plus generated CSS, Tailwind theme CSS, and JSON metadata |
| [`@astryxdesign/cli`](packages/cli) | Svelte-first CLI for component docs, templates, swizzling, theme CSS generation, validation, and agent docs |
| [`@astryxdesign/svelte-lab`](packages/svelte-lab) | Private parity/experimental Svelte surfaces |
| [`@astryxdesign/svelte-vega`](packages/svelte-vega) | Private Svelte Vega wrapper surface |

## Apps

| App | Purpose |
| --- | --- |
| [`apps/example-svelte-css`](apps/example-svelte-css) | Consumer-style Svelte + plain CSS example with no Tailwind dependency |
| [`apps/example-svelte-tailwind`](apps/example-svelte-tailwind) | Consumer-style Svelte + Tailwind v4 example |
| [`apps/svelte-storybook`](apps/svelte-storybook) | Visual review surface for the Svelte package |
| [`apps/svelte-docs`](apps/svelte-docs) | Lightweight docs shell for package, CLI, and release surface review |

## CLI

After installing dependencies:

```bash
XDS="node packages/cli/bin/astryx.mjs"
$XDS help
$XDS docs
$XDS docs svelte --dense
$XDS component --list
$XDS component Button --dense
$XDS template --list
$XDS template app-shell --skeleton
$XDS swizzle Button --gap
$XDS doctor --json
```

The CLI defaults to Svelte. Legacy React/StyleX framework switches are not part of this release line.

## Development

Use pnpm 10 via Corepack:

```bash
corepack enable
pnpm install
```

Run the local review surfaces in separate terminals:

```bash
pnpm -F @astryxdesign/svelte-docs dev --port 5173
pnpm -F @astryxdesign/svelte-storybook dev --port 5174
pnpm -F @astryxdesign/example-svelte-tailwind dev --host 127.0.0.1 --port 5175
pnpm -F @astryxdesign/example-svelte-css dev --host 127.0.0.1 --port 5176
```

Open:

- Docs: `http://127.0.0.1:5173/`
- Storybook-style visual surface: `http://127.0.0.1:5174/`
- Consumer example app: `http://127.0.0.1:5175/`
- Plain CSS example app: `http://127.0.0.1:5176/`

Common checks:

```bash
pnpm build
pnpm check:svelte
pnpm test
pnpm check:repo
pnpm storybook
pnpm docs
```

Focused package checks:

```bash
pnpm -F @astryxdesign/tokens build
pnpm -F @astryxdesign/svelte check
pnpm -F @astryxdesign/svelte test
pnpm -F @astryxdesign/svelte package
pnpm -F @astryxdesign/svelte-storybook build
pnpm -F @astryxdesign/example-svelte-tailwind build
pnpm -F @astryxdesign/example-svelte-css build
pnpm -F @astryxdesign/vibe-tests check:fairness -- --fixture fixtures/svelte-fairness.clean.json
```

## Repository Layout

| Directory | Purpose |
| --- | --- |
| `packages/svelte/` | Public Svelte components, grouped docs, tests, styles, and package exports |
| `packages/tokens/` | Shared token source and generated artifacts |
| `packages/cli/` | CLI commands, JSON API, templates, codemods, docs, and agent support |
| `apps/` | Svelte example, visual review, and docs surfaces |
| `internal/` | Test utilities, vibe tests, fixtures, and release guardrails |
| `scripts/` | Repo checks, token docs, changesets, release, and packaging helpers |

## License

MIT
