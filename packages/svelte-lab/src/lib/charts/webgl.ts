// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file webgl.ts
 * @input Canvas elements, SVG marker elements, and color strings
 * @output WebGL helpers with graceful no-context fallback
 * @position Private Svelte lab WebGL chart utilities
 */

export function hexToGL(hex: string): readonly [number, number, number] {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

export function getCanvasDPR(): number {
  return globalThis.window?.devicePixelRatio ?? 1;
}

export function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  return canvas.getContext('webgl', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  });
}

export function sizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number = getCanvasDPR(),
): number {
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return dpr;
}

export function mountCanvasOverSVG(
  svgMarker: SVGGraphicsElement,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): (() => void) | undefined {
  const svg = svgMarker.ownerSVGElement;
  const parent = svg?.parentElement;
  if (!parent) {
    return undefined;
  }

  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  canvas.style.height = `${height}px`;
  canvas.style.left = '0px';
  canvas.style.pointerEvents = 'none';
  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.width = `${width}px`;
  parent.appendChild(canvas);

  return () => {
    if (canvas.parentElement === parent) {
      parent.removeChild(canvas);
    }
  };
}
