/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// SvelteKit-Service-Worker.
// Strategie: App-Shell + Build-Assets cache-first, alles andere
// stale-while-revalidate. Eingebauter Build-Manifest-Zugriff via
// `$service-worker` virtual module.

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE_PREFIX = 'lievito';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${version}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${version}`;

const PRECACHE = [...build, ...files];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE);
      await sw.skipWaiting();
    })()
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      );
      await sw.clients.claim();
    })()
  );
});

sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Nur same-origin im Cache. Externe Hosts immer direkt fetchen.
  if (url.origin !== sw.location.origin) return;

  // KI-/API-Requests nicht cachen.
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(handle(event.request));
});

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const staticCache = await caches.open(STATIC_CACHE);

  // Build-Assets sind immutable: cache-first.
  if (PRECACHE.includes(url.pathname)) {
    const cached = await staticCache.match(request);
    if (cached) return cached;
  }

  const runtimeCache = await caches.open(RUNTIME_CACHE);
  const cached = await runtimeCache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok && response.type === 'basic') {
        runtimeCache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => cached ?? Response.error());

  // Stale-while-revalidate: cached zuerst, im Hintergrund Update.
  return cached ?? network;
}

sw.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') sw.skipWaiting();
});

export {};
