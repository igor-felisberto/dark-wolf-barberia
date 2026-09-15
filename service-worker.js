const CACHE_NAME = "dark-wolf-v1";

const arquivos = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./logo-darkwolf.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(arquivos);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resposta) => {
      return resposta || fetch(event.request);
    })
  );
});