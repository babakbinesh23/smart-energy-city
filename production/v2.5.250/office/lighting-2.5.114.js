/* Replace light membership once, only when it changed. Never clear/push per mesh. */
export function refreshOfficeLights114(scene,lights,Vector3){
 const active=lights.filter(record=>!record.editorOwner||record.editorOwner.isEnabled());
 const positions=active.map(({light})=>{light.computeTransformedInformation();return light.transformedPosition?.clone()||light.position.clone();});
 const wanted=new Map(lights.map(record=>[record.light,[]]));
 for(const mesh of scene.meshes){
  if(!mesh.isEnabled()||!mesh.getTotalVertices?.())continue;
  mesh.computeWorldMatrix(true);const center=mesh.getBoundingInfo().boundingBox.centerWorld;
  const nearest=positions.map((p,index)=>({index,distance:Vector3.DistanceSquared(p,center)})).sort((a,b)=>a.distance-b.distance).slice(0,6);
  for(const {index}of nearest)wanted.get(active[index].light).push(mesh);
 }
 let changed=0;
 for(const [light,meshes]of wanted){
  // Babylon interprets an empty inclusion list as "all meshes". An inactive owner
  // remains disabled through the existing dimmer; don't resync every unrelated mesh.
  const previous=light.includedOnlyMeshes;
  if(previous.length===meshes.length&&previous.every((mesh,index)=>mesh===meshes[index]))continue;
  light.includedOnlyMeshes=meshes;changed++;
 }
 return changed;
}
