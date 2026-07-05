// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file test-visual.mjs
 * @input Built Vite preview output and optional scenario name
 * @output DOM assertions plus breakpoint screenshots for visual evidence
 * @position Visual smoke test for @astryxdesign/svelte-storybook
 */

import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(new URL('../../../', import.meta.url).pathname);
const appRoot = path.resolve(new URL('../', import.meta.url).pathname);
const evidenceDir = path.join(root, '.omo/evidence/task-20-visual');
const maybeScenario = process.argv.at(-1);
const scenario = maybeScenario != null && !maybeScenario.startsWith('--') ? maybeScenario : 'all';

async function freePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address == null || typeof address === 'string') {
          reject(new Error('Unable to allocate preview port.'));
          return;
        }
        resolve(address.port);
      });
    });
  });
}

async function waitForPreview(child, url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode != null) {
      throw new Error(`Preview exited early with code ${child.exitCode}.`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Preview did not become ready at ${url}.`);
}

async function verifyScreenshot(file) {
  const metadata = await sharp(file).metadata();
  if ((metadata.width ?? 0) < 300 || (metadata.height ?? 0) < 500) {
    throw new Error(`Screenshot ${file} is too small.`);
  }
  const pixels = await sharp(file).raw().toBuffer();
  const values = new Set();
  for (let index = 0; index < pixels.length; index += 97) {
    values.add(pixels[index]);
    if (values.size > 24) {
      return {file, width: metadata.width, height: metadata.height, sampledValues: values.size};
    }
  }
  throw new Error(`Screenshot ${file} appears blank.`);
}

async function run() {
  await fs.mkdir(evidenceDir, {recursive: true});
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  const preview = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: appRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  preview.stdout.on('data', (chunk) => process.stdout.write(chunk));
  preview.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForPreview(preview, url);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const captures = [];
    for (const viewport of [
      {name: 'mobile', width: 375, height: 900},
      {name: 'tablet', width: 768, height: 960},
      {name: 'desktop', width: 1280, height: 960},
    ]) {
      await page.setViewportSize({width: viewport.width, height: viewport.height});
      await page.goto(url, {waitUntil: 'networkidle'});
      await page.locator('[data-testid="visual-surface"]').waitFor();
      await page.locator('[data-story-group]').evaluateAll((nodes) => {
        if (nodes.length < 9) {
          throw new Error(`Expected at least 9 story groups, found ${nodes.length}.`);
        }
      });
      await page.locator('[data-story-group="foundation-visibility-stack"]').waitFor();
      await page.locator('[data-astryx-chart-bar] rect').first().waitFor();
      await page.locator('[data-testid="vega-chart"]').waitFor();
      const screenshot = path.join(evidenceDir, `storybook-${scenario}-${viewport.name}.png`);
      await page.screenshot({path: screenshot, fullPage: true});
      captures.push(await verifyScreenshot(screenshot));
    }
    await browser.close();
    console.log(JSON.stringify({scenario, captures}, null, 2));
  } finally {
    preview.kill('SIGTERM');
  }
}

await run();
