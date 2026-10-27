const C='parentdrive-v1';
const base=self.registration.scope;
const files=['','index.html','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(files.map(file=>new URL(file,base)))));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>(key.startsWith('parentdrive-')||key==='taxi-v4')&&key!==C).map(key=>caches.delete(key))
  )));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(C);
    if(event.request.mode==='navigate'){
      try{
        const response=await fetch(event.request);
        if(response.ok)await cache.put(event.request,response.clone());
        return response;
      }catch(error){
        const offline=await cache.match(event.request)||await cache.match(new URL('index.html',base));
        if(offline)return offline;
        throw error;
      }
    }
    return await cache.match(event.request)||fetch(event.request);
  })());
});
