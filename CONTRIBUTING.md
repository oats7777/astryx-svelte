# Contributing

Astryx Svelte uses pnpm 10 via Corepack.

```bash
corepack enable
pnpm install
```

## Development Checks

```bash
pnpm build
pnpm check:svelte
pnpm test
pnpm check:repo
```

For focused work:

```bash
pnpm -F @astryxdesign/svelte check
pnpm -F @astryxdesign/svelte test
pnpm -F @astryxdesign/svelte package
pnpm -F @astryxdesign/tokens build
pnpm -F @astryxdesign/svelte-storybook build
pnpm -F @astryxdesign/example-svelte-tailwind build
```

## Component Changes

Svelte components live in `packages/svelte/src/lib/<group>/`.

Before editing, run:

```bash
XDS="node packages/cli/bin/astryx.mjs"
$XDS component --list
$XDS component <Name> --dense
```

Keep these in sync when behavior changes:

- Component `.svelte` source and support `.ts` files.
- Group `index.ts` exports.
- Component docs metadata.
- Tests and visual examples.
- Package exports when a new public subpath is added.

## Styling

Use `@astryxdesign/svelte/styles.css` and token-backed Tailwind v4 utilities. Prefer documented component props, slots, and CSS variables over hardcoded values. Do not add React/StyleX-only dependencies to this release line.

## Changesets

Public package changes need a changeset:

```bash
pnpm changeset
```

Private parity packages stay private unless a release decision changes that.
