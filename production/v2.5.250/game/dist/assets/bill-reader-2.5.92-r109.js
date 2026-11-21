import {billCue92,billView92,drawBillUnderline92,BILL_CUES92,smooth92} from './bill-focus-2.5.92-r109.js';
import {createBillChart92,drawBillChart92} from './bill-chart-2.5.92-r109.js';

export function installBillReader92(game,bills,phaseAt,data){
 const root=document.createElement('section');root.className='bill-reader90 bill-reader91 bill-reader92';root.hidden=true;root.dir='rtl';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','نمایش بزرگ اصل قبض برق');
 root.innerHTML='<header><strong data-reader-title>اصل قبض برق</strong><nav aria-label="انتخاب قبض"><button data-bill="before">قبض قبل</button><button data-bill="after">قبض بعد</button><button data-bill="summary" hidden>نمودار مقایسه</button></nav><button data-bill="close" aria-label="بستن قبض و بازگشت به شهر">بازگشت به شهر ×</button></header><div class="bill-reader-tools90"><span role="status"></span><button data-bill="pause">مکث صحبت کارشناس</button><button data-bill="focus">تمرکز روی بهای انرژی</button><button data-bill="sync" aria-pressed="true">همگام با گفتار</button><button data-bill="zoom">اندازه اصلی</button><button data-bill="fit">جا شدن در صفحه</button></div><div class="bill-reader-paper90" tabindex="0"><div class="bill-sheet91"><img alt="اصل قبض برق" draggable="false"><svg class="bill-mark91" viewBox="0 0 2048 1252" aria-hidden="true"><path pathLength="1" d="M610 1004 H414"/></svg></div><div class="bill-comparison92" hidden></div><div class="bill-chart-panel92" hidden></div></div>';
 const image=root.querySelector('img'),sheet=root.querySelector('.bill-sheet91'),line=root.querySelector('path'),status=root.querySelector('[role=status]'),paper=root.querySelector('.bill-reader-paper90'),speech=game.city.expert.speech;
 document.body.append(root);
 let visible=false,lastPhase='hidden',manual=false,native=false,current='before',readerPause=false,focusOverride=null,lastLayout='',displayStage='bill',boundMedia=null,hadSession=false,resumePending=false,imageReadyAt=null,lastSpeechTime=0;
 const comparison=root.querySelector('.bill-comparison92'),chartPanel=root.querySelector('.bill-chart-panel92'),title=root.querySelector('[data-reader-title]'),chart=createBillChart92(data);
 chartPanel.append(chart.element);
 comparison.innerHTML=[['before','قبل از همکاری',bills.before.src,data.beforeEnergy],['after','بعد از همکاری',bills.after.src,data.afterEnergy]].map(([key,label,src,value])=>`<figure><figcaption><span>${label}</span><strong><bdi>${new Intl.NumberFormat('fa-IR').format(value)}</bdi> ریال</strong><small>بهای انرژی تأمین‌شده</small></figcaption><button data-bill="${key}" aria-label="نمایش اصل قبض ${label}"><img src="${src}" alt="قبض ${label}" draggable="false"></button></figure>`).join('');
 const marker=c=>c.phase+'/'+c.stage;
 const observeTime=()=>{const t=speech.currentTime;if(t<lastSpeechTime-.05)imageReadyAt=t;lastSpeechTime=t;};
 const activeSession=()=>['loading','playing','paused'].includes(speech.state);
 const ended=()=>{if(timed()&&(speech.media?.ended||speech.currentTime>=BILL_CUES92.end||(hadSession&&['idle','error'].includes(speech.state)))){reader.close('ended');hide();lastPhase='hidden';hadSession=false;return true;}return false;};
 const mediaEnded=()=>{reader.close('ended');hide();lastPhase='hidden';hadSession=false;};
 function bindMedia(){const m=speech.media;if(m===boundMedia)return;boundMedia?.removeEventListener?.('ended',mediaEnded);boundMedia=m;if(m)lastPhase='hidden';boundMedia?.addEventListener?.('ended',mediaEnded);}
 function setStage(stage){displayStage=stage;root.dataset.stage=stage;sheet.hidden=stage!=='bill';comparison.hidden=stage!=='comparison';chartPanel.hidden=stage!=='chart';paper.classList.toggle('native-size',stage==='bill'&&native);title.textContent=stage==='chart'?'نتیجهٔ مقایسه':stage==='comparison'?'مقایسهٔ دو قبض':'اصل قبض برق';if(stage!=='bill'){paper.classList.remove('bill-focus-active91');root.dataset.focus='false';}for(const b of root.querySelectorAll('nav button'))b.setAttribute('aria-pressed',String(b.dataset.bill==='summary'?stage==='chart':stage==='bill'&&b.dataset.bill===current));if(stage!=='bill')status.textContent=stage==='chart'?'کاهش بهای انرژی با مصرف مبنای یکسان':'مقایسهٔ بهای انرژی تأمین‌شده';}

 const syncButton=root.querySelector('[data-bill=sync]');
 const timed=()=>speech.usingTimeline===true;
 const cue=()=>billCue92(speech.currentTime,timed());
 const syncState=()=>syncButton.setAttribute('aria-pressed',String(!manual&&focusOverride===null));
 function layout(){
  if(!visible)return;
  const c=cue();root.querySelector('[data-bill=summary]').hidden=c.phase!=='compare';
  if(displayStage==='chart'){chart.update(manual?1:c.chartProgress);return;}if(displayStage!=='bill'||!image.naturalWidth)return;
  if(imageReadyAt===null&&image.complete&&image.currentSrc===image.src)imageReadyAt=speech.currentTime;
  const active=c.key===current&&c.phase!=='hidden';
  const viewAge=imageReadyAt===null?0:Math.max(0,speech.currentTime-imageReadyAt);
  const weight=focusOverride===null?(!manual&&active?Math.min(c.weight,smooth92((viewAge-4)/2.4)):0):focusOverride;
  const trace=manual||focusOverride!==null?1:active?Math.min(c.trace,smooth92((viewAge-4.5)/1.1)):c.phase==='compare'?1:0;
  const w=paper.clientWidth,h=paper.clientHeight;
  if(!w||!h)return;
  const v=billView92(w,h,image.naturalWidth,image.naturalHeight,weight);
  const key=[w,h,native,current,weight.toFixed(3),trace.toFixed(3)].join('|');
  if(key===lastLayout)return;lastLayout=key;
  sheet.style.width=image.naturalWidth+'px';sheet.style.height=image.naturalHeight+'px';
  sheet.style.transform=native?'none':`translate(${v.x.toFixed(2)}px,${v.y.toFixed(2)}px) scale(${v.scale.toFixed(5)})`;
  line.style.strokeDashoffset=String(1-trace);line.style.opacity=String(trace>0?1:0);
  paper.classList.toggle('bill-focus-active91',weight>.01&&!native);
  root.dataset.bill=current;root.dataset.focus=String(weight>.01&&!native);
 }
 image.addEventListener('load',()=>{imageReadyAt=speech.currentTime;lastLayout='';layout()});
 image.addEventListener('error',()=>status.textContent='تصویر قبض دریافت نشد؛ اتصال را بررسی کنید.');
 const observer=new ResizeObserver(()=>{lastLayout='';layout()});observer.observe(paper);
 const reader={get visible(){return visible},show(key,stage='bill'){
  if(!visible){visible=true;imageReadyAt=speech.currentTime;document.documentElement.classList.add('bill-reading90');root.hidden=false;game.input.clear();game.input.exitPointerLock();root.querySelector('[data-bill=close]').focus();game.time.resetAccumulator();}
  hadSession=activeSession();bindMedia();this.select(key);setStage(stage);layout();
 },select(key){
  if(key!==current||displayStage!=='bill'){imageReadyAt=speech.currentTime;native=false;focusOverride=null;paper.classList.remove('native-size');paper.scrollTop=paper.scrollLeft=0;}
  current=key;setStage('bill');const src=key==='before'?bills.before.src:bills.after.src;if(image.getAttribute('src')!==src){imageReadyAt=null;image.src=src;}
  image.alt=key==='before'?'اصل قبض قبل از همکاری با برقتو':'اصل قبض بعد از همکاری با برقتو';status.textContent=image.alt;
  for(const button of root.querySelectorAll('nav button'))button.setAttribute('aria-pressed',String(button.dataset.bill===key));
  lastLayout='';syncState();layout();
 },close(reason='user'){
  resumePending=['distance','hidden','vr'].includes(reason);visible=false;document.documentElement.classList.remove('bill-reading90');root.hidden=true;readerPause=false;native=false;focusOverride=null;manual=false;lastLayout='';paper.classList.remove('native-size');
  root.querySelector('[data-bill=pause]').textContent='مکث صحبت کارشناس';speech.resume?.('reader');game.input.clear();game.time.resetAccumulator();game.renderer.canvas.focus({preventScroll:true});
 },tick(){
  if(!visible)return;observeTime();bindMedia();if(activeSession())hadSession=true;if(ended())return;
  const near=game.city.expert.isNear(game.player.position);
  if(!near||document.hidden||game.vr.active){if(!near)speech.pause?.('distance');this.close(!near?'distance':document.hidden?'hidden':'vr');return;}
  const c=cue();if(c.phase==='hidden'){this.close('outside');lastPhase='hidden';return;}
  if(marker(c)!==lastPhase){lastPhase=marker(c);if(!manual){native=false;focusOverride=null;this.select(c.key);setStage(c.stage);}}
  layout();
 },dispose(){this.close();boundMedia?.removeEventListener?.('ended',mediaEnded);observer.disconnect();window.removeEventListener('keydown',key,true);root.remove();}};
 root.addEventListener('click',e=>{
  const button=e.target.closest('button'),action=button?.dataset.bill;
  if(action==='close')reader.close();
  else if(action==='before'||action==='after'){manual=true;focusOverride=null;native=false;paper.classList.remove('native-size');reader.select(action);}
  else if(action==='pause'){readerPause=!readerPause;readerPause?speech.pause('reader'):speech.resume('reader');button.textContent=readerPause?'ادامه صحبت کارشناس':'مکث صحبت کارشناس';}
  else if(action==='sync'){manual=false;native=false;focusOverride=null;paper.classList.remove('native-size');const c=cue();lastPhase=marker(c);if(c.key){reader.select(c.key);setStage(c.stage);}syncState();lastLayout='';layout();}
  else if(action==='summary'){manual=true;native=false;focusOverride=null;setStage('chart');syncState();layout();}
  else if(['zoom','fit','focus'].includes(action)){focusOverride=action==='focus'?1:0;native=action==='zoom';paper.classList.toggle('native-size',native);paper.scrollTop=paper.scrollLeft=0;lastLayout='';syncState();layout();}
 });
 const key=e=>{if(!visible)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();reader.close();}else if(e.key==='Tab'){const buttons=[...root.querySelectorAll('button,[tabindex]')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}else if(['KeyW','KeyA','KeyS','KeyD','Space','KeyE'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();}};
 window.addEventListener('keydown',key,true);
 const update=bills.update.bind(bills),hide=bills.hide.bind(bills),draw=bills.draw.bind(bills),dispose=bills.dispose.bind(bills);
 let drawKey='';
 bills.draw=function(time){
  const c=billCue92(time,timed()),f=this.phase==='before'||this.phase==='after',weight=f?Math.round(c.weight*20)/20:0,trace=Math.round(c.trace*10)/10;
  const key=[this.phase,this.zoom,this.before.naturalWidth,this.after.naturalWidth,weight,trace,c.stage,Math.round(c.chartProgress*20)/20].join('|');
  if(key===drawKey)return;drawKey=key;
  if(this.phase==='compare'&&c.stage==='chart'&&!this.zoom){const ctx=this.canvas.getContext('2d');if(ctx){drawBillChart92(ctx,data,Math.round(c.chartProgress*20)/20);this.texture.needsUpdate=true;}return;}
  draw(time);
  const ctx=this.canvas.getContext('2d');if(!ctx)return;
  if(f&&!this.zoom&&weight>0){
   const im=this.phase==='before'?this.before:this.after;if(!im.naturalWidth)return;
   const x=24,y=112,w=2000,h=1136,v=billView92(w,h,im.naturalWidth,im.naturalHeight,weight);
   ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);
   ctx.drawImage(im,x+v.x,y+v.y,im.naturalWidth*v.scale,im.naturalHeight*v.scale);
   drawBillUnderline92(ctx,im,x+v.x,y+v.y,im.naturalWidth*v.scale,im.naturalHeight*v.scale,trace);ctx.restore();
  }else if(this.zoom){
   const im=this.zoom==='before'?this.before:this.after;if(im.naturalWidth){const scale=Math.min(2008/im.naturalWidth,1135/im.naturalHeight);drawBillUnderline92(ctx,im,(2048-im.naturalWidth*scale)/2,130,im.naturalWidth*scale,im.naturalHeight*scale);}
  }else if(this.phase==='compare'){
   drawBillUnderline92(ctx,this.before,1060,650,940,575);drawBillUnderline92(ctx,this.after,48,650,940,575);
  }else if(f)drawBillUnderline92(ctx,this.phase==='before'?this.before:this.after,60,525,920,562.4,trace);
  this.texture.needsUpdate=true;
 };
 bills.update=function(dt,camera,feet,allowed,xr){
  observeTime();bindMedia();if(activeSession())hadSession=true;if(ended())return;
  if(xr){if(visible)reader.close('vr');return update(dt,camera,feet,allowed,xr);}
  this.group.visible=this.prompt.visible=false;this.allowed=false;
  const c=cue();if(c.phase==='hidden'){lastPhase='hidden';return;}
  if(allowed&&game.city.expert.isNear(feet)&&(marker(c)!==lastPhase||resumePending)){lastPhase=marker(c);resumePending=false;manual=false;focusOverride=null;native=false;paper.classList.remove('native-size');reader.show(c.key,c.stage);}
 };
 bills.hide=function(){hide();if(visible)reader.close();};bills.dispose=function(){reader.dispose();dispose();};
 game.billReader90=game.billReader92=reader;return reader;
}
