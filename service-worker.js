const CACHE = "gomoku-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  // 외부 파일이 있다면 여기에 추가 (예: ./icons/icon-192.png, ./icons/icon-512.png)
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  // 캐시 우선, 실패 시 네트워크
  e.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((res) => {
        // 동일 출처만 캐시
        if (request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});