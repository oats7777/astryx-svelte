// Copyright (c) Meta Platforms, Inc. and affiliates.

import {levenshteinDistance} from '../lib/string-utils.mjs';
import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

const HOOK_DOCS = {
  useTheme: {
    name: 'useTheme',
    importPath: '@astryxdesign/svelte/theme',
    usage: {
      description:
        'Reads the nearest Astryx Svelte Theme context and exposes the resolved theme name, mode, token lookup, and token map.',
      bestPractices: [
        {
          guidance: true,
          description:
            'Use CSS variables and Tailwind token utilities for styling; use useTheme only when JavaScript needs the resolved token values.',
        },
      ],
    },
    params: [],
    returns: [
      {
        name: 'name',
        type: 'string',
        description: 'Active theme name.',
      },
      {
        name: 'mode',
        type: "'light' | 'dark'",
        description: 'Resolved effective color mode.',
      },
      {
        name: 'token',
        type: '(name: string) => string',
        description: 'Looks up one resolved token value.',
      },
      {
        name: 'tokens',
        type: 'Readonly<Record<string, string>>',
        description: 'Resolved token map for the current theme and mode.',
      },
    ],
    relatedComponents: ['Theme'],
  },
};

const HOOK_GROUPS = {
  Theme: ['useTheme'],
};

function detailFor(name) {
  return HOOK_DOCS[name] ?? null;
}

function entriesFor(names) {
  return names.map(name => ({
    name,
    description: HOOK_DOCS[name]?.usage?.description ?? '',
    import: HOOK_DOCS[name]?.importPath ?? '@astryxdesign/svelte/theme',
  }));
}

function suggestionsFor(name) {
  const needle = String(name).toLowerCase();
  return Object.keys(HOOK_DOCS)
    .map(hookName => ({
      name: hookName,
      distance: levenshteinDistance(needle, hookName.toLowerCase()),
    }))
    .filter(match => match.distance <= 5)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(match => ({
      name: match.name,
      reason: `similar name (distance ${match.distance})`,
    }));
}

export async function hook(name, options = {}) {
  const {
    list = false,
    category,
    params = false,
    detail: detailOption,
  } = options;

  const isListView = list || category != null || !name;
  const detail = detailOption ?? (isListView ? 'brief' : 'full');

  if (category || list || !name) {
    if (category) {
      const match = Object.entries(HOOK_GROUPS).find(
        ([key]) => key.toLowerCase() === category.toLowerCase(),
      );
      if (!match) {
        throw new AstryxError(
          `Unknown category "${category}"`,
          Object.keys(HOOK_GROUPS).map(key => ({
            name: key,
            reason: 'valid category',
          })),
          ERROR_CODES.ERR_UNKNOWN_CATEGORY,
        );
      }
      if (detail === 'compact') {
        return {type: 'hook.brief', data: {[match[0]]: entriesFor(match[1])}};
      }
      if (detail === 'full') {
        return {
          type: 'hook.full',
          data: {[match[0]]: match[1].map(hookName => detailFor(hookName))},
        };
      }
      return {type: 'hook.list', data: {[match[0]]: match[1]}};
    }

    if (detail === 'compact') {
      const result = {};
      for (const [group, names] of Object.entries(HOOK_GROUPS)) {
        result[group] = entriesFor(names);
      }
      return {type: 'hook.brief', data: result};
    }

    if (detail === 'full') {
      const result = {};
      for (const [group, names] of Object.entries(HOOK_GROUPS)) {
        result[group] = names.map(hookName => detailFor(hookName));
      }
      return {type: 'hook.full', data: result};
    }

    return {type: 'hook.list', data: HOOK_GROUPS};
  }

  const doc = detailFor(name);
  if (!doc) {
    throw new AstryxError(
      `No hook named "${name}"`,
      suggestionsFor(name),
      ERROR_CODES.ERR_UNKNOWN_HOOK,
    );
  }

  if (params) {
    return {type: 'hook.detail.params', data: doc.params};
  }
  return {type: 'hook.detail', data: doc};
}
