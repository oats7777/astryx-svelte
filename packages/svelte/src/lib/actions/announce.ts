// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file announce.ts
 * @input Announcement messages and politeness level
 * @output Persistent visually-hidden live regions plus canonical focus selector
 * @position Shared Svelte/DOM accessibility utility for action and overlay components
 */

export type AnnouncePoliteness = 'polite' | 'assertive';
export type AnnounceFn = (message: string, politeness?: AnnouncePoliteness) => void;

export const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls], iframe, details > summary:first-child';

const CONTAINER_ATTR = 'data-astryx-live-region';
const VISUALLY_HIDDEN_CSS =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;' +
  'inset-block-start:0;inset-inline-start:0;pointer-events:none;' +
  'user-select:none;';

type LiveRegions = {
  readonly polite: HTMLElement;
  readonly assertive: HTMLElement;
};

let regions: LiveRegions | null = null;

function createRegion(politeness: AnnouncePoliteness): HTMLElement {
  const region = document.createElement('div');
  region.setAttribute(CONTAINER_ATTR, politeness);
  region.setAttribute('aria-live', politeness);
  region.setAttribute('aria-atomic', 'true');
  region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  region.style.cssText = VISUALLY_HIDDEN_CSS;
  document.body.appendChild(region);
  return region;
}

function getRegions(): LiveRegions | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (regions == null) {
    regions = {
      polite: createRegion('polite'),
      assertive: createRegion('assertive'),
    };
    return regions;
  }

  if (!regions.polite.isConnected) {
    document.body.appendChild(regions.polite);
  }
  if (!regions.assertive.isConnected) {
    document.body.appendChild(regions.assertive);
  }
  return regions;
}

function setAnnouncement(region: HTMLElement, message: string): void {
  region.textContent = '';
  const schedule = globalThis.requestAnimationFrame ?? ((callback: FrameRequestCallback) => {
    globalThis.setTimeout(() => callback(0), 0);
    return 0;
  });
  schedule(() => {
    region.textContent = message;
  });
}

export const announce: AnnounceFn = (message, politeness = 'polite') => {
  const liveRegions = getRegions();
  if (liveRegions == null) {
    return;
  }

  const target = politeness === 'assertive' ? liveRegions.assertive : liveRegions.polite;
  if (message.length === 0) {
    target.textContent = '';
    return;
  }

  setAnnouncement(target, message);
};

export function __resetLiveRegionsForTest(): void {
  regions?.polite.remove();
  regions?.assertive.remove();
  regions = null;
}
