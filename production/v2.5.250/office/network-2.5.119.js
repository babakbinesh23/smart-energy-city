/* The city owns identity, signaling and audio. This scene only reports pose and draws peers. */
export async function createOfficeNetwork119(debug,loadAvatar){
 const lib=await import(new URL('xr-babylon-8.46.2.js',new URL(window.OfficeHost97.assetBase,location.href)));lib.installEngineExtensions97(debug.engine);
 const {TransformNode,MeshBuilder,StandardMaterial,DynamicTexture,Color3,Vector3,Quaternion}=lib,scene=debug.scene,peers=new Map();let adapter=null,disposed=false,clock=0,avatarPromise=null,lastPos=null,statusClock=0,lastStatus='',snapshot={peers:[],on:false,ready:false};
 const ui=document.createElement('div');ui.id='office119-social';ui.dir='rtl';ui.style.cssText='position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:18;display:flex;flex-wrap:wrap;align-items:center;gap:8px;max-width:calc(100vw - 24px);font:12px Vazirmatn,Tahoma,sans-serif';
 const mic=document.createElement('button');mic.type='button';mic.setAttribute('aria-label','روشن‌کردن میکروفن');mic.style.cssText='border:1px solid #84b8aa;background:#163b43ed;color:#effff8;min-height:42px;padding:8px 12px';
 const hear=document.createElement('button');hear.type='button';hear.textContent='فعال‌کردن شنیدن صدا';hear.hidden=true;
 const status=document.createElement('span');status.setAttribute('role','status');status.style.cssText='background:#102832e8;color:#e8f7f3;padding:8px 12px;border-radius:10px;max-width:240px';ui.append(mic,hear,status);document.body.append(ui);
 const style=document.createElement('style');style.textContent='@media(pointer:coarse),(max-width:700px){#office119-social{bottom:max(280px,calc(env(safe-area-inset-bottom) + 268px))!important;left:12px!important;right:12px;justify-content:flex-end}#office119-social span{font-size:10px;max-width:180px}}';document.head.append(style);
 function material(name,color){const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.maxSimultaneousLights=4;return m;}
 const clothes=material('office119-clothes','#356f96'),skin=material('office119-skin','#c99974'),trousers=material('office119-trousers','#263441');
 function makePeer(person){
  const root=new TransformNode('office119-peer-'+person.id,scene);root.metadata={remotePlayer119:true};const fallback=new TransformNode('office119-fallback',scene);fallback.parent=root;
  const part=(name,options,y,mat)=>{const mesh=MeshBuilder.CreateCapsule(name,options,scene);mesh.parent=fallback;mesh.position.y=y;mesh.material=mat;mesh.isPickable=false;return mesh;};
  part('torso',{height:.72,radius:.22,tessellation:8},1.1,clothes);const head=MeshBuilder.CreateSphere('head',{diameter:.31,segments:8},scene);head.parent=fallback;head.position.y=1.68;head.material=skin;head.isPickable=false;
  const limbs=[];for(const side of[-1,1]){const leg=part('leg',{height:.75,radius:.085,tessellation:6},.45,trousers);leg.position.x=side*.12;const arm=part('arm',{height:.62,radius:.065,tessellation:6},1.08,clothes);arm.position.x=side*.31;limbs.push({leg,arm,side});}
  const labelTexture=new DynamicTexture('office119-label',{width:768,height:128},scene,false),labelMaterial=new StandardMaterial('office119-label',scene);labelMaterial.diffuseTexture=labelTexture;labelMaterial.emissiveColor=Color3.White();labelMaterial.disableLighting=true;labelMaterial.backFaceCulling=false;
  const label=MeshBuilder.CreatePlane('office119-player-name',{width:1.6,height:.267,sideOrientation:2},scene);label.parent=root;label.position.y=2.08;label.material=labelMaterial;label.isPickable=false;
  const peer={root,fallback,label,labelTexture,labelMaterial,limbs,models:null,joints:[],caption:'',phase:0,disposed:false};peers.set(person.id,peer);void attachAvatar(peer,person.id);return peer;
 }
 async function attachAvatar(peer,id){
  const url=adapter?.avatarUrl;if(!url)return;
  try{avatarPromise??=loadAvatar(url);const container=await avatarPromise;if(disposed||peer.disposed||peers.get(id)!==peer)return;
   const instance=container.instantiateModelsToScene(name=>'office119-'+id+'-'+name,false,{doNotInstantiate:true}),pivot=new TransformNode('office119-avatar',scene);pivot.parent=peer.root;for(const node of instance.rootNodes)node.parent=pivot;
   pivot.computeWorldMatrix(true);const bounds=pivot.getHierarchyBoundingVectors(true),height=bounds.max.y-bounds.min.y;if(!(height>.1&&Number.isFinite(height)))throw Error('Invalid remote avatar');const scale=1.85/height;pivot.scaling.setAll(scale);pivot.position.set(-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
   for(const mesh of pivot.getChildMeshes()){mesh.isPickable=false;mesh.receiveShadows=false;}
   for(const node of pivot.getDescendants()){const key=node.name.replace('office119-'+id+'-','').replace(/_\d+$/,'');if(['LeftUpLeg','RightUpLeg','LeftArm','RightArm'].includes(key)&&node.rotationQuaternion)peer.joints.push({node,rest:node.rotationQuaternion.clone(),side:key.startsWith('Left')?1:-1,arm:key.endsWith('Arm')});}
   peer.models={pivot,instance};peer.fallback.setEnabled(false);
  }catch(error){avatarPromise=null;console.warn('Office visitor avatar uses fallback',error.message);}
 }
 function removePeer(id){const p=peers.get(id);if(!p)return;p.disposed=true;p.root.dispose(false,false);p.labelTexture.dispose();p.labelMaterial.dispose();p.models?.instance.animationGroups?.forEach(a=>a.dispose());p.models?.instance.skeletons?.forEach(s=>s.dispose());peers.delete(id);}
 function caption(p,person){const text=(person.pose.muted?'🔇 ':'🎙 ')+person.name+(person.role==='admin'?' · ادمین':'');if(text===p.caption)return;p.caption=text;const c=p.labelTexture.getContext();c.clearRect(0,0,768,128);c.fillStyle='#102c38eF';c.fillRect(0,0,768,128);c.direction='rtl';c.textAlign='center';c.fillStyle='#effff8';c.font='bold 36px Tahoma';c.fillText(text,384,83,740);p.labelTexture.update(true);}
 function update(dt){
  if(disposed)return;clock+=dt;const vr=!!window.Office97?.xrActive;ui.hidden=vr||!!debug.editor.selected;
  const point=debug.pos,p=lastPos,elapsed=Math.max(.001,dt),speed=p?Math.min(5,Math.hypot(point.x-p.x,point.z-p.z)/elapsed):0;lastPos={x:point.x,y:point.y,z:point.z};adapter?.tick(point,debug.yaw,speed>.04,vr,speed,dt,debug.playing);snapshot=adapter?.getSnapshot()||{peers:[],on:false,ready:false,joined:false};
  const present=new Set(snapshot.peers.map(p=>p.id));for(const id of peers.keys())if(!present.has(id))removePeer(id);
  const camera=scene.activeCamera,eye=camera.getWorldMatrix().getTranslation();
  for(const person of snapshot.peers){const p=peers.get(person.id)||makePeer(person),pose=person.pose;p.root.position.set(...pose.p);p.root.rotation.y=pose.yaw;p.phase+=dt*Math.max(.2,pose.speed)*4;const weight=Math.min(1,pose.speed/.7),angle=Math.sin(p.phase)*weight*.42;for(const limb of p.limbs){limb.leg.rotation.x=angle*limb.side;limb.arm.rotation.x=-angle*limb.side*.6;}for(const joint of p.joints){const delta=Quaternion.RotationAxis(new Vector3(1,0,0),angle*joint.side*(joint.arm?-.6:1));joint.rest.multiplyToRef(delta,joint.node.rotationQuaternion);joint.node.markAsDirty('rotationQuaternion');}p.label.lookAt(eye);p.label.rotation.y+=Math.PI;caption(p,person);}
  statusClock+=dt;if(statusClock>.2){statusClock=0;mic.disabled=!snapshot.ready||!debug.playing;mic.textContent=snapshot.on?'🎙 میکروفن روشن':'🎙 روشن‌کردن میکروفن';mic.setAttribute('aria-pressed',String(!!snapshot.on));mic.setAttribute('aria-label',snapshot.on?'خاموش‌کردن میکروفن':'روشن‌کردن میکروفن');hear.hidden=!snapshot.blocked;const text=snapshot.full?'سرور پر شده؛ بعداً امتحان کنید.':adapter?(snapshot.joined?`${(snapshot.peers.length+1).toLocaleString('fa-IR')} نفر در ساختمان`:'در حال اتصال به بازدید گروهی…'):'برای بازدید گروهی، از شهر وارد ساختمان شوید.';if(text!==lastStatus){status.textContent=text;lastStatus=text;}status.title=snapshot.message||'';}
 }
 mic.onclick=()=>void adapter?.toggleMicrophone();hear.onclick=()=>void adapter?.resumePlayback();
 return {connect(value){adapter=value;lastPos=null;},update,get snapshot(){return snapshot;},get count(){return peers.size;},get micLabel(){return snapshot.on?'میکروفن: روشن · خاموش کردن':'میکروفن: خاموش · روشن کردن';},toggleMicrophone:()=>adapter?.toggleMicrophone(),resumePlayback:()=>adapter?.resumePlayback(),dispose(){disposed=true;adapter=null;for(const id of[...peers.keys()])removePeer(id);ui.remove();style.remove();for(const m of[clothes,skin,trousers])m.dispose();if(avatarPromise)avatarPromise.then(c=>c.dispose()).catch(()=>{});}};
}
