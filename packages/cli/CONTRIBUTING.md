# CLI Contributing

CLI behavior lives under `packages/cli/src/api/`; command files in `packages/cli/src/commands/` format terminal output.

Useful checks:

```bash
pnpm -F @astryxdesign/cli typecheck:json-api
pnpm -F @astryxdesign/cli typecheck:template-docs
node packages/cli/bin/astryx.mjs component Button --json
node packages/cli/bin/astryx.mjs template app-shell --skeleton
```

Keep docs and JSON API types aligned when adding or changing commands. New Svelte templates need `page.svelte` and `template.doc.mjs`.
