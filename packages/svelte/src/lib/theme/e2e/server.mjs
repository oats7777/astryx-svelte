// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file server.mjs
 * @input Playwright webServer lifecycle
 * @output Vite-backed SSR page for Svelte theme hydration checks
 * @position Package-local E2E server for @astryxdesign/svelte
 */

import http from 'node:http';
import {createServer as createViteServer} from 'vite';

const host = '127.0.0.1';
const port = 4265;

const vite = await createViteServer({
  appType: 'custom',
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {middlewareMode: true},
});

const server = http.createServer(async (request, response) => {
  if (request.url === '/') {
    const module = await vite.ssrLoadModule('/src/lib/theme/e2e/ThemeRootSyncApp.svelte');
    const svelteServer = await vite.ssrLoadModule('svelte/server');
    const result = svelteServer.render(module.default);

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(`<!doctype html>
<html lang="en" data-server-rendered="true">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${result.head}
  </head>
  <body>
    <div id="app">${result.body}</div>
    <script type="module" src="/src/lib/theme/e2e/client.ts"></script>
  </body>
</html>`);
    return;
  }

  vite.middlewares(request, response, () => {
    response.writeHead(404);
    response.end('Not found');
  });
});

server.listen(port, host);

function closeServer() {
  server.close();
  void vite.close();
}

process.on('SIGTERM', closeServer);
process.on('SIGINT', closeServer);
