## Svelte Port Rollback Runbook

Use this when the Svelte full-port release gates fail after merge or when the
team decides not to publish Svelte packages yet. These commands keep React
`@astryxdesign/core` as the stable fallback.

### 1. Disable Svelte release gates

This switch makes `release.yml` skip `@astryxdesign/svelte` and
`@astryxdesign/tokens` instead of publishing them without the full gate suite.
The corresponding enabled gate suite is listed in `docs/release.md` and includes
`pnpm build:svelte`, `pnpm -F @astryxdesign/svelte-storybook build`,
`pnpm -F @astryxdesign/example-svelte-tailwind build`,
`pnpm check:svelte:parity`,
`pnpm -F @astryxdesign/vibe-tests check:fairness -- --fixture fixtures/svelte-fairness.clean.json`,
and `node scripts/check-package-boundaries.js`.
The parity step expands to the final full-scope checker command with
`--fail-on-missing` and must report zero missing, stale, MVP-only,
placeholder-equivalent, unclassified, deprecated-without-rationale, or
missing-required-scope entries before Svelte release packages are eligible.

```
perl -0pi -e 's/ASTRYX_SVELTE_RELEASE_GATES: "1"/ASTRYX_SVELTE_RELEASE_GATES: "0"/' .github/workflows/release.yml
rg -n 'ASTRYX_SVELTE_RELEASE_GATES: "0"|Skipping .*Svelte release packages' .github/workflows/release.yml
```

### 2. Revert package publication eligibility

Mark Svelte release packages private while preserving the existing React package
manifests. Keep lab and Vega private.

```
node <<'NODE'
const fs = require('node:fs');
const packageJsons = [
  'packages/tokens/package.json',
  'packages/svelte/package.json',
  'packages/svelte-lab/package.json',
  'packages/svelte-vega/package.json',
];

for (const file of packageJsons) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  pkg.private = true;
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
}
NODE

node scripts/check-package-boundaries.js
node scripts/check-changesets.mjs
```

### 3. Keep React core as the fallback

Do not rename, deprecate, or repoint `@astryxdesign/core`. Verify the React
package still builds and tests:

```
pnpm -F @astryxdesign/core build
pnpm -F @astryxdesign/core test
node -p "require('./packages/core/package.json').name"
```

The expected package name is `@astryxdesign/core`.

### 4. Verify canary/latest tags

Confirm the registry still points users at React core for stable installs:

```
npm view @astryxdesign/core dist-tags --json
npm view @astryxdesign/core@latest version
npm view @astryxdesign/core@canary version
npm view @astryxdesign/svelte dist-tags --json
npm view @astryxdesign/svelte@latest version
npm view @astryxdesign/svelte@canary version
```

If the Svelte package has no registry entry yet, the Svelte `npm view` commands
may fail. In that case, the rollback success condition is that
`@astryxdesign/core@latest` and `@astryxdesign/core@canary` resolve.

### 5. Confirm private lab/Vega packages remain private

```
node -p "require('./packages/svelte-lab/package.json').private === true"
node -p "require('./packages/svelte-vega/package.json').private === true"
node scripts/check-package-boundaries.js
node scripts/check-package-boundaries.js --fixture internal/fixtures/svelte-lab-publishable.package.json
```

The final fixture command must fail with an actionable
`@astryxdesign/svelte-lab must stay private/non-publishable` message. That
failure proves a publishable private lab package cannot pass the boundary gate.
