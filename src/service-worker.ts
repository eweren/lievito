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

interface ScheduleNotificationMessage {
  type: 'SCHEDULE_NOTIFICATION';
  id: string;
  fireAt: number; // ms-Epoch
  title: string;
  body: string;
  tag?: string;
}

interface CancelNotificationMessage {
  type: 'CANCEL_NOTIFICATION';
  id: string;
}

const scheduledTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data === 'SKIP_WAITING') {
    sw.skipWaiting();
    return;
  }
  const data = event.data as
    | ScheduleNotificationMessage
    | CancelNotificationMessage
    | undefined;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const delay = Math.max(0, data.fireAt - Date.now());
    const existing = scheduledTimeouts.get(data.id);
    if (existing) clearTimeout(existing);
    const handle = setTimeout(() => {
      scheduledTimeouts.delete(data.id);
      sw.registration
        .showNotification(data.title, {
          body: data.body,
          tag: data.tag ?? data.id,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png'
        })
        .catch(() => undefined);
    }, delay);
    scheduledTimeouts.set(data.id, handle);
  }

  if (data.type === 'CANCEL_NOTIFICATION') {
    const existing = scheduledTimeouts.get(data.id);
    if (existing) {
      clearTimeout(existing);
      scheduledTimeouts.delete(data.id);
    }
  }
});

sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    sw.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return sw.clients.openWindow('/timer');
    })
  );
});

export {};
