(function(){
 'use strict';
 if(window.barghetoStartup82)return;
 // Normalize only own-site http(s) URLs in trusted WordPress bootstrap data.
 // A bare-host document cannot import www-host ES modules without CORS.
 const sameSite148=value=>{
  if(typeof value==='string'&&/^https?:\/\//i.test(value)){
   try{const u=new URL(value),here=new URL(location.href),host=s=>s.replace(/^www\./i,'').toLowerCase();
    if(!u.username&&!u.password&&host(u.hostname)===host(here.hostname)&&u.port===here.port)return here.origin+u.pathname+u.search+u.hash;
   }catch{}return value;
  }
  if(Array.isArray(value))return value.map(sameSite148);
  if(value&&typeof value==='object'){const out={};for(const [key,item]of Object.entries(value))Object.defineProperty(out,key,{value:sameSite148(item),writable:true,enumerable:true,configurable:true});return out;}
  return value;
 };
 for(const name of ['barghetoOffice','barghetoRegistration','barghetoCityServerMedia109','barghetoCityExpertVoice','barghetoMultiplayer','barghetoLayout','barghetoCityVehicleUrls','barghetoCityModelFallbacks83','barghetoCityAssetUrls'])if(window[name])window[name]=sameSite148(window[name]);

 let entryPromise233=null;
 let game=null,ready=false,failed=false,stage='دریافت برنامه',lastProgress=Date.now(),notice=null,lost=false;const watched=new WeakSet();
 let loading=null,loadingText=null,downloadText=null,bar=null,progressElement=null,percentText=null,liveOverlay=null,progressValue=0,latestStats=null,lastDownload=0;
 const formatter=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
 function paint(){
  if(loadingText)loadingText.textContent=stage;
  const percent=Math.round(progressValue*100);
  if(bar)bar.style.width=percent+'%';
  progressElement?.setAttribute('aria-valuenow',String(percent));
  if(percentText)percentText.textContent=formatter.format(percent)+'٪ آماده‌سازی';
  if(downloadText)downloadText.textContent=latestStats?`دریافت مدل‌ها: ${formatter.format(latestStats.complete)} از ${formatter.format(latestStats.scheduled)} · ${formatter.format(latestStats.bytes/1048576)} مگابایت`:'در حال دریافت برنامه و فایل‌های سه‌بعدی…';
 }
 function mountMeta(card){
  let meta=card.querySelector('.loading-meta88');
  if(!meta){meta=document.createElement('div');meta.className='loading-meta88';percentText=document.createElement('span');percentText.className='loading-percent88';downloadText=document.createElement('small');downloadText.className='loading-downloads88';meta.append(percentText,downloadText);card.append(meta);}
  else{percentText=meta.querySelector('.loading-percent88');downloadText=meta.querySelector('.loading-downloads88');}
 }
 function showLoading(){
  if(ready||failed||loading||liveOverlay)return;
  loading=document.createElement('section');loading.id='bargheto-loading88';loading.dir='rtl';loading.setAttribute('role','status');
  loading.style.cssText='position:fixed;inset:0;z-index:2147483645;display:grid;place-items:center;padding:16px;background:#151927;color:#ecfff6;text-align:right;font:16px/1.9 Vazirmatn,Tahoma,sans-serif';
  loading.innerHTML='<div class="card loading-card"><div class="brand"><div class="brand-title">شهر هوشمند <span class="energy-word">انرژی</span> برقتو</div><div class="brand-sub">در حال آماده‌سازی شهر</div></div><div class="progress" role="progressbar" aria-label="پیشرفت آماده‌سازی شهر" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar"></div></div><div class="status" aria-live="polite"></div></div>';
  loading.firstElementChild.style.cssText='width:min(620px,100%);padding:28px;border:1px solid #ffffff24;border-radius:20px;background:#101722';loading.querySelector('.progress').style.cssText='height:7px;border-radius:99px;background:#ffffff24;overflow:hidden;margin-top:24px;direction:rtl;display:flex;justify-content:flex-start';loading.querySelector('.progress-bar').style.cssText='height:100%;width:0%;flex:none;background:linear-gradient(90deg,#ffb35c,#ff7f9b)';loadingText=loading.querySelector('.status');bar=loading.querySelector('.progress-bar');progressElement=loading.querySelector('[role=progressbar]');mountMeta(loading.firstElementChild);paint();document.body.appendChild(loading);
 }
 const hideLoading=()=>{loading?.remove();loading=null;};
 if(document.body)showLoading();else{const bodyWatcher=new MutationObserver(()=>{if(document.body){bodyWatcher.disconnect();showLoading();}});bodyWatcher.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',()=>{bodyWatcher.disconnect();showLoading();},{once:true});}
 const hideNotice=()=>{notice?.remove();notice=null;};
 const hasWasm234=()=>typeof window.WebAssembly==='object'&&typeof window.WebAssembly.instantiate==='function';
 function report(error,code='STARTUP'){
  if(!hasWasm234())code='WASM_UNAVAILABLE';
  if(failed)return;failed=true;hideNotice();hideLoading();
  try{game?.renderer.webgl.setAnimationLoop(null);game?.input.clear();if(game?.cinematic?.element)game.cinematic.element.hidden=true;game?.cinematicAudio.setPaused(true);}catch(_){}
  const root=document.createElement('section');root.id='bargheto-startup-recovery';root.setAttribute('role','alert');root.dir='rtl';
  root.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#0b151ef5;color:#edf7f2;padding:24px;box-sizing:border-box;font:15px/1.9 Tahoma,sans-serif;overflow:auto';
  const card=document.createElement('div');card.style.cssText='max-width:620px;width:100%;box-sizing:border-box;padding:28px;border:1px solid #659b8a;border-radius:18px;background:#11232c';
  const title=document.createElement('h1');title.textContent=code==='WASM_UNAVAILABLE'?'بازی را در مرورگر اصلی باز کنید':code==='WEBGL_LOST'?'نمای سه‌بعدی متوقف شد':'نمای شهر راه‌اندازی نشد';title.style.cssText='font-size:22px;margin:0 0 12px';
  const message=document.createElement('p');message.textContent=code==='WEBGL_UNAVAILABLE'?'مرورگر نتوانست بخش سه‌بعدی را فعال کند. می‌توانید دوباره با حالت سازگار تلاش کنید. اگر این پیام تکرار شد، در دسترس بودن WebGL و شتاب‌دهی گرافیکی مرورگر را بررسی کنید.':code==='WEBGL_LOST'?'ارتباط مرورگر با بخش گرافیکی قطع شد. برای ساخت دوبارهٔ صحنه، از دکمهٔ زیر استفاده کنید.':`آماده‌سازی یا اجرای شهر با خطا روبه‌رو شد. مرحله: ${stage}. می‌توانید دوباره تلاش کنید.`;
  const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin-top:20px';
  if(code==='WASM_UNAVAILABLE'){
   message.textContent='این پنجره به WebAssembly، یکی از قابلیت‌های لازم برای اجرای بازی، دسترسی ندارد. اگر صفحه در پنجرهٔ ورود به وای‌فای باز شده، آن را ببندید و اتصال به همین شبکه را حفظ کنید. سپس Safari یا Chrome اصلی دستگاه را باز کنید و آدرس زیر را در نوار آدرس وارد کنید. اگر همین پیام در مرورگر اصلی هم دیده شد، پشتیبانی مرورگر و تنظیمات محدودکنندهٔ آن باید بررسی شود.';
   const address=document.createElement('input');address.type='text';address.readOnly=true;address.value=location.href;address.dir='ltr';address.setAttribute('aria-label','آدرس بازی');address.style.cssText='width:100%;box-sizing:border-box;font:16px Arial;padding:12px;background:#07151f;color:white;border:1px solid #93c6b3;border-radius:8px';
   const copy=document.createElement('button');copy.type='button';copy.textContent='کپی آدرس بازی';copy.style.cssText='cursor:pointer;padding:12px 16px;min-height:44px;background:#285b4b;color:white;border:1px solid #93c6b3;border-radius:10px;font:inherit';
   const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
   copy.onclick=()=>{address.focus();address.select();address.setSelectionRange(0,address.value.length);let copied=false;try{copied=document.execCommand('copy');}catch(_){}status.textContent=copied?'آدرس کپی شد؛ در نوار آدرس مرورگر اصلی وارد کنید.':'آدرس را انتخاب و با گزینهٔ کپی بردارید.';};
   row.append(address,copy,status);
  }else for(const [label,compat]of [['تلاش دوباره',false],['شروع با حالت سازگار',true]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='cursor:pointer;border:1px solid #93c6b3;border-radius:10px;padding:12px 16px;background:#285b4b;color:white;font:inherit';b.onclick=()=>{if(compat){const u=new URL(location.href);u.searchParams.set('compat','1');location.assign(u.href);}else location.reload();};row.appendChild(b);}
  const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent='جزئیات خطا';pre.dir='ltr';pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.6 monospace';pre.textContent=[`V2.5.250 · ${code}`,String(error?.name||'Error')+': '+String(error?.message??error),String(error?.stack||''),'Stage: '+stage,'Entry: '+String(window.barghetoStartupEntry233||''),'Page: '+location.href,'Browser: '+navigator.userAgent].filter(Boolean).join('\n').slice(0,6000);details.append(summary,pre);details.style.marginTop='18px';card.append(title,message,row,details);root.appendChild(card);document.body.appendChild(root);
 }
 window.barghetoStartup82={
  resolveAsset148:sameSite148,
  loadMain233(entry){
   if(entryPromise233)return entryPromise233;
   if(!hasWasm234()){
    const explain=()=>report(new Error('WebAssembly is unavailable in this browser window'),'WASM_UNAVAILABLE');
    if(document.body)explain();else document.addEventListener('DOMContentLoaded',explain,{once:true});
    return entryPromise233=Promise.resolve(null);
   }
   const url=sameSite148(entry);window.barghetoStartupEntry233=url;
   // A dynamic import preserves the actual SyntaxError/fetch rejection from
   // WebKit instead of reducing it to a generic script-element error event.
   entryPromise233=import(url).catch(error=>{report(error,'MODULE_LOAD');return null;});
   return entryPromise233;
  },
  progress(label,value){stage=label;if(Number.isFinite(value))progressValue=Math.max(progressValue,Math.max(0,Math.min(1,value)));lastProgress=Date.now();hideNotice();paint();},
  attachLoading(overlay){liveOverlay=overlay;hideLoading();loadingText=overlay.status;bar=overlay.bar;progressElement=bar.parentElement;mountMeta(overlay.loading.querySelector('.card'));paint();},
  downloads(stats){latestStats={...stats};lastProgress=Date.now();if(Date.now()-lastDownload<250)return;lastDownload=Date.now();paint();},
  bind(value){game=value;},
  ready(){ready=true;lastProgress=Date.now();hideNotice();hideLoading();},
  report,
  watchCanvas(canvas){
   if(watched.has(canvas))return;watched.add(canvas);
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;report(new Error('WebGL context lost'),'WEBGL_LOST');});
   canvas.addEventListener('webglcontextrestored',()=>{if(lost)stage='بازسازی صحنه';});
  }
 };
 window.addEventListener('error',e=>{
  if(e.target instanceof HTMLScriptElement){if(e.target.id==='city-main-module82'||/\/assets\/(?:index-|startup-|runtime-|workers-|city-updates-|shared-editor-|scene-updates-)/.test(e.target.src))report(new Error('Script could not load: '+e.target.src),'MODULE_LOAD');return;}
  if(!ready&&e.error&&(!e.filename||/\/assets\//.test(e.filename)))report(e.error,'BOOT_EXCEPTION');
 },true);
 window.addEventListener('unhandledrejection',e=>{if(!ready)report(e.reason,'BOOT_PROMISE');});
 window.setInterval(()=>{
  if(ready||failed||notice||document.hidden||Date.now()-lastProgress<60000)return;
  notice=document.createElement('div');notice.setAttribute('role','status');notice.dir='rtl';notice.textContent='بارگذاری شهر بیشتر از معمول طول کشیده است؛ مرحله: '+stage+' — دریافت فایل‌ها هنوز ممکن است ادامه داشته باشد.';notice.style.cssText='position:fixed;bottom:16px;left:16px;right:16px;z-index:2147483646;background:#18313a;color:#e9fff4;border:1px solid #88aa9b;border-radius:12px;padding:12px;font:14px/1.8 Tahoma,sans-serif';document.body.appendChild(notice);
 },5000);
})();
