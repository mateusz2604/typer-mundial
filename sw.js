// Wersja cache – zmień tę liczbę przy każdym deployu żeby wyczyścić stary cache
const CACHE_VERSION = 'typer-ms2026-v' + Date.now();

self.addEventListener('install', e => {
  // Od razu aktywuj nowy SW bez czekania
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Usuń WSZYSTKIE stare cache przy każdej aktualizacji
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Ignoruj nie-http requesty i metody inne niż GET
  if (!e.request.url.startsWith('http')) return;
  if (e.request.method !== 'GET') return;

  // Firebase, googleapis – zawsze sieć, nigdy cache
  if (
    e.request.url.includes('firebase') ||
    e.request.url.includes('googleapis') ||
    e.request.url.includes('gstatic') ||
    e.request.url.includes('api-sports')
  ) return;

  // Dla index.html – zawsze sieć, fallback do cache
  if (e.request.url.includes('index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Reszta – sieć pierwsza, cache jako fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Nasłuchuj wiadomości od klienta – wymuszony reset
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  if (e.data === 'CLEAR_CACHE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
