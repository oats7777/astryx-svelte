// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contrast.mjs
 * @input Playwright page with the Svelte Storybook first viewport rendered in dark mode
 * @output WCAG contrast measurements for hero text against the effective shell background
 * @position Visual e2e contrast helpers for @astryxdesign/svelte-storybook
 */

const rgbPattern = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/u;

function parseRgb(color) {
  const match = rgbPattern.exec(color);
  if (match == null) {
    throw new Error(`Unsupported CSS color for contrast measurement: ${color}.`);
  }
  return {
    alpha: match[4] == null ? 1 : Number(match[4]),
    channels: [Number(match[1]), Number(match[2]), Number(match[3])],
  };
}

function srgbToLinear(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(channels) {
  return 0.2126 * srgbToLinear(channels[0]) + 0.7152 * srgbToLinear(channels[1]) + 0.0722 * srgbToLinear(channels[2]);
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export async function measureDarkHeroContrast(page) {
  const colors = await page.locator('[data-testid="visual-surface"]').evaluate((shell) => {
    const hero = shell.querySelector('.storybook-hero');
    const heading = hero?.querySelector('h1');
    const supportingCopy = [...(hero?.querySelectorAll('*') ?? [])].find((element) =>
      element.textContent?.includes('Representative full-port surfaces'),
    );
    if (heading == null || supportingCopy == null) {
      throw new Error('Unable to find Storybook hero heading and supporting copy for contrast measurement.');
    }

    const bodyStyle = window.getComputedStyle(document.body);
    const shellStyle = window.getComputedStyle(shell);
    const shellBackground = shellStyle.backgroundColor;
    const bodyBackground = bodyStyle.backgroundColor;
    return {
      bodyBackground,
      colorScheme: window.getComputedStyle(document.documentElement).colorScheme,
      headingColor: window.getComputedStyle(heading).color,
      mode: shell.getAttribute('data-storybook-mode'),
      shellBackground,
      supportingCopyColor: window.getComputedStyle(supportingCopy).color,
    };
  });
  const shellBackground = parseRgb(colors.shellBackground);
  const bodyBackground = parseRgb(colors.bodyBackground);
  const background = shellBackground.alpha > 0 ? shellBackground.channels : bodyBackground.channels;
  return {
    ...colors,
    backgroundColor: shellBackground.alpha > 0 ? colors.shellBackground : colors.bodyBackground,
    headingContrast: contrastRatio(parseRgb(colors.headingColor).channels, background),
    supportingCopyContrast: contrastRatio(parseRgb(colors.supportingCopyColor).channels, background),
  };
}

export function assertDarkHeroContrast(measurement) {
  if (measurement.mode !== 'dark' || !measurement.colorScheme.includes('dark')) {
    throw new Error(`Dark hero contrast measured outside dark mode: ${JSON.stringify(measurement)}.`);
  }
  if (measurement.headingContrast < 3 || measurement.supportingCopyContrast < 4.5) {
    throw new Error(`Dark hero contrast is unreadable: ${JSON.stringify(measurement)}.`);
  }
}
