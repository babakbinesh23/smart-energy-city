(async()=>{
 'use strict';const cfg=window.OfficeHost97,token=new URLSearchParams(location.search).get('city-host'),embedded=parent!==window&&!!token;
 const message=(type,extra={})=>{if(embedded)parent.postMessage({type,protocol:1,token,...extra},location.origin);};
 const progress=(ratio,label)=>message('bargheto-office-progress',{ratio,label});window.Office99Progress=progress;
 const fail=error=>{console.error('Office VR loading',error);window.Office97.loadError99=error?.message||String(error);message('bargheto-office-error',{message:window.Office97.loadError99});};window.Office99Fail=fail;
 try{
  progress(.02,'آماده‌سازی ساختمان برای VR');
  let owner=null;try{if(embedded&&parent.location.origin===location.origin)owner=parent.__BARGHETO_CITY87__;}catch{}
  if(owner?.officeAssets128&&owner.vr.active){
   // One fetch and decompression job is shared with the city's model preload.
   const cache=parent.BarghetoOfficeCache99;if(cache)BarghetoOfficeCache99.fetchMedia=url=>cache.fetchMedia(url);
  }
  let payload;
  if(owner?.officeAssets128&&owner.vr.active)payload=await owner.officeAssets128.getPayload();
  else{const bytes=await BarghetoOfficeCache99.getSource(cfg),html=new TextDecoder().decode(bytes),match=/<script id="payload"[^>]*>([\s\S]*?)<\/script>/.exec(html);if(!match)throw Error('داده‌های ساختمان پیدا نشد.');const raw=Uint8Array.from(atob(match[1].trim()),c=>c.charCodeAt(0));payload=JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());}
  const data=window.Office97.applyPayload128(payload),imports={},urls=[];progress(.55,'چیدن اجزای ساختمان');
  for(const[name,code]of Object.entries(data.modules)){const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));imports['kit/'+name]=url;urls.push(url);}
  const asset=name=>new URL(name,new URL(cfg.sourceUrl,location.href)).href;
  Object.assign(imports,{'kit/joystick-99.js':cfg.joystickUrl,'kit/mobile-121.js':asset('mobile-2.5.121.js'),'kit/network-119.js':asset('network-2.5.119.js'),'kit/shared-xr-119.js':asset('shared-xr-2.5.138.js'),'kit/presence-117.js':asset('expert-presence-2.5.127.js'),'kit/lighting-114.js':asset('lighting-2.5.130.js'),'kit/television.js':asset('television-vr-2.5.131.js')});
  window.Office97.blobURLs99=urls;window.OFFICE_DATA={layout:data.layout,models:data.models,objects:data.objects,media:data.media};
  const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.append(map);
  await import('kit/game.js');if(window.Office97.loadError99)throw Error(window.Office97.loadError99);if(!window.officeDebug?.ready)throw Error('ساختمان کامل آماده نشد.');
  await window.Office97.ready99();progress(1,'ساختمان آماده است');
 }catch(error){fail(error);}
})();
