const CACHE_NAME = 'senior-fit-v1';
// 先只快取必要的，確保不會因為缺一個檔就整組壞掉
const ASSETS_TO_CACHE = [
  './index.html',
  './app.js',
  './style.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
