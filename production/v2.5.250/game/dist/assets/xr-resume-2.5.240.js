// A visibility change is a suspended session, not a new game or a new wearer
// origin. Retain world placement and narrated tours while reacquiring input.
export function installXRResume240(game){
 const vr=game.vr;if(!vr)return null;
 const original={frame:game.frame,update:vr.update,activity:vr.onActivityChange,select:vr.onSelectRay,interact:vr.onInteract,intro:vr.selectIntro,blocked:vr.navigationBlocked};
 let session=null,ready=false,stable=0,lastActive=false,resumeAt=0,failures=0,lastFrameTime=null,slow=0,disposed=false;
 const now=()=>performance.now();
 function reset(reason){ready=false;stable=0;failures=0;lastFrameTime=null;slow=0;resumeAt=now();game.time.resetAccumulator();api.reason=reason;}
 function neutral(){for(const hand of vr.hands||[]){const p=hand.source?.gamepad;if(p&&!p.buttons[0]?.pressed&&!(hand.source.handedness==='right'&&p.buttons[4]?.pressed)){hand.needsRelease=false;hand.selectHandled=false;hand.buttons=p.buttons.map(b=>b.pressed);}}}
 const api={reason:'initial',get ready(){return ready;},get recovering(){return !ready;},lastError:null,recoveries:0,
  frameError(error){
   // Only known XR timing errors, only during reacquisition, and bounded.
   // Logic errors keep the normal visible error report rather than being hidden.
   if(!vr.active||now()-resumeAt>10000||!['InvalidStateError','AbortError'].includes(error?.name)||++failures>3)return false;
   api.lastError={name:error.name,message:String(error.message||error),at:now()};api.recoveries++;ready=false;stable=0;lastFrameTime=null;game.time.resetAccumulator();vr.cancelInput?.();return true;
  }};
 game.xrRecovery240=api;
 vr.onActivityChange=function(active){
  if(!active){if(lastActive||ready)reset('visibility-or-tracking');lastActive=false;}
  else if(!lastActive){reset('resuming');lastActive=true;}
  return original.activity?.call(this,active);
 };
 vr.update=function(dt,frame){
  if(this.session!==session){session=this.session;lastActive=false;reset('session');}
  const value=original.update.call(this,dt,frame);
  if(this.active&&this.visible&&frame){if(!ready&&++stable>=2){ready=true;failures=0;neutral();game.time.resetAccumulator();}else if(ready)neutral();}
  else if(ready||stable){reset('untracked');lastActive=false;}
  return value;
 };
 vr.onSelectRay=function(...args){return ready?original.select?.apply(this,args):false;};
 vr.onInteract=function(...args){return ready?original.interact?.apply(this,args):false;};
 vr.selectIntro=function(...args){return ready?original.intro?.apply(this,args):false;};
 vr.navigationBlocked=function(){return !ready||original.blocked?.call(this);};
 game.frame=function(time,frame){
  if(disposed)return original.frame.call(this,time,frame);
  if(vr.active&&!game.officeSession?.active){
   if(!frame||frame.session&&frame.session!==vr.session){game.time.resetAccumulator();return;}
   if(vr.session.visibilityState!=='visible'){
    if(lastActive||ready||stable){reset('not-visible');lastActive=false;vr.tracked=false;original.activity?.call(vr,false);vr.cancelInput?.();}
    game.time.resetAccumulator();return;
   }
   const reference=vr.renderer.xr.getReferenceSpace();let pose;
   try{pose=reference&&frame.getViewerPose(reference);}catch(error){if(api.frameError(error))return;throw error;}
   if(!pose){
    if(lastActive||ready||stable){reset('pose-unavailable');lastActive=false;vr.tracked=false;original.activity?.call(vr,false);vr.cancelInput?.();}
    game.time.resetAccumulator();return;
   }
   // Sample only uninterrupted visible XR frames, never the time spent off-head.
   if(ready&&lastFrameTime!==null){const dt=Math.max(0,(time-lastFrameTime)/1000),target=vr.session.frameRate||72;
    if(dt>0&&dt<.25&&game.autoQuality160?.policy?.enabled&&!game.vrDiagnostics187?.state.lockAuto){
     slow=dt>1/(target*.70)?slow+dt:Math.max(0,slow-dt*2);
     if(slow>=5){const levels=['low','medium','high','ultra'],index=levels.indexOf(game.settings.quality);if(index>0){const policy=game.autoQuality160.policy,enabled=policy.enabled;game.setQuality(levels[index-1]);policy.enabled=enabled;}slow=0;}
    }
   }
   lastFrameTime=time;
  }else lastFrameTime=null;
  return original.frame.call(this,time,frame);
 };
 game.disposers.push(()=>{disposed=true;game.frame=original.frame;vr.update=original.update;vr.onActivityChange=original.activity;vr.onSelectRay=original.select;vr.onInteract=original.interact;vr.selectIntro=original.intro;vr.navigationBlocked=original.blocked;delete game.xrRecovery240;});
 return api;
}
