// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file link-button-fallback.test.ts
 * @input Svelte Link without href
 * @output Focused no-href fallback proof for Todo 8 manual QA
 * @position Failure-path regression for the actions family
 */

import {mount, tick, unmount} from 'svelte';
import {describe, expect, it} from 'vitest';
import {Link} from './index.js';

describe('Svelte Link no-href fallback', () => {
  it('Given Link has no href When rendered Then it is a button instead of an anchor', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const app = mount(Link, {
      target,
      props: {label: 'Run action'},
    });

    await tick();

    expect(target.querySelector('button')?.textContent).toContain('Run action');
    expect(target.querySelector('a')).toBeNull();

    await unmount(app);
  });
});
