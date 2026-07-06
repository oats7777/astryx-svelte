// Copyright (c) Meta Platforms, Inc. and affiliates.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const isStrictMode =
  globalThis.process?.env.ASTRYX_STRICT_LINT === '1' ||
  globalThis.process?.env.CI === 'true';
const warningSeverity = isStrictMode ? 'error' : 'warn';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.svelte-kit/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.svelte',
      '**/*.tsx',
      '.claude/**',
      '.changeset/**',
      '.github/scripts/**',
      'internal/vibe-tests/app/**',
    ],
  },
  {
    files: ['**/*.{ts,mts,cts}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        warningSeverity,
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        warningSeverity,
        {fixStyle: 'inline-type-imports'},
      ],
      '@typescript-eslint/no-non-null-assertion': warningSeverity,
      '@typescript-eslint/consistent-type-assertions': [
        warningSeverity,
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      curly: warningSeverity,
      'no-console': ['warn', {allow: ['warn', 'error']}],
    },
  },
  {
    files: ['packages/cli/**/*.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [
      'apps/**/scripts/**/*.{mjs,js}',
      'internal/**/*.mjs',
      'packages/svelte/src/lib/theme/e2e/*.mjs',
      'packages/*/scripts/**/*.mjs',
      'scripts/**/*.{cjs,js,mjs}',
    ],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['internal/vibe-tests/src/**/*.{ts,mts,cts}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['apps/svelte-storybook/scripts/contrast.mjs'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    files: ['packages/svelte/src/lib/rich-surfaces/markdown-utils.ts'],
    rules: {
      'no-control-regex': 'off',
    },
  },
);
