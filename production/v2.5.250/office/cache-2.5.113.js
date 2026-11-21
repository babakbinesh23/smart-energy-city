(function(){'use strict';if(globalThis.BarghetoOfficeCache99)return;
 const NAME='bargheto-office-public-v1',MEDIA='bargheto-city-media-v1',pending=new Map(),mediaPending=new Map(),prefetchPending=new Map(),complete=new Set();
 async function valid(bytes,sha){if(!sha)return true;if(!globalThis.crypto?.subtle)return bytes.byteLength===1546547;const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')===sha;}
 function sameOrigin(value){const u=new URL(value,location.href);if(u.origin!==location.origin||!/^https?:$/.test(u.protocol))throw Error('Office asset must be same-origin');return u.href;}
 function assetURL(cfg){const u=new URL(sameOrigin(cfg.sourceUrl));u.searchParams.set('office-sha',cfg.sourceSHA);return u.href;}
 async function local(cfg,progress=()=>{}){
  const url=assetURL(cfg),running=pending.get(url);if(running){running.listeners.add(progress);try{return await running.promise;}finally{running.listeners.delete(progress);}}
  const listeners=new Set([progress]),emit=(ratio,label,cache=false)=>{for(const fn of listeners)try{fn({ratio,label,cache});}catch{}},job={listeners,promise:null};
  job.promise=(async()=>{let cache=null;try{if('caches'in globalThis)cache=await caches.open(NAME);}catch{}if(cache){const response=await cache.match(url);if(response){const bytes=await response.arrayBuffer();if(await valid(bytes,cfg.sourceSHA)){emit(1,'برنامهٔ ساختمان از کش آماده است',true);return bytes;}await cache.delete(url);}}
   emit(0,'دریافت برنامهٔ ساختمان برقتو');const response=await fetch(url,{credentials:'same-origin',cache:'force-cache'});if(!response.ok)throw Error('دریافت ساختمان انجام نشد ('+response.status+')');let bytes;const total=Number(response.headers.get('content-length'))||1546547;
   if(response.body?.getReader){const reader=response.body.getReader(),chunks=[];let size=0;for(;;){const r=await reader.read();if(r.done)break;chunks.push(r.value);size+=r.value.byteLength;emit(Math.min(.98,size/total),'دریافت برنامهٔ ساختمان برقتو');}const all=new Uint8Array(size);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.byteLength;}bytes=all.buffer;}else bytes=await response.arrayBuffer();
   if(!await valid(bytes,cfg.sourceSHA))throw Error('فایل ساختمان کامل یا معتبر دریافت نشده؛ دوباره تلاش کنید.');if(cache)try{await cache.put(url,new Response(bytes,{headers:{'Content-Type':'text/html; charset=utf-8','X-Office-SHA':cfg.sourceSHA}}));}catch{}emit(1,'برنامهٔ ساختمان آماده است');return bytes;
  })();pending.set(url,job);try{return await job.promise;}finally{pending.delete(url);}
 }
 async function getSource(cfg,progress){if(parent!==globalThis){let owner;try{if(parent.location.origin===location.origin)owner=parent.BarghetoOfficeCache99;}catch{}if(owner&&owner!==api)return owner.getSource(cfg,progress);}return local(cfg,progress);}
 async function fetchMedia(value){
  const url=sameOrigin(value);let cache=null;try{if('caches'in globalThis){cache=await caches.open(MEDIA);const response=await cache.match(url);if(response?.status===200)return response;}}catch{}
  if(mediaPending.has(url))return (await mediaPending.get(url)).clone();
  const job=(async()=>{const response=await fetch(url,{credentials:'same-origin',cache:'force-cache'});if(!response.ok||response.status!==200||/text\/html/i.test(response.headers.get('content-type')||''))throw Error('دریافت فایل ساختمان انجام نشد ('+response.status+')');if(cache)try{await cache.put(url,response.clone());}catch{}return response;})();mediaPending.set(url,job);try{return (await job).clone();}finally{mediaPending.delete(url);}
 }
 async function prefetch(cfg){
  const key=assetURL(cfg);if(complete.has(key))return true;if(prefetchPending.has(key))return prefetchPending.get(key);
  const job=(async()=>{const bytes=await getSource(cfg),html=new TextDecoder().decode(bytes),payload=/<script id="payload"[^>]*>([\s\S]*?)<\/script>/.exec(html);if(!payload)throw Error('Office payload missing');
   const raw=Uint8Array.from(atob(payload[1].trim()),c=>c.charCodeAt(0));const data=JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
   const urls=Object.values(data.models||{});if(data.media?.televisionVideo)urls.push(data.media.televisionVideo);for(const track of Object.values(data.media?.guideVoices||{}))if(track.url)urls.push(track.url);
   const queue=[...new Set(urls.map(value=>sameOrigin(new URL(value,cfg.mediaBase))))];let index=0;
   const worker=async()=>{while(index<queue.length){const url=queue[index++],response=await fetchMedia(url);await response.arrayBuffer();}};
   await Promise.all([worker(),worker()]);complete.add(key);return true;
  })();prefetchPending.set(key,job);try{return await job;}finally{prefetchPending.delete(key);}
 }
 const api=globalThis.BarghetoOfficeCache99={name:NAME,mediaName:MEDIA,getSource,fetchMedia,assetURL,prefetch};
})();
