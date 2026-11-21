/* Run after speech mixers, immediately before rendering. Keep edit roots untouched. */
export function installExpertPresence117(game,T){
 const rigs=[],V=T.Vector3,Q=T.Quaternion,up=new V(0,1,0),feet=new V,eyes=new V;
 for(const expert of [game.city.expert,game.city.factoryManager,game.city.coolerExpert87,game.city.solarExpert107,game.city.greenAggregationExpert108]){
  const root=expert?.group,body=expert?.body||root?.children[0];if(!root||!body||!root.children.length)continue;
  const head=root.getObjectByName('Head'),rest=head?.quaternion.clone();
  root.updateWorldMatrix(true,false);root.updateMatrixWorld(true);
  // Solar experts are already placed in city coordinates, then attached to
  // their building. Preserve that local transform and saved administrator edits.
  const currentBox=new T.Box3().setFromObject(body,true),height=currentBox.max.y-currentBox.min.y;
  const wanted=game.player.rig?.root?.userData?.height??1.9;
  if(height>.5&&height<4){root.scale.multiplyScalar(wanted/height);root.userData.height=wanted;root.updateMatrixWorld(true);
   for(const handle of root.userData.editColliders||[]){const collider=game.physics.world.getCollider(handle);if(!collider?.setHalfHeight)continue;collider.setHalfHeight(wanted/2);const center=collider.translation();collider.setTranslation({x:center.x,y:root.getWorldPosition(new V).y+wanted/2,z:center.z});}
  }
  const box=new T.Box3().setFromObject(body,true),origin=root.getWorldPosition(new V),scale=root.getWorldScale(new V);
  // Cache the actual sole level once; querying every skinned vertex per frame is expensive.
  const sole=box.isEmpty()?0:(box.min.y-origin.y)/Math.max(.001,scale.y),base=body.position.y;
  const feetBones=['LeftToeBase','RightToeBase'].map(n=>root.getObjectByName(n)).filter(Boolean),clearance=feetBones.length?(Math.min(...feetBones.map(b=>b.getWorldPosition(new V).y))-box.min.y)/Math.max(.001,scale.y):0;
  rigs.push({root,body,head,rest,sole,base,clearance,correction:0,gazeWorld:new Q,gazeReady:false,lastCheck:-Infinity,feetBones});
 }
 const pos=new V,target=new V,local=new V,headPos=new V,front=new V,right=new V,dir=new V,parent=new Q,bodyQ=new Q,desired=new Q,aim=new T.Euler(0,0,0,'YXZ');
 let clock=0;
 function ground(r){
  r.root.getWorldPosition(pos);let floor=null;
  const physics=game.city.physics;
  if(physics?.world?.castRay&&physics.rapier?.Ray){
   const ignored=new Set(rigs.flatMap(x=>x.root.userData.editColliders||[]));
   const ray=new physics.rapier.Ray({x:pos.x,y:pos.y+.65,z:pos.z},{x:0,y:-1,z:0});
   const hit=physics.world.castRay(ray,1.3,true,physics.rapier.QueryFilterFlags.EXCLUDE_DYNAMIC|physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS,undefined,undefined,undefined,c=>!ignored.has(c.handle));
   if(hit)floor=pos.y+.65-hit.timeOfImpact;
  }
  if(!Number.isFinite(floor))floor=r.root.userData.role==='cooler-expert'?game.city.cooler.roofY:.15;
  const scale=r.root.getWorldScale(local).y,below=floor-(pos.y+r.sole*scale);
  r.floor=floor;r.correction=below>0&&below<.6?below/Math.max(.001,scale):0;
 }
 const api={rigs,update(dt){
  if(game.paused||game.editor.active||game.officeSession.active||game.vr.introducing)return;
  dt=Math.min(.08,Math.max(0,dt||0));if(!dt)return;clock+=dt;
  const vr=game.vr.active,camera=vr?game.vr.view:game.camera.camera;
  if(vr)feet.copy(game.vr.feet);else feet.copy(game.player.position);
  if(vr||game.camera.firstPerson!==false)camera.getWorldPosition(eyes);else eyes.copy(feet).add(new V(0,1.74,0));
  for(const r of rigs){
   const {root,body,head}=r;if(root.userData.editorDeleted||!root.visible)continue;
   root.updateWorldMatrix(true,false);root.getWorldPosition(pos);
   if(clock-r.lastCheck>.5){ground(r);r.lastCheck=clock;}
   body.position.y=r.base;body.updateWorldMatrix(false,false);
   const scale=root.getWorldScale(local).y;if(r.feetBones.length){const bottom=Math.min(...r.feetBones.map(b=>b.getWorldPosition(target).y))-r.clearance*scale,below=r.floor-bottom;r.correction=below>0&&below<.6?below/Math.max(.001,scale):0;}body.position.y+=r.correction;
   const near=Math.hypot(feet.x-pos.x,feet.z-pos.z)<9&&Math.abs(feet.y-pos.y)<3.5;
   if(!near)continue;
   target.set(eyes.x,pos.y,eyes.z);local.copy(target);root.worldToLocal(local);
   const angle=Math.atan2(local.x,local.z),delta=Math.atan2(Math.sin(angle-body.rotation.y),Math.cos(angle-body.rotation.y));
   body.rotation.y+=delta*(1-Math.exp(-6*dt));
   if(!head||!head.parent)continue;
   body.updateWorldMatrix(false,true);head.getWorldPosition(headPos);dir.copy(eyes).sub(headPos);if(dir.lengthSq()<.04)continue;
   body.getWorldQuaternion(bodyQ);front.set(0,0,1).applyQuaternion(bodyQ);front.y=0;front.normalize();right.crossVectors(up,front).normalize();
   const yaw=Math.max(-.72,Math.min(.72,Math.atan2(dir.dot(right),dir.dot(front)))),pitch=Math.max(-.38,Math.min(.38,Math.atan2(dir.y,Math.hypot(dir.x,dir.z))));
   head.parent.getWorldQuaternion(parent);aim.set(-pitch,Math.atan2(front.x,front.z)+yaw,0,'YXZ');desired.setFromEuler(aim);
   if(!r.gazeReady){head.getWorldQuaternion(r.gazeWorld);r.gazeReady=true;}r.gazeWorld.slerp(desired,1-Math.exp(-12*dt));
   head.quaternion.copy(parent.invert().multiply(r.gazeWorld));head.updateWorldMatrix(false,true);
  }
 },dispose(){rigs.length=0;}};
 game.expertPresence117=api;game.city.plantAudio.bindCity?.(game.city);game.disposers.push(()=>api.dispose());return api;
}
