// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  documentedTokenGroups,
  renderDefaultTokenCSS,
  renderTailwindThemeCSS,
  tailwindThemeCSS,
  tokenGroups,
  tokenMetadata,
} from './index';

describe('token-drift', () => {
  it('Given canonical token groups When metadata is emitted Then token counts stay aligned', () => {
    const groupCount = tokenGroups.reduce(
      (sum, group) => sum + group.tokens.length,
      0,
    );

    expect(tokenMetadata.tokens).toHaveLength(groupCount);
    expect(tokenMetadata.groups.map(group => group.key)).toEqual(
      tokenGroups.map(group => group.key),
    );
  });

  it('Given deprecated transition compatibility tokens When docs groups are selected Then only current tokens are documented', () => {
    const deprecatedGroups = tokenGroups.filter(
      group => group.lifecycle === 'deprecated',
    );
    const documentedTokenCount = documentedTokenGroups.reduce(
      (sum, group) => sum + group.tokens.length,
      0,
    );

    expect(tokenGroups).toHaveLength(13);
    expect(tokenMetadata.tokens).toHaveLength(186);
    expect(documentedTokenGroups).toHaveLength(12);
    expect(documentedTokenCount).toBe(184);
    expect(deprecatedGroups.map(group => group.key)).toEqual(['transition']);
    expect(deprecatedGroups[0]?.tokens).toHaveLength(2);
  });

  it('Given the Svelte Tailwind bridge When canonical tokens render it Then utility variables stay aligned', () => {
    const css = renderTailwindThemeCSS();

    expect(css).toBe(tailwindThemeCSS);
    expect(css).toContain('@import "@astryxdesign/svelte/styles.css";');
    expect(css).toContain('@import "@astryxdesign/tokens/tailwind-theme.css";');
    expect(css).toContain('--color-primary: var(--color-text-primary);');
  });

  it('Given default CSS variables When emitted Then light-dark values are preserved', () => {
    const css = renderDefaultTokenCSS();

    expect(css).toContain(
      '--color-accent: light-dark(#0064E0, #2694FE);',
    );
    expect(css).toContain(
      '--shadow-low: 0px 1px 1px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 8px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));',
    );
  });
});
