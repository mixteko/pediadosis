/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'pediadosis-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon_192.png',
  '/icon_512.png'
];

// Install Event: cache static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: network-first or cache-fallback to preserve offline capability inside hospital walls
self.addEventListener('fetch', (event) => {
  // 1. Only intercept GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  // 2. Only intercept standard HTTP/HTTPS schemes (bypass chrome-extensions, safari-extensions, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }

  const requestUrl = new URL(url);

  // 3. Bypass Vite development server internals to prevent blank screens during development
  const isViteInternal = requestUrl.pathname.startsWith('/@') || 
                         requestUrl.pathname.includes('/node_modules/') || 
                         requestUrl.pathname.endsWith('.tsx') || 
                         requestUrl.pathname.endsWith('.ts') ||
                         requestUrl.pathname.includes('__vite_ping');
  
  if (isViteInternal) {
    return;
  }

  // Skip APIs or external sheets request to let the application fetch fresh data
  if (requestUrl.hostname.includes('spreadsheets.google.com') || requestUrl.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to match cache if offline
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached, but fetch fresh in background to update cache (Stale-While-Revalidate)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  try {
                    cache.put(event.request, networkResponse);
                  } catch (e) {
                    console.warn('[Service Worker] Failed to update cache for:', event.request.url, e);
                  }
                });
              }
            })
            .catch(() => { /* ignore offline errors in background */ });
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Cache newly requested frontend assets on the fly
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseToCache);
              } catch (e) {
                console.warn('[Service Worker] Failed to cache response for:', event.request.url, e);
              }
            });

            return networkResponse;
          })
          .catch(() => {
            // Offline fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
      .catch((err) => {
        console.error('[Service Worker] Fetch handler error, fallback to network:', err);
        return fetch(event.request);
      })
  );
});
