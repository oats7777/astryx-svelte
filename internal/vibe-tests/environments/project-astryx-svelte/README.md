# Astryx Svelte + Tailwind CSS

This project uses Astryx Svelte components with Tailwind CSS v4. Use the CLI
and package docs to look up component props and usage before writing code:

```bash
npx astryx docs svelte --dense
npx astryx component --list
node -e "import('@astryxdesign/svelte/docs.mjs').then(m => console.log(m.docs))"
```

Components use:

- Svelte 5 single-file components
- Tailwind CSS utility classes for layout and supplemental styling
- Astryx token CSS, Tailwind token bridge, and package styles from `@astryxdesign/svelte/tailwind.css`

## Tailwind Source Expectations

The local Tailwind v4 entrypoint is `src/app.css`. It imports `@astryxdesign/svelte/tailwind.css`
and keeps Tailwind scanning focused on generated Svelte app code:

```css
@source "./**/*.{svelte,ts}";
```

Keep generated components in the project tree so that source glob covers their
classes.

## Import Pattern

Import Svelte components and helpers from the package barrel:

```svelte
<script lang="ts">
  import {Button, Theme, TextInput, defineTheme} from '@astryxdesign/svelte';

  const theme = defineTheme({name: 'app'});
</script>

<Theme {theme} mode="light">
  <Button label="Save" variant="primary" />
  <TextInput label="Project name" value="" />
</Theme>
```

## Event Handlers

Astryx Svelte components use documented Svelte callback props such as `onClick`,
`onChange`, and `onOpenChange`. For button activation, use `onClick`:

```svelte
<Button label="Save" onClick={() => save()} />
```

Do not use React-only props like `className` or cross-platform props like
`onPress` unless a component explicitly documents them.
