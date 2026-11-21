// Active frame intervals only. Every scope change starts a fresh measurement.
export class QualityWindow160 {
 constructor(){this.reset();this.failed=false;this.promoted=false;this.enabled=true;}
 reset(){this.seconds=0;this.frames=0;this.binSeconds=0;this.binFrames=0;this.minimumFps=Infinity;this.stalls=0;this.slowSeconds=0;}
 sample(seconds,refreshRate=0){
  if(!this.enabled||!Number.isFinite(seconds)||seconds<=0)return null;
  this.seconds+=seconds;this.frames++;this.binSeconds+=seconds;this.binFrames++;
  if(seconds>.1)this.stalls++;
  const fps=this.frames/this.seconds;
  const target=refreshRate>0?refreshRate:0;
  const minimumAverage=target?target*.97:52;
  const minimumBin=target?target*.92:48;
  const rollbackAverage=target?target*.9:45;
  if(this.binSeconds>=1){
   const binFps=this.binFrames/this.binSeconds;
   this.minimumFps=Math.min(this.minimumFps,binFps);
   this.slowSeconds=binFps<rollbackAverage?this.slowSeconds+this.binSeconds:0;
   this.binSeconds=0;this.binFrames=0;
  }
  if(this.promoted&&this.slowSeconds>=8){this.reset();this.failed=true;this.promoted=false;return 'rollback';}
  if(this.seconds<20)return null;
  const upgrade=!this.failed&&fps>=minimumAverage&&this.minimumFps>=minimumBin&&this.stalls<=(target?0:1);
  this.last={fps,minimumFps:this.minimumFps,seconds:this.seconds,stalls:this.stalls};
  const {slowSeconds}=this;
  this.reset();this.slowSeconds=slowSeconds;return upgrade?'upgrade':null;
 }
}

export function installAutoQuality160(game, presets, webPresets=presets){
 const policy=new QualityWindow160(),renderer=game.renderer;
 let scope=null,transition=null,disposed=false;
 const originalSet=game.setQuality,originalObserve=renderer.observeFrame;
 let webQuality=game.settings.quality;
 function set(value){let saved;try{saved=localStorage.getItem('mirasol.quality');}catch{}try{originalSet.call(game,value);}finally{try{if(saved===null)localStorage.removeItem('mirasol.quality');else if(saved!==undefined)localStorage.setItem('mirasol.quality',saved);}catch{}}}
 function cancel(){if(transition){renderer.applyQuality(presets[game.settings.quality]);game.environment.applyQuality(renderer.qualityPreset);transition=null;}policy.reset();scope=null;}
 game.setQuality=function(value){if(!Object.hasOwn(presets,value))return false;cancel();policy.enabled=false;return originalSet.call(this,value);};
 function tick(seconds,source,active,office,refreshRate=0){
  if(disposed)return;
  if(!active||!policy.enabled){cancel();return;}
  if(scope!==source){cancel();scope=source;return;}
  if(transition){
   transition.elapsed+=seconds;
   const stage=Math.min(5,Math.floor(transition.elapsed/.5));
   if(stage===transition.stage)return;
   transition.stage=stage;
   if(stage===5){
    const target=transition.target;transition=null;set(target);policy.promoted=true;policy.reset();return;
   }
   const start=webPresets[game.settings.quality],target=webPresets[transition.target],blend=Math.min(1,(stage+1)/3);
   const partial={...start,pixelRatioCap:start.pixelRatioCap+(target.pixelRatioCap-start.pixelRatioCap)*blend,renderScale:start.renderScale+(target.renderScale-start.renderScale)*blend,adaptiveFloor:1};
   if(stage>=3)Object.assign(partial,{shadowMapSize:target.shadowMapSize,shadowDistance:target.shadowDistance});
   if(stage>=4)Object.assign(partial,{bloom:target.bloom,msaaSamples:target.msaaSamples});
   renderer.applyQuality(partial);game.environment.applyQuality(renderer.qualityPreset);
   return;
  }
  const action=policy.sample(seconds,refreshRate),levels=['low','medium','high','ultra'],index=levels.indexOf(game.settings.quality);
  if(action==='rollback'&&index>1){set(levels[index-1]);return;}
  if(action==='upgrade'&&index<3){
   // Building transitions use its normal setter at a frame boundary.
   if(office||refreshRate){set(levels[index+1]);policy.promoted=true;policy.reset();}
   else transition={target:levels[index+1],elapsed:0,stage:-1};
  }
 }
 renderer.observeFrame=function(seconds,paused){
  if(!transition)originalObserve.call(this,seconds,paused);
  if(game.officeSession.active)return;
  const vr=game.vr,session=this.webgl.xr.getSession();
  if(session){
   const active=vr.active&&vr.visible&&!document.hidden&&session.visibilityState==='visible'&&(!vr.introducing||vr.introPhase==='overview')&&!vr.insideOffice&&!vr.mapOpen125&&!vr.panel.visible&&!vr.pending&&!vr.fade;
   const rate=refreshRateOf(session);
   tick(seconds,'city-vr:'+rate,active,false,rate);
  }else if(!vr.active){
   tick(seconds,'city',!paused&&!document.hidden&&game.enteredCity&&!game.cinematic.active&&!game.editor.active);
  }
 };
 function restoreWeb(){
  set(webQuality);
  policy.promoted=webQuality==='high'||webQuality==='ultra';
 }
 let mode=game.overlay.mode;
 const modeChange=()=>{
  const next=game.overlay.mode;
  if(mode===next)return;
  cancel();
  if(next==='vr'){webQuality=game.settings.quality;set('medium');}
  else restoreWeb();
  mode=next;
 };
 game.overlay.start.querySelector('.experience-choice')?.addEventListener('change',modeChange);
 const originalStart=game.vr.start;
 game.vr.start=function(...args){
  if(this.active||this.starting)return originalStart.apply(this,args);
  if(!game.officeSession.active){
   cancel();
   if(game.overlay.mode!=='vr')webQuality=game.settings.quality;
   if(policy.enabled){policy.failed=false;policy.promoted=false;set('medium');}
   else if(game.overlay.mode!=='vr')set('medium');
  }
  return originalStart.apply(this,args).catch(error=>{
   cancel();
   if(game.overlay.mode!=='vr')restoreWeb();
   throw error;
  });
 };
 const xrStart=()=>cancel();
 const xrEnd=()=>{
  cancel();
  if(!game.officeSession.active&&game.overlay.mode!=='vr')restoreWeb();
 };
 renderer.webgl.xr.addEventListener('sessionstart',xrStart);
 renderer.webgl.xr.addEventListener('sessionend',xrEnd);
 const api={policy,tick,manual(){policy.enabled=false;cancel();},report:()=>({enabled:policy.enabled,failedUpgrade:policy.failed,measured:policy.last??null,scope,transition:transition?.target??null})};
 game.autoQuality160=api;
 const context=game.performanceContext;
 game.performanceContext=function(...args){return {...context.apply(this,args),autoQuality160:api.report()};};
 game.disposers.push(()=>{disposed=true;cancel();game.vr.start=originalStart;renderer.observeFrame=originalObserve;game.setQuality=originalSet;game.performanceContext=context;renderer.webgl.xr.removeEventListener('sessionstart',xrStart);renderer.webgl.xr.removeEventListener('sessionend',xrEnd);game.overlay.start.querySelector('.experience-choice')?.removeEventListener('change',modeChange);delete game.autoQuality160;});
 return api;
}

function refreshRateOf(session){
 return Number.isFinite(session?.frameRate)&&session.frameRate>0?session.frameRate:72;
}

export function installOfficeAuto160(debug,host,apply,getSelected,getSession){
 let city;try{city=host.parent.__BARGHETO_CITY87__;}catch{}
 const policy=new QualityWindow160();let last=null,scope=null;
 const manual=()=>{policy.enabled=false;city?.autoQuality160?.manual();};
 const observer=debug.scene.onBeforeRenderObservable.add(()=>{
  const time=host.performance.now(),seconds=last===null?0:(time-last)/1000;last=time;
  const xr=!!host.Office97?.xrActive,session=xr?getSession():null;
  const active=debug.playing&&!host.document.hidden&&(!xr||session?.visibilityState==='visible');
  const rate=xr?refreshRateOf(session):0;
  const source=xr?'office-vr:'+rate:'office';
  if(city){
   if(city.officeSession.active)city.autoQuality160?.tick(seconds,source,active,true,rate);
   return;
  }
  if(!active||scope!==source){policy.reset();last=null;scope=source;return;}
  const action=policy.sample(seconds,rate),levels=['low','medium','high','ultra'],index=levels.indexOf(getSelected());
  if(action==='upgrade'&&index<3){apply(levels[index+1]);policy.promoted=true;}
  if(action==='rollback'&&index>1)apply(levels[index-1]);
 });
 debug.scene.onDisposeObservable.addOnce(()=>{debug.scene.onBeforeRenderObservable.remove(observer);});
 function beginXR(){
  if(city||!policy.enabled)return;
  policy.failed=false;policy.promoted=false;policy.reset();last=null;scope=null;
  apply('medium');
 }
 return {manual,beginXR};
}
