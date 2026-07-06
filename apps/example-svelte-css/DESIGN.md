# Astryx Svelte Plain CSS Example Design

## Purpose

This example proves Astryx Svelte can be consumed without Tailwind. It uses the package's plain CSS entrypoint plus app-authored CSS classes that read only Astryx semantic variables.

## Tokens

Use `@astryxdesign/svelte/styles.css` as the only design-system import. All app styling must reference Astryx CSS variables for color, spacing, radius, typography, shadow, and motion.

## Layout

The page is an operational product shell: a persistent app navigation, a compact status summary, form controls, and data display. Layout classes are app-local and prefixed with `css-example-`.

## Components

Use public Astryx Svelte components directly. Navigation components must render correctly from package CSS alone, because this app intentionally has no Tailwind plugin, no Tailwind imports, and no `@source` directives.

