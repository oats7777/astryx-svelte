#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Explicit Svelte pipeline fixture generator
 * @input Svelte vibe-test iteration manifest.
 * @output Representative fixture .svelte and JSON result files.
 * @position internal/vibe-tests/src/create-svelte-pipeline-fixture.ts
 *
 * Seeds representative .svelte results for a previously created
 * astryx-svelte iteration. This is for local build/screenshot/aggregate smoke
 * only; normal interactive task setup does not call this script.
 *
 * Usage:
 *   tsx src/create-svelte-pipeline-fixture.ts --iteration <id>
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ensureDir,
  getResultsDir,
  readJson,
  timestamp,
  writeJson,
} from './utils.js';

interface FixturePrompt {
  readonly id: string;
  readonly category: string;
  readonly prompt: string;
}

interface FixtureManifest {
  readonly config?: {
    readonly target?: string;
  };
  readonly prompts: readonly FixturePrompt[];
}

function parseArgs(): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) {
      return args[i + 1];
    }
  }

  console.error(
    'Usage: tsx src/create-svelte-pipeline-fixture.ts --iteration <id>',
  );
  process.exit(1);
}

function svelteFixtureSource(prompt: FixturePrompt): string {
  const taskText = JSON.stringify(prompt.prompt);
  const category = JSON.stringify(prompt.category);
  const promptId = JSON.stringify(prompt.id);

  return `<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

<script lang="ts">
  import {Button, Theme, defineTheme} from '@astryxdesign/svelte';

  const theme = defineTheme({name: 'vibe-svelte-pipeline-fixture'});
  const taskText = ${taskText};
  const category = ${category};
  const promptId = ${promptId};

  const metrics = [
    {label: 'Prompt', value: promptId},
    {label: 'Category', value: category},
    {label: 'Target', value: 'Astryx Svelte'},
  ] as const;
</script>

<Theme {theme} mode="light">
  <main class="min-h-dvh bg-body p-6 text-primary">
    <section class="mx-auto grid max-w-4xl gap-5 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div class="grid gap-2">
        <p class="text-sm font-medium text-accent">Astryx Svelte pipeline fixture</p>
        <h1 class="text-2xl font-semibold text-primary">Pipeline smoke preview</h1>
        <p class="text-sm leading-6 text-secondary">{taskText}</p>
      </div>

      <dl class="grid gap-3 sm:grid-cols-3">
        {#each metrics as item}
          <div class="rounded-lg border border-border bg-surface p-3">
            <dt class="text-xs font-medium uppercase text-secondary">{item.label}</dt>
            <dd class="mt-1 break-words text-sm font-semibold text-primary">{item.value}</dd>
          </div>
        {/each}
      </dl>

      <div class="flex flex-wrap gap-2">
        <Button label="Primary action" variant="primary" />
        <Button label="Secondary action" variant="secondary" />
      </div>
    </section>
  </main>
</Theme>
`;
}

function main(): void {
  const iteration = parseArgs();
  const iterDir = path.join(getResultsDir(), iteration);
  const manifestPath = path.join(iterDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`No manifest.json found for iteration ${iteration}`);
    process.exit(1);
  }

  const manifest = readJson<FixtureManifest>(manifestPath);
  if (manifest.config?.target !== 'astryx-svelte') {
    console.error(
      `Iteration ${iteration} target is ${manifest.config?.target ?? 'unknown'}, expected astryx-svelte`,
    );
    process.exit(1);
  }

  const codeDir = path.join(iterDir, 'results');
  ensureDir(codeDir);

  for (const prompt of manifest.prompts) {
    const source = svelteFixtureSource(prompt);
    fs.writeFileSync(path.join(codeDir, `${prompt.id}.svelte`), source);
    writeJson(path.join(codeDir, `${prompt.id}.json`), {
      response: source,
      trajectoryDepth: 0,
      docsRead: [
        'AGENTS.svelte.md',
        'README.md',
        'package.json',
        'src/app.css',
      ],
      completedAt: timestamp(),
      pipelineFixture: true,
      agentOutput: false,
    });
  }

  console.log(
    `Seeded ${manifest.prompts.length} explicit Astryx Svelte pipeline fixture result file(s) for ${iteration}`,
  );
}

main();
