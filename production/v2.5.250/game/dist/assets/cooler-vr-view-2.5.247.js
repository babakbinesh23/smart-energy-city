const boundsCache247=new WeakMap();
// Use rigid geometry, excluding airflow/labels. Model origins do not describe
// the body footprint, especially with scaled or administrator-placed coolers.
export function coolerBounds141(unit,T){
 unit.model.updateWorldMatrix(true,false);const key=unit.model.matrixWorld.elements.join(',')+'|'+unit.model.children.length;
 const cached=boundsCache247.get(unit);if(cached?.key===key)return cached.bounds.clone();
 const bounds=new T.Box3().makeEmpty();unit.model.updateWorldMatrix(true,true);
 unit.model.traverse(node=>{
  if(!node.isMesh||node.visible===false)return;
  for(let p=node;p;p=p.parent){if(p.userData?.airflow||p.userData?.coolerEnergy100)return;if(p===unit.model)break;}
  // Instanced and batched meshes store their rendered footprint on the
  // object; raw geometry omits instance transforms and can place the wearer
  // inside a cabinet. All work stays in the VR-only planner.
  if(node.isInstancedMesh||node.isBatchedMesh){node.computeBoundingBox();if(node.boundingBox)bounds.union(node.boundingBox.clone().applyMatrix4(node.matrixWorld));return;}
  const geometry=node.geometry;if(!geometry)return;if(!geometry.boundingBox)geometry.computeBoundingBox();
  if(geometry.boundingBox)bounds.union(geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
 });
 if(bounds.isEmpty()){const center=unit.model.getWorldPosition(new T.Vector3);bounds.setFromCenterAndSize(center,new T.Vector3(2,2,2));}
 boundsCache247.set(unit,{key,bounds:bounds.clone()});return bounds;
}
export function planCoolerView141(units,shot,roof,ground,T){
 if(!units.length||!Number.isFinite(roof))return null;
 const boxes=units.map(u=>coolerBounds141(u,T)),index=Math.max(0,units.findIndex(u=>u.variant===shot)),unit=units[index];
 const focus=shot==='pair'?boxes.reduce((box,b)=>box.union(b),new T.Box3().makeEmpty()):boxes[index];
 const target=focus.getCenter(new T.Vector3),front=new T.Vector3(-1,0,0).applyQuaternion(unit.model.getWorldQuaternion(new T.Quaternion));front.y=0;if(front.lengthSq()<.001)front.set(-1,0,0);front.normalize();
 const lift=shot==='pair'?Math.max(2.8,focus.max.y-roof+.8):0;
 // Every candidate is outside both physical footprints with room for body and
 // room-scale leaning. The ground resolver also checks the actual roof/physics.
 for(const angle of [0,Math.PI/6,-Math.PI/6,Math.PI/3,-Math.PI/3,Math.PI/2,-Math.PI/2,Math.PI]){
  const direction=front.clone().applyAxisAngle(new T.Vector3(0,1,0),angle);let edge=0;
  for(const x of [focus.min.x,focus.max.x])for(const z of [focus.min.z,focus.max.z])edge=Math.max(edge,(x-target.x)*direction.x+(z-target.z)*direction.z);
  for(const clearance of [1.6,2.4,3.4,4.6]){
   const point=target.clone().addScaledVector(direction,edge+clearance);
   if(boxes.some(b=>point.x>=b.min.x-.9&&point.x<=b.max.x+.9&&point.z>=b.min.z-.9&&point.z<=b.max.z+.9))continue;
   const feet=ground(point.x,point.z,roof+1.5,2.5);if(!feet||Math.abs(feet.y-roof)>.5)continue;
   return{feet,target,lift};
  }
 }
 return null;
}
