import {installOfficeAuto160} from './auto-quality-2.5.240.js';
// One policy for city, office and XR. Device limits may clamp requested quality.
export const QUALITY157=Object.freeze({
 low:Object.freeze({label:'Low',pixelRatioCap:1,renderScale:.65,adaptiveFloor:.75,msaaSamples:0,shadows:false,shadowMapSize:512,shadowDistance:65,bloom:false,xrScale:.75,foveation:.6,officeShadowSize:512,officeShadowFilter:2}),
 medium:Object.freeze({label:'Medium',pixelRatioCap:1.08,renderScale:.70,adaptiveFloor:.85,msaaSamples:0,shadows:false,shadowMapSize:512,shadowDistance:65,bloom:false,xrScale:.85,foveation:.5,officeShadowSize:512,officeShadowFilter:2}),
 high:Object.freeze({label:'High',pixelRatioCap:1.15,renderScale:.76,adaptiveFloor:.9,msaaSamples:2,shadows:true,shadowMapSize:512,shadowDistance:75,bloom:false,xrScale:.95,foveation:.35,officeShadowSize:512,officeShadowFilter:2}),
 ultra:Object.freeze({label:'Ultra',pixelRatioCap:2,renderScale:1,adaptiveFloor:1,msaaSamples:4,shadows:true,shadowMapSize:4096,shadowDistance:260,bloom:true,xrScale:1.2,foveation:0,officeShadowSize:4096,officeShadowFilter:0})
});
export function qualityRow165(){
 return `<div class="quality-row" role="group" aria-label="کیفیت تصویر"><span>کیفیت تصویر</span>${Object.entries(QUALITY157).map(([id,preset])=>`<button type="button" data-quality="${id}" aria-pressed="false">${preset.label}</button>`).join('')}</div>`;
}
export function syncQualityRow165(root,value,locked=false){
 root.dataset.vrQualityLocked222=String(locked);
 for(const button of root.querySelectorAll('[data-quality]')){
  button.disabled=locked;button.hidden=locked&&button.dataset.quality!=="high";
  button.title=locked?"کیفیت VR روی High ثابت است":"";
  const active=button.dataset.quality===value;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 }
}
export const vrQualityLocked222=game=>!!(game?.overlay?.mode==='vr'||game?.vr?.active||game?.vr?.starting||game?.renderer?.webgl?.xr?.isPresenting||game?.officeSession?.frame?.contentWindow?.Office97?.xrActive);
export const quality157=value=>Object.hasOwn(QUALITY157,value)?value:'high';
export const ratio157=(preset,dpr=1)=>Math.min(Math.max(1,Number(dpr)||1),preset.pixelRatioCap)*preset.renderScale;
export const xrScale157=(quality,state)=>QUALITY157[quality157(quality)].xrScale*(state?.edgeClarity===false?1/1.2:1);
export const foveation157=(quality,state)=>state?.fullEdges?0:QUALITY157[quality157(quality)].foveation;

export function installQuality157(game){
 if(game.quality157)return game.quality157;
 const select=game.setQuality,context=game.performanceContext,offices=new Set();
 const note=document.createElement('p');note.className='quality-note157';note.dir='rtl';note.style.cssText='font:12px/1.8 Vazirmatn,sans-serif;color:#d9e8e0;max-width:560px;margin:8px auto';
 const button=game.overlay.element.querySelector('[data-quality]');button?.parentElement?.after(note);
 function describe(){const id=quality157(game.settings.quality);note.textContent={low:'Low: وضوح پایین‌تر؛ سایه و درخشش نور خاموش؛ مناسب اجرای سبک‌تر.',medium:'Medium: وضوح کمی بیشتر؛ سایه و درخشش نور خاموش.',high:'High: وضوح بیشتر، هموارسازی لبه‌ها و سایهٔ سبک.',ultra:'Ultra: بیشترین وضوح و دقت سایه؛ نیازمند پردازندهٔ گرافیکی قوی‌تر.'}[id];}
 game.setQuality=function(value){if(!Object.hasOwn(QUALITY157,value))return false;select.call(this,value);this.shadowOptimization156?.invalidate();if(!QUALITY157[value].shadows)this.scene.traverse(node=>{if(node.isLight&&node.shadow?.map){node.shadow.map.dispose();node.shadow.map=null;}});this.overlay.setQuality(value);syncQualityRow165(this.overlay.element,value,false);this.vrQuality140?.qualityChanged157?.();for(const office of offices)office.apply(value);describe();return true;};
 game.performanceContext=function(...args){return{...context.apply(this,args),qualityPolicy157:{requested:this.settings.quality,sceneShadows:this.renderer.webgl.shadowMap.enabled,adaptiveFloor:this.renderer.qualityPreset.adaptiveFloor,xrRequestedScale:xrScale157(this.settings.quality,this.vrQuality140?.state),xrActiveScale:this.vrQuality140?.activeScale??null,xrResolutionPending:this.vrQuality140?.pendingEdges??false,offices:[...offices].map(o=>o.report())}};};
 const api={attachOffice(debug,host){const office=installOfficeQuality157(debug,host,()=>game.settings.quality,value=>game.setQuality(value));offices.add(office);debug.scene.onDisposeObservable.addOnce(()=>offices.delete(office));return office;}};
 game.quality157=api;game.setQuality(quality157(game.settings.quality));
 game.disposers.push(()=>{game.setQuality=select;game.performanceContext=context;note.remove();delete game.quality157;});return api;
}

export function installOfficeQuality157(debug,host=window,getQuality,setQuality){
 if(debug.quality157)return debug.quality157;
 const {scene,engine}=debug;let disposed=false,lastXR=null,selected='low',xrHelper=null;
 const read=()=>getQuality?quality157(getQuality()):selected;
 const isXR=()=>!!host.Office97?.xrActive;
 const locked=()=>{let city;try{city=host.parent.__BARGHETO_CITY87__;}catch{}return isXR()||new URLSearchParams(host.location.search).get('city-xr')==='1'||vrQualityLocked222(city);};
 const imageState=()=>{try{return host.parent.__BARGHETO_CITY87__?.vrQuality140?.state;}catch{return null;}};
 const xrFoveation=()=>{if(xrHelper?.baseExperience.state===2)xrHelper.baseExperience.sessionManager.fixedFoveation=foveation157(selected,imageState());};
 debug.mobileQuality121?.setQualityManaged157?.(true);
 let resolutionTransition=null,initialized=false;
 function resize(){
  if(disposed||isXR())return;
  const scale=1/ratio157(QUALITY157[selected],host.devicePixelRatio);
  resolutionTransition=null;
  if(Math.abs(engine.getHardwareScalingLevel()-scale)<=.001)return;
  if(initialized)resolutionTransition={from:engine.getHardwareScalingLevel(),to:scale,start:host.performance.now(),last:0};
  else{engine.setHardwareScalingLevel(scale);engine.resize();}
 }
 function apply(value=read()){
  selected=quality157(value);const p=QUALITY157[selected];scene.shadowsEnabled=p.shadows;
  for(const light of scene.lights||[]){const generator=light.getShadowGenerator?.();if(!generator)continue;
   if(p.shadows){const size=Math.min(p.officeShadowSize,engine.getCaps?.().maxTextureSize||4096);if(generator.mapSize!==size){const old=generator.getShadowMap(),rate=old?.refreshRate;generator.mapSize=size;if(rate!==undefined)generator.getShadowMap().refreshRate=rate;}generator.filteringQuality=p.officeShadowFilter;generator.getShadowMap()?.resetRefreshCounter();}
  }
  resize();initialized=true;xrFoveation();if(controls)syncQualityRow165(controls,selected,locked());
 }

 const document=host.document;
 const card=document.getElementById('settings')||document.querySelector('#pause .card');
 let controls=null;
 if(card){
  controls=document.createElement('div');
  controls.className='office-quality165';
  controls.innerHTML=qualityRow165();
  card.append(controls);
  controls.addEventListener('click',event=>{
   const button=event.target.closest('button[data-quality]');
   if(button)choose(button.dataset.quality);
  });
 }
 const style=document.createElement('link');
 style.rel='stylesheet';
 style.href=new URL('./office-quality-2.5.165.css',import.meta.url).href;
 if(controls)document.head.append(style);
 function choose(value){
  if(locked())return false;
  if(!Object.hasOwn(QUALITY157,value))return false;
  auto.manual();
  if(setQuality)return setQuality(value);
  try{host.localStorage.setItem('mirasol.quality',value);}catch{}
  apply(value);
  return true;
 }
 const storage=e=>{if(e.key==='mirasol.quality')apply(read());};host.addEventListener('storage',storage);host.addEventListener('resize',resize);
 const observer=scene.onBeforeRenderObservable.add(()=>{const xr=isXR();if(controls)syncQualityRow165(controls,selected,locked());if(xr!==lastXR){lastXR=xr;if(!xr)resize();else resolutionTransition=null;}
  if(resolutionTransition&&!xr){
   const time=host.performance.now(),elapsed=time-resolutionTransition.start;
   if(time-resolutionTransition.last>=250){
    const progress=Math.min(1,elapsed/2000),smooth=progress*progress*(3-2*progress);
    engine.setHardwareScalingLevel(resolutionTransition.from+(resolutionTransition.to-resolutionTransition.from)*smooth);engine.resize();resolutionTransition.last=time;
    if(progress===1)resolutionTransition=null;
   }
  }
  xrFoveation();});
 const api={apply,choose,get selected(){return selected;},xrOptions:stencil=>({canvasOptions:{antialias:true,depth:true,stencil:!!stencil,alpha:true,framebufferScaleFactor:xrScale157(selected,imageState())}}),setXRHelper:helper=>{xrHelper=helper;},report:()=>({quality:selected,shadows:scene.shadowsEnabled,hardwareScale:engine.getHardwareScalingLevel(),xr:isXR()}),dispose(){if(disposed)return;disposed=true;host.removeEventListener('storage',storage);host.removeEventListener('resize',resize);scene.onBeforeRenderObservable.remove(observer);controls?.remove();style.remove();delete debug.quality157;}};
 const auto=installOfficeAuto160(debug,host,apply,()=>selected,()=>xrHelper?.baseExperience.sessionManager.session);
 debug.quality157=api;api.beginXR=auto.beginXR;apply();scene.onDisposeObservable.addOnce(()=>api.dispose());return api;
}
