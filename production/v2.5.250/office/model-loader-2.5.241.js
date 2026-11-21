// Validate bytes before giving them to Babylon. A bad retained response must
// not permanently prevent entry; refresh that single model once, then fail
// with its real model/stage instead of a generic loading message.
export async function validOfficeGLB241(bytes,url,cryptoAPI=globalThis.crypto){
 if(bytes.byteLength<20)return false;
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==bytes.byteLength)return false;
 const expected=new URL(url,location.href).searchParams.get('sha');
 if(expected&&cryptoAPI?.subtle){const digest=await cryptoAPI.subtle.digest('SHA-256',bytes),actual=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');if(!actual.startsWith(expected))return false;}
 return true;
}
export async function loadOfficeModel241({id,url,scene,loadContainer,cache=globalThis.BarghetoOfficeCache99,request=globalThis.fetch,storage=globalThis.caches,cryptoAPI=globalThis.crypto,progress=()=>{}}){
 const names={office:'ساختمان',eric:'کارشناس',elevator:'آسانسور'},label=names[id]||id;
 const target=new URL(url,location.href);if(target.origin!==location.origin)throw Error('آدرس مدل '+label+' هم‌مبدأ نیست.');
 progress(.70,'دریافت مدل '+label);
 let bytes;
 try{const response=await cache.fetchMedia(target.href);bytes=new Uint8Array(await response.arrayBuffer());}
 catch(error){throw Error('دریافت مدل '+label+' انجام نشد: '+String(error?.message||error));}
 if(!await validOfficeGLB241(bytes,target.href,cryptoAPI)){
  progress(.72,'دریافت دوبارهٔ فایل معتبر '+label);
  // The city may also retain model bytes in memory; invalidate only this URL.
  try{parent.__BARGHETO_CITY87__?.officeAssets128?.forgetModel241?.(target.href);}catch{}
  let response;try{response=await request(target.href,{credentials:'same-origin',cache:'reload'});}catch(error){throw Error('دریافت دوبارهٔ مدل '+label+' انجام نشد: '+String(error?.message||error));}
  if(!response.ok)throw Error('مدل '+label+' دریافت نشد (HTTP '+response.status+').');
  bytes=new Uint8Array(await response.arrayBuffer());
  if(!await validOfficeGLB241(bytes,target.href,cryptoAPI))throw Error('فایل مدل '+label+' ناقص یا نامعتبر است.');
  try{if(storage&&cache.mediaName){const saved=await storage.open(cache.mediaName);await saved.put(target.href,new Response(bytes,{headers:{'Content-Type':'model/gltf-binary'}}));}}catch{}
 }
 progress(.78,'آماده‌سازی مدل '+label);
 try{const container=await loadContainer(bytes,scene,{pluginExtension:'.glb',name:id+'.glb'});for(const material of container.materials)if(material.maxSimultaneousLights!==undefined)material.maxSimultaneousLights=8;return container;}
 catch(error){throw Error('آماده‌سازی مدل '+label+' انجام نشد: '+String(error?.message||error));}
}
