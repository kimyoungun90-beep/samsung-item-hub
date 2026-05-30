const CACHE_NAME = 'samsung-item-hub-v334';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // HTML 화면은 캐시 쓰지 않고 항상 최신 파일 우선
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match(req))
    );
    return;
  }

  // 이미지도 최신 우선
  if (url.pathname.includes('/images/')) {
    event.respondWith(fetch(req, { cache: 'reload' }));
    return;
  }

  // 나머지만 일반 캐시
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
