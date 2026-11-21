// Active frame intervals only. Every scope change starts a fresh measurement.
export class QualityWindow160 {
 constructor(){this.reset();this.failed=false;this.promoted=false;this.enabled=true;}
 reset(){this.seconds=0;this.frames=0;this.binSeconds=0;this.binFrames=0;this.minimumFps=Infinity;this.stalls=0;}
 sample(seconds){
  if(!this.enabled||!Number.isFinite(seconds)||seconds<=0)return null;
  this.seconds+=seconds;this.frames++;this.binSeconds+=seconds;this.binFrames++;
  if(seconds>.1)this.stalls++;
  if(this.binSeconds>=1){this.minimumFps=Math.min(this.minimumFps,this.binFrames/this.binSeconds);this.binSeconds=0;this.binFrames=0;}
  const fps=this.frames/this.seconds;
  if(this.promoted&&this.seconds>=8&&fps<45){this.reset();this.failed=true;this.promoted=false;return 'rollback';}
  if(this.seconds<20)return null;
  const upgrade=!this.failed&&fps>=52&&this.minimumFps>=48&&this.stalls<=1;
  this.last={fps,minimumFps:this.minimumFps,seconds:this.seconds,stalls:this.stalls};
  this.reset();return upgrade?'upgrade':null;
 }
}

export function installAutoQuality160(game, presets){
 const policy=new QualityWindow160(),renderer=game.renderer;
 let internal=false,scope=null,transition=null,disposed=false;
 const originalSet=game.setQuality,originalObserve=renderer.observeFrame;
 const initialVR=game.settings.vrQuality160||'high';
 let webQuality=game.settings.quality;
 try{localStorage.setItem('mirasol.quality',initialVR);}catch{}
 function set(value){internal=true;let saved;try{saved=localStorage.getItem('mirasol.quality');}catch{}try{originalSet.call(game,value);}finally{internal=false;try{if(saved===null)localStorage.removeItem('mirasol.quality');else if(saved!==undefined)localStorage.setItem('mirasol.quality',saved);}catch{}}}
 function cancel(){if(transition){renderer.applyQuality(presets[game.settings.quality]);game.environment.applyQuality(renderer.qualityPreset);transition=null;}policy.reset();scope=null;}
 game.setQuality=function(value){if(!presets[value])return false;if(!internal){cancel();policy.enabled=false;}return originalSet.call(this,value);};
 function tick(seconds,source,active,office){
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
   const start=presets[game.settings.quality],target=presets[transition.target],blend=Math.min(1,(stage+1)/3);
   const partial={...start,pixelRatioCap:start.pixelRatioCap+(target.pixelRatioCap-start.pixelRatioCap)*blend,renderScale:start.renderScale+(target.renderScale-start.renderScale)*blend,adaptiveFloor:1};
   if(stage>=3)Object.assign(partial,{shadowMapSize:target.shadowMapSize,shadowDistance:target.shadowDistance});
   if(stage>=4)Object.assign(partial,{bloom:target.bloom,msaaSamples:target.msaaSamples});
   renderer.applyQuality(partial);game.environment.applyQuality(renderer.qualityPreset);
   return;
  }
  const action=policy.sample(seconds),levels=['low','medium','high','ultra'],index=levels.indexOf(game.settings.quality);
  if(action==='rollback'&&index>1){set(levels[index-1]);return;}
  if(action==='upgrade'&&index<3){
   // Building transitions use its normal setter at a frame boundary.
   if(office){set(levels[index+1]);policy.promoted=true;policy.reset();}
   else transition={target:levels[index+1],elapsed:0,stage:-1};
  }
 }
 renderer.observeFrame=function(seconds,paused){
  if(!transition)originalObserve.call(this,seconds,paused);
  tick(seconds,'city',!paused&&!document.hidden&&!game.vr.active&&!this.webgl.xr.isPresenting&&!game.officeSession.active&&game.enteredCity&&!game.cinematic.active&&!game.editor.active);
 };
 const modeChange=()=>{cancel();if(game.overlay.mode==='vr'){webQuality=game.settings.quality;set(initialVR);}else set(webQuality);};
 game.overlay.start.querySelector('.experience-choice')?.addEventListener('change',modeChange);
 const originalStart=game.vr.start;
 game.vr.start=function(...args){
  cancel();
  if(game.overlay.mode!=='vr'){webQuality=game.settings.quality;set(initialVR);}
  return originalStart.apply(this,args);
 };
 const xrStart=()=>cancel();
 const xrEnd=()=>{cancel();set(webQuality);};
 renderer.webgl.xr.addEventListener('sessionstart',xrStart);
 renderer.webgl.xr.addEventListener('sessionend',xrEnd);
 const api={policy,tick,manual(){policy.enabled=false;cancel();},report:()=>({enabled:policy.enabled,failedUpgrade:policy.failed,measured:policy.last??null,scope,transition:transition?.target??null})};
 game.autoQuality160=api;
 const context=game.performanceContext;
 game.performanceContext=function(...args){return {...context.apply(this,args),autoQuality160:api.report()};};
 game.disposers.push(()=>{disposed=true;cancel();game.vr.start=originalStart;renderer.observeFrame=originalObserve;game.setQuality=originalSet;game.performanceContext=context;renderer.webgl.xr.removeEventListener('sessionstart',xrStart);renderer.webgl.xr.removeEventListener('sessionend',xrEnd);game.overlay.start.querySelector('.experience-choice')?.removeEventListener('change',modeChange);delete game.autoQuality160;});
 return api;
}

export function installOfficeAuto160(debug,host,apply,getSelected){
 let city;try{city=host.parent.__BARGHETO_CITY87__;}catch{}
 const policy=new QualityWindow160();let last=null;
 if(!city&&!host.Office97?.xrActive)apply('medium');
 const select=host.document.querySelector('select[aria-label="کیفیت تصویر"]');
 const manual=()=>{policy.enabled=false;city?.autoQuality160?.manual();};
 select?.addEventListener('change',manual);
 const observer=debug.scene.onBeforeRenderObservable.add(()=>{
  const time=host.performance.now(),seconds=last===null?0:(time-last)/1000;last=time;
  const active=debug.playing&&!host.document.hidden&&!host.Office97?.xrActive;
  if(city){city.autoQuality160?.tick(seconds,'office',active,true);return;}
  if(!active){policy.reset();last=null;return;}
  const action=policy.sample(seconds),levels=['low','medium','high','ultra'],index=levels.indexOf(getSelected());
  if(action==='upgrade'&&index<3){apply(levels[index+1]);policy.promoted=true;}
  if(action==='rollback'&&index>1)apply(levels[index-1]);
 });
 debug.scene.onDisposeObservable.addOnce(()=>{select?.removeEventListener('change',manual);debug.scene.onBeforeRenderObservable.remove(observer);});
}
