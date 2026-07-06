# Astryx Svelte Docs Design

## Purpose

The docs shell is an operational repository surface. It should help maintainers and early consumers scan package status, install commands, CLI capabilities, and release checks without feeling like a marketing page.

## Tokens

- `--docs-bg`: `#f6f7f9`, page background.
- `--docs-panel`: `#ffffff`, primary panel background.
- `--docs-panel-muted`: `#eef2f6`, secondary panel background.
- `--docs-text`: `#14171f`, primary text.
- `--docs-text-muted`: `#586170`, supporting text.
- `--docs-border`: `#d8dee8`, borders and dividers.
- `--docs-accent`: `#0a66c2`, command and link accent.
- `--docs-success`: `#147a3f`, stable status accent.

## Typography

Use the system UI stack for low-friction documentation rendering. Display type is reserved for the page title only; compact panels use restrained headings.

## Layout

The app uses a single-column shell with responsive two-column grids for package and check summaries. Content width is capped for readability, and all cards remain independent panels rather than nested cards.

## Components

- Shell header: repo name, status, and primary install command.
- Package grid: public and private package roles.
- CLI panel: command examples for component docs, templates, swizzling, and doctor.
- Release checklist: checks expected before publishing.

## States

Links and command chips have hover and focus states. The static build has no loading or error state because it does not fetch remote data.
