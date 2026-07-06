// Copyright (c) Meta Platforms, Inc. and affiliates.

/// <reference types="node" />
/**
 * @file Fairness checks for generated vibe-test task prompts
 * @input Fixture JSON or generated iteration task files
 * @output Process exit status and actionable leakage diagnostics
 * @position CLI guardrail for internal/vibe-tests prompt invariants
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  inspectSvelteEnvironment,
  inspectSvelteTask,
  SVELTE_TARGET,
} from './svelte-fairness.js';
import {getResultsDir} from './utils.js';

type FairnessTask = {
  readonly promptId: string;
  readonly prompt: string;
  readonly subagentPrompt: string;
  readonly expectedComponents: readonly string[];
  readonly target?: string;
};

type FairnessIssue = {
  readonly file: string;
  readonly promptId: string;
  readonly rule: string;
  readonly detail: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readStringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function toFairnessTask(value: unknown): FairnessTask | null {
  if (!isRecord(value)) {
    return null;
  }

  const promptId = readString(value.promptId) ?? readString(value.id);
  const prompt = readString(value.prompt);
  const subagentPrompt =
    readString(value.subagentPrompt) ?? readString(value.taskPrompt);
  const expectedComponents = readStringArray(value.expectedComponents);
  if (promptId === null || prompt === null || subagentPrompt === null) {
    return null;
  }

  const target = readString(value.target) ?? undefined;
  return {promptId, prompt, subagentPrompt, expectedComponents, target};
}

function extractTasks(value: unknown): readonly FairnessTask[] {
  if (Array.isArray(value)) {
    return value
      .map(toFairnessTask)
      .filter((task): task is FairnessTask => task !== null);
  }
  if (isRecord(value) && Array.isArray(value.tasks)) {
    return value.tasks
      .map(toFairnessTask)
      .filter((task): task is FairnessTask => task !== null);
  }
  const task = toFairnessTask(value);
  return task === null ? [] : [task];
}

function inspectTask(
  task: FairnessTask,
  file: string,
): readonly FairnessIssue[] {
  const issues: FairnessIssue[] = [];
  const subagentPrompt = task.subagentPrompt.toLowerCase();
  const originalPrompt = task.prompt.toLowerCase();

  if (subagentPrompt.includes('expectedcomponents')) {
    issues.push({
      file,
      promptId: task.promptId,
      rule: 'expected-components-key-leak',
      detail: '`expectedComponents` appeared inside subagentPrompt',
    });
  }

  for (const component of task.expectedComponents) {
    const componentName = component.toLowerCase();
    if (
      componentName.length > 0 &&
      subagentPrompt.includes(componentName) &&
      !originalPrompt.includes(componentName)
    ) {
      issues.push({
        file,
        promptId: task.promptId,
        rule: 'expected-component-name-hint',
        detail: `Expected component "${component}" appeared in subagentPrompt but not in the original prompt`,
      });
    }
  }

  issues.push(...inspectSvelteTask(task, file));

  return issues;
}

function parseArgs(): {readonly fixture?: string; readonly iteration?: string} {
  const args = process.argv.slice(2);
  let fixture: string | undefined;
  let iteration: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    const next = args[index + 1];
    if (arg === '--fixture' && next !== undefined) {
      fixture = next;
      index++;
    } else if (arg === '--iteration' && next !== undefined) {
      iteration = next;
      index++;
    }
  }

  if (fixture === undefined && iteration === undefined) {
    console.error(
      'Usage: tsx src/check-fairness.ts --fixture <path> | --iteration <id>',
    );
    process.exit(1);
  }

  return {fixture, iteration};
}

function loadFixtureTasks(fixturePath: string): readonly {
  readonly file: string;
  readonly task: FairnessTask;
}[] {
  const absolutePath = path.resolve(process.cwd(), fixturePath);
  const data: unknown = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
  return extractTasks(data).map(task => ({file: absolutePath, task}));
}

function loadIterationTasks(iteration: string): readonly {
  readonly file: string;
  readonly task: FairnessTask;
}[] {
  const tasksDir = path.join(getResultsDir(), iteration, 'tasks');
  if (!fs.existsSync(tasksDir)) {
    throw new Error(`No tasks directory found at ${tasksDir}`);
  }

  return fs
    .readdirSync(tasksDir)
    .filter((file: string) => file.endsWith('.json'))
    .flatMap((file: string) => {
      const taskPath = path.join(tasksDir, file);
      const data: unknown = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
      return extractTasks(data).map(task => ({file: taskPath, task}));
    });
}

function main(): void {
  const {fixture, iteration} = parseArgs();
  const taskEntries =
    fixture !== undefined
      ? loadFixtureTasks(fixture)
      : loadIterationTasks(iteration ?? '');

  if (taskEntries.length === 0) {
    console.error('No fairness task records found');
    process.exit(1);
  }

  const issues = taskEntries.flatMap(entry =>
    inspectTask(entry.task, entry.file),
  );
  const hasSvelteTask = taskEntries.some(
    entry => entry.task.target === SVELTE_TARGET,
  );
  const allIssues = hasSvelteTask
    ? [...issues, ...inspectSvelteEnvironment()]
    : issues;

  if (allIssues.length > 0) {
    console.error(`Fairness check failed with ${allIssues.length} issue(s):`);
    for (const issue of allIssues) {
      console.error(
        `- ${issue.rule} ${issue.file}#${issue.promptId}: ${issue.detail}`,
      );
    }
    process.exit(1);
  }

  console.log(`Fairness check passed for ${taskEntries.length} task(s)`);
}

main();
