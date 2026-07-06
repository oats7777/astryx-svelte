# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-05
**Branch:** main

## OVERVIEW

Astryx Svelte is a Svelte 5 + Tailwind v4 design system monorepo. It publishes the public Svelte component package, framework-neutral tokens, and a Svelte-first CLI while keeping private lab, Vega, visual review, example, docs, and vibe-test surfaces for release quality.

## STRUCTURE

```
astryx-svelte/
|-- apps/
|   |-- example-svelte-tailwind/  # consumer-style Svelte + Tailwind app
|   |-- svelte-storybook/         # visual review surface
|   `-- svelte-docs/              # lightweight docs shell
|-- packages/
|   |-- svelte/                   # public Svelte package
|   |-- tokens/                   # shared token source and generated CSS/JSON
|   |-- cli/                      # astryx CLI, templates, docs, JSON API
|   |-- svelte-lab/               # private experimental parity package
|   `-- svelte-vega/              # private Vega wrapper package
|-- internal/                     # test utils, vibe tests, fixtures, guardrails
`-- scripts/                      # checks, release helpers, generated docs
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Component work | `packages/svelte/src/lib/<group>/` | `.svelte`, support `.ts`, docs, tests, and group exports |
| Component docs | `packages/svelte/src/lib/**/{Name}.doc.mjs` and `packages/svelte/docs.mjs` | CLI consumes these docs for `component` and agent output |
| Theme runtime | `packages/svelte/src/lib/theme/` | `Theme.svelte`, `defineTheme`, runtime CSS helpers |
| Tokens | `packages/tokens/src/` | Source tokens, CSS renderers, Tailwind bridge, metadata |
| CLI behavior | `packages/cli/src/api/` then `packages/cli/src/commands/` | API owns logic; commands own terminal formatting |
| CLI docs | `packages/cli/docs/*.doc.mjs` | Dense variants use `*.doc.dense.mjs`; Svelte topic is `svelte.doc.mjs` |
| Templates | `packages/cli/templates/pages/` | Svelte templates use `page.svelte` plus `template.doc.mjs` |
| Storybook | `apps/svelte-storybook/src/` | Visual review and interaction scenarios |
| Example app | `apps/example-svelte-tailwind/src/` | Consumer Tailwind v4 integration |
| Vibe tests | `internal/vibe-tests/` | Agent evaluation harness; Svelte target uses `AGENTS.svelte.md` |
| Repo guards | `scripts/`, `.github/workflows/` | Svelte checks, release, parity, package boundaries |

## CONVENTIONS

- Package manager is pnpm 10 via Corepack. Run `corepack enable`, then `pnpm install`.
- Source files keep the Meta copyright header and structured `@file`, `@input`, `@output`, `@position` headers where that convention already exists.
- Component docs use plain JS `*.doc.mjs` modules. JSDoc `@example` code fences must be plain triple backticks, not language-tagged fences.
- Svelte package tests run through package-local Vite/Vitest or script wrappers.
- Use semantic CSS variables and token-backed Tailwind v4 utilities. Do not hardcode raw color/spacing/radius values when a token exists.
- Public package imports should prefer `@astryxdesign/svelte` group exports or documented subpaths such as `@astryxdesign/svelte/actions`.
- Disabled links must render as buttons or inert controls; disabled anchors are an accessibility anti-pattern.
- Private packages `@astryxdesign/svelte-lab` and `@astryxdesign/svelte-vega` must stay private until an explicit release decision changes that.

## COMMANDS

```bash
corepack enable
pnpm install
pnpm build
pnpm check:svelte
pnpm test
pnpm check:repo
pnpm storybook
pnpm docs
```

CLI bootstrap:

```bash
XDS="node packages/cli/bin/astryx.mjs"
$XDS help
$XDS docs
$XDS docs svelte --dense
$XDS docs tokens --dense
$XDS docs theme --dense
$XDS component --list
$XDS component Button --dense
$XDS template --list
$XDS template app-shell --skeleton
$XDS swizzle Button --gap
$XDS doctor --json
```

For component work, run `$XDS component <Name> --dense` before edits. After package version changes, run `$XDS upgrade --apply` to refresh generated agent docs where present.

## CUSTOM COMMANDS

`/vibe-test [count]` runs Svelte target vibeability tests:

1. `pnpm -F @astryxdesign/vibe-tests interactive --target astryx-svelte --sample <count>` when sampling.
2. Spawn one fresh subagent per task file in `results/<iteration>/tasks/{promptId}.json`.
3. Each subagent writes `.svelte` and metadata to `results/<iteration>/results/`.
4. Run Svelte fairness and preview checks before aggregation.
5. `pnpm -F @astryxdesign/vibe-tests aggregate --iteration <id>`.

Use `--degradation` to exercise retention probes when comparing agent behavior across turns.

## NOTES

- If the local CLI fails with `ERR_MODULE_NOT_FOUND`, dependencies are missing; run `pnpm install`.
- `pnpm check:svelte:parity` compares the Svelte port ledger against required release scopes.
- `scripts/check-package-boundaries.js` rejects accidentally publishable private Svelte lab/Vega packages.
- Site deploy and npm publish are separate. `deploy.yml` builds static Svelte docs/storybook/example artifacts; `release.yml` owns npm trusted publishing.
