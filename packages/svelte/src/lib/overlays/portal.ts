// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file portal.ts
 * @input Overlay element and portal enablement
 * @output Body portal action preserving local Astryx theme attributes
 * @position Shared portal action for Todo 11 overlays
 */

type PortalOptions = {
  readonly enabled: boolean;
};

function currentThemeAttributes(node: HTMLElement): readonly (readonly [string, string])[] {
  const host = node.closest<HTMLElement>('[data-astryx-theme]');
  const theme = host?.getAttribute('data-astryx-theme');
  const mode = host?.getAttribute('data-theme');
  return [
    ...(theme == null ? [] : [['data-astryx-theme', theme] as const]),
    ...(mode == null ? [] : [['data-theme', mode] as const]),
  ];
}

export function portal(
  node: HTMLElement,
  options: PortalOptions,
): {update: (next: PortalOptions) => void; destroy: () => void} {
  const marker = document.createComment('astryx-portal');
  const parent = node.parentNode;
  let mounted = false;

  function mount(next: PortalOptions): void {
    if (!next.enabled || mounted || parent == null) {
      return;
    }
    for (const [name, value] of currentThemeAttributes(node)) {
      node.setAttribute(name, value);
    }
    parent.insertBefore(marker, node);
    document.body.appendChild(node);
    mounted = true;
  }

  mount(options);

  return {
    update: mount,
    destroy() {
      if (mounted) {
        node.remove();
      }
      marker.remove();
    },
  };
}
