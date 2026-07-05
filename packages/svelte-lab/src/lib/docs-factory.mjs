// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs-factory.mjs
 * @input Svelte lab component names and docs group metadata
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
  if (/Chart|Radial|Sankey|ThreeD/.test(name)) {
    return [
      prop('data', 'readonly Record<string, unknown>[]', `Dataset rendered by ${displayName(name)}.`),
      prop('label', 'string', 'Accessible label or legend text for the visualization.'),
    ];
  }
  if (/Schedule|Stepper|Step|Editor/.test(name)) {
    return [
      prop('label', 'string', `Accessible label for ${displayName(name)}.`),
      prop('value', 'unknown', 'Current controlled value for the lab surface.'),
      prop('isDisabled', 'boolean', 'Disables interaction while preserving accessible state.', {default: 'false'}),
    ];
  }
  return [
    prop('label', 'string', `Accessible label or visible text for ${displayName(name)}.`),
    prop('children', 'Snippet', 'Optional Svelte snippet content rendered inside the component.'),
  ];
}

function exampleFor(packageName, dir, name) {
  const importPath = `${packageName}/${dir}`;
  if (/Chart|Radial|Sankey|ThreeD/.test(name)) {
    return `<script>\n  import {${name}} from '${importPath}';\n\n  const data = [{label: 'Alpha', value: 12}, {label: 'Beta', value: 18}];\n</script>\n\n<${name} {data} label="${displayName(name)}" />`;
  }
  if (/Schedule|Editor/.test(name)) {
    return `<script>\n  import {${name}} from '${importPath}';\n\n  let value = $state('');\n</script>\n\n<${name} bind:value label="${displayName(name)}" />`;
  }
  return `<script>\n  import {${name}} from '${importPath}';\n</script>\n\n<${name} label="${displayName(name)}">\n  ${displayName(name)}\n</${name}>`;
}

export function createGroupDocs({packageName, dir, groupLabel, category, components}) {
  return {
    name: groupLabel.replace(/\s+/g, ''),
    displayName: groupLabel,
    group: groupLabel,
    category,
    description: `${groupLabel} components for Astryx Svelte lab surfaces.`,
    usage: {
      description: `${groupLabel} components document private Svelte lab experiments without React-only examples.`,
    },
    keywords: ['svelte', 'lab', groupLabel.toLowerCase()],
    components: components.map(name => ({
      name,
      displayName: displayName(name),
      description: `${displayName(name)} provides a Svelte lab implementation for ${groupLabel.toLowerCase()} workflows.`,
      props: propDocs(name),
      usage: {
        description: `${displayName(name)} is part of the Astryx Svelte lab ${groupLabel.toLowerCase()} surface. Use it from Svelte examples and package entrypoints only.`,
        bestPractices: [
          {guidance: true, description: 'Import the lab component from the Svelte lab entrypoint shown in the example.'},
          {guidance: true, description: 'Keep examples in Svelte markup with snippets or bindings.'},
          {guidance: false, description: 'Do not copy TSX-only examples into Svelte lab documentation.'},
        ],
      },
      examples: [{label: 'Svelte usage', code: exampleFor(packageName, dir, name)}],
    })),
  };
}
