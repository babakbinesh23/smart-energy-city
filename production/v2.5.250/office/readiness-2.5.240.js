import {createVisibleDeadline240} from '../game/dist/assets/xr-deadline-2.5.240.js';
// Model loads have already completed. Only enabled renderable room meshes,
// their geometry/materials/textures and the active camera gate entry. Hidden
// editor/templates and unrelated global effect caches must not block the room.
export function officeSceneReady136(scene){
 if(scene.isDisposed)return false;
 for(const mesh of scene.meshes||[]){
  if(mesh.isEnabled?.()===false||mesh.isVisible===false||mesh.visibility===0||!mesh.subMeshes?.length)continue;
  if(!mesh.isReady(true))return false;
 }
 return scene.activeCamera?.isReady?.(true)!==false;
}
export async function waitOfficeScene131(scene,{limit=30000,progress=()=>{},now=()=>performance.now(),wait=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 const started=now();let stable=0;
 while(stable<2){
  if(scene.isDisposed)throw Error('آماده‌سازی ساختمان لغو شد.');
  // Drive shader/texture preparation while the module is awaiting boot. This
  // is before XR adoption; immersive renders stay on the real XR frame clock.
  scene.incrementRenderId();scene.render?.(false);
  stable=officeSceneReady136(scene)?stable+1:0;
  if(stable===2)return;
  if(now()-started>=limit)throw Error('اجزای قابل نمایش اتاق آماده نشدند؛ با B برگردید و دوباره تلاش کنید.');
  progress(.92,'آماده‌سازی اجزای نمای اتاق');await wait(32);
 }
}

// Only the immersive office uses this curtain. DOM loading cards are invisible
// inside a headset, so both XR renderers own a matching card during handoff.
export function officeXRLoading131(debug,api,lib,{limit=75000,session240=null}={}){
 const scene=debug.scene,helper=api.helper,camera=helper.baseExperience.camera;
 const background=lib.MeshBuilder.CreatePlane('office133-loading-background',{width:12,height:12,sideOrientation:2},scene);
 const panel=lib.MeshBuilder.CreatePlane('office133-loading-panel',{width:1.75,height:.546875,sideOrientation:2},scene);
 const texture=new lib.DynamicTexture('office133-loading-label',{width:1024,height:320},scene,false);
 const bg=new lib.StandardMaterial('office133-loading-background-material',scene),mat=new lib.StandardMaterial('office133-loading-panel-material',scene);
 for(const material of[bg,mat]){material.disableLighting=true;material.backFaceCulling=false;material.depthFunction=519;material.emissiveColor=lib.Color3.White();}
 bg.emissiveColor=new lib.Color3(.035,.065,.085);mat.diffuseTexture=texture;
 background.material=bg;panel.material=mat;
 for(const mesh of[background,panel]){mesh.parent=camera;mesh.isPickable=false;mesh.position.z=scene.useRightHandedSystem===false?.8:-.8;}
 background.renderingGroupId=2;panel.renderingGroupId=3;
 const c=texture.getContext();
 function paint(ratio,label){
  c.fillStyle='#102b38';c.fillRect(0,0,1024,320);c.strokeStyle='#83d7bc';c.lineWidth=5;c.strokeRect(4,4,1016,312);c.direction='rtl';c.textAlign='center';c.fillStyle='#effff8';c.font='bold 40px Tahoma';c.fillText('در حال آماده‌سازی ساختمان برقتو',512,85,970);c.font='26px Tahoma';c.fillText(label,512,155,970);c.fillText('برای بازگشت، دکمهٔ B کنترلر راست را بزنید',512,205,970);c.fillStyle='#38545f';c.fillRect(60,242,904,18);const gradient=c.createLinearGradient(60,0,964,0);gradient.addColorStop(0,'#ffb35c');gradient.addColorStop(1,'#ff7f9b');c.fillStyle=gradient;c.fillRect(964-904*ratio,242,904*ratio,18);c.fillStyle='#effff8';c.font='25px Tahoma';c.fillText(new Intl.NumberFormat('fa-IR').format(Math.round(ratio*100))+'٪',512,297);texture.update(true);
 }
 paint(.97,'اتصال نمای اتاق در VR');
 let observer,timer,finished=false,rendered=0,revealed=false,lastTimestamp=null,lastFrame=null,resolveWait,rejectWait;
 const promise=new Promise((resolve,reject)=>{resolveWait=resolve;rejectWait=reject;});
 void promise.catch(()=>{});
 function finish(error){if(finished)return;finished=true;timer?.cancel();scene.onAfterRenderObservable.remove(observer);background.dispose();panel.dispose();bg.dispose();mat.dispose();texture.dispose();if(error)rejectWait(error);else resolveWait();}
 observer=scene.onAfterRenderObservable.add(()=>{
  const manager=helper.baseExperience.sessionManager,frame=manager.currentFrame;
  let tracked=false;
  try{tracked=manager.inXRFrameLoop===true&&!!frame?.getViewerPose(manager.referenceSpace);}catch{}
  if(helper.baseExperience.state!==2||!tracked||api.poseAligned133===false||!officeSceneReady136(scene)){
   rendered=0;if(revealed){revealed=false;background.setEnabled(true);panel.setEnabled(true);}return;
  }
  // A desktop render or multiple renders of the same XR frame cannot unlock
  // movement. The first complete revealed frame must reach the XR layer.
  const timestamp=manager.currentTimestamp;if(Number.isFinite(timestamp)){if(timestamp===lastTimestamp)return;lastTimestamp=timestamp;}else{if(frame===lastFrame)return;lastFrame=frame;}
  if(revealed){finish();return;}
  if(++rendered===1){paint(.99,'نمای اتاق آماده است');window.Office99Progress?.(.99,'آماده‌سازی آخرین فریم اتاق');}
  if(rendered>=2){background.setEnabled(false);panel.setEnabled(false);revealed=true;}
 });
 timer=createVisibleDeadline240(session240||helper.baseExperience.sessionManager.session,limit,()=>finish(Error('نمای VR ساختمان کامل آماده نشد؛ با B به شهر برگردید.')));
 return{promise,cancel:()=>finish(Error('ورود به ساختمان لغو شد.'))};
}
