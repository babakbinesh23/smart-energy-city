/* Public static assets only. Dynamic HTML, JSON, POST, auth and live data always reach the server. */
const CFG=self.BC_CACHE_CONFIG109;
const CODE='bargheto-city-code-'+CFG.version,MEDIA='bargheto-city-media-v1',pending=new Map();
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('bargheto-city-code-')&&name!==CODE)await caches.delete(name);await self.clients.claim();})()));
function kind(url){
 if(url.origin!==self.location.origin)return null;
 if(url.pathname.startsWith(CFG.mediaPath)&&/\.(?:glb|gltf|mp3|wav|ogg|m4a|mp4|png|webp|jpe?g)$/i.test(url.pathname))return MEDIA;
 if(url.pathname.startsWith(CFG.pluginPath)&&/\.(?:js|css|woff2?|png|webp|jpe?g|svg|glb|mp3)$/i.test(url.pathname)&&!url.pathname.includes('cache-worker-'))return /\.(glb|mp3)$/i.test(url.pathname)?MEDIA:CODE;
 // Fixed allowlist for public fallback media endpoints. Never cache other AJAX requests.
 if(url.pathname===CFG.ajaxPath&&['bargheto_city_vehicle','bargheto_city_expert_audio'].includes(url.searchParams.get('action')))return MEDIA;
 return null;
}
async function whole(request,name){
 const key=new Request(request.url,{method:'GET',credentials:'same-origin'});
 let cache;try{cache=await caches.open(name);const hit=await cache.match(key);if(hit&&hit.status===200)return hit;}catch{}
 if(pending.has(key.url))return (await pending.get(key.url)).clone();
 const job=(async()=>{const headers=new Headers(request.headers);headers.delete('Range');headers.delete('If-Range');const response=await fetch(new Request(request,{headers,cache:'default'}));
  if(response.status===200&&response.type!=='opaque'&&!/text\/html|application\/json/i.test(response.headers.get('Content-Type')||'')){
   if(cache)try{await cache.put(key,response.clone());}catch{} // Quota/private mode must never prevent play.
  }return response;
 })();pending.set(key.url,job);try{return (await job).clone();}finally{pending.delete(key.url);}
}
async function serve(request,name){
 const response=await whole(request,name),range=request.headers.get('Range');if(!range||response.status!==200)return response;
 const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return fetch(request);
 const bytes=await response.arrayBuffer(),size=bytes.byteLength;let start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2])),end=m[1]?(m[2]?Math.min(size-1,Number(m[2])):size-1):size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start||(!m[1]&&Number(m[2])===0))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 const headers=new Headers(response.headers);headers.delete('Content-Encoding');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');return new Response(bytes.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
}
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||event.request.mode==='navigate')return;const name=kind(new URL(event.request.url));if(name)event.respondWith(serve(event.request,name));});
