# Astryx Svelte Tailwind Example Design

## Purpose

This example is an operational product surface that proves Astryx Svelte components and Tailwind v4 utilities can share the same token contract.

## Tokens

Use Astryx semantic CSS variables for all color, spacing, radius, typography, and shadow values. Tailwind utilities should resolve through `@astryxdesign/tokens/tailwind-theme.css`, so classes such as `bg-body`, `text-primary`, `rounded-lg`, and `shadow-sm` remain theme-aware.

## Layout

The page uses a single dashboard canvas: top navigation, a summary band, a form panel, a data-display panel, and an overlay entry point. Cards use the Astryx surface, border, radius, and shadow tokens with restrained density for internal-tool scanning.

## Components

Reusable primitives demonstrated by the page:

- Theme: wraps the app and exposes light/dark mode.
- Actions: primary, secondary, and ghost buttons.
- Forms: text input and switch.
- Navigation: top nav and segmented control.
- Data display: list and table.
- Overlay: modal dialog with deterministic test markers.
- Rich surfaces: chat log with markdown-backed message content.

## States

The form updates preview state in place. The mode switch changes the active Theme mode. The dialog opens and closes through Astryx buttons. Table sorting and row selection are left to the Astryx component implementation.
