(function () {
 'use strict';
 const form=document.getElementById('bargheto-media-form225');
 if(!form)return;
 const config=JSON.parse(document.getElementById('bargheto-media-config225').textContent);
 const input=form.querySelector('[type=file]'),submit=form.querySelector('[type=submit]');
 const progress=document.getElementById('bargheto-media-progress225');
 const message=document.getElementById('bargheto-media-message225');
 const pause=document.getElementById('bargheto-media-pause225');
 const reset=document.getElementById('bargheto-media-reset225');
 const refresh=document.getElementById('bargheto-media-refresh225');
 const number=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
 const key='bargheto-media225:'+config.user+':'+config.catalog;
 let running=false,paused=false,active=null,session=null;
 function read(){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
 function write(value){session=value;try{if(value)localStorage.setItem(key,JSON.stringify(value));else localStorage.removeItem(key);}catch{}}
 function show(text,error=false){message.textContent=text;message.style.color=error?'#b32d2e':'#1d2327';}
 function paint(value,text){progress.hidden=false;progress.value=value;show(text);}
 class UploadError extends Error {constructor(text,retry=false){super(text);this.retry=retry;}}
 function request(op,fields={},chunk=null,onProgress=null){
  return new Promise((resolve,reject)=>{
   const data=new FormData();data.append('action','bargheto_city_media225');data.append('nonce',config.nonce);data.append('op',op);
   for(const [name,value]of Object.entries(fields))data.append(name,String(value));
   if(chunk)data.append('chunk',chunk,'chunk.bin');
   const xhr=new XMLHttpRequest();active=xhr;xhr.open('POST',config.url,true);xhr.timeout=90000;
   if(onProgress)xhr.upload.onprogress=e=>{if(e.lengthComputable)onProgress(e.loaded/e.total);};
   xhr.onload=()=>{
    if(active===xhr)active=null;
    let response;try{response=JSON.parse(xhr.responseText);}catch{}
    if(xhr.status===403){reject(new UploadError(response?.data?.message||'دسترسی یا اعتبار صفحه تمام شده است. صفحه را تازه کنید و دوباره همین ZIP را انتخاب کنید.'));return;}
    if(xhr.status===413){reject(new UploadError('سرور حتی قطعهٔ کوچک فایل را رد کرد (HTTP 413). سقف درخواست سرور باید افزایش یابد.'));return;}
    if(xhr.status>=200&&xhr.status<300&&response?.success){resolve(response.data);return;}
    const text=response?.data?.message||(xhr.status>=500?`خطای سرور (HTTP ${xhr.status}). دوباره ادامه دهید؛ قطعه‌های دریافت‌شده حفظ می‌شوند.`:response?'درخواست پذیرفته نشد. دوباره وارد پیشخوان شوید.':`پاسخ معتبر دریافت نشد (HTTP ${xhr.status}). بخش Network یا گزارش خطای هاست را بررسی کنید.`);
    reject(new UploadError(text,xhr.status>=500));
   };
   xhr.onerror=()=>{if(active===xhr)active=null;reject(new UploadError('ارتباط با سرور قطع شد؛ قطعه‌های دریافت‌شده حفظ شده‌اند.',true));};
   xhr.ontimeout=()=>{if(active===xhr)active=null;reject(new UploadError('زمان پاسخ سرور تمام شد؛ دوباره ادامه دهید.',true));};
   xhr.onabort=()=>{if(active===xhr)active=null;reject(new UploadError('بارگذاری متوقف شد. برای ادامه همین فایل را انتخاب کنید.'));};
   xhr.send(data);
  });
 }
 async function send(op,fields={},chunk=null,onProgress=null){
  for(let attempt=0;;attempt++){
   if(paused)throw new UploadError('بارگذاری متوقف شد؛ با زدن ادامه، از آخرین قطعه ادامه می‌یابد.');
   try{return await request(op,fields,chunk,onProgress);}catch(error){
    if(paused||!error.retry||attempt>=2)throw error;
    show('پاسخ سرور نرسید؛ تلاش دوباره…');
    await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
   }
  }
 }
 async function fingerprint(file){
  // Works on HTTP local exhibition servers as well as HTTPS; no WebCrypto dependency.
  const bytes=new Uint8Array(await new Blob([file.slice(0,65536),file.slice(Math.max(0,file.size-65536))]).arrayBuffer());
  let hash=2166136261;for(const byte of bytes)hash=Math.imul(hash^byte,16777619);
  return JSON.stringify([file.name,file.size,file.lastModified,hash>>>0]);
 }
 function controls(){input.disabled=running;submit.disabled=running;pause.hidden=!running;reset.hidden=!session||running;submit.textContent=session?'ادامهٔ بارگذاری و نصب':'بارگذاری و نصب رسانه‌ها';}
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(running)return;
  const file=input.files[0];if(!file){show('ابتدا بستهٔ ZIP رسانه‌ها را انتخاب کنید.',true);return;}
  if(!/\.zip$/i.test(file.name)||file.size<1||file.size>config.maxSize){show('یک بستهٔ ZIP با حجم حداکثر ۱۵۰ مگابایت انتخاب کنید.',true);return;}
  running=true;paused=false;refresh.hidden=true;controls();
  try{
   const stamp=await fingerprint(file);let state;
   session=read();
   if(session&&session.fingerprint!==stamp)throw new UploadError('فایل انتخاب‌شده با بارگذاری ناتمام فرق دارد؛ همان فایل را انتخاب کنید یا «شروع دوباره» را بزنید.');
   if(session){show('بررسی آخرین قطعهٔ دریافت‌شده…');state=await send('status',{id:session.id});}
   else{show('آماده‌سازی بارگذاری…');state=await send('init',{size:file.size});write({id:state.id,fingerprint:stamp});}
   const id=session.id;
   if(state.phase==='upload'){
    let offset=state.offset;const chunkSize=state.chunkSize;
    if(!Number.isInteger(offset)||offset<0||offset>file.size||!Number.isInteger(chunkSize)||chunkSize<1)throw new UploadError('وضعیت دریافتی از سرور معتبر نیست.');
    while(offset<file.size){
     const start=offset,end=Math.min(file.size,start+chunkSize);
     const paintUpload=ratio=>{const sent=Math.min(file.size,start+(end-start)*ratio);paint(sent/file.size*100,`بارگذاری: ${number.format(sent/1048576)} از ${number.format(file.size/1048576)} مگابایت (${number.format(sent/file.size*100)}٪)`);};
     paintUpload(0);
     const result=await send('chunk',{id,offset:start},file.slice(start,end),paintUpload);
     if(!Number.isInteger(result.offset)||result.offset<=start||result.offset>file.size)throw new UploadError('تأیید قطعه از سرور معتبر نیست.');
     offset=result.offset;
    }
    paint(100,'بارگذاری کامل شد؛ بررسی ساختار بسته…');state=await send('prepare',{id});
   }
   if(state.phase!=='done'){
    let index=state.index,total=state.total;
    while(true){
     paint(total?index/total*100:0,`بررسی و نصب رسانه‌ها: ${number.format(index)} از ${number.format(total)} فایل`);
     const result=await send('step',{id});index=result.index;total=result.total;
     if(result.done)break;
    }
   }
   // A lost cleanup response must not turn a successful installation into an error.
   try{await send('ack',{id});}catch{}
   write(null);paint(100,'نصب رسانه‌ها کامل شد؛ همهٔ فایل‌ها بررسی شدند. برای دیدن وضعیت جدید، دکمهٔ زیر را بزنید.');refresh.hidden=false;
  }catch(error){show(error.message||String(error),true);}
  finally{running=false;controls();}
 });
 pause.addEventListener('click',()=>{paused=true;active?.abort();show('در حال توقف؛ فایل‌های دریافت‌شده حفظ می‌شوند.');});
 reset.addEventListener('click',async()=>{
  if(running)return;const previous=session||read();if(!previous)return;
  running=true;paused=false;controls();
  try{await send('cancel',{id:previous.id});write(null);progress.hidden=true;show('بارگذاری قبلی لغو شد؛ فایل ZIP را انتخاب و بارگذاری را شروع کنید.');}
  catch(error){show(error.message,true);}
  finally{running=false;controls();}
 });
 refresh.addEventListener('click',()=>location.reload());
 window.addEventListener('beforeunload',event=>{if(running){event.preventDefault();event.returnValue='';}});
 session=read();controls();if(session)show('یک بارگذاری ناتمام وجود دارد. همان ZIP را انتخاب کنید و «ادامهٔ بارگذاری و نصب» را بزنید.');
})();
