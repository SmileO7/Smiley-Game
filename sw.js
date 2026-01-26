const CACHE_NAME = 'smiley-game-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './SmileyGame.js',
  './data.js',       // Falls du diese Datei separat hast
  './manifest.json',
  './icon.png'
];

// Installation: Dateien in den Cache laden
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Abruf: Wenn offline, nimm Dateien aus dem Cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});