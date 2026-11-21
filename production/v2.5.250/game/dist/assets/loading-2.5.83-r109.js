// Download original GLBs while the CPU builds the city. Parsing and ownership stay per loader.
export function createModelPool83({fetcher=globalThis.fetch.bind(globalThis),concurrency=4,timeout=60000,onProgress=()=>{}}={}){
 const entries=new Map(),queue=[];let active=0,retaining=true;
 const stats={scheduled:0,complete:0,failed:0,active:0,bytes:0};
 const progress=()=>{stats.active=active;onProgress({...stats});};
 async function download(url){
  const controller=new AbortController();let timer;
  const touch=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(),timeout);};
  try{
   touch();const response=await fetcher(url,{credentials:'same-origin',signal:controller.signal});
   if(!response.ok)throw new Error('Model HTTP '+response.status);
   let buffer;
   if(response.body?.getReader){
    const reader=response.body.getReader(),chunks=[];let size=0;
    for(;;){const {done,value}=await reader.read();if(done)break;touch();chunks.push(value);size+=value.byteLength;stats.bytes+=value.byteLength;progress();}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}buffer=bytes.buffer;
   }else{buffer=await response.arrayBuffer();stats.bytes+=buffer.byteLength;}
   // A successful HTML error page must not poison the download cache.
   if(buffer.byteLength<12||new DataView(buffer).getUint32(0,true)!==0x46546c67)throw new Error('Invalid GLB response');
   return buffer;
  }finally{clearTimeout(timer);}
 }
 function pump(){while(active<concurrency&&queue.length){const job=queue.shift();active++;progress();
  (async()=>{let error;for(const url of job.urls){try{const data=await download(url);stats.complete++;job.resolve(data);return;}catch(e){error=e;}}
   stats.failed++;if(entries.get(job.key)===job.promise)entries.delete(job.key);job.reject(error);
  })().finally(()=>{active--;if(!retaining)entries.delete(job.key);progress();pump();});
 }}
 function get(url,fallback){const key=new URL(url,globalThis.location?.href??'http://localhost/').href;let promise=entries.get(key);if(promise)return promise;
  let resolve,reject;promise=new Promise((a,b)=>{resolve=a;reject=b;});promise.catch(()=>{});entries.set(key,promise);stats.scheduled++;
  queue.push({key,promise,resolve,reject,urls:[key,...(fallback&&fallback!==key?[new URL(fallback,key).href]:[])]});pump();return promise;
 }
 return {get,stats,release(){retaining=false;entries.clear();},has:url=>entries.has(new URL(url,globalThis.location?.href??'http://localhost/').href)};
}

export function installModelDownloads83(Loader,urls,fallbacks={}){
 if(Loader.prototype.modelDownloads83)return Loader.prototype.modelDownloads83;
 const warm=new Set(urls.filter(Boolean).map(url=>new URL(url,location.href).href));
 // Other bundled models (the office/guide) remain lazy but keep the same fallback.
 const allowed=new Set([...warm,...Object.keys(fallbacks).map(url=>new URL(url,location.href).href)]);
 const pool=createModelPool83({onProgress:stats=>{window.barghetoLoadStats83=stats;window.barghetoStartup82?.downloads?.(stats);}});
 const original=Loader.prototype.loadAsync;
 Loader.prototype.loadAsync=async function(url,onProgress){
  const key=new URL(url,location.href).href;
  if(!allowed.has(key)||this.path||Object.keys(this.requestHeader??{}).length||this.manager.resolveURL(url)!==url)return original.call(this,url,onProgress);
  this.manager.itemStart(url);
  try{const bytes=await pool.get(key,fallbacks[key]);return await this.parseAsync(bytes,this.resourcePath||new URL('.',key).href);}
  catch(error){this.manager.itemError(url);throw error;}finally{this.manager.itemEnd(url);}
 };
 Loader.prototype.modelDownloads83=pool;
 for(const url of warm)pool.get(url,fallbacks[url]).catch(error=>console.warn('Model prefetch failed; normal load may retry',url,error));
 return pool;
}
