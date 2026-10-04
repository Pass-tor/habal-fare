const CACHE = 'habal-fare-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Don't cache API calls (telegram, OSRM, nominatim, photon)
  if(url.hostname.includes('telegram.org') || url.hostname.includes('openstreetmap.org') || url.hostname.includes('project-osrm.org') || url.hostname.includes('komoot.io')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(r=>{
      // cache html
      if(e.request.method==='GET' && r.ok && url.origin===location.origin){
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request, clone));
      }
      return r;
    }).catch(()=>caches.match('./index.html')))
  );
});