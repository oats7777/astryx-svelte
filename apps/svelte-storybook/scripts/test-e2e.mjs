// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file test-e2e.mjs
 * @input Built Vite preview output and an explicit interaction scenario name
 * @output Theme, form, overlay, and navigation interaction evidence
 * @position E2E interaction test for @astryxdesign/svelte-storybook
 */

import {chromium, expect} from '@playwright/test';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import sharp from 'sharp';
import {assertDarkHeroContrast, measureDarkHeroContrast} from './contrast.mjs';
import {parseScenarioArgs} from './scenario-dispatch.mjs';

const root = path.resolve(new URL('../../../', import.meta.url).pathname);
const appRoot = path.resolve(new URL('../', import.meta.url).pathname);
const parsedArgs = parseScenarioArgs(process.argv.slice(2), root);
const scenario = parsedArgs.scenario;
const dispatchScenario = parsedArgs.dispatchScenario;
const evidenceTarget = parsedArgs.evidenceTarget;
const evidenceDir = evidenceTarget.endsWith('.md') ? evidenceTarget.slice(0, -3) : evidenceTarget;
const evidenceReport = evidenceTarget.endsWith('.md') ? evidenceTarget : `${evidenceTarget}.md`;
const scenarioFocus = Object.freeze({
  forms: 'forms controls plus Todo 6 CheckboxList, FileInput, InputGroup, NumberInput, and RadioList assertions',
  'selection-date-time': 'selection and temporal controls plus Todo 6 MultiSelector, DateInput, DateRangeInput, and DateTimeInput assertions',
  'overlays-keyboard': 'Dialog overlay open/close and keyboard Escape assertions',
  'navigation-data-layout': 'navigation tab focus, table sorting/selection, TreeList keyboard, and scrollable layout assertions',
  'navigation-shells': 'navigation tab focus and keyboard-only shell assertions',
  'table-tree': 'table sorting/selection and TreeList APG keyboard assertions',
  'observer-rich-foundation': 'VisuallyHidden, Stack/StackItem, chat, markdown, and reduced-motion foundation assertions',
  'rich-media-chat-command-palette': 'chat log, markdown heading, command palette search, and CodeBlock assertions',
  'lab-vega': 'lab chart and Vega wrapper assertions',
  'lab-experimental': 'experimental CircularProgress and Stepper assertions through the shared full-port surface',
  'lab-charts': 'lab chart SVG bar/line assertions',
  vega: 'Vega wrapper render and deterministic fallback assertions',
});

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
      if (response.ok) return;
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Preview did not become ready at ${url}.`);
}

async function buildPreviewOutput() {
  await new Promise((resolve, reject) => {
    const build = spawn('pnpm', ['exec', 'vite', 'build'], {cwd: appRoot, stdio: ['ignore', 'pipe', 'pipe']});
    build.stdout.on('data', (chunk) => process.stdout.write(chunk));
    build.stderr.on('data', (chunk) => process.stderr.write(chunk));
    build.on('error', reject);
    build.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Vite build exited with code ${code}.`));
    });
  });
}

async function verifyScreenshot(file) {
  const metadata = await sharp(file).metadata();
  const [fileBuffer, pixels] = await Promise.all([fs.readFile(file), sharp(file).raw().toBuffer()]);
  const values = new Set();
  for (let index = 0; index < pixels.length; index += 101) {
    values.add(pixels[index]);
    if (values.size > 24) {
      return {file, width: metadata.width, height: metadata.height, sampledValues: values.size, sha1: crypto.createHash('sha1').update(fileBuffer).digest('hex')};
    }
  }
  throw new Error(`Screenshot ${file} appears blank.`);
}

function assertDistinctCaptures(captures, pairs) {
  const byName = new Map(captures.map((capture) => [capture.name, capture]));
  return pairs.map(([leftName, rightName]) => {
    const left = byName.get(leftName);
    const right = byName.get(rightName);
    if (left == null || right == null) {
      throw new Error(`Missing capture for distinctness check: ${leftName} vs ${rightName}.`);
    }
    if (left.sha1 === right.sha1) {
      throw new Error(`State screenshots must differ but ${leftName} and ${rightName} share ${left.sha1}.`);
    }
    return `${leftName} != ${rightName} (${left.sha1} != ${right.sha1})`;
  });
}

function recordScenarioFocus(record) {
  const focus = scenarioFocus[scenario];
  if (focus != null) {
    record(`scenario focus: ${scenario} runs shared ${dispatchScenario} baseline with ${focus}`);
  }
}

async function hiddenValues(page, name) {
  return await page.locator(`input[type="hidden"][name="${name}"]`).evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('value') ?? ''),
  );
}

async function assertNoUnexpectedTemporalAlerts(page) {
  const invalidTemporalAlerts = await page.getByRole('alert').evaluateAll((nodes) =>
    nodes
      .map((node) => node.textContent?.trim() ?? '')
      .filter((text) => ['Invalid date', 'Invalid date range', 'Invalid date or time'].includes(text)),
  );
  expect(invalidTemporalAlerts).toEqual([]);
}

async function assertTodo6FormsScenario(page, record) {
  const checkboxGroup = page.locator('#todo6-release-channels-options');
  await expect(checkboxGroup).toBeVisible();
  await expect(checkboxGroup).toHaveAttribute('role', 'group');
  await expect(checkboxGroup).toHaveAttribute('aria-labelledby', 'todo6-release-channels-label');
  await expect(checkboxGroup.getByRole('checkbox', {name: /Beta channel/})).toHaveAttribute('aria-checked', 'true');
  expect(await hiddenValues(page, 'releaseChannels')).toEqual(['beta', 'docs']);
  record('Todo 6 forms: CheckboxList labeled group and repeated hidden releaseChannels values');

  const fileInput = page.locator('#todo6-evidence-upload');
  await fileInput.setInputFiles({
    name: 'todo6-report.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('Todo 6 accepted file'),
  });
  await expect(page.locator('[data-astryx-live-region="polite"]')).toContainText('1 file selected: todo6-report.pdf');
  await fileInput.setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('Todo 6 rejected file'),
  });
  await expect(page.getByRole('alert').filter({hasText: 'avatar.png is not an accepted file type'})).toBeVisible();
  record('Todo 6 forms: FileInput accepted-file live announcement and rejected-file alert');

  await expect(page.getByRole('group', {name: 'Budget estimate'})).toBeVisible();
  record('Todo 6 forms: InputGroup labeled group');

  const numberInput = page.getByRole('spinbutton', {name: 'Reviewer seats'});
  await numberInput.fill('0');
  await expect(numberInput).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert').filter({hasText: 'Invalid number'})).toBeVisible();
  record('Todo 6 forms: NumberInput invalid typed status and assertive announcement');

  const radioGroup = page.getByRole('radiogroup', {name: 'Approval cadence'});
  await expect(radioGroup).toBeVisible();
  await radioGroup.getByRole('radio', {name: /Weekly/}).focus();
  await expect(radioGroup.getByRole('radio', {name: /Weekly/})).toBeFocused();
  await radioGroup.getByRole('radio', {name: /Weekly/}).press('ArrowDown');
  await expect(radioGroup.getByRole('radio', {name: /Monthly/})).toBeFocused();
  await expect(radioGroup.getByRole('radio', {name: /Monthly/})).toHaveAttribute('aria-checked', 'true');
  expect(await hiddenValues(page, 'approvalCadence')).toEqual(['monthly']);
  record('Todo 6 forms: RadioList deterministic focus, keyboard selection, and hidden selected value');
}

async function assertTodo6SelectionDateTimeScenario(page, record) {
  const multiSelector = page.getByTestId('todo6-multi-selector').getByRole('combobox', {name: 'Todo 6 reviewers'});
  await expect(multiSelector).toBeVisible();
  expect(await hiddenValues(page, 'reviewerRoles')).toEqual(['design', 'qa']);
  await page.getByRole('button', {name: 'Remove QA'}).click();
  await expect(page.locator('[data-astryx-live-region="polite"]')).toContainText('1 of 3 selected');
  expect(await hiddenValues(page, 'reviewerRoles')).toEqual(['design']);
  await multiSelector.focus();
  await multiSelector.press('Delete');
  await expect(page.locator('[data-astryx-live-region="polite"]')).toContainText('Selection cleared');
  await expect(page.locator('input[type="hidden"][name="reviewerRoles"]')).toHaveCount(0);
  record('Todo 6 selection/date-time: MultiSelector live count, keyboard clear, and hidden values');

  const dueDate = page.getByRole('combobox', {name: 'Todo 6 due date'});
  await expect(dueDate).toHaveValue(/2026/);
  await dueDate.press('ArrowDown');
  await expect(dueDate).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', {name: 'Choose Todo 6 due date'})).toBeVisible();
  await dueDate.press('Escape');
  await expect(page.getByRole('dialog', {name: 'Choose Todo 6 due date'})).toHaveCount(0);
  record('Todo 6 selection/date-time: DateInput ArrowDown calendar open and native input serialization');

  const rangeGroup = page.getByRole('group', {name: 'Todo 6 QA window'});
  await expect(rangeGroup).toBeVisible();
  const rangeStart = rangeGroup.getByRole('combobox').first();
  await expect(rangeStart).toHaveValue(/2026/);
  await rangeStart.press('ArrowDown');
  await expect(rangeStart).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', {name: 'Choose Todo 6 QA window'})).toBeVisible();
  await rangeStart.press('Escape');
  await expect(page.getByRole('dialog', {name: 'Choose Todo 6 QA window'})).toHaveCount(0);
  record('Todo 6 selection/date-time: DateRangeInput ArrowDown calendar open and native start/end inputs');

  const dateTimeGroup = page.getByRole('group', {name: 'Todo 6 kickoff'});
  await expect(dateTimeGroup).toBeVisible();
  await expect(page.getByText('Hora de inicio')).toBeVisible();
  await expect(page.getByRole('textbox', {name: 'Hora de inicio'})).toBeVisible();
  const kickoffDate = dateTimeGroup.getByRole('combobox').first();
  await expect(kickoffDate).toHaveValue(/2026/);
  await kickoffDate.press('ArrowDown');
  await expect(kickoffDate).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('dialog', {name: 'Choose Todo 6 kickoff'})).toBeVisible();
  await kickoffDate.press('Escape');
  await expect(page.getByRole('dialog', {name: 'Choose Todo 6 kickoff'})).toHaveCount(0);
  await assertNoUnexpectedTemporalAlerts(page);
  record('Todo 6 selection/date-time: DateTimeInput ArrowDown calendar open and localized timeLabel');
  record('Todo 6 selection/date-time: valid keyboard calendar open/close exposes zero unexpected invalid date alerts');
}

async function run() {
  await fs.mkdir(evidenceDir, {recursive: true});
  await fs.mkdir(path.dirname(evidenceReport), {recursive: true});
  await buildPreviewOutput();
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
    const page = await browser.newPage({viewport: {width: 1280, height: 960}});
    const captures = [];
    const checks = [];
    const record = (name) => checks.push(name);
    const capturePage = async (name, targetPage = page) => {
      const screenshot = path.join(evidenceDir, `storybook-${scenario}-${name}.png`);
      await targetPage.screenshot({path: screenshot, fullPage: true});
      const capture = await verifyScreenshot(screenshot);
      const namedCapture = {...capture, name};
      captures.push(namedCapture);
      return namedCapture;
    };

    await page.goto(url, {waitUntil: 'networkidle'});
    recordScenarioFocus(record);
    await expect(page.locator('[data-testid="visual-surface"]')).toBeVisible();
    await expect(page.locator('.astryx-theme[data-astryx-theme="svelte-storybook"][data-theme="light"]')).toBeAttached();
    await expect(page.locator('[data-testid="visual-surface"]')).toHaveAttribute('data-storybook-mode', 'light');
    await expect(page.getByRole('button', {name: 'Dark mode'})).toBeVisible();
    await expect(page.locator('[data-story-group]')).toHaveCount(9);
    await expect(page.locator('[data-story-group="foundation-visibility-stack"]')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Stack'})).toBeVisible();
    const hiddenLabel = page.getByTestId('visually-hidden-label');
    await expect(hiddenLabel).toHaveClass(/astryx-sr-only/);
    await expect(page.getByRole('region', {name: 'Stack latest-main scroll region'})).toHaveAttribute('data-scrollable', 'true');
    await expect(page.getByRole('region', {name: 'StackItem scrollable milestone list'})).toHaveAttribute('data-scrollable', 'true');
    record('full surface groups: foundations/actions, VisuallyHidden + Stack/StackItem, forms/selection, navigation/overlays, table + TreeList, lab charts, Vega, rich surfaces, experimental progress');
    await capturePage('desktop-light');

    await page.getByRole('button', {name: 'Dark mode'}).click();
    await expect(page.locator('.astryx-theme[data-astryx-theme="svelte-storybook"][data-theme="dark"]')).toBeAttached();
    await expect(page.locator('[data-testid="visual-surface"]')).toHaveAttribute('data-storybook-mode', 'dark');
    await expect(page.getByRole('button', {name: 'Light mode'})).toBeVisible();
    const darkHeroContrast = await measureDarkHeroContrast(page);
    assertDarkHeroContrast(darkHeroContrast);
    record(`theme switching and dark first-viewport contrast: heading ${darkHeroContrast.headingContrast}, supporting copy ${darkHeroContrast.supportingCopyContrast}`);
    await capturePage('desktop-dark');

    await page.getByRole('textbox', {name: 'Workspace name'}).fill('Northstar');
    await expect(page.getByRole('textbox', {name: 'Workspace name'})).toHaveValue('Northstar');
    await expect(page.getByRole('switch', {name: 'Live preview'})).toBeVisible();
    await page.locator('input[type="range"]').fill('73');
    await expect(page.locator('input[type="range"]')).toHaveValue('73');
    record('forms: text input, switch visibility, slider');

    if (scenario === 'forms') {
      await assertTodo6FormsScenario(page, record);
    }

    if (scenario === 'selection-date-time') {
      await assertTodo6SelectionDateTimeScenario(page, record);
    }

    await page.locator('[data-testid="open-coverage-dialog"]').click();
    await expect(page.getByRole('dialog', {name: 'Port coverage details'})).toBeVisible();
    await expect(page.locator('[data-testid="coverage-dialog"][data-astryx-overlay="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', {name: 'Port coverage details'})).toHaveCount(0);
    record('overlays: real Dialog opened and closed by keyboard Escape');

    await page.getByRole('button', {name: 'Data'}).click();
    await expect(page.getByRole('button', {name: 'Data'})).toBeFocused();
    record('navigation: tab click and focus state');

    await page.getByRole('button', {name: 'Sort by Surface'}).click();
    await page.getByRole('checkbox', {name: /Select row/}).first().check();
    record('table: sort and row selection');

    const tree = page.getByRole('tree', {name: 'TreeList manual QA'});
    await expect(page.locator('[data-testid="tree-list-surface"]')).toBeVisible();
    await expect(tree).toBeVisible();
    const rootTreeItem = tree.getByRole('treeitem', {name: 'Data display parity'});
    await expect(rootTreeItem).toBeVisible();
    await expect(tree.getByRole('treeitem')).toHaveCount(2);
    await rootTreeItem.focus();
    await expect(rootTreeItem).toBeFocused();
    await rootTreeItem.press('ArrowRight');
    await expect(rootTreeItem).toHaveAttribute('aria-expanded', 'true');
    const childTreeItem = tree.getByRole('treeitem', {name: 'Table manual QA'});
    await expect(childTreeItem).toBeVisible();
    await rootTreeItem.press('ArrowDown');
    await expect(childTreeItem).toBeFocused();
    await childTreeItem.press('Enter');
    await expect(childTreeItem).toHaveAttribute('aria-selected', 'true');
    record('TreeList/tree manual QA: real role="tree" surface, visible treeitems, keyboard expansion, roving focus, and selection state');

    await expect(page.getByRole('log')).toContainText('full-port surfaces');
    await expect(page.getByRole('heading', {name: 'Markdown QA'})).toBeVisible();
    record('chat and markdown');

    await page.getByRole('button', {name: 'Open command palette'}).click();
    await expect(page.getByRole('dialog', {name: 'Story command palette'})).toBeVisible();
    await page.getByRole('combobox', {name: 'Search commands'}).fill('table');
    await expect(page.getByRole('option', {name: 'Inspect table states'})).toBeVisible();
    record('command palette: search and keyboard path');

    await page.locator('[data-astryx-chart-bar] rect').first().waitFor();
    record('lab charts');
    await expect(page.locator('[data-testid="vega-render"]')).toBeVisible();
    await page.locator('[data-testid="vega-render"] canvas, [data-testid="vega-render"] svg').first().waitFor();
    record('Vega chart');
    await capturePage('desktop-interactions');

    await page.setViewportSize({width: 375, height: 900});
    await expect(page.locator('[data-testid="visual-surface"]')).toBeVisible();
    record('mobile viewport');
    await capturePage('mobile');

    const reducedContext = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: {width: 768, height: 960},
    });
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto(url, {waitUntil: 'networkidle'});
    await expect(reducedPage.locator('.astryx-reduced-motion-safe').first()).toBeVisible();
    record('reduced motion');
    await capturePage('reduced-motion', reducedPage);
    await reducedContext.close();

    const keyboardPage = await browser.newPage({viewport: {width: 1280, height: 960}});
    await keyboardPage.goto(url, {waitUntil: 'networkidle'});
    await keyboardPage.keyboard.press('Tab');
    await expect(keyboardPage.getByRole('button', {name: 'Dark mode'})).toBeFocused();
    await keyboardPage.keyboard.press('Enter');
    await expect(keyboardPage.locator('.astryx-theme[data-astryx-theme="svelte-storybook"][data-theme="dark"]')).toBeAttached();
    await expect(keyboardPage.getByRole('button', {name: 'Light mode'})).toBeFocused();
    await keyboardPage.keyboard.press('Tab');
    await expect(keyboardPage.getByRole('button', {name: 'Open workflow details'})).toBeFocused();
    await keyboardPage.keyboard.press('Enter');
    await expect(keyboardPage.getByRole('dialog', {name: 'Port coverage details'})).toBeVisible();
    await expect(keyboardPage.locator('[data-testid="coverage-dialog"][data-astryx-overlay="dialog"]')).toBeVisible();
    record('keyboard-only path: dark mode plus real Dialog focus state');
    await capturePage('keyboard-only', keyboardPage);
    await keyboardPage.keyboard.press('Escape');
    await expect(keyboardPage.getByRole('dialog', {name: 'Port coverage details'})).toHaveCount(0);
    await keyboardPage.close();

    await browser.close();
    const distinctness = assertDistinctCaptures(captures, [
      ['desktop-light', 'desktop-dark'], ['desktop-light', 'desktop-interactions'], ['desktop-light', 'mobile'],
      ['desktop-light', 'reduced-motion'], ['desktop-light', 'keyboard-only'], ['desktop-dark', 'keyboard-only'],
    ]);
    const visibleStates = [
      'desktop-light: light theme provider attached, Dark mode button visible.',
      `desktop-dark: dark theme provider attached, Light mode button visible, first-viewport hero contrast heading=${darkHeroContrast.headingContrast}, supporting copy=${darkHeroContrast.supportingCopyContrast}, background=${darkHeroContrast.backgroundColor}.`,
      'desktop-interactions: form entry, sorted/selected table row, TreeList expanded/selected treeitem, command search, chart, Vega, markdown, and chat states visible.',
      'mobile: 375px viewport responsive layout visible.',
      'reduced-motion: reduced-motion browser context captured with reduced-motion-safe content visible.',
      'keyboard-only: keyboard activated dark mode and real Dialog remained visibly open at capture time.',
    ];
    await fs.writeFile(
      evidenceReport,
      [
        `# Svelte Storybook Full-Port E2E`, ``, `scenario: ${scenario}`, `dispatch: ${scenario === dispatchScenario ? dispatchScenario : `${scenario} scenario-specific checks with ${dispatchScenario} shared baseline`}`, `url: ${url}`, ``, `## Covered Scenarios`,
        ...checks.map((check) => `- ${check}`),
        ``, `## Captures`,
        ...captures.map((capture) => `- ${capture.file} (${capture.width}x${capture.height}, sampledValues=${capture.sampledValues}, sha1=${capture.sha1})`),
        ``, `## Visible States`,
        ...visibleStates.map((state) => `- ${state}`),
        ``, `## Screenshot Distinctness`,
        ...distinctness.map((check) => `- ${check}`),
        ``,
      ].join('\n'),
    );
    console.log(JSON.stringify({scenario, dispatchScenario, evidenceReport, captures, checks, distinctness}, null, 2));
  } finally {
    preview.kill('SIGTERM');
  }
}

await run();
