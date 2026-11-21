import {cityRenderState129,cityLayerActive129} from './xr-return-2.5.129.js';
export function installOfficeContinuity119(game,T){
 const office=game.officeSession,mp=game.multiplayer;if(!office||!mp)return;
 const originalSuspend=office.onSuspend,originalResume=office.onResume,originalClose=office.close.bind(office),originalRetry=office.retry.bind(office);
 let mode='city',generation=0,adapter=null,shared=null,savedFeet=null,savedHeading=0,wasVR=false,lastTick=0,dead=false,loadScene=null,loadPanel=null,loadTexture=null,loadCanvas=null,lastLoad='',lastCancel=false,resumeAt=0,returnDestination=null,attachTimer=0;
 let entryTimer128=0,loadingFrames133=0,loadingResolve133=null,loadingReject133=null,loadingReady133=null;
 function cancelLoading133(){loadingReject133?.(Error('ورود به ساختمان لغو شد.'));loadingResolve133=loadingReject133=null;}

 const selectRay=game.vr.onSelectRay,interact=game.vr.onInteract,blocked=game.vr.navigationBlocked;game.vr.onSelectRay=function(...args){return mode==='city'&&performance.now()>=resumeAt?selectRay?.apply(this,args):false;};game.vr.onInteract=function(...args){return mode==='city'&&performance.now()>=resumeAt?interact?.apply(this,args):false;};game.vr.navigationBlocked=()=>mode!=='city'||performance.now()<resumeAt||blocked?.();
 const valid=point=>point&&['x','y','z'].every(k=>Number.isFinite(point[k])&&Math.abs(point[k])<100);
 function switchSpace(space){if(mp.space119===space)return;mp.active=false;mp.moving=false;mp.resetPeers();mp.voiceFallback114?.setSpace119();mp.space119=space;mp.schedule?.(0);}
 function loading(label='در حال آماده‌سازی ساختمان برقتو',ratio=0){
  if(!T||!wasVR)return;if(!loadScene){loadScene=new T.Scene;loadCanvas=document.createElement('canvas');loadCanvas.width=1024;loadCanvas.height=320;loadTexture=new T.CanvasTexture(loadCanvas);loadTexture.colorSpace=T.SRGBColorSpace;loadPanel=new T.Mesh(new T.PlaneGeometry(1.8,.5625),new T.MeshBasicMaterial({map:loadTexture,depthTest:false,toneMapped:false}));loadPanel.renderOrder=10000;loadScene.add(loadPanel);}
  const key=label+Math.round(ratio*100);if(key===lastLoad)return;lastLoad=key;const c=loadCanvas.getContext('2d');c.fillStyle='#102b38';c.fillRect(0,0,1024,320);c.strokeStyle='#83d7bc';c.lineWidth=5;c.strokeRect(4,4,1016,312);c.direction='rtl';c.textAlign='center';c.fillStyle='#effff8';c.font='bold 40px Tahoma';c.fillText(label,512,100,970);c.font='27px Tahoma';c.fillText('برای بازگشت، دکمهٔ B کنترلر راست را بزنید',512,180,970);c.fillStyle='#38545f';c.fillRect(60,242,904,18);const progress=Math.max(0,Math.min(1,Number(ratio)||0)),w=904*progress,gradient=c.createLinearGradient(60,0,964,0);gradient.addColorStop(0,'#ffb35c');gradient.addColorStop(1,'#ff7f9b');c.fillStyle=gradient;c.fillRect(964-w,242,w,18);c.fillStyle='#effff8';c.font='25px Tahoma';c.fillText(new Intl.NumberFormat('fa-IR').format(Math.round(progress*100))+'٪',512,297);loadTexture.needsUpdate=true;
 }
 function loadFrame(time,frame){
  if(mode!=='opening'&&mode!=='attaching')return;
  // setAnimationLoop may also invoke the window clock. Render only XR frames.
  if(!frame)return;
  let tracked133=false;if(frame&&loadPanel){const pose=frame.getViewerPose(game.renderer.webgl.xr.getReferenceSpace());if(pose){tracked133=true;const p=pose.transform.position,q=pose.transform.orientation;game.vr.rig.updateWorldMatrix(true,false);loadPanel.position.set(p.x,p.y,p.z).applyMatrix4(game.vr.rig.matrixWorld);loadPanel.quaternion.copy(game.vr.rig.getWorldQuaternion(new T.Quaternion)).multiply(new T.Quaternion(q.x,q.y,q.z,q.w));loadPanel.translateZ(-1.6);}}
  // XRInputSourceArray is iterable, but does not provide Array.prototype.find.
  const pressed=!!Array.from(shared?.session?.inputSources??[]).find(s=>s.handedness==='right')?.gamepad?.buttons[5]?.pressed;if(pressed&&!lastCancel){office.close();return;}lastCancel=pressed;
  // Once the office owns the XR layer, the city must stop drawing its old
  // framebuffer. Keep this clock alive only for B/cancellation until ready.
  if(shared?.session&&!cityLayerActive129(shared.session,shared.renderState))return;
  if(loadScene){game.renderer.webgl.render(loadScene,game.camera.camera);
   if(tracked133&&loadingResolve133&&++loadingFrames133>=2){const resolve=loadingResolve133;loadingResolve133=loadingReject133=null;resolve();}
  }
 }
 function suspend(){
  generation++;returnDestination=null;mode='opening';wasVR=game.vr.active;
  if(wasVR){loadingFrames133=0;lastLoad='';loadingReady133=new Promise((resolve,reject)=>{loadingResolve133=resolve;loadingReject133=reject;});void loadingReady133.catch(()=>{});}
lastTick=0;savedFeet=(wasVR?game.vr.feet:game.player.position).clone();savedHeading=wasVR?game.vr.rig.rotation.y:game.camera.yaw;
  if(wasVR){clearTimeout(entryTimer128);entryTimer128=setTimeout(()=>{if(mode==='opening'||mode==='attaching'){office.close();game.vr.message='آماده‌سازی ساختمان کامل نشد؛ دوباره وارد شوید.';}},180000);}
  shared=wasVR?{session:game.vr.session||game.renderer.webgl.xr.getSession(),renderState:null}:null;
  if(shared?.session){const r=shared.session.renderState;shared.renderState={baseLayer:r.baseLayer,depthNear:r.depthNear,depthFar:r.depthFar,...(r.layers?{layers:[...r.layers]}:{})};}
  switchSpace('office');mp.active=false;mp.setWorldVisible(false);mp.updateVoice(performance.now());
  game.touch?.update(0,false,false);game.input.exitPointerLock();game.input.clear();game.player.controller.reset();game.officePortal.element.hidden=true;game.editor?.setAvailable(false);game.city.updateAudio(wasVR?game.vr.view:game.camera.camera,true,wasVR);game.cinematicAudio?.setPaused(true);
  for(const story of[game.coolerStory93,game.solarExpertStory107,game.greenAggregationStory108])story?.speech?.pause('environment');
  if(!wasVR){game.pause();game.renderer.webgl.setAnimationLoop(null);}else{loading('در حال آماده‌سازی ساختمان برقتو',.01);game.renderer.webgl.setAnimationLoop(loadFrame);}
  game.time.resetAccumulator();
 }
 function restoreRenderState(){if(!shared?.session||!game.vr.active)return;shared.session.updateRenderState(cityRenderState129(shared.renderState));}
 function beforeClose(){cancelLoading133();clearTimeout(entryTimer128);clearTimeout(attachTimer);mode='returning';generation++;adapter=null;const child=office.frame?.contentWindow;try{child?.Office97?.releaseSharedXR119?.();}catch(error){console.warn('Releasing office XR layer',error);}restoreRenderState();}
 function resume(ready){
  const returnVR=wasVR&&game.vr.active;mode='city';resumeAt=performance.now()+350;switchSpace('city');mp.setWorldVisible(true);
  if(returnVR){game.officePortal.resetEntry();game.input.clear();game.time.resetAccumulator();game.paused=false;game.manualPause=false;game.overlay.show('none');game.renderer.webgl.setAnimationLoop((time,frame)=>{if(frame){game.vr.update(0,frame);game.vr.place(savedFeet,savedHeading);const target=returnDestination;returnDestination=null;if(target)game.navigation113?.vrMap?.[target.id?'teleport':'teleportPoint'](target.id||target.point);}game.renderer.webgl.setAnimationLoop(game.frame);game.frame(time,frame);});}
  else originalResume?.(ready);
  shared=null;wasVR=false;
 }
 async function connect(){
  if(dead||!office.frame||mode!=='opening')return;const frame=office.frame,version=generation,child=frame.contentWindow;mode='attaching';
  adapter={
   getSnapshot(){if(mode!=='office'&&mode!=='attaching')return{peers:[],on:false,ready:false};const now=performance.now(),peers=[];for(const [id,p]of mp.peers){const pose=p.remote.buffer.sample(now);if(!pose?.active||(pose.space??'city')!=='office'||now-p.lastPoseAt>3000)continue;peers.push({id,name:p.remote.name||p.audio.dataset.name||'بازدیدکننده',role:p.remote.role||'guest',pose:{...pose,p:[...pose.p]}});}return{peers,on:mp.microphoneEnabled,ready:mp.microphoneReady,blocked:mp.playbackBlocked,joined:mp.joined,message:mp.voiceMessage,full:mp.full114};},
   tick(point,yaw,moving,immersive,speed,dt,active=true){if((mode!=='office'&&mode!=='attaching')||!valid(point)||!Number.isFinite(yaw)||!Number.isFinite(speed))return;const now=performance.now();if(now-lastTick<12)return;lastTick=now;mp.update(Math.min(.1,Math.max(0,dt||.016)),active,moving,new T.Vector3(point.x,point.y,point.z),yaw,immersive,Math.min(5,Math.max(0,speed)));},
   async toggleMicrophone(){if(mode!=='office'&&mode!=='attaching')return;await mp.toggleMicrophone();await mp.resumePlayback();},
   resumePlayback:()=>mp.resumePlayback(),
   avatarUrl:window.barghetoCityVehicleUrls?.['male-avatar']||window.barghetoCityServerMedia109?.['male-avatar-CCes6A5L.glb']||'',
  };
  try{child.Office97.connectCity119(adapter);if(shared?.session){frame.style.visibility='visible';loading('در حال اتصال نمای VR ساختمان',.97);if(typeof child.Office97.waitForXRFrame128!=='function')throw Error('تأیید آماده‌شدن نمای VR ساختمان موجود نیست.');const entering=child.Office97.enterSharedXR119(shared.session).then(()=>child.Office97.waitForXRFrame128());entering.then(()=>{if(version!==generation){child.Office97.releaseSharedXR119?.();restoreRenderState();}},()=>{});await Promise.race([entering,new Promise((_,reject)=>{attachTimer=setTimeout(()=>reject(Error('اتصال VR ساختمان کامل نشد.')),90000);})]);clearTimeout(attachTimer);if(version===generation)game.renderer.webgl.setAnimationLoop(null);}
   if(version!==generation||office.frame!==frame){child.Office97.releaseSharedXR119?.();return;}clearTimeout(entryTimer128);mode='office';office.loading?.remove();office.loading=null;frame.style.visibility='visible';frame.focus();
  }catch(error){if(version!==generation)return;console.error('Office continuity',error);game.vr.message='آماده‌سازی ساختمان کامل نشد؛ دوباره تلاش کنید.';if(wasVR&&game.vr.active&&shared?.session)office.close();else{beforeClose();originalClose(false);resume(false);}throw error;}
 }
 function destination(id,point){
  if(mode!=='office'||!game.vr.active)return false;
  if(id){if(!['supply','industry','solar','efficiency','hq','vpp'].includes(id))return false;returnDestination={id};}
  else {if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z)||!game.vr.mapPoint125?.(point))return false;returnDestination={point:{x:point.x,z:point.z}};}
  office.close();return true;
 }
 office.onSuspend=suspend;office.onResume=resume;office.continuity119={connect,destination,progress:loading,startLoading133:()=>loadingReady133||Promise.resolve(),get mode(){return mode;}};
 office.close=function(resumeCity=true){
  if(!this.frame)return;
  if(mode==='returning'&&resumeCity&&game.vr.active)return;
  if(resumeCity&&wasVR&&game.vr.active&&shared?.session){
   const frame=this.frame,ready=this.ready,session=shared.session,state=shared.renderState;
   beforeClose();const version=generation;game.vr.cancelInput?.();
   // Keep the office GL context alive until the browser commits the city's
   // restored layer. Immediate iframe disposal can leave the compositor blank.
   game.renderer.webgl.setAnimationLoop((time,xrFrame)=>{
    if(version!==generation||this.frame!==frame)return;
    if(!xrFrame||!cityLayerActive129(session,state))return;
    game.vr.update(0,xrFrame);game.vr.place(savedFeet,savedHeading);game.vr.cancelInput?.();
    originalClose(false);resume(ready);game.frame(time,xrFrame);
   });return;
  }
  beforeClose();return originalClose(resumeCity);
 };
 office.requestVRExit129=(token,source)=>{
  if(!office.frame||source!==office.frame.contentWindow||token!==office.token||!wasVR||!game.vr.active)return false;
  const current=office.frame;queueMicrotask(()=>{if(office.frame===current)office.close();});return true;
 };
 office.retry=function(){if(shared?.session){this.close();return;}return originalRetry();};
 const endVR=game.vr.onEnd;game.vr.onEnd=function(...args){if(mode!=='city')office.close();return endVR?.apply(this,args);};
 game.vr.enterOffice=async()=>{if(mode!=='city'||office.active)return false;void game.prefetchOffice99?.();return office.open(new URL(window.barghetoOffice.url,location.href));};
 const api={get mode(){return mode;},get sharedSession(){return shared?.session;},dispose(){dead=true;if(office.active)office.close(false);for(const o of[loadPanel]){o?.geometry.dispose();o?.material.dispose();}loadTexture?.dispose();office.onSuspend=originalSuspend;office.onResume=originalResume;}};game.officeContinuity119=api;game.disposers.push(()=>api.dispose());return api;
}
