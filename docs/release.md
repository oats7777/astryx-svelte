## Releasing to npm via Trusted Publishing (OIDC)

astryx publishes public `@astryxdesign/*` packages to npm from
`.github/workflows/release.yml` using npm trusted publishing (OIDC). There is no
long-lived `NPM_TOKEN` in CI. Stable releases use the `latest` dist-tag from a
manual `workflow_dispatch`; canary releases use the `canary` dist-tag on every
push to `main`.

### Stable fallback policy

`@astryxdesign/core` remains the stable React/StyleX fallback package. The
Svelte port does not replace, deprecate, or repoint React imports. Keep the
existing React release path working until Svelte parity, docs, vibe fairness,
Storybook, and example-app gates are green.

### Svelte release gates

`release.yml` has an explicit `ASTRYX_SVELTE_RELEASE_GATES: "1"` switch. When
enabled, `@astryxdesign/svelte` and `@astryxdesign/tokens` are publishable only
after these gates pass:

```
pnpm build:svelte
pnpm -F @astryxdesign/svelte typecheck:docs
pnpm -F @astryxdesign/svelte-lab typecheck:docs
pnpm -F @astryxdesign/svelte-vega typecheck:docs
pnpm -F @astryxdesign/svelte-storybook build
pnpm -F @astryxdesign/example-svelte-tailwind build
pnpm check:svelte:parity
pnpm -F @astryxdesign/vibe-tests check:fairness -- --fixture fixtures/svelte-fairness.clean.json
node scripts/check-package-boundaries.js
```

`pnpm check:svelte:parity` runs the final full-scope Svelte parity gate:
`pnpm exec tsx scripts/check-svelte-port-parity.ts --require-scope cli,core,svelte,lab,vega,docs,storybook,examples,vibe,ci-release --fail-on-missing --fail-on-mvp`.
The report must have zero missing, stale, MVP-only, placeholder-equivalent,
unclassified, deprecated-without-rationale, or missing-required-scope entries.

If the switch is set to `"0"`, the workflow skips Svelte release packages
instead of publishing them without gates. Existing React/core/theme packages
remain on their normal release path.

### Public and private package policy

Public Svelte release packages:

- `@astryxdesign/tokens`
- `@astryxdesign/svelte`

Private, non-publishable Svelte packages:

- `@astryxdesign/svelte-lab`
- `@astryxdesign/svelte-vega`

`node scripts/check-package-boundaries.js` fails if the private Svelte lab or
Vega package becomes publishable. `node scripts/check-changesets.mjs` continues
to reject private or ignored packages in changeset frontmatter.

### Canary/latest verification

Use npm dist-tag checks after release or canary jobs:

```
npm view @astryxdesign/core dist-tags --json
npm view @astryxdesign/core@latest version
npm view @astryxdesign/core@canary version
npm view @astryxdesign/svelte dist-tags --json
npm view @astryxdesign/svelte@latest version
npm view @astryxdesign/svelte@canary version
```

If Svelte release gates are disabled or Svelte package publication eligibility
has been reverted, `@astryxdesign/core@latest` and `@astryxdesign/core@canary`
are the expected install targets.

### Trusted-publishing setup

The trusted-publishing maintainer script is local-only and prepares npm trust
configuration for public packages:

```
npm i -g npm@latest
npm login --registry https://registry.npmjs.org
node scripts/npm/setup-trusted-publishing.mjs
node scripts/npm/setup-trusted-publishing.mjs --bootstrap --setup-trust --workflow release.yml
```

Use `--replace` only when intentionally repointing an existing npm trust
configuration to `release.yml`.

### Rollback

For the Svelte full-port rollback path, use
`docs/svelte-port-rollback.md`. It includes exact commands for disabling Svelte
release gates, reverting Svelte package publication eligibility, preserving
React `@astryxdesign/core` as the fallback, verifying `canary` and `latest`
tags, and confirming private lab/Vega packages remain private.
