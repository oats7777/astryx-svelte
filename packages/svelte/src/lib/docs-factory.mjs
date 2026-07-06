// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs-factory.mjs
 * @input Svelte package component names and docs group metadata
 * @output Component docs metadata objects with Svelte examples
 * @position Internal helper for package-local .doc.mjs metadata modules
 */

const displayName = name =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim();

const prop = (name, type, description, extra = {}) => ({
  name,
  type,
  description,
  ...extra,
});

function propDocs(name) {
  if (/Input|Selector|Calendar|Tokenizer|Typeahead|Search|Slider|Switch|Checkbox|Radio|TextArea|Field/.test(name)) {
    return [
      prop('label', 'string', `Accessible label for ${displayName(name)}.`),
      prop('value', 'unknown', 'Current controlled value for the input or selection surface.'),
      prop('isDisabled', 'boolean', 'Disables interaction while preserving accessible state.', {default: 'false'}),
    ];
  }
  if (/Button|Link|Token|Item|Card|Citation|Menu|Nav|Tab|Toolbar|Breadcrumb|Pagination/.test(name)) {
    return [
      prop('label', 'string', `Accessible label or visible text for ${displayName(name)}.`),
      prop('children', 'Snippet', 'Optional Svelte snippet content rendered inside the component.'),
      prop('isDisabled', 'boolean', 'Disables unavailable actions.', {default: 'false'}),
    ];
  }
  if (/Dialog|Popover|Tooltip|Toast|Overlay|Layer|HoverCard/.test(name)) {
    return [
      prop('isOpen', 'boolean', 'Controls whether the overlay is visible.', {default: 'false'}),
      prop('label', 'string', `Accessible label for ${displayName(name)}.`),
      prop('children', 'Snippet', 'Overlay body content rendered as a Svelte snippet.'),
    ];
  }
  if (/Icon|Avatar|Badge|Banner|Progress|Spinner|Status|Thumbnail|EmptyState/.test(name)) {
    return [
      prop('label', 'string', `Accessible label or visible text for ${displayName(name)}.`),
      prop('variant', 'string', `Visual variant for ${displayName(name)}.`),
    ];
  }
  return [
    prop('children', 'Snippet', `Content rendered inside ${displayName(name)}.`),
    prop('class', 'string', 'Additional class names forwarded to the component root.'),
  ];
}

function exampleFor(packageName, dir, name) {
  const importPath =
    dir === 'theme' ? '@astryxdesign/svelte/theme' : `${packageName}/${dir}`;
  if (/Input|Selector|Calendar|Tokenizer|Typeahead|Search|Slider|Switch|Checkbox|Radio|TextArea|Field/.test(name)) {
    return `<script>\n  import {${name}} from '${importPath}';\n\n  let value = $state('');\n</script>\n\n<${name} bind:value label="${displayName(name)}" />`;
  }
  if (/Dialog|Popover|Tooltip|Toast|Overlay|Layer|HoverCard/.test(name)) {
    return `<script>\n  import {${name}} from '${importPath}';\n</script>\n\n<${name} label="${displayName(name)}">\n  Content for the ${displayName(name).toLowerCase()} surface.\n</${name}>`;
  }
  if (name === 'Theme') {
    return `<script>\n  import {Theme} from '@astryxdesign/svelte/theme';\n</script>\n\n<Theme name="neutral">\n  <main>App content</main>\n</Theme>`;
  }
  return `<script>\n  import {${name}} from '${importPath}';\n</script>\n\n<${name} label="${displayName(name)}">\n  ${displayName(name)}\n</${name}>`;
}

export function createGroupDocs({packageName, dir, groupLabel, category, components}) {
  return {
    name: groupLabel.replace(/\s+/g, ''),
    displayName: groupLabel,
    group: groupLabel,
    category,
    description: `${groupLabel} components for the Astryx Svelte package.`,
    usage: {
      description: `${groupLabel} components provide Svelte-first building blocks for Astryx product surfaces.`,
    },
    keywords: ['svelte', groupLabel.toLowerCase()],
    components: components.map(name => ({
      name,
      displayName: displayName(name),
      description: `${displayName(name)} provides a Svelte implementation for ${groupLabel.toLowerCase()} workflows.`,
      props: propDocs(name),
      usage: {
        description: `${displayName(name)} is part of the Astryx Svelte ${groupLabel.toLowerCase()} surface. Use it without importing React-only examples or components.`,
        bestPractices: [
          {guidance: true, description: 'Import the component from the Svelte package entrypoint shown in the example.'},
          {guidance: true, description: 'Prefer Svelte snippets and bindings for composition rather than React children or JSX handlers.'},
          {guidance: false, description: 'Do not copy TSX-only examples into Svelte documentation.'},
        ],
      },
      examples: [{label: 'Svelte usage', code: exampleFor(packageName, dir, name)}],
    })),
  };
}
