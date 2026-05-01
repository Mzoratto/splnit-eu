const CACHE_NAME = "splnit-offline-v2";
const APP_SHELL = [
  "/",
  "/icon-192x192.png",
  "/icon-512x512.png",
];
const PRIVATE_ROUTE_PREFIXES = [
  "/clients",
  "/controls",
  "/dashboard",
  "/evidence",
  "/frameworks",
  "/incidents",
  "/integrations",
  "/onboarding",
  "/policies",
  "/questionnaires",
  "/risks",
  "/settings",
  "/team",
  "/trust-center",
  "/vendors",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    if (isPrivateRoute(url.pathname)) {
      event.respondWith(fetch(request));
      return;
    }

    event.respondWith(networkFirst(request, "/"));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(cacheFirst(request));
  }
});

function isPrivateRoute(pathname) {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match(fallbackUrl)) ||
      (await cache.match("/"))
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}
