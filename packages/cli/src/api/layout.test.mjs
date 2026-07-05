// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Svelte integration tests for the layout API.
 * @input Real @astryxdesign/svelte component registry and compact/outline XLE.
 * @output Assertions over Svelte code generation, validation, and grammar data.
 * @position Protects the CLI layout surface from emitting React/XDS-prefixed code.
 */

import {beforeAll, describe, expect, it} from 'vitest';
import {compile} from 'svelte/compiler';

import {buildRegistry} from '../lib/xle/registry.mjs';
import {layoutCheck, layoutExpand, layoutGrammar} from './layout.mjs';

const SLOW = 30_000;

beforeAll(async () => {
  await buildRegistry();
}, 120_000);

function expectValidSvelte(code) {
  expect(() => compile(code, {filename: 'GeneratedLayout.svelte'})).not.toThrow();
}

describe('layoutExpand', () => {
  it('emits prefix-free Svelte imports and component tags', async () => {
    const result = await layoutExpand('C > B"Sign in"');
    const {code} = result.data;

    expect(result.type).toBe('layout.expand');
    expectValidSvelte(code);
    expect(code).toContain("import {Button} from '@astryxdesign/svelte/actions';");
    expect(code).toContain("import {Card} from '@astryxdesign/svelte/foundations';");
    expect(code).toContain('<Card>');
    expect(code).toContain('<Button label="Sign in" />');
    expect(code).not.toContain('XDSButton');
    expect(code).not.toContain('XDSCard');
  }, SLOW);

  it('accepts legacy XDS-prefixed input while emitting Svelte names', async () => {
    const result = await layoutExpand('XDSCard > XDSButton"Save"');
    const {code} = result.data;

    expectValidSvelte(code);
    expect(code).toContain('<Card>');
    expect(code).toContain('<Button label="Save" />');
    expect(code).not.toContain('<XDS');
  }, SLOW);

  it('expands outline input to the same Svelte code as compact input', async () => {
    const compact = await layoutExpand('C > B"Save"');
    const check = await layoutCheck('C > B"Save"');
    const outline = await layoutExpand(check.data.outline, {form: 'outline'});

    expect(check.data.valid).toBe(true);
    expect(outline.data.code).toEqual(compact.data.code);
  }, SLOW);

  it('throws structured errors for invalid Svelte layout expressions', async () => {
    await expect(layoutExpand('A[p6] > Grdi')).rejects.toMatchObject({
      code: 'ERR_LAYOUT_INVALID',
      message: expect.stringMatching(/AppShell has no prop 'padding'/),
    });
  });
});

describe('layoutCheck', () => {
  it('returns canonical compact and outline forms for valid input', async () => {
    const result = await layoutCheck('C > B"Save"');

    expect(result.data.valid).toBe(true);
    expect(result.data.compact).toBe('C > B"Save"');
    expect(result.data.outline).toContain('C');
    expect(result.data.outline).toContain('B "Save"');
  });

  it('collects all validation errors instead of stopping at the first', async () => {
    const result = await layoutCheck('A[p6] > Grdi + {not-a-block}');
    const messages = result.data.errors.map(error => error.message).join('\n');

    expect(result.data.valid).toBe(false);
    expect(messages).toMatch(/no prop 'padding'/);
    expect(messages).toMatch(/Unknown component or alias 'Grdi'/);
    expect(messages).toMatch(/Unknown block/);
  });
});

describe('layoutGrammar', () => {
  it('emits the cheatsheet with registry-filtered Svelte aliases', async () => {
    const result = await layoutGrammar();

    expect(result.type).toBe('layout.grammar');
    expect(result.data.text).toContain('TWO SURFACES');
    expect(result.data.aliases.V).toBe('VStack');
    expect(result.data.aliases.B).toBe('Button');
    expect(Object.values(result.data.aliases)).not.toContain(undefined);
  });
});
