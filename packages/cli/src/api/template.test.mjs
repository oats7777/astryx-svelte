// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {stripTemplateAssetRefs, template} from './template.mjs';

describe('stripTemplateAssetRefs', () => {
  it('replaces a lookaside astryx image URL with an inline data URI', () => {
    const src =
      "const hero = 'https://lookaside.facebook.com/assets/astryx/colorful-home-horizontal-1.png';";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces a lookaside block-avatar image URL', () => {
    const src =
      'src="https://lookaside.facebook.com/assets/astryx/avatar-profile-05.jpg"';
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces every lookaside reference, not just the first', () => {
    const src = [
      "'https://lookaside.facebook.com/assets/astryx/colorful-home-horizontal-1.png'",
      "'https://lookaside.facebook.com/assets/astryx/illustrative-horizontal-3.png'",
      "'https://lookaside.facebook.com/assets/astryx/moody-scene-horizontal-1.png'",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('lookaside.facebook.com');
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(3);
  });

  it('preserves surrounding source structure', () => {
    const src =
      "const data = [{src: 'https://lookaside.facebook.com/assets/astryx/x.png', alt: 'X'}];";
    const out = stripTemplateAssetRefs(src);
    expect(out).toContain("alt: 'X'");
    expect(out).toContain('const data = [{src:');
  });

  it('leaves non-Meta third-party image URLs untouched', () => {
    const src = [
      'src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"',
      'src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg"',
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });

  it('leaves unrelated local paths untouched', () => {
    const src = "import x from './local.png'; const y = '/public/logo.svg';";
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });
});

describe('template --skeleton component extraction (prefix-agnostic)', () => {
  // Regression guard: templates author bare component names post un-prefix
  // migration (P2380608025). The extractors previously matched only the
  // `XDS`-prefixed form, so `--skeleton` returned an empty components list and
  // an empty skeleton body for bare templates.
  it('extracts components and a skeleton from a bare-named template', async () => {
    const result = await template('contact-form', {skeleton: true});

    expect(result.type).toBe('template.skeleton');
    expect(Array.isArray(result.data.components)).toBe(true);
    expect(result.data.components.length).toBeGreaterThan(0);
    // The contact-form template composes a Card + form inputs.
    expect(result.data.components).toContain('Card');
    expect(result.data.components).toContain('TextInput');

    // Skeleton body is non-empty and uses bare component tags (no XDS prefix).
    expect(result.data.skeleton.trim().length).toBeGreaterThan(0);
    expect(result.data.skeleton).toMatch(/<[A-Z]\w+/);
    expect(result.data.skeleton).not.toContain('<XDS');

    expect(result.data.skeleton).toContain('columns={{minWidth: 200}}');
  });

  it('extracts a skeleton from a Svelte template without a TSX default export', async () => {
    const result = await template('app-shell', {
      framework: 'svelte',
      skeleton: true,
    });

    expect(result.type).toBe('template.skeleton');
    expect(result.data.framework).toBe('svelte');
    expect(result.data.components).toContain('AppShell');
    expect(result.data.skeleton).toContain('<AppShell');
    expect(result.data.skeleton).not.toContain('export default function');
  });

  it('keeps the React app-shell skeleton on the React source path', async () => {
    const result = await template('app-shell', {
      framework: 'react',
      skeleton: true,
    });

    expect(result.type).toBe('template.skeleton');
    expect(result.data.framework).toBe('react');
    expect(result.data.components).toContain('AppShell');
    expect(result.data.skeleton).toContain('<AppShell');
    expect(result.data.skeleton).not.toContain('.svelte');
    expect(result.data.skeleton).not.toContain('@astryxdesign/svelte');
  });

  it('copies Svelte page templates as page.svelte', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-svelte-template-'));
    try {
      const result = await template('app-shell', {
        framework: 'svelte',
        targetPath: 'src/routes',
        cwd: tmpDir,
      });

      expect(result.type).toBe('template.copy');
      expect(result.data.framework).toBe('svelte');
      expect(result.data.fileName).toBe('page.svelte');
      const copiedPagePath = path.join(tmpDir, 'src', 'routes', 'page.svelte');
      expect(
        fs.existsSync(copiedPagePath),
      ).toBe(true);
      const copiedPage = fs.readFileSync(copiedPagePath, 'utf8');
      expect(copiedPage).not.toMatch(/<AppShell\b[^>]*\/>/);
      expect(copiedPage).toMatch(/<AppShell\b[^>]*>\s*<section[\s\S]*<\/section>\s*<\/AppShell>/);
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('rejects Svelte template output directories that resolve through symlinks outside cwd', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-svelte-template-link-'));
    try {
      const project = path.join(tmpDir, 'project');
      const escaped = path.join(tmpDir, 'escaped');
      fs.mkdirSync(project);
      fs.mkdirSync(escaped);
      fs.symlinkSync('../escaped', path.join(project, 'link-out'));

      await expect(
        template('app-shell', {
          framework: 'svelte',
          targetPath: 'link-out',
          cwd: project,
        }),
      ).rejects.toMatchObject({code: 'ERR_PATH_TRAVERSAL'});

      expect(fs.existsSync(path.join(escaped, 'page.svelte'))).toBe(false);
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('copies React app-shell page templates as page.tsx', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-react-template-'));
    try {
      const result = await template('app-shell', {
        framework: 'react',
        targetPath: 'src/app',
        cwd: tmpDir,
      });

      expect(result.type).toBe('template.copy');
      expect(result.data.framework).toBe('react');
      expect(result.data.fileName).toBe('page.tsx');
      const copiedPagePath = path.join(tmpDir, 'src', 'app', 'page.tsx');
      expect(fs.existsSync(copiedPagePath)).toBe(true);
      const copiedPage = fs.readFileSync(copiedPagePath, 'utf8');
      expect(copiedPage).toContain('@astryxdesign/core/AppShell');
      expect(copiedPage).not.toContain('@astryxdesign/svelte');
      expect(copiedPage).not.toContain('page.svelte');
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });

  it('rejects malformed Svelte templates that contain TSX-only skeleton markup', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-malformed-svelte-template-'));
    try {
      const packageDir = path.join(tmpDir, 'node_modules', '@fixture', 'templates');
      const blockDir = path.join(packageDir, 'blocks', 'svelte', 'BrokenSvelteShell');
      fs.mkdirSync(path.join(packageDir, 'src'), {recursive: true});
      fs.mkdirSync(blockDir, {recursive: true});
      fs.writeFileSync(
        path.join(packageDir, 'package.json'),
        JSON.stringify({
          name: '@fixture/templates',
          astryx: {docs: './src', blocks: './blocks'},
        }),
      );
      fs.writeFileSync(
        path.join(blockDir, 'BrokenSvelteShell.doc.mjs'),
        [
          'export const doc = {',
          "  name: 'BrokenSvelteShell',",
          "  description: 'Malformed Svelte block fixture.',",
          "  framework: 'svelte',",
          '};',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(blockDir, 'BrokenSvelteShell.svelte'),
        [
          '<script lang="ts">',
          '  import {AppShell} from "@astryxdesign/svelte";',
          '  export default function BrokenSvelteShell() {',
          '    return (<AppShell title="Broken" />);',
          '  }',
          '</script>',
        ].join('\n'),
      );

      await expect(
        template('BrokenSvelteShell', {
          framework: 'svelte',
          skeleton: true,
          cwd: tmpDir,
        }),
      ).rejects.toMatchObject({
        code: 'ERR_INVALID_DOC',
        message: expect.stringContaining('Svelte skeleton'),
      });
    } finally {
      fs.rmSync(tmpDir, {recursive: true, force: true});
    }
  });
});
