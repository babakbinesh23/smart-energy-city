// Prepare shaders while the visitor fills the form. Keep the menu responsive
// by skipping the hidden 3D scene and yielding between small compile batches.
export function installEntryWarmup179(game,compile,Group,yieldTask){
 const overlay=game.overlay,card=overlay.start.querySelector('.visitor-card');
 const style=document.createElement('style');
 style.textContent='.entry-warmup179{margin:9px 0 0;color:#b7d0d2;font:11px/1.7 Vazirmatn,Tahoma,sans-serif}.entry-warmup179 .track{height:5px;margin-top:5px;background:#ffffff23;border-radius:99px;overflow:hidden;direction:rtl}.entry-warmup179 .fill{width:0;height:100%;background:linear-gradient(90deg,#ffb35c,#ff7f9b);transition:width .16s}.entry-warmup179 .label{display:flex;justify-content:space-between;gap:8px}';
 document.head.append(style);
 const row=document.createElement('div');row.className='entry-warmup179';
 row.innerHTML='<div class="label"><span>آماده‌سازی تصویر در پس‌زمینه</span><span class="percent">۰٪</span></div><div class="track" role="progressbar" aria-label="آماده‌سازی تصویر شهر" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="fill"></div></div>';
 card.querySelector('.brand').after(row);
 const label=row.querySelector('.label span'),percent=row.querySelector('.percent'),track=row.querySelector('.track'),fill=row.querySelector('.fill');
 let lastInput=0,disposed=false,promise=null;
 const input=()=>{lastInput=performance.now();};overlay.start.addEventListener('input',input);overlay.start.addEventListener('focusin',input);
 const frame=game.frame;
 game.frame=function(...args){
  if(!overlay.admitted&&overlay.element.dataset.screen==='start')return;
  return frame.apply(this,args);
 };
 function progress(value,text){
  if(disposed)return;const p=Math.round(Math.max(0,Math.min(1,value))*100);
  fill.style.width=p+'%';track.setAttribute('aria-valuenow',String(p));
  percent.textContent=new Intl.NumberFormat('fa-IR').format(p)+'٪';
  if(text)label.textContent=text;
 }
 function start(){
  if(promise)return promise;
  if(game.renderer.compatibilityMode){progress(1,'تصویر آماده است');return promise=Promise.resolve();}
  promise=new Promise(resolve=>setTimeout(resolve,350)).then(async()=>{
   while(performance.now()-lastInput<180)await new Promise(resolve=>setTimeout(resolve,100));
   return compile(
   game.renderer.webgl,game.scene,game.camera.camera,Group,
   async()=>{await yieldTask();if(performance.now()-lastInput<120)await new Promise(resolve=>setTimeout(resolve,120));},
   value=>progress(value)
   );
  }).then(()=>progress(1,'تصویر آماده است'),error=>{console.warn('City shader warmup',error);label.textContent='آماده‌سازی تصویر هنگام ورود تکمیل می‌شود';});
  overlay.entryWarmup179=promise;return promise;
 }
 game.disposers.push(()=>{disposed=true;overlay.start.removeEventListener('input',input);overlay.start.removeEventListener('focusin',input);row.remove();style.remove();game.frame=frame;});
 overlay.entryWarmup179=Promise.resolve();
 return{start,get promise(){return promise;}};
}
