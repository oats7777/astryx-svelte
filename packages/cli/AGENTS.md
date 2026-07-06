# CLI PACKAGE KNOWLEDGE

## OVERVIEW

`@astryxdesign/cli` is the human and agent interface for component docs, reference docs, templates, swizzling, setup, codemods, and machine-readable JSON.

## STRUCTURE

```
packages/cli/
|-- bin/astryx.mjs          # executable, Node version gate, realpath import flow
|-- src/api/                # programmatic command logic
|-- src/commands/           # Commander wiring and terminal rendering
|-- src/lib/                # shared errors, manifest, formatting, search
|-- src/codemods/           # version migration transforms/tests
|-- docs/                   # reference docs, dense docs, zh overlays
`-- templates/              # page/block/theme template sources and docs
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| CLI runtime entry | `bin/astryx.mjs` | Checks Node support before dynamic import. |
| JSON/API behavior | `src/api/*.mjs` | Source of truth for command semantics. |
| Terminal output | `src/commands/**` | Keep formatting separate from API return shape. |
| Error contracts | `src/api/error.mjs`, `src/lib/error-codes.mjs` | Codes are stable and append-only. |
| Manifest | `src/lib/manifest.mjs` | Derived from Commander plus response metadata. |
| Templates | `templates/pages`, `templates/blocks/components` | Source plus `*.doc.mjs` metadata. |
| Docs | `docs/*.doc.mjs` | `*.doc.dense.mjs` exports `docsDense`; `*.doc.zh.mjs` exports zh overlay. |

## CONVENTIONS

- API functions return typed envelopes; CLI commands render those envelopes. Do not duplicate business logic in command files.
- Branch on `AstryxError.code`, not the human error message. New conditions get new `ERR_*` codes.
- Dense and zh docs overlay base docs by section index. Keep section ordering stable when editing translations.
- Template docs export `TemplateDoc` metadata. Common fields: `type`, `exampleFor`, `name`, `displayName`, `description`, `isReady`, `aspectRatio`, `componentsUsed`.
- `template()` path safety uses `assertWithin`; never create directories before traversal checks pass.
- Template copy strips demo asset references so generated files do not depend on Meta-only images.
- CLI `.mjs` files are linted as Node ESM. Use CLI output helpers; raw `console.log` is banned outside tests.

## ANTI-PATTERNS

- Do not make JSON users parse terminal strings.
- Do not remove or rename published error codes.
- Do not add docs topics without dense-mode consideration for agent use.
- Do not make generated templates require private assets or network-only demo media.
- Do not write template targets outside the caller project root.
