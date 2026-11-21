import {createGraphicMap116,mapOrder116} from './graphic-map-2.5.227.js';
import {installVRMap113} from './city-vr-map-2.5.240.js';
import '../../../office/autosave-2.5.113.js';

export function registerVpp113(features,buildings){
 const homes=buildings.filter(b=>b.category==='home');if(!homes.length)return;
 const register=features.register;
 features.register=function(feature){
  if(feature.id==='vpp'){
   const areas=feature.areas.filter(a=>!a.vppGround);
   if(areas.length){
    const bounds={minX:Math.min(...areas.map(a=>a.minX))-7,maxX:Math.max(...areas.map(a=>a.maxX))+7,minZ:Math.min(...areas.map(a=>a.minZ))-7,maxZ:Math.max(...areas.map(a=>a.maxZ))+7,minY:.15,maxY:Math.max(...areas.map(a=>a.maxY))};
    feature={...feature,focusArea:bounds,entry:{x:(bounds.minX+bounds.maxX)/2,z:(bounds.minZ+bounds.maxZ)/2,heading:Math.PI},areas:[...areas,{...bounds,minY:.15,maxY:.3,vppGround:true}]};
   }else feature={...feature,areas:[],focusArea:undefined,entry:undefined};
  }
  return register.call(this,feature);
 };
 features.register({id:'vpp',title:'تجمیع برق سبز · VPP',subtitle:'سه خانهٔ خورشیدی، یک نیروگاه مجازی',accent:'#62dab4',areas:homes.map(b=>({minX:b.x-b.width/2,maxX:b.x+b.width/2,minY:.15,maxY:b.height+1.3,minZ:b.z-b.depth/2,maxZ:b.z+b.depth/2})),fields:[{label:'مجموعه',value:'سه خانه با پنل خورشیدی'},{label:'کارکرد',value:'تجمیع برق تولیدی نیروگاه‌های کوچک'}]});
}

export function installCitySave113(game){
 const editor=game.editor;if(!editor?.store)return;
 let stamp=editor.changeId;
 const saver=BarghetoCommitSave113({canSave:()=>editor.available&&editor.store.canSave&&!!editor.store.endpoint&&!editor.dragging&&!editor.before,
  save:async()=>{const id=editor.changeId;await editor.store.save();if(editor.changeId===id)editor.changed=false;},
  onStatus(state,error){editor.saving=state==='saving';editor.refreshButtons();editor.notice.textContent=state==='saving'?'در حال ذخیره روی سرور…':state==='saved'?'چیدمان روی سرور ذخیره شد.':state==='pending'?'تغییر ثبت شد؛ در انتظار ذخیره روی سرور…':error?.message||'ذخیره روی سرور انجام نشد؛ دوباره دکمهٔ ذخیره را بزنید.';}});
 const mark=()=>{if(editor.store.canSave&&editor.changed){stamp=editor.changeId;saver.mark();}};
 for(const name of ['touch','finish','remove','paste','undo','reset','applyFields']){
  const fn=editor[name];if(!fn)continue;
  editor[name]=function(...args){const result=fn.apply(this,args);const done=()=>{if(this.changeId!==stamp||name==='finish'&&this.changed)mark();};if(result?.then)return result.then(v=>{done();return v;});done();return result;};
 }
 editor.save=async()=>{if(!editor.store.canSave)return false;editor.finish();return saver.flush();};
 const beforeUnload=e=>{if(editor.changed&&editor.store.canSave){e.preventDefault();e.returnValue='';}};
 window.addEventListener('beforeunload',beforeUnload);
 game.disposers.push(()=>{saver.dispose();window.removeEventListener('beforeunload',beforeUnload);});
 game.citySave113=saver;
}

export function installCityNavigation113(game,T,safeSpawn){
 installCitySave113(game);
 const host=game.renderer.canvas.parentElement,style=document.createElement('style');
 style.textContent=`
 .city-minimap113{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(24px,env(safe-area-inset-bottom));z-index:36;width:150px;height:auto;aspect-ratio:1;padding:0;border:0;border-radius:50%;overflow:hidden;background:#102932;box-shadow:0 6px 24px #0006;cursor:pointer;pointer-events:auto;color:#effff8}
 .city-minimap113 canvas{width:100%;height:100%;border-radius:50%;display:block}
 .city-map113,.city-map113 *{box-sizing:border-box}.city-map113[hidden],.city-minimap113[hidden]{display:none!important}.city-map113{position:absolute;inset:0;z-index:80;background:#07151dcc;display:grid;place-items:center;padding:16px;pointer-events:auto;direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;backdrop-filter:blur(6px)}
 .city-map113 section{width:min(1280px,100%);max-height:calc(100dvh - 32px);overflow:auto;border:1px solid #6eaa9c;border-radius:24px;background:#112932;color:#effff8;padding:20px;box-shadow:0 20px 80px #0006}.city-map113 header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.city-map113 h2{font-size:20px;margin:0}.city-map113 button{font:inherit;color:inherit;cursor:pointer}.city-map113 [data-close]{width:42px;height:42px;border-radius:50%;border:1px solid #496c73;background:#203e47;font-size:25px}
 .city-map113 .map-body113{display:grid;grid-template-columns:minmax(0,4fr) minmax(180px,1fr);gap:16px;align-items:start}.city-map113 canvas{width:100%;height:auto;background:#0b222d;border-radius:18px;cursor:pointer;touch-action:manipulation}.city-map113 .map-list113{display:grid;gap:8px}.city-map113 [data-destination]{text-align:right;display:flex;align-items:center;gap:10px;min-height:52px;padding:10px;border:1px solid #416b72;border-radius:12px;background:#1a3a43}.city-map113 [data-destination]:hover{background:#285149;border-color:#86e2ba}.city-map113 [data-destination] b{display:grid;place-items:center;width:26px;height:26px;flex:none;border:1px solid #78cfb7;border-radius:50%;font-size:12px}.city-map113 p{font-size:12px;color:#b7d0d2;line-height:1.8}.city-map113 [data-map-retry][hidden]{display:none!important}.city-map113 [data-map-retry]{padding:10px 16px;border:1px solid #78cfb7;border-radius:10px;background:#1a3a43}.city-map113 [role=status]{color:#ffd592;min-height:22px}.city-map113 :focus-visible,.city-minimap113:focus-visible{outline:3px solid #ffc77d;outline-offset:3px}
 @media(pointer:coarse){.city-minimap113{width:102px;bottom:max(198px,calc(env(safe-area-inset-bottom) + 182px));right:12px}}
 @media(max-width:700px){.city-minimap113{width:102px;bottom:max(198px,calc(env(safe-area-inset-bottom) + 182px));right:12px}.city-map113 section{padding:14px;border-radius:18px}.city-map113 .map-body113{grid-template-columns:1fr}.city-map113 canvas{height:auto}.city-map113 .map-list113{grid-template-columns:1fr 1fr}.city-map113 [data-destination]{font-size:11px;min-height:48px;padding:8px}.city-map113 h2{font-size:17px}}
 `;document.head.append(style);
 const mini=document.createElement('button');mini.className='city-minimap113';mini.type='button';mini.hidden=true;mini.setAttribute('aria-label','بازکردن نقشهٔ شهر و انتخاب مقصد');mini.setAttribute('aria-haspopup','dialog');mini.setAttribute('aria-expanded','false');mini.innerHTML='<canvas width="320" height="320" aria-hidden="true"></canvas>';
 const dialog=document.createElement('div');dialog.className='city-map113';dialog.hidden=true;dialog.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="city-map-title113"><header><h2 id="city-map-title113">کجا می‌خواهی بروی؟</h2><button type="button" data-close aria-label="بستن نقشه">×</button></header><div class="map-body113"><canvas width="1536" height="1024" aria-label="موقعیت شما و بخش‌های شهر"></canvas><div class="map-list113"></div></div><p>نشانگر سبز، جای شماست. برای رفتن به هر بخش روی ساختمان یا نام آن بزن.</p><div role="status" aria-live="polite"></div><button type="button" data-map-retry hidden>دریافت دوبارهٔ نقشه</button></section>';
 host.append(mini,dialog);let opened=false,wasPaused=false,clock=0,disposed=false,markers=[],lastFocus=null;
 const list=dialog.querySelector('.map-list113'),large=dialog.querySelector('canvas'),small=mini.querySelector('canvas'),status=dialog.querySelector('[role=status]');
 const features=()=>game.city.features.all.filter(f=>f.areas.length).sort((a,b)=>mapOrder116.indexOf(a.id)-mapOrder116.indexOf(b.id));
 const graphic=createGraphicMap116(game,features);
 const retryMap=dialog.querySelector('[data-map-retry]');
 function mapStatus(){
  retryMap.hidden=graphic.state!=='error';
  status.textContent=graphic.state==='loading'?'در حال دریافت نقشهٔ کامل…':graphic.state==='error'?'تصویر نقشه دریافت نشد. دریافت دوباره را بزنید؛ انتخاب مقصد از فهرست فعال است.':'';
 }
 retryMap.onclick=()=>graphic.reload();
 const unwatchMap=graphic.subscribe(()=>{if(disposed)return;mapStatus();if(opened)draw(large,true);if(!mini.hidden)draw(small);});
 function mapBounds(){const areas=features().flatMap(f=>f.areas);return{minX:Math.min(...areas.map(a=>a.minX))-24,maxX:Math.max(...areas.map(a=>a.maxX))+24,minZ:Math.min(...areas.map(a=>a.minZ))-24,maxZ:Math.max(...areas.map(a=>a.maxZ))+24};}
 function draw(canvas,expanded=false){
  if(canvas===small?graphic.drawMini(canvas):graphic.draw(canvas))return;
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,b=mapBounds(),scale=Math.min((w-32)/(b.maxX-b.minX),(h-32)/(b.maxZ-b.minZ)),ox=(w-(b.maxX-b.minX)*scale)/2,oz=(h-(b.maxZ-b.minZ)*scale)/2;
  const point=(x,z)=>({x:ox+(x-b.minX)*scale,y:oz+(z-b.minZ)*scale});c.fillStyle='#102c37';c.fillRect(0,0,w,h);
  c.strokeStyle='#1e3d46';c.lineWidth=1;for(let x=0;x<w;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let z=0;z<h;z+=24){c.beginPath();c.moveTo(0,z);c.lineTo(w,z);c.stroke();}
  for(const road of game.city.layout?.roads||[]){const ns=road.axis==='ns',a=ns?point(road.coord,b.minZ):point(b.minX,road.coord),d=ns?point(road.coord,b.maxZ):point(b.maxX,road.coord);c.strokeStyle='#48606a';c.lineWidth=Math.max(3,road.width*scale);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(d.x,d.y);c.stroke();}
  markers=[];features().forEach((f,i)=>{const areas=f.areas.filter(a=>!a.vppGround);for(const a of areas){const p=point(a.minX,a.minZ);c.globalAlpha=.55;c.fillStyle=f.accent||'#8fdcc1';c.fillRect(p.x,p.y,Math.max(3,(a.maxX-a.minX)*scale),Math.max(3,(a.maxZ-a.minZ)*scale));c.globalAlpha=1;}const a=f.focusArea||areas[0],p=point((a.minX+a.maxX)/2,(a.minZ+a.maxZ)/2);if(expanded){c.fillStyle='#183b44';c.strokeStyle=f.accent||'#8fdcc1';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,12,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#effff8';c.font='bold 12px Tahoma';c.textAlign='center';c.fillText(new Intl.NumberFormat('fa-IR').format(i+1),p.x,p.y+4);markers.push({...p,id:f.id});}});
  const p=point(game.player.position.x,game.player.position.z),x=Math.max(12,Math.min(w-12,p.x)),y=Math.max(12,Math.min(h-12,p.y));c.save();c.translate(x,y);c.rotate(game.camera.yaw||0);c.shadowColor='#5cffe0';c.shadowBlur=9;c.fillStyle='#e9fffb';c.beginPath();c.moveTo(0,-9);c.lineTo(6,7);c.lineTo(0,4);c.lineTo(-6,7);c.closePath();c.fill();c.restore();c.fillStyle='#c1dedc';c.font='bold '+(expanded?14:20)+'px Tahoma';c.textAlign='left';c.fillText('N ↑',expanded?18:28,expanded?24:38);
 }
 function close(resume=true){if(!opened)return;opened=false;dialog.hidden=true;mini.setAttribute('aria-expanded','false');game.input.clear();game.time.resetAccumulator();if(resume&&!wasPaused)game.resume();else game.paused=wasPaused;(lastFocus?.isConnected?lastFocus:mini).focus?.({preventScroll:true});}
 function open(){if(disposed||mini.hidden)return;lastFocus=document.activeElement;wasPaused=game.paused;opened=true;game.input.clear();game.input.exitPointerLock();game.paused=true;game.city.updateAudio?.(game.camera.camera,true);game.time.resetAccumulator();mini.setAttribute('aria-expanded','true');mapStatus();list.replaceChildren();for(const [i,f]of features().entries()){const button=document.createElement('button');button.type='button';button.dataset.destination=f.id;const badge=document.createElement('b');badge.textContent=new Intl.NumberFormat('fa-IR').format(i+1);button.append(badge,document.createTextNode(f.title));button.onclick=()=>teleport(f.id);list.append(button);}dialog.hidden=false;draw(large,true);dialog.querySelector('[data-close]').focus();}
 function beforeTeleport(){game.coolerStory93?.end();game.solarExpertStory107?.end?.();game.greenAggregationStory108?.end?.();game.city.expert.speech.stop();game.expertBills.hide();game.input.clear();}
 async function teleport(id){
  if(!opened||game.vr.active||game.officeSession.active)return false;const feature=game.city.features.get(id);if(!feature?.areas.length)return false;
  try{const selection={feature,area:feature.areas[0],point:new T.Vector3},spawn=safeSpawn(selection);beforeTeleport();game.freeCamera=null;game.player.controller.setFlying(false);game.input.captureOnDrag=false;game.flightControl.setFlying(false);game.hud.setFlying(false);game.player.teleport(spawn.feet,spawn.heading);game.player.update(0,1);game.camera.yaw=spawn.heading-Math.PI;game.camera.pitch=.1;game.camera.reset();game.camera.update(1/60,game.input,game.player);game.player.rig.root.visible=!game.camera.firstPerson;close();return true;}catch(error){status.textContent='ورود امن به این بخش ممکن نشد؛ مقصد دیگری را انتخاب کن.';console.warn('Map destination',error);return false;}
 }
 mini.onclick=open;dialog.querySelector('[data-close]').onclick=()=>close();dialog.addEventListener('click',e=>{if(e.target===dialog)close();});large.onclick=e=>{const r=large.getBoundingClientRect(),x=(e.clientX-r.left)*large.width/r.width,y=(e.clientY-r.top)*large.height/r.height;const id=graphic.hit(large,x,y);if(graphic.image.complete&&graphic.image.naturalWidth){if(id)void teleport(id);return;}const m=markers.filter(m=>Math.hypot(m.x-x,m.y-y)<25).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(m)void teleport(m.id);};
 const key=e=>{if(!opened)return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){const buttons=[...dialog.querySelectorAll('button')].filter(button=>!button.hidden);if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}};window.addEventListener('keydown',key,true);
 const vrMap=installVRMap113(game,T,{features,draw,hitMap:graphic.hit,safeSpawn,beforeTeleport});
 const frame=game.frame;game.frame=function(...args){const r=frame.apply(this,args);if(disposed)return r;vrMap.update();const show=game.enteredCity&&!game.cinematic.active&&!game.vr.active&&!game.officeSession.active&&!game.editor.active&&!game.settings.hideHud;mini.hidden=!show;if(!show&&opened)close(false);const now=performance.now();if(show&&now-clock>150){clock=now;draw(small);if(opened)draw(large,true);}return r;};
 const api={open,close,teleport,mini,dialog,draw,vrMap,get opened(){return opened;},dispose(){disposed=true;if(opened)close(false);window.removeEventListener('keydown',key,true);vrMap.dispose();unwatchMap();graphic.dispose();mini.remove();dialog.remove();style.remove();}};game.navigation113=api;game.disposers.push(()=>api.dispose());return api;
}
