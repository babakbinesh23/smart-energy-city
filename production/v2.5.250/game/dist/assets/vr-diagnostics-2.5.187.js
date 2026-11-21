export const diagnosticDefaults187=()=>({rate:72,scale:0,shadows:true,lockAuto:false,freezeOverview:false});
export function frameStats187(samples,rate){
 if(!samples.length)return null;const sorted=[...samples].sort((a,b)=>a-b),mean=samples.reduce((a,b)=>a+b,0)/samples.length;
 return{fps:1000/mean,mean,p95:sorted[Math.ceil(sorted.length*.95)-1],late:rate>0?100*samples.filter(t=>t>1500/rate).length/samples.length:null,count:samples.length};
}
export function installXRDiagnostics187(game,api){
 const key='bargheto-vr-diagnostics-v1',defaults=diagnosticDefaults187();let state={...defaults};
 try{const s=JSON.parse(localStorage.getItem(key));for(const k of ['shadows','lockAuto','freezeOverview'])if(typeof s?.[k]==='boolean')state[k]=s[k];if([0,.65,.8,1,1.2,1.4].includes(s?.scale))state.scale=s.scale;if(Number.isFinite(s?.rate)&&s.rate>=60&&s.rate<=144)state.rate=s.rate;}catch{}
 let session=null,samples=[],scope='',notice='',busy=false,baseline=null,autoSaved=null,shadowSaved=null,office=null,lastOffice=null;
 const rates=()=>Array.from(session?.supportedFrameRates||[]).filter(n=>Number.isFinite(n)&&n>0);
 function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
 async function requestRate(s=session){
  if(!s?.updateTargetFrameRate||!Array.from(s.supportedFrameRates||[]).includes(state.rate)){notice='این نرخ در نشست فعلی پشتیبانی نمی‌شود';return false;}
  if(busy)return false;busy=true;const wanted=state.rate;
  try{await s.updateTargetFrameRate(wanted);notice='درخواست نرخ ثبت شد؛ نرخ واقعی را پایین ببین';samples=[];return true;}
  catch{notice='مرورگر تغییر نرخ را نپذیرفت';return false;}finally{busy=false;}
 }
 function sample(ms,source,visible){
  if(scope!==source){scope=source;samples=[];return;}
  if(!visible){samples=[];return;}
  if(Number.isFinite(ms)&&ms>0){samples.push(ms);if(samples.length>180)samples.shift();}
 }
 function overrides(){
  if(!game.vr.active)return;
  const policy=game.autoQuality160?.policy;
  if(state.lockAuto&&policy){if(autoSaved===null)autoSaved=policy.enabled;game.autoQuality160.manual();}
  else if(autoSaved!==null&&policy){policy.enabled=autoSaved;policy.reset();autoSaved=null;}
  if(!state.shadows){if(shadowSaved===null)shadowSaved=game.renderer.webgl.shadowMap.enabled;game.renderer.webgl.shadowMap.enabled=false;}
  else if(shadowSaved!==null){game.renderer.webgl.shadowMap.enabled=shadowSaved;shadowSaved=null;game.shadowOptimization156?.invalidate();}
 }
 const update=game.vr.update,end=game.vr.onEnd,intro=game.vr.updateIntroduction;
 game.vr.updateIntroduction=function(dt){const speed=this.intro?.orbitSpeed;if(state.freezeOverview&&this.intro)this.intro.orbitSpeed=0;try{return intro.call(this,dt);}finally{if(this.intro&&speed!==undefined)this.intro.orbitSpeed=speed;}};
 game.vr.update=function(dt,frame){const result=update.call(this,dt,frame);if(this.active&&frame){if(session!==this.session){session=this.session;samples=[];scope='';}overrides();sample(game.time.rawDelta*1000,'city',this.visible);}return result;};
 function restore(){if(autoSaved!==null&&game.autoQuality160?.policy){game.autoQuality160.policy.enabled=autoSaved;game.autoQuality160.policy.reset();autoSaved=null;}if(shadowSaved!==null){game.renderer.webgl.shadowMap.enabled=shadowSaved;shadowSaved=null;}}
 game.vr.onEnd=function(...args){restore();session=null;samples=[];return end?.apply(this,args);};
 game.vr.requestRate187=requestRate;
 const oldChange=api.change;
 function change(id){
  if(id==='diag:rate'){const list=rates();if(!list.length||busy)return false;state.rate=list[(list.indexOf(state.rate)+1)%list.length];persist();void requestRate();return true;}
  if(id==='diag:scale'){const values=[0,.65,.8,1,1.2,1.4];state.scale=values[(values.indexOf(state.scale)+1)%values.length];persist();api.qualityChanged157();return true;}
  if(id==='diag:baseline'){baseline={...report(),image:api.state};notice='نمونهٔ مقایسه ذخیره شد';return true;}
  if(id==='diag:measure'){samples=[];baseline=null;notice='اندازه‌گیری از نو شروع شد';return true;}
  const k=id.slice(5);if(id.startsWith('diag:')&&['shadows','lockAuto','freezeOverview'].includes(k)){state[k]=!state[k];persist();overrides();return true;}
  if(id==='reset'){state=diagnosticDefaults187();persist();restore();samples=[];baseline=null;if(session)void requestRate();}
  return oldChange(id);
 }
 function report(){return{settings:{...state},scope,requestedHz:state.rate,actualHz:session?.frameRate??null,supportedHz:rates(),stats:frameStats187(samples,session?.frameRate),notice,activeScale:api.activeScale,pendingScale:api.pendingEdges};}
 const diagnostics={get state(){return{...state}},get baseline(){return baseline},get busy(){return busy},report,requestRate,
  attach(debug,helper){const current={debug,helper,shadow:null};office=current;lastOffice=null;
   const observer=debug.scene.onBeforeRenderObservable.add(()=>{const manager=helper.baseExperience.sessionManager;if(!manager.inXRSession){if(current.shadow!==null){debug.scene.shadowsEnabled=current.shadow;current.shadow=null;}lastOffice=null;return;}session=manager.session||game.vr.session;overrides();const now=performance.now();sample(lastOffice===null?0:now-lastOffice,'office',session?.visibilityState==='visible');lastOffice=now;
    if(!state.shadows){if(current.shadow===null)current.shadow=debug.scene.shadowsEnabled;debug.scene.shadowsEnabled=false;}else if(current.shadow!==null){debug.scene.shadowsEnabled=current.shadow;current.shadow=null;}
   });return()=>{debug.scene.onBeforeRenderObservable.remove(observer);if(current.shadow!==null)debug.scene.shadowsEnabled=current.shadow;if(office===current)office=null;lastOffice=null;};
  }};
 api.change=change;game.vrDiagnostics187=diagnostics;api.diagnostics187=diagnostics;
 const context=game.performanceContext;game.performanceContext=function(...args){return{...context.apply(this,args),vrDiagnostics187:{...report(),baseline}};};
 game.disposers.push(()=>{restore();game.vr.update=update;game.vr.onEnd=end;game.vr.updateIntroduction=intro;delete game.vr.requestRate187;delete game.vrDiagnostics187;api.change=oldChange;});return diagnostics;
}
