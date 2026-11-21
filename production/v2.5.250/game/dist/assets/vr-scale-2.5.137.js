export const VR_HEIGHT137=1.9,VR_EYE137=1.74;
// Calibrate once to the floor reference, never to the moving overview camera.
// Only real body meshes participate in height; name sprites and UI do not.
export function bodyBounds137(root,T){
 const box=new T.Box3().makeEmpty();root.updateWorldMatrix(true,true);
 root.traverse(node=>{if(node.isSkinnedMesh&&node.visible!==false)box.union(new T.Box3().setFromObject(node,true));});
 return box;
}
export function installVRScale137(game,T){
 const vr=game.vr;let saved=[],session=null;
 const experts=()=>[game.city.expert,game.city.coolerExpert87,game.city.solarExpert107,game.city.greenAggregationExpert108].filter(Boolean);
 function save(root){return{root,parent:root.parent,position:root.position.clone(),quaternion:root.quaternion.clone(),scale:root.scale.clone(),visible:root.visible,deleted:root.userData.editorDeleted,height:root.userData.height,colliders:(root.userData.editColliders||[]).map(handle=>{const c=game.physics.world.getCollider(handle);return c?{c,position:{...c.translation()},half:c.halfHeight?.()}:null;}).filter(Boolean)};}
 function relocateSolar(){
  const root=game.city.solarExpert107?.group,bess=game.city.solarBess?.group;if(!root||!bess)return;
  const battery=bess.getObjectByName('BESS_BatteryIcon')?.parent||bess;
  const box=new T.Box3().setFromObject(battery,true);if(box.isEmpty())return;
  const point=new T.Vector3(box.min.x-1.3,box.min.y,(box.min.z+box.max.z)/2);
  const ignored=new Set(experts().flatMap(e=>e.group.userData.editColliders||[]));
  const w=game.physics;
  if(w.rapier?.Ray&&w.world.castRay){const hit=w.world.castRay(new w.rapier.Ray({x:point.x,y:point.y+2,z:point.z},{x:0,y:-1,z:0}),5,true,w.rapier.QueryFilterFlags.EXCLUDE_SENSORS,undefined,undefined,undefined,c=>!ignored.has(c.handle));if(hit)point.y+=2-hit.timeOfImpact;}
  game.city.group.attach(root);root.position.copy(game.city.group.worldToLocal(point.clone()));root.visible=true;root.userData.editorDeleted=false;root.updateWorldMatrix(true,true);
 }
 function restore(){for(const state of saved){const {root}=state;if(state.parent)state.parent.add(root);root.position.copy(state.position);root.quaternion.copy(state.quaternion);root.scale.copy(state.scale);root.visible=state.visible;root.userData.editorDeleted=state.deleted;root.userData.height=state.height;root.updateWorldMatrix(true,true);for(const {c,position,half}of state.colliders){c.setTranslation(position);if(Number.isFinite(half))c.setHalfHeight?.(half);}}saved=[];}
 function begin(){
  if(saved.length)restore();saved=experts().map(e=>save(e.group));relocateSolar();
  for(const expert of experts()){
   const root=expert.group,box=bodyBounds137(root,T),height=box.max.y-box.min.y;
   if(!box.isEmpty()&&height>.5&&height<4){root.scale.multiplyScalar(VR_HEIGHT137/height);root.userData.height=VR_HEIGHT137;root.updateWorldMatrix(true,true);}
   const center=root.getWorldPosition(new T.Vector3);
   for(const handle of root.userData.editColliders||[]){const c=game.physics.world.getCollider(handle);if(c){c.setHalfHeight?.(VR_HEIGHT137/2);c.setTranslation({x:center.x,y:center.y+VR_HEIGHT137/2,z:center.z});}}
  }
  vr.avatarHeight=VR_HEIGHT137;vr.calibrationEyeHeight=VR_EYE137;vr.firstPose=true;
 }
 const onBegin=vr.onBegin,onEnd=vr.onEnd,reset=vr.resetSpace,update=vr.update;
 vr.onBegin=function(...args){const result=onBegin?.apply(this,args);begin();return result;};
 vr.onEnd=function(...args){restore();session=null;return onEnd?.apply(this,args);};
 vr.resetSpace=function(...args){const result=reset?.apply(this,args);this.calibrationEyeHeight=VR_EYE137;return result;};
 vr.update=function(...args){if(this.active&&this.session!==session){session=this.session;if(!saved.length)begin();this.calibrationEyeHeight=VR_EYE137;this.firstPose=true;}return update.apply(this,args);};
 game.disposers.push(restore);
 return{begin,restore,get saved(){return saved;}};
}
