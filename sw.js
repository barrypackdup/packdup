const CACHE='packdup-v4';
const ASSETS=['/','/index.html'];
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  // never cache API / mapbox / unsplash tiles — network only
  if(url.includes('workers.dev')||url.includes('api.mapbox')||url.includes('mailchimp')||url.includes('googletagmanager')){return;}
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetched=fetch(e.request).then(res=>{
        if(res&&res.status===200&&e.request.method==='GET'){
          const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>cached);
      return cached||fetched;
    })
  );
});
