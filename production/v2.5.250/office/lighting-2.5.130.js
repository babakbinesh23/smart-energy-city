/* VR-only light membership. Six local fixtures + bounce + soft shadow = 8. */
const autoDisabled130=new WeakMap();
export function refreshOfficeLights114(scene,lights,Vector3){
 const active=lights.filter(r=>!r.editorOwner||r.editorOwner.isEnabled());
 const positions=active.map(({light})=>{light.computeTransformedInformation();return light.transformedPosition?.clone()||light.position.clone();});
 const wanted=new Map(lights.map(r=>[r.light,[]]));
 for(const mesh of scene.meshes){
  if(!mesh.isEnabled()||!mesh.getTotalVertices?.())continue;
  mesh.computeWorldMatrix(true);const center=mesh.getBoundingInfo().boundingBox.centerWorld;
  const nearest=positions.map((p,index)=>({index,distance:Vector3.DistanceSquared(p,center)})).sort((a,b)=>a.distance-b.distance).slice(0,6);
  for(const {index}of nearest)wanted.get(active[index].light).push(mesh);
 }
 let changed=0;
 for(const {light}of lights){
  const meshes=wanted.get(light),hasReceivers=meshes.length>0;
  // Babylon treats an empty includedOnlyMeshes list as "every mesh". Disable
  // these unused fixtures so they cannot consume slots intended for local lights.
  if(!hasReceivers&&!autoDisabled130.has(light)){autoDisabled130.set(light,light.isEnabled());light.setEnabled(false);changed++;}
  else if(hasReceivers&&autoDisabled130.has(light)){light.setEnabled(autoDisabled130.get(light));autoDisabled130.delete(light);changed++;}
  const previous=light.includedOnlyMeshes;
  if(previous.length!==meshes.length||previous.some((m,i)=>m!==meshes[i])){light.includedOnlyMeshes=meshes;changed++;}
 }
 return changed;
}
