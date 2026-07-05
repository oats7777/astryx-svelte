// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Svelte-specific component API helpers.
 *
 * Keeps framework-specific docs/source/showcase behavior out of the shared
 * component API orchestrator.
 */

import * as fs from 'node:fs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {
  discoverSvelteComponents,
  findSvelteComponentDoc,
  findSvelteComponentSource,
  normalizeSvelteComponentName,
  resolveSvelteImportPath,
} from '../lib/component-discovery.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {AstryxError} from './error.mjs';
import {findShowcase, findRelatedBlocks} from './template.mjs';

export function withFramework(data, framework) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return {...data, framework};
  }
  return data;
}

export function scopeSvelteComponentDoc(docs, componentName, importPath) {
  const matchingComponent = docs.components
    ? docs.components.find(c => c.name === componentName || c.displayName === componentName)
    : null;

  if (!matchingComponent) {
    return withFramework({...docs, import: importPath}, 'svelte');
  }

  const scoped = {
    name: componentName,
    displayName: matchingComponent.displayName || componentName,
    description: matchingComponent.description,
    props: matchingComponent.props,
    components: [matchingComponent],
    parentDoc: docs.name,
    import: importPath,
    framework: 'svelte',
  };
  if (matchingComponent.usage || docs.usage) scoped.usage = matchingComponent.usage || docs.usage;
  if (matchingComponent.examples) scoped.examples = matchingComponent.examples;
  if (docs.theming) scoped.theming = docs.theming;
  return scoped;
}

export async function svelteComponentDetail(request) {
  const {
    name,
    dirName,
    cwd,
    svelteDir,
    source,
    showcase,
    blocks,
    props,
    zh,
    dense,
    lang,
  } = request;
  const componentName = normalizeSvelteComponentName(name);
  if (!componentName) {
    throw new AstryxError(
      `Invalid Svelte component name "${name}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  if (source) {
    const sourcePath = findSvelteComponentSource(svelteDir, componentName);
    if (!sourcePath) {
      throw new AstryxError(`Source for "${name}" not found`, undefined, ERROR_CODES.ERR_NO_SOURCE);
    }
    return {
      type: 'component.detail.source',
      data: {component: componentName, framework: 'svelte', source: fs.readFileSync(sourcePath, 'utf-8')},
    };
  }

  if (showcase) {
    const match = await findShowcase(componentName, cwd, {framework: 'svelte'});
    if (!match) {
      throw new AstryxError(`No showcase found for "${name}"`, undefined, ERROR_CODES.ERR_NO_SHOWCASE);
    }
    return {
      type: 'component.detail.showcase',
      data: {
        component: componentName,
        framework: 'svelte',
        aspectRatio: match.aspectRatio,
        source: fs.readFileSync(match.filePath, 'utf-8'),
      },
    };
  }

  let docPath = findSvelteComponentDoc(svelteDir, componentName);
  let resolvedName = componentName;

  if (!docPath) {
    const components = discoverSvelteComponents(svelteDir);
    const candidates = Object.values(components)
      .flat()
      .filter(comp => comp.toLowerCase().includes(dirName.toLowerCase()))
      .slice(0, 5);
    if (candidates.length === 1) {
      resolvedName = candidates[0];
      docPath = findSvelteComponentDoc(svelteDir, resolvedName);
    } else {
      throw new AstryxError(
        `No component named "${name}"`,
        candidates.map(c => ({name: c, reason: 'Svelte component'})),
        ERROR_CODES.ERR_UNKNOWN_COMPONENT,
      );
    }
  }

  const docs = scopeSvelteComponentDoc(
    await loadDocs(docPath, {zh, dense, lang}),
    resolvedName,
    resolveSvelteImportPath(svelteDir, resolvedName),
  );

  if (blocks) {
    const allBlocks = await findRelatedBlocks(resolvedName, cwd, {framework: 'svelte'});
    const toEntry = b => ({
      name: b.dirName,
      displayName: b.name,
      description: b.description,
      isShowcase: b.isShowcase ?? false,
      category: b.category,
    });
    const showcaseBlock = allBlocks.find(b => b.isShowcase) ?? null;
    return {
      type: 'component.detail.blocks',
      data: {
        component: resolvedName,
        framework: 'svelte',
        showcase: showcaseBlock ? toEntry(showcaseBlock) : null,
        examples: allBlocks.filter(b => !b.isShowcase).map(toEntry),
        related: [],
      },
    };
  }

  if (props) {
    const componentProps = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
    return {type: 'component.detail.props', data: componentProps};
  }
  return {type: 'component.detail', data: docs};
}
