// Copyright (c) Meta Platforms, Inc. and affiliates.
// allow: SIZE_OK — public template API orchestrates built-in, external, and integration templates; framework and skeleton helpers are extracted.

/**
 * @file Programmatic API for the template command.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadModuleWithSchema} from '../lib/module-loader.mjs';
import {TemplateEnvelopeSchema} from '../template.mjs';
import {CLI_ROOT, discoverExternalPackages} from '../utils/paths.mjs';
import {
  assertWithin,
  isFilePathArg,
  PathSafetyError,
} from '../utils/path-safety.mjs';
import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {Project} from '../lib/project.mjs';
import {
  docFramework,
  resolveTemplateFramework,
  resolveTemplateSourceFile,
} from './template-framework.mjs';
import {extractComponents, extractSkeleton} from './template-skeleton.mjs';

export {extractComponents} from './template-skeleton.mjs';

/** Identity used for core (built-in) templates in package-scoped listings. */
const CORE_PACKAGE = '@astryxdesign/svelte';

/** Doc-file basename suffixes for integration templates, in precedence order. */
const DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

/**
 * Load an integration template doc module and validate it against the template
 * envelope at the load boundary. Default export only — `.ts` via jiti,
 * `.mjs`/`.js` via dynamic import. Throws (caught by discovery) if the default
 * export is missing or fails {@link TemplateEnvelopeSchema}. NOTE: the built-in
 * core templates use `export const doc = {...}` and are loaded by a different
 * function ({@link loadDocModule}) — this path is for INTEGRATION templates.
 *
 * @param {string} file
 * @param {string} [label]
 */
async function loadIntegrationDoc(file, label) {
  return loadModuleWithSchema(file, TemplateEnvelopeSchema, {label});
}

const TEMPLATES_DIR = path.join(CLI_ROOT, 'templates');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');
const BLOCKS_DIR = path.join(TEMPLATES_DIR, 'blocks');

/**
 * Inline placeholder swapped in for demo imagery when scaffolding a template,
 * so scaffolded pages render with zero setup (see stripTemplateAssetRefs).
 * Neutral hex colors (not design tokens) so it renders in any project, themed
 * or not. Mirrors the placeholder previously used by the React docsite.
 */
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f5f6f8%22%2F%3E%3Cg%20transform%3D%22translate%28200%20150%29%22%20fill%3D%22none%22%20stroke%3D%22%23c2cad6%22%20stroke-width%3D%225%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%22-44%22%20y%3D%22-44%22%20width%3D%2288%22%20height%3D%2288%22%20rx%3D%2216%22%2F%3E%3Ccircle%20cx%3D%2218%22%20cy%3D%22-18%22%20r%3D%222.5%22%20fill%3D%22%23c2cad6%22%20stroke%3D%22none%22%2F%3E%3Cpath%20d%3D%22M-34%2030%20L-8%200%20L10%2018%20L20%208%20L34%2024%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E';

/**
 * Demo-image sources to strip from scaffolded projects — Meta's lookaside CDN
 * (a Meta-only network dependency). Genuine third-party URLs (e.g. brand logos
 * from paypalobjects.com) are intentionally left untouched.
 *
 * @type {RegExp[]}
 */
const DEMO_IMAGE_PATTERNS = [
  /https?:\/\/(?:[\w-]+\.)*lookaside\.facebook\.com\/[^\s'"`)]+/g,
];

/**
 * Replace demo image references with a self-contained placeholder data URI so
 * scaffolded pages render with zero setup. Builders drop in their own images.
 *
 * @param {string} source - Template source code.
 * @returns {string} Source with demo image references replaced.
 */
export function stripTemplateAssetRefs(source) {
  return DEMO_IMAGE_PATTERNS.reduce(
    (out, pattern) => out.replace(pattern, PLACEHOLDER_IMAGE),
    source,
  );
}
async function loadDocModule(docPath) {
  if (!fs.existsSync(docPath)) return null;
  const docModule = await import(`file://${docPath}`);
  return docModule.doc;
}

export {discoverAll as discoverTemplates};

export function listTemplates() {
  const all = [];
  if (fs.existsSync(PAGES_DIR)) {
    all.push(
      ...fs
        .readdirSync(PAGES_DIR, {withFileTypes: true})
        .filter(e => e.isDirectory())
        .map(e => e.name),
    );
  }
  return all.sort();
}

function findDocFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findDocFiles(full, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

async function discoverPages(framework) {
  if (!fs.existsSync(PAGES_DIR)) return [];
  const dirs = fs
    .readdirSync(PAGES_DIR, {withFileTypes: true})
    .filter(e => e.isDirectory());

  const templates = [];
  for (const dir of dirs) {
    const dirPath = path.join(PAGES_DIR, dir.name);
    const doc = await loadDocModule(path.join(dirPath, 'template.doc.mjs'));
    const filePath = resolveTemplateSourceFile(dirPath, 'page', framework);
    if (!filePath) continue;
    const frameworkName = docFramework(doc, filePath);
    if (frameworkName !== framework) continue;
    templates.push({
      type: 'page',
      framework: frameworkName,
      dirName: dir.name,
      name: doc?.name || dir.name,
      description: doc?.description || '',
      category: doc?.category || '',
      isReady: doc?.isReady ?? true,
      scaffold: doc?.scaffold ?? false,
      filePath: filePath ?? path.join(dirPath, 'page.svelte'),
      docPath: path.join(dirPath, 'template.doc.mjs'),
    });
  }
  return templates;
}

async function discoverBlocks(framework) {
  const docFiles = findDocFiles(BLOCKS_DIR, /\.doc\.mjs$/);
  const blocks = [];
  for (const docPath of docFiles) {
    const basename = path.basename(docPath, '.doc.mjs');
    const filePath = resolveTemplateSourceFile(path.dirname(docPath), basename, framework);
    if (!filePath) continue;
    const doc = await loadDocModule(docPath);
    const frameworkName = docFramework(doc, filePath);
    if (frameworkName !== framework) continue;
    const relPath = path.relative(BLOCKS_DIR, path.dirname(docPath));
    blocks.push({
      type: 'block',
      framework: frameworkName,
      dirName: basename,
      name: doc?.name || basename,
      description: doc?.description || '',
      isReady: doc?.isReady ?? true,
      aspectRatio: doc?.aspectRatio ?? 1,
      componentsUsed: doc?.componentsUsed ?? [],
      isShowcase: doc?.isShowcase ?? false,
      filePath,
      docPath,
      category: relPath,
    });
  }
  return blocks;
}

/**
 * Discover blocks from external packages that declare `astryx.blocks` in
 * their package.json. Same shape as discoverBlocks() output.
 *
 * @param {string} [cwd]
 */
async function discoverExternalBlocks(cwd = process.cwd(), framework = 'svelte') {
  const externals = discoverExternalPackages(cwd);
  const blocks = [];

  for (const ext of externals) {
    if (!ext.blocksDir || !fs.existsSync(ext.blocksDir)) continue;
    const docFiles = findDocFiles(ext.blocksDir, /\.doc\.mjs$/);
    for (const docPath of docFiles) {
      const basename = path.basename(docPath, '.doc.mjs');
      const filePath = resolveTemplateSourceFile(path.dirname(docPath), basename, framework);
      if (!filePath) continue;
      const doc = await loadDocModule(docPath);
      const frameworkName = docFramework(doc, filePath);
      if (frameworkName !== framework) continue;
      const relPath = path.relative(ext.blocksDir, path.dirname(docPath));
      blocks.push({
        type: 'block',
        framework: frameworkName,
        dirName: basename,
        name: doc?.name || basename,
        description: doc?.description || '',
        isReady: doc?.isReady ?? true,
        aspectRatio: doc?.aspectRatio ?? 1,
        componentsUsed: doc?.componentsUsed ?? [],
        isShowcase: doc?.isShowcase ?? false,
        filePath,
        docPath,
        category: relPath,
        package: ext.name,
      });
    }
  }

  return blocks;
}

/**
 * Discover all blocks — core + external packages.
 * @param {string} [cwd]
 */
async function discoverAllBlocks(cwd = process.cwd(), framework = 'svelte') {
  const [core, external] = await Promise.all([
    discoverBlocks(framework),
    discoverExternalBlocks(cwd, framework),
  ]);
  return [...core, ...external];
}

async function discoverAll(cwd = process.cwd(), options = {}) {
  const framework = resolveTemplateFramework(options.framework);
  const [pages, blocks, integration] = await Promise.all([
    discoverPages(framework),
    discoverAllBlocks(cwd, framework),
    discoverIntegrationTemplates(cwd),
  ]);
  return [...pages, ...blocks, ...integration.templates].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/**
 * Like {@link discoverAll} but also returns integration-template discovery
 * errors (missing same-stem source, missing `type`, load failure). Use this
 * when the caller wants to warn about malformed integration templates.
 *
 * @param {string} [cwd]
 * @returns {Promise<{templates: object[], errors: {package: string, template?: string, message: string}[]}>}
 */
async function discoverAllWithErrors(cwd = process.cwd()) {
  const [pages, blocks, integration] = await Promise.all([
    discoverPages('svelte'),
    discoverAllBlocks(cwd, 'svelte'),
    discoverIntegrationTemplates(cwd),
  ]);
  const templates = [...pages, ...blocks, ...integration.templates].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  return {templates, errors: integration.errors};
}

export {discoverAllWithErrors};

/**
 * Recursively collect integration template doc files under `root`.
 * Returns absolute paths to files ending in one of DOC_SUFFIXES.
 *
 * @param {string} root
 * @returns {string[]}
 */
function findIntegrationDocFiles(root) {
  const results = [];
  if (!fs.existsSync(root)) return results;
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (DOC_SUFFIXES.some(suffix => entry.name.endsWith(suffix))) {
        results.push(full);
      }
    }
  };
  walk(root);
  return results;
}

/**
 * The doc-file suffix present on `file`, or null if none matches.
 * @param {string} file
 */
function matchedDocSuffix(file) {
  return DOC_SUFFIXES.find(suffix => file.endsWith(suffix)) ?? null;
}

/**
 * Discover templates contributed by configured integrations.
 *
 * For each integration with a resolved `templates` root, every
 * `<id>.doc.{ts,mjs,js}` file is a template whose id is its path relative to
 * the templates root with the `.doc.*` suffix stripped (kebab-case, may be
 * nested). The doc's `type` (page|block) decides scaffolding — there is no
 * `/pages` vs `/blocks` requirement. A same-stem sibling source file
 * (`<id>.svelte`) is required; a doc missing its source, or missing `type`, is
 * an integration error and that template is skipped (recorded in `errors`).
 *
 * @param {string} [cwd]
 * @returns {Promise<{templates: object[], errors: {package: string, template?: string, message: string}[]}>}
 */
async function discoverIntegrationTemplates(cwd = process.cwd()) {
  const templates = [];
  const errors = [];

  let loadedIntegrations;
  try {
    const project = await Project.load(cwd);
    loadedIntegrations = project.loadedIntegrations;
  } catch {
    // Config load failures are surfaced elsewhere (discover/doctor); here we
    // simply contribute no integration templates.
    return {templates, errors};
  }

  for (const integration of loadedIntegrations) {
    const result = await discoverIntegrationTemplatesForOne(integration);
    templates.push(...result.templates);
    errors.push(...result.errors);
  }

  return {templates, errors};
}

/**
 * Discover the templates contributed by a SINGLE integration. Same per-template
 * rules as {@link discoverIntegrationTemplates} (same-stem source required,
 * page|block type required); broken templates are recorded in `errors` rather
 * than thrown. Exposed for `validate-integration`.
 *
 * @param {{name?: string, __spec?: string, templates?: string}} integration
 * @returns {Promise<{templates: object[], errors: {package: string, template?: string, message: string}[]}>}
 */
export async function discoverIntegrationTemplatesForOne(integration) {
  const templates = [];
  const errors = [];

  const root = integration?.templates;
  const pkgLabel = integration?.name ?? integration?.__spec ?? 'integration';
  if (!root || !fs.existsSync(root)) return {templates, errors};

  for (const docPath of findIntegrationDocFiles(root)) {
    const suffix = matchedDocSuffix(docPath);
    const id = path
      .relative(root, docPath)
      .slice(0, -suffix.length)
      .split(path.sep)
      .join('/');

    const sourcePath = docPath.slice(0, -suffix.length) + '.svelte';
    if (!fs.existsSync(sourcePath)) {
      errors.push({
        package: pkgLabel,
        template: id,
        message: `Template "${id}" is missing its same-stem source file ${path.basename(sourcePath)}.`,
      });
      continue;
    }

    let doc;
    try {
      doc = await loadIntegrationDoc(docPath, `Template "${id}"`);
    } catch (err) {
      errors.push({
        package: pkgLabel,
        template: id,
        message: `Template "${id}" failed to load: ${err.message}`,
      });
      continue;
    }

    // loadIntegrationDoc validates against the envelope (incl. a 'page'|'block'
    // type) at the load boundary, so a valid doc always has a type. This guard
    // stays as defense-in-depth.
    const type = doc?.type;
    if (type !== 'page' && type !== 'block') {
      errors.push({
        package: pkgLabel,
        template: id,
        message: `Template "${id}" is missing a "type" of "page" or "block". Author it with createPageTemplate/createBlockTemplate.`,
      });
      continue;
    }

    templates.push({
      type,
      framework: 'svelte',
      dirName: id,
      name: doc?.name || id,
      description: doc?.description || '',
      category: doc?.category || '',
      isReady: true,
      scaffold: false,
      componentsUsed: doc?.componentsUsed ?? [],
      filePath: sourcePath,
      docPath,
      package: pkgLabel,
    });
  }

  return {templates, errors};
}

export async function findRelatedBlocks(componentName, cwd, options = {}) {
  const framework = resolveTemplateFramework(options.framework);
  const blocks = await discoverAllBlocks(cwd, framework);
  return blocks.filter(b =>
    b.componentsUsed.some(c => c.toLowerCase() === componentName.toLowerCase()),
  );
}

/**
 * @param {string} componentName
 * @param {string} [cwd]
 * @param {{ package?: string, framework?: 'svelte' }} [options] - When set, only search blocks from this package/framework.
 *   Core blocks have no `package` field; external blocks have `package` set to the npm name.
 */
export async function findShowcase(componentName, cwd, options) {
  const framework = resolveTemplateFramework(options?.framework);
  const blocks = await discoverAllBlocks(cwd, framework);
  const lc = componentName.toLowerCase();
  const packageFilter = options?.package;

  // When scoped to a package, only consider blocks from that package.
  // Core blocks have no `package` field — filter them out when a package is specified.
  const showcases = blocks.filter(b => {
    if (!b.isShowcase) return false;
    if (packageFilter) return b.package === packageFilter;
    return true;
  });

  const toResult = b => ({
    name: b.name,
    aspectRatio: b.aspectRatio,
    filePath: b.filePath,
    docPath: b.docPath,
  });

  // Priority 1: own directory (components/Badge/ for "Badge")
  const dirMatch = showcases.find(b => {
    const catDir = b.category.split('/').pop()?.toLowerCase();
    return catDir === lc;
  });
  if (dirMatch) return toResult(dirMatch);

  // Priority 2: componentsUsed in any directory (ClickableCard in Card/)
  const usedMatch = showcases.find(b =>
    b.componentsUsed.some(c => c.toLowerCase() === lc),
  );
  if (usedMatch) return toResult(usedMatch);

  return null;
}

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.targetPath]
 * @param {boolean} [options.list]
 * @param {boolean} [options.skeleton]
 * @param {boolean} [options.show]
 * @param {'page'|'block'} [options.type] - Filter list views / narrow lookups by template kind.
 * @param {string} [options.package] - Narrow lookups to a specific package (id-only matches across packages are ambiguous).
 * @param {'svelte'} [options.framework] - Template target framework. Defaults to 'svelte'.
 * @param {string} [options.cwd]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function template(name, options = {}) {
  const {
    list = false,
    skeleton = false,
    show = false,
    targetPath,
    type,
    package: packageFilter,
    framework: frameworkOption,
    cwd = process.cwd(),
  } = options;
  const framework = resolveTemplateFramework(frameworkOption);
  const templates = await discoverAll(cwd, {framework});

  /**
   * Identity for a template in package-scoped views. Core (built-in)
   * templates have no `package` field; report them under @astryxdesign/svelte.
   * @param {{package?: string}} t
   */
  const pkgOf = t => t.package ?? CORE_PACKAGE;

  if (list || (!name && !skeleton)) {
    let filtered = templates;
    if (type) filtered = filtered.filter(t => t.type === type);
    if (packageFilter) filtered = filtered.filter(t => pkgOf(t) === packageFilter);
    return {
      type: 'template.list',
      data: filtered.map(t => ({
        id: t.dirName,
        name: t.name,
        // `displayName` retained for back-compat with existing consumers.
        displayName: t.name,
        description: t.description,
        type: t.type,
        framework: t.framework ?? framework,
        package: pkgOf(t),
        category: t.category || undefined,
        componentsUsed: t.componentsUsed ?? undefined,
        isReady: t.isReady,
        scaffold: t.scaffold ?? false,
      })),
    };
  }

  // Resolve `name` to a single template. The same id can appear across types
  // and/or packages (e.g. a core "hero" page and an integration "hero"
  // block); narrow with --type / --package.
  let candidates = templates.filter(t => t.dirName === name);
  if (type) candidates = candidates.filter(t => t.type === type);
  if (packageFilter) candidates = candidates.filter(t => pkgOf(t) === packageFilter);

  if (name && candidates.length === 0) {
    throw new AstryxError(
      `Unknown template "${name}"`,
      templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
      ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
    );
  }
  if (name && candidates.length > 1) {
    throw new AstryxError(
      `Template "${name}" is ambiguous — narrow it with --type and/or --package.`,
      candidates.map(t => ({
        name: t.dirName,
        reason: `${t.type} template in ${pkgOf(t)}`,
      })),
      ERROR_CODES.ERR_AMBIGUOUS_TEMPLATE,
    );
  }
  const match = candidates[0];

  if (skeleton) {
    if (!match) {
      throw new AstryxError(
        'Specify a template name for --skeleton',
        templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
        ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
      );
    }
    if (!fs.existsSync(match.filePath)) {
      throw new AstryxError(
        `No source file found for template "${name}"`,
        undefined,
        ERROR_CODES.ERR_NO_SOURCE,
      );
    }
    const src = fs.readFileSync(match.filePath, 'utf-8');
    return {
      type: 'template.skeleton',
      data: {
        template: name,
        framework: match.framework ?? framework,
        description: match.description,
        components: extractComponents(match.filePath),
        skeleton: extractSkeleton(src),
      },
    };
  }

  if (!fs.existsSync(match.filePath)) {
    throw new AstryxError(
      `No source file found for template "${name}"`,
      undefined,
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  if (show || !targetPath) {
    return {
      type: 'template.show',
      data: {
        template: name,
        framework: match.framework ?? framework,
        description: match.description,
        type: match.type,
        components: extractComponents(match.filePath),
        source: fs.readFileSync(match.filePath, 'utf-8'),
      },
    };
  }

  // Path-safety: resolve the user-supplied targetPath relative to cwd,
  // rejecting absolute paths and any traversal that escapes the project
  // root. This guard runs BEFORE any mkdir/copyFile so we never create
  // directories outside the root just to fail on the file write.
  let resolvedTarget;
  try {
    resolvedTarget = assertWithin(targetPath, cwd, {
      label: 'template target path',
    });
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(
        err.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw err;
  }

  // If targetPath looks like a file (e.g. `./foo.svelte`), write directly to
  // it. Previously this path was treated as a directory and the file was
  // written as `./foo.svelte/page.svelte`, which is wrong and surprising.
  let outputDir;
  let outputFileName;
  let outputFilePath;
  if (isFilePathArg(targetPath)) {
    outputDir = path.dirname(resolvedTarget);
    outputFileName = path.basename(resolvedTarget);
    outputFilePath = resolvedTarget;
  } else {
    outputDir = resolvedTarget;
    outputFileName =
      match.type === 'block' ? path.basename(match.filePath) : path.basename(match.filePath);
    outputFilePath = path.join(outputDir, outputFileName);
  }

  fs.mkdirSync(outputDir, {recursive: true});

  // Strip demo image references so the scaffolded file renders without a
  // Meta-only network dependency.
  const source = fs.readFileSync(match.filePath, 'utf-8');
  const outputSource = stripTemplateAssetRefs(source);
  fs.writeFileSync(outputFilePath, outputSource);

  const relOutput = path.relative(cwd, outputDir) || '.';
  return {
    type: 'template.copy',
    data: {
      template: name,
      framework: match.framework ?? framework,
      outputDir: relOutput,
      fileName: outputFileName,
      filesCopied: 1,
    },
  };
}
