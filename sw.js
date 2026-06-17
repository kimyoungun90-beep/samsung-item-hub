const CACHE_NAME = 'costco-item-operation-hub-v120';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './tv_wall_install_fee.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 제품 이미지는 저장본을 즉시 보여주고 뒤에서 새 파일로 교체합니다.
  if (url.pathname.includes('/images/') || url.hostname.includes('raw.githubusercontent.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached => {
          const fresh = fetch(req).then(res => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fresh;
        })
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // v120: 홈 화면 설치 앱도 재실행할 때 최신 index.html을 먼저 확인합니다.
  // 네트워크가 끊긴 경우에만 저장된 화면을 사용하므로 기기별 구버전 차이를 줄입니다.
  if (req.mode === 'navigate' || /\/index\.html$/.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        try {
          const fresh = await fetch(req, { cache: 'no-store' });
          if (fresh && fresh.ok) {
            cache.put(req, fresh.clone());
            cache.put('./index.html', fresh.clone());
          }
          return fresh;
        } catch (e) {
          return (await cache.match(req)) || (await cache.match('./index.html')) || Response.error();
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }))
  );
});
