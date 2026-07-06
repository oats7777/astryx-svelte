// Copyright (c) Meta Platforms, Inc. and affiliates.

import {ERROR_CODES} from '../lib/error-codes.mjs';
import {
  resolveFramework as resolveFrameworkOption,
  supportedFrameworksLabel,
} from '../lib/frameworks.mjs';
import {findSvelteDir} from '../utils/paths.mjs';
import {
  discoverSvelteComponents,
  findSvelteComponentDoc,
  resolveSvelteImportPath,
} from '../lib/component-discovery.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {AstryxError} from './error.mjs';
import {
  scopeSvelteComponentDoc,
  svelteComponentDetail,
} from './svelte-component.mjs';

function resolveFramework(framework) {
  const value = resolveFrameworkOption(framework);
  if (!value) {
    throw new AstryxError(
      `Invalid --framework value "${framework}". Valid frameworks: ${supportedFrameworksLabel()}`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  return value;
}

async function componentEntry(svelteDir, componentName, options) {
  const docPath = findSvelteComponentDoc(svelteDir, componentName);
  const importPath = resolveSvelteImportPath(svelteDir, componentName);
  if (!docPath) {
    return {
      name: componentName,
      description: '',
      import: importPath,
      framework: 'svelte',
    };
  }

  try {
    const docs = await loadDocs(docPath, options);
    const scoped = scopeSvelteComponentDoc(docs, componentName, importPath);
    return {
      name: componentName,
      description: scoped.usage?.description || scoped.description || '',
      import: importPath,
      framework: 'svelte',
    };
  } catch {
    return {
      name: componentName,
      description: '',
      import: importPath,
      framework: 'svelte',
    };
  }
}

async function componentDocs(svelteDir, componentName, options) {
  const docPath = findSvelteComponentDoc(svelteDir, componentName);
  if (!docPath) {
    return {name: componentName, description: '', framework: 'svelte'};
  }

  try {
    return scopeSvelteComponentDoc(
      await loadDocs(docPath, options),
      componentName,
      resolveSvelteImportPath(svelteDir, componentName),
    );
  } catch {
    return {name: componentName, description: '', framework: 'svelte'};
  }
}

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {boolean} [options.list]
 * @param {string} [options.category]
 * @param {string} [options.package]
 * @param {boolean} [options.props]
 * @param {boolean} [options.source]
 * @param {boolean} [options.showcase]
 * @param {boolean} [options.blocks]
 * @param {'full' | 'compact' | 'brief'} [options.detail]
 * @param {'svelte'} [options.framework]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<import('../types/component').ComponentListResponse | import('../types/component').ComponentBriefResponse | import('../types/component').ComponentFullResponse | import('../types/component').ComponentDetailResponse | import('../types/component').ComponentDetailPropsResponse | import('../types/component').ComponentDetailSourceResponse | import('../types/component').ComponentDetailShowcaseResponse | import('../types/component').ComponentDetailBlocksResponse>}
 */
export async function component(name, options = {}) {
  const {
    cwd = process.cwd(),
    list = false,
    category,
    props = false,
    source = false,
    showcase = false,
    blocks = false,
    detail: detailOption,
    framework: frameworkOption,
    lang = null,
    zh = false,
    dense = false,
  } = options;
  resolveFramework(frameworkOption);

  const svelteDir = findSvelteDir(cwd);
  if (!svelteDir) {
    throw new AstryxError(
      'Could not find @astryxdesign/svelte package',
      undefined,
      ERROR_CODES.ERR_UNKNOWN_PACKAGE,
    );
  }

  const isListView = list || category != null || !name;
  const detail = detailOption ?? (isListView ? 'brief' : 'full');
  const components = discoverSvelteComponents(svelteDir);

  if (category || list || !name) {
    if (category) {
      const match = Object.entries(components).find(
        ([key]) => key.toLowerCase() === category.toLowerCase(),
      );
      if (!match) {
        throw new AstryxError(
          `Unknown category "${category}"`,
          Object.keys(components).map(key => ({
            name: key,
            reason: 'valid category',
          })),
          ERROR_CODES.ERR_UNKNOWN_CATEGORY,
        );
      }

      if (detail === 'compact') {
        const entries = [];
        for (const comp of match[1]) {
          entries.push(await componentEntry(svelteDir, comp, {zh, lang}));
        }
        return {type: 'component.brief', data: {[match[0]]: entries}};
      }

      if (detail === 'full') {
        const docs = [];
        for (const comp of match[1]) {
          docs.push(await componentDocs(svelteDir, comp, {zh, dense, lang}));
        }
        return {type: 'component.full', data: {[match[0]]: docs}};
      }

      return {type: 'component.list', data: {[match[0]]: match[1]}};
    }

    if (detail === 'compact') {
      const result = {};
      for (const [group, comps] of Object.entries(components)) {
        result[group] = [];
        for (const comp of comps) {
          result[group].push(await componentEntry(svelteDir, comp, {zh, lang}));
        }
      }
      return {type: 'component.brief', data: result};
    }

    if (detail === 'full') {
      const result = {};
      for (const [group, comps] of Object.entries(components)) {
        result[group] = [];
        for (const comp of comps) {
          result[group].push(
            await componentDocs(svelteDir, comp, {zh, dense, lang}),
          );
        }
      }
      return {type: 'component.full', data: result};
    }

    return {type: 'component.list', data: components};
  }

  if (typeof name !== 'string') {
    throw new AstryxError(
      `No component named "${String(name)}"`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  return svelteComponentDetail({
    name,
    dirName: name.replace(/^XDS/, ''),
    cwd,
    svelteDir,
    source,
    showcase,
    blocks,
    props,
    zh,
    dense,
    lang,
  });
}
