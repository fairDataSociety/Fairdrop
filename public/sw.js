/**
 * Fairdrop Service Worker
 *
 * Features:
 * - Static asset caching for offline access
 * - Share Target handling for incoming shares
 * - Background sync for uploads
 */

const CACHE_NAME = 'fairdrop-v3';
const STATIC_CACHE = 'fairdrop-static-v3';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('fairdrop-') && name !== STATIC_CACHE && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle share target POST requests
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // For navigation requests, try network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets, try cache first, fall back to network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request)
            .then((networkResponse) => {
              // Cache successful responses
              if (networkResponse.ok && shouldCache(event.request)) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, clone);
                });
              }
              return networkResponse;
            });
        })
    );
    return;
  }

  // For external requests, just fetch
  event.respondWith(fetch(event.request));
});

// Handle share target
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file');
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';

    // Store files in temporary storage for the app to pick up
    const shareData = {
      files: [],
      title,
      text,
      url,
      timestamp: Date.now()
    };

    for (const file of files) {
      if (file instanceof File) {
        // Store file data
        shareData.files.push({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file)
        });
      }
    }

    // Store in IndexedDB for the app to retrieve
    await storeShareData(shareData);

    // Redirect to app with share flag
    return Response.redirect('/?share=pending', 303);
  } catch (error) {
    console.error('[SW] Share target error:', error);
    return Response.redirect('/?share=error', 303);
  }
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Store share data in IndexedDB
async function storeShareData(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fairdrop-share', 1);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'timestamp' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');

      store.add(data);

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
}

// Check if request should be cached
function shouldCache(request) {
  const url = new URL(request.url);

  // Cache static assets
  if (url.pathname.startsWith('/assets/')) {
    return true;
  }

  // Cache JS and CSS
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return true;
  }

  return false;
}

// Background sync for uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-sync') {
    event.waitUntil(processPendingUploads());
  }
});

// Process pending uploads (from background sync)
async function processPendingUploads() {
  // This would be implemented to retry failed uploads
  // For now, just log
  console.log('[SW] Processing pending uploads...');
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New message received',
    icon: '/assets/images/fairdrop-icon-192.png',
    badge: '/assets/images/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Fairdrop', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log('[SW] Service worker loaded');
