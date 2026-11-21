export const B_HOLD_MS190=2000;
// All deadlines use the monotonic XR application's clock, never clamped game dt.
// A short press fires on release; holding fires once in the first frame >= 2000ms.
export function createBButton190(now=()=>performance.now()){
 let source=null,armed=false,start=null,fired=false;
 function cancel(){source=null;armed=false;start=null;fired=false;}
 return{cancel,poll(input,enabled,onShort,onHold){
  if(!enabled||input?.handedness!=='right'||!input.gamepad){cancel();return;}
  const pressed=!!input.gamepad.buttons[5]?.pressed,time=now();
  if(source!==input){source=input;armed=!pressed;start=null;fired=false;}
  if(!armed){if(!pressed)armed=true;return;}
  if(pressed){if(start===null)start=time;if(!fired&&time-start>=B_HOLD_MS190){fired=true;onHold();}}
  else if(start!==null){const held=time-start;start=null;if(!fired){fired=true;if(held>=B_HOLD_MS190)onHold();else onShort();}fired=false;}
 },get progress(){return start===null?0:Math.min(1,Math.max(0,(now()-start)/B_HOLD_MS190));}};
}
export function installBButton190(game){
 const vr=game.vr,button=createBButton190();
 const orbitSpeed191=Number.isFinite(vr.intro?.orbitSpeed)&&vr.intro.orbitSpeed!==0?vr.intro.orbitSpeed:2*Math.PI/95;
 function startOverview(){
  if(!vr.active||game.officeSession?.active)return false;
  game.navigation113?.vrMap?.close();game.city.solarBess?.close();
  vr.resetForOverview190?.();
  for(const story of [game.coolerStory93,game.solarExpertStory107,game.greenAggregationStory108]){story?.closeMenu?.();story?.end?.();}
  game.city.expert?.speech?.stop();game.expertBills?.hide();
  game.input.clear();vr.cancelInput();vr.pending=null;vr.fade=0;
  vr.panel.visible=false;vr.marker.visible=false;vr.smallTitle.visible=false;
  vr.introReturnFeet.copy(vr.feet);vr.introReturnYaw=vr.rig.rotation.y;
  vr.enableIntro();game.vrDiagnostics187?.resumeOverview191();
  vr.intro.orbitSpeed=orbitSpeed191;vr.introPending=false;vr.intro.start();vr.blocked=false;vr.firstPose=false;
  // Do not add the original 4.4s entry blackout after the two-second gesture.
  vr.revealAge125=4.4;vr.camera.far=4000;vr.camera.updateProjectionMatrix();
  game.player.rig.root.visible=false;vr.notifyIntro();vr.updateIntroduction(0);
  game.cinematicAudio?.startOverview();game.time.resetAccumulator();return true;
 }
 function overview(){
  if(game.officeSession?.active)return game.officeContinuity119?.returnOverview190?.()??false;
  return startOverview();
 }
 const api={startOverview,overview,cancel:()=>button.cancel(),get progress(){return button.progress;},
  poll(source,{enabled=true,short=()=>vr.toggleMap125?.()}={}){button.poll(source,enabled,short,overview);},
  city(){const source=Array.from(vr.session?.inputSources||[]).find(s=>s.handedness==='right');this.poll(source,{enabled:vr.active&&vr.visible&&!!vr.session&&vr.session.visibilityState==='visible'&&!game.officeSession?.active});}
 };
 const cancel=vr.cancelInput,end=vr.onEnd;
 vr.cancelInput=function(...args){button.cancel();return cancel.apply(this,args);};
 vr.onEnd=function(...args){button.cancel();return end?.apply(this,args);};
 game.vrB190=api;game.disposers.push(()=>{button.cancel();delete game.vrB190;});return api;
}
