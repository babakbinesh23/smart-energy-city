// One policy for city, office and XR. Device limits may clamp requested quality.
export const QUALITY157=Object.freeze({
 low:Object.freeze({label:'Low',pixelRatioCap:1,renderScale:.65,adaptiveFloor:.75,msaaSamples:0,shadows:false,shadowMapSize:512,shadowDistance:65,bloom:false,xrScale:.75,foveation:.6,officeShadowSize:512,officeShadowFilter:2}),
 medium:Object.freeze({label:'Medium',pixelRatioCap:1.25,renderScale:.85,adaptiveFloor:.85,msaaSamples:2,shadows:true,shadowMapSize:1024,shadowDistance:110,bloom:false,xrScale:.9,foveation:.4,officeShadowSize:1024,officeShadowFilter:2}),
 high:Object.freeze({label:'High',pixelRatioCap:1.5,renderScale:1,adaptiveFloor:1,msaaSamples:4,shadows:true,shadowMapSize:2048,shadowDistance:190,bloom:true,xrScale:1.1,foveation:.2,officeShadowSize:2048,officeShadowFilter:1}),
 ultra:Object.freeze({label:'Ultra',pixelRatioCap:2,renderScale:1,adaptiveFloor:1,msaaSamples:4,shadows:true,shadowMapSize:4096,shadowDistance:260,bloom:true,xrScale:1.2,foveation:0,officeShadowSize:4096,officeShadowFilter:0})
});
export const quality157=value=>Object.hasOwn(QUALITY157,value)?value:'high';
export const ratio157=(preset,dpr=1)=>Math.min(Math.max(1,Number(dpr)||1),preset.pixelRatioCap)*preset.renderScale;
export const xrScale157=(quality,state)=>QUALITY157[quality157(quality)].xrScale*(state?.edgeClarity===false?1/1.2:1);
export const foveation157=(quality,state)=>state?.fullEdges?0:QUALITY157[quality157(quality)].foveation;

export function installQuality157(game){
 if(game.quality157)return game.quality157;
 const select=game.setQuality,context=game.performanceContext,offices=new Set();
 const note=document.createElement('p');note.className='quality-note157';note.dir='rtl';note.style.cssText='font:12px/1.8 Vazirmatn,sans-serif;color:#d9e8e0;max-width:560px;margin:8px auto';
 const button=game.overlay.element.querySelector('[data-quality]');button?.parentElement?.after(note);
 function describe(){const id=quality157(game.settings.quality);note.textContent={low:'Low: وضوح پایین‌تر؛ سایه و درخشش نور خاموش؛ مناسب اجرای سبک‌تر.',medium:'Medium: وضوح متوسط؛ سایهٔ سبک؛ درخشش نور خاموش.',high:'High: وضوح کامل؛ سایهٔ دقیق و درخشش نور فعال.',ultra:'Ultra: بیشترین وضوح و دقت سایه؛ نیازمند پردازندهٔ گرافیکی قوی‌تر.'}[id];}
 game.setQuality=function(value){if(!Object.hasOwn(QUALITY157,value))return false;select.call(this,value);this.shadowOptimization156?.invalidate();if(!QUALITY157[value].shadows)this.scene.traverse(node=>{if(node.isLight&&node.shadow?.map){node.shadow.map.dispose();node.shadow.map=null;}});this.overlay.setQuality(value);this.vrQuality140?.qualityChanged157?.();for(const office of offices)office.apply(value);describe();return true;};
 game.performanceContext=function(...args){return{...context.apply(this,args),qualityPolicy157:{requested:this.settings.quality,sceneShadows:this.renderer.webgl.shadowMap.enabled,adaptiveFloor:this.renderer.qualityPreset.adaptiveFloor,xrRequestedScale:xrScale157(this.settings.quality,this.vrQuality140?.state),xrActiveScale:this.vrQuality140?.activeScale??null,xrResolutionPending:this.vrQuality140?.pendingEdges??false,offices:[...offices].map(o=>o.report())}};};
 const api={attachOffice(debug,host){const office=installOfficeQuality157(debug,host,()=>game.settings.quality,value=>game.setQuality(value));offices.add(office);debug.scene.onDisposeObservable.addOnce(()=>offices.delete(office));return office;}};
 game.quality157=api;game.setQuality(quality157(game.settings.quality));
 game.disposers.push(()=>{game.setQuality=select;game.performanceContext=context;note.remove();delete game.quality157;});return api;
}

export function installOfficeQuality157(debug,host=window,getQuality,setQuality){
 if(debug.quality157)return debug.quality157;
 const {scene,engine}=debug;let disposed=false,lastXR=null,selected='high',xrHelper=null;
 const read=()=>{if(getQuality)return quality157(getQuality());try{return quality157(host.localStorage.getItem('mirasol.quality'));}catch{return'high';}};
 const isXR=()=>!!host.Office97?.xrActive;
 const imageState=()=>{try{return host.parent.__BARGHETO_CITY87__?.vrQuality140?.state;}catch{return null;}};
 const xrFoveation=()=>{if(xrHelper?.baseExperience.state===2)xrHelper.baseExperience.sessionManager.fixedFoveation=foveation157(selected,imageState());};
 debug.mobileQuality121?.setQualityManaged157?.(true);
 function resize(){if(disposed||isXR())return;const scale=1/ratio157(QUALITY157[selected],host.devicePixelRatio);if(Math.abs(engine.getHardwareScalingLevel()-scale)>.001){engine.setHardwareScalingLevel(scale);engine.resize();}}
 function apply(value=read()){
  selected=quality157(value);const p=QUALITY157[selected];scene.shadowsEnabled=p.shadows;
  for(const light of scene.lights||[]){const generator=light.getShadowGenerator?.();if(!generator)continue;
   if(p.shadows){const size=Math.min(p.officeShadowSize,engine.getCaps?.().maxTextureSize||4096);if(generator.mapSize!==size){const old=generator.getShadowMap(),rate=old?.refreshRate;generator.mapSize=size;if(rate!==undefined)generator.getShadowMap().refreshRate=rate;}generator.filteringQuality=p.officeShadowFilter;generator.getShadowMap()?.resetRefreshCounter();}
  }
  resize();xrFoveation();if(select)select.value=selected;
 }
 // A native select remains sharp even when the WebGL render is reduced.
 const card=host.document.querySelector('#pause .card');let select=null,label=null;
 if(card){label=host.document.createElement('label');label.textContent='کیفیت تصویر ';label.dir='rtl';label.style.cssText='display:block;margin:12px 0';select=host.document.createElement('select');select.setAttribute('aria-label','کیفیت تصویر');for(const id of Object.keys(QUALITY157)){const option=host.document.createElement('option');option.value=id;option.textContent=QUALITY157[id].label;select.append(option);}label.append(select);card.append(label);select.onchange=()=>{if(setQuality)setQuality(select.value);else{try{host.localStorage.setItem('mirasol.quality',select.value);}catch{}apply(select.value);}};}
 const storage=e=>{if(e.key==='mirasol.quality')apply(read());};host.addEventListener('storage',storage);host.addEventListener('resize',resize);
 const observer=scene.onBeforeRenderObservable.add(()=>{const xr=isXR();if(xr!==lastXR){lastXR=xr;if(!xr)resize();}xrFoveation();});
 const api={apply,xrOptions:stencil=>({canvasOptions:{antialias:true,depth:true,stencil:!!stencil,alpha:true,framebufferScaleFactor:xrScale157(selected,imageState())}}),setXRHelper:helper=>{xrHelper=helper;},report:()=>({quality:selected,shadows:scene.shadowsEnabled,hardwareScale:engine.getHardwareScalingLevel(),xr:isXR()}),dispose(){if(disposed)return;disposed=true;host.removeEventListener('storage',storage);host.removeEventListener('resize',resize);scene.onBeforeRenderObservable.remove(observer);label?.remove();delete debug.quality157;}};
 debug.quality157=api;apply();scene.onDisposeObservable.addOnce(()=>api.dispose());return api;
}
