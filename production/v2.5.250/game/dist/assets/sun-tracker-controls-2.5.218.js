import {TrackerDriveAudio209} from './tracker-drive-audio-2.5.212-media223.js';
import {TRACKERS207} from './sun-trackers-2.5.218-media223.js';
export function installSunTracking207(game,T,{safeSpawn}={}){
 const trackers=game.city.sunTrackers207,bess=game.city.solarBess;if(!trackers||!bess)return null;
 const driveAudio=new TrackerDriveAudio209(game,T,trackers);
 let disposed=false,preview=null,manual=false,reopen=0,generation=0,lastButtonModal=null,lastButtonState=null;
 const camera=game.camera.camera,viewPosition=new T.Vector3().fromArray(TRACKERS207.view.position),target=new T.Vector3().fromArray(TRACKERS207.view.target);
 const viewRotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(viewPosition,target,new T.Vector3(0,1,0)));
 function fitView(){const offset=new T.Vector3().fromArray(TRACKERS207.view.position).sub(target),half=Math.atan(Math.tan(26*Math.PI/180)*Math.min(1,Math.max(.3,camera.aspect)));const distance=Math.max(offset.length(),22.1/Math.sin(half));viewPosition.copy(target).addScaledVector(offset.normalize(),distance);viewRotation.setFromRotationMatrix(new T.Matrix4().lookAt(viewPosition,target,new T.Vector3(0,1,0)));}fitView();
 const orbitOffset=new T.Vector3(),orbitUp209=new T.Vector3(0,1,0);
 function cinematicPose209(age){const angle=game.cinematic.motionReduced?0:.10*Math.sin(Math.min(1,Math.max(0,age-.9)/14)*Math.PI/2);camera.position.copy(target).add(orbitOffset.copy(viewPosition).sub(target).applyAxisAngle(orbitUp209,angle));camera.lookAt(target);}
 
 const host=game.renderer.canvas.parentElement,shield=document.createElement('div'),bar=document.createElement('div');shield.hidden=true;shield.style.cssText='position:absolute;inset:0;z-index:100500;pointer-events:auto';host.append(shield);bar.hidden=true;bar.dir='rtl';bar.style.cssText='position:absolute;bottom:26px;left:50%;transform:translateX(-50%);z-index:100501;padding:10px 14px;background:#112c32ed;border:1px solid #74b59c;border-radius:14px;color:white;font:14px Vazirmatn,Tahoma;display:flex;gap:10px;align-items:center;pointer-events:auto;max-width:calc(100% - 20px);width:max-content;flex-wrap:wrap;justify-content:center';bar.innerHTML='<span>نمای پنل‌های متحرک</span><button data-track207="off">Track off</button><button data-track207="on">Track on</button><button data-return207>بازگشت</button>';
 for(const b of bar.querySelectorAll('button'))b.style.cssText='font:inherit;color:white;background:#22594c;border:1px solid #94c6af;border-radius:8px;padding:7px 12px;cursor:pointer';host.append(bar);bar.style.display='none';
 function syncButtons(modal=bess.runtime.data?.modal,force=false){if(!force&&modal===lastButtonModal&&trackers.enabled===lastButtonState)return;lastButtonModal=modal;lastButtonState=trackers.enabled;for(const b of modal?.querySelectorAll('[data-bess-set-suntrack207]')??[]){const on=b.dataset.bessSetSuntrack207==='on';b.disabled=false;b.title=on?'حرکت آرام دو پنل به سمت خورشید':'برگشت آرام دو پنل به وضعیت رو به پایین';b.classList.toggle('active',trackers.enabled===on);b.setAttribute('aria-pressed',String(trackers.enabled===on));}for(const b of bar.querySelectorAll('[data-track207]'))b.setAttribute('aria-pressed',String(trackers.enabled===(b.dataset.track207==='on')));}
 const configure=bess.configureModal;
 bess.configureModal=function(modal){const result=configure.call(this,modal);for(const b of modal.querySelectorAll('[data-bess-set-suntrack207]')){b.onclick=()=>startPreview(b.dataset.bessSetSuntrack207==='on');}syncButtons(modal,true);return result;};
 function finish(){const p=preview;if(!p)return;preview=null;shield.hidden=true;bar.hidden=true;bar.style.display='none';game.paused=p.paused;game.input.clear();game.time.resetAccumulator();if(!p.vr){game.freeCamera=p.freeCamera;camera.position.copy(p.returnPose.position);camera.quaternion.copy(p.returnPose.rotation);camera.fov=p.returnPose.fov;camera.updateProjectionMatrix();game.camera.reset();if(p.reopen)reopen=3;}else if(p.reopen)reopen=3;syncButtons();}
 function returnPreview(){if(!preview)return;const p=preview;if(p.vr){if(p.returning||game.vr.pending||game.vr.fade>0)return;p.returning=true;const vr=game.vr,g=++generation;vr.queue(()=>{if(disposed||g!==generation)return;vr.eyeOffset=p.eyeOffset;vr.place(p.feet,p.yaw);vr.syncView();finish();});}else if(p.phase!=='out'){p.phase='out';p.age=0;p.fromPosition=camera.position.clone();p.fromRotation=camera.quaternion.clone();}}
 function pausedBeforeModal(){return bess.isOpen?!!bess.runtime.data.previousPaused:game.paused;}
 function observerSpawn(){const feature=game.city.features.get('solar'),area=feature.areas[0];return safeSpawn({feature:{...feature,entry:{x:34.5,z:-137.5,heading:Math.PI}},area,point:new T.Vector3()});}
 function startPreview(on){
  if(disposed||game.officeSession.active)return false;fitView();
  manual=true;
  if(preview){preview.age=0;preview.command=on;if(!preview.vr&&preview.phase!=='hold'){preview.phase='in';preview.started=false;preview.fromPosition=camera.position.clone();preview.fromRotation=camera.quaternion.clone();}else{trackers.setEnabled(on);if(!preview.vr)preview.phase='hold';}syncButtons();return true;}
  const p={vr:!!game.vr.active,paused:pausedBeforeModal(),reopen:bess.isOpen,freeCamera:game.freeCamera,returnPose:{position:camera.position.clone(),rotation:camera.quaternion.clone(),fov:camera.fov},fromPosition:camera.position.clone(),fromRotation:camera.quaternion.clone(),phase:'in',age:0,command:on,started:false};
  if(p.vr){const vr=game.vr;if(vr.pending||vr.fade>0)return false;let spawn;try{spawn=observerSpawn();}catch(error){console.warn('Tracker observation point unavailable',error);trackers.setEnabled(on);return false;}
   p.feet=vr.feet.clone();p.yaw=vr.rig.rotation.y;p.eyeOffset=vr.eyeOffset;p.ready=false;game.vrTours125?.cancel(false);bess.close();game.paused=true;preview=p;
   const g=++generation;vr.queue(()=>{if(disposed||g!==generation)return;vr.eyeOffset=p.eyeOffset+12;vr.place(spawn.feet,spawn.heading-Math.PI);vr.syncView();p.ready=true;p.age=0;});
  }else{bess.close();game.paused=true;game.input.clear();game.input.exitPointerLock();preview=p;shield.hidden=false;bar.hidden=false;bar.style.display='flex';}
  syncButtons();return true;
 }
 bar.querySelectorAll('[data-track207]').forEach(b=>{b.onclick=()=>startPreview(b.dataset.track207==='on');});bar.querySelector('[data-return207]').onclick=returnPreview;
 // Preserve normal arrival and its access checks; the solar destination has
 // no tracker tour. The only tour entry is a Track on/off LCD action.
 const requestEntry=game.cinematic.requestEntry;
 game.cinematic.requestEntry=function(hit=this.hoverHit){const phase=this.phase;const result=requestEntry.call(this,hit);if(hit?.feature.id==='solar'&&phase==='orbit'&&this.phase==='descent')this.finish();return result;};
 const blocked=game.vr.navigationBlocked;game.vr.navigationBlocked=function(){return !!preview||blocked?.call(this);};
 function tick(dt){
  if(disposed)return;dt=Math.max(0,Math.min(.1,Number(dt)||0));
  if(reopen){if(--reopen===0&&game.enteredCity&&!game.cinematic.active&&!game.officeSession.active){bess.open();syncButtons();}}
  if(preview){const p=preview;if(p.vr&&!game.vr.active){game.vr.eyeOffset=p.eyeOffset;finish();return;}if(game.officeSession.active){returnPreview();return;}
   if(!p.vr||p.ready&&!game.vr.pending&&game.vr.fade<=0){p.age+=dt;if(!p.started&&p.age>=.9){p.started=true;trackers.setEnabled(p.command);p.phase='hold';}
    if(p.phase==='hold'&&((p.age>2&&trackers.settled)||p.age>24))returnPreview();
    if(!p.vr){const t=Math.min(1,p.age/.9),ease=t*t*(3-2*t);if(p.phase==='in'){camera.position.lerpVectors(p.fromPosition,viewPosition,ease);camera.quaternion.slerpQuaternions(p.fromRotation,viewRotation,ease);camera.fov=p.returnPose.fov+(52-p.returnPose.fov)*ease;}else if(p.phase==='hold'){cinematicPose209(p.age);camera.fov=52;}else{camera.position.lerpVectors(p.fromPosition,p.returnPose.position,ease);camera.quaternion.slerpQuaternions(p.fromRotation,p.returnPose.rotation,ease);camera.fov=52+(p.returnPose.fov-52)*ease;if(t>=1)finish();}camera.clearViewOffset();camera.updateProjectionMatrix();camera.updateMatrixWorld(true);}
   }
  }
  if(!document.hidden&&!game.officeSession.active&&(!game.paused||preview||bess.isOpen))trackers.update(dt);
  driveAudio.update(game.vr.active?game.vr.view:camera,dt,!game.officeSession.active&&!document.hidden&&(!game.vr.active||game.vr.visible!==false)&&(!game.paused||!!preview||bess.isOpen));
  syncButtons();
 }
 const render=game.renderer.render;game.renderer.render=function(...args){tick(game.time.rawDelta);return render.apply(this,args);};
 const key=e=>{if(preview&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();returnPreview();}};window.addEventListener('keydown',key,true);
 const api={startPreview,returnPreview,tick,trackers,driveAudio,get previewing(){return!!preview;},get manual(){return manual;},dispose(){if(disposed)return;disposed=true;driveAudio.dispose();++generation;if(preview?.vr)game.vr.eyeOffset=preview.eyeOffset;if(preview)finish();game.renderer.render=render;bess.configureModal=configure;game.cinematic.requestEntry=requestEntry;game.vr.navigationBlocked=blocked;bar.remove();shield.remove();window.removeEventListener('keydown',key,true);}};
 game.sunTracking207=api;game.disposers.push(()=>api.dispose());return api;
}
