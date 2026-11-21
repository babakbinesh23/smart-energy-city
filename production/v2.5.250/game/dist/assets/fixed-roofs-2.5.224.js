// Fixed rooftop racks share the power plant's geometry, slope and materials.
// No tracker parts, motors or per-frame updates are installed on these roofs.
export function harmonizeFixedRoofs224(city,T){
 const field=city.fieldSolar,source=field?.group.getObjectByName('supplied-solar-panels-in-solar-field'),rack=field?.group.getObjectByName('field-solar-fixed-legs-and-rails');
 if(!source||!rack||!source.count)return null;
 const first=new T.Matrix4();source.getMatrixAt(0,first);
 const center=new T.Vector3().setFromMatrixPosition(first),ground=field.roofs[0].bounds[0].min.y-field.group.userData.mountClearance;
 const geometry=source.geometry.clone().applyMatrix4(first).translate(-center.x,-ground,-center.z);geometry.computeBoundingBox();const box=geometry.boundingBox,size=box.getSize(new T.Vector3());
 const supportMatrices=[];for(let i=0;i<rack.count/source.count;i++){const m=new T.Matrix4();rack.getMatrixAt(i,m);m.elements[12]-=center.x;m.elements[13]-=ground;m.elements[14]-=center.z;supportMatrices.push(m);}
 const slope=field.group.userData.slope,clearance=field.group.userData.mountClearance,plane=z=>field.group.userData.frontSupportHeight+.07+(field.roofs[0].plan.panelDepth*.32-z)*slope;
 for(const z of [box.min.z,box.max.z,-size.z*.32,size.z*.32])supportMatrices.push(new T.Matrix4().compose(new T.Vector3(0,plane(z)-.025,z),new T.Quaternion(),new T.Vector3(size.x,.065,.08)));
 const roofRecords=[];for(const roof of city.homeSolar.roofs){const group=city.homeSolar.group.children.find(g=>g.userData.attachBuildingId===roof.id),old=group?.children.find(m=>m.isInstancedMesh&&m.name.startsWith('supplied-solar-panels'));if(old)roofRecords.push({owner:city.homeSolar,group,old,roof,clearance:city.homeSolar.group.userData.mountClearance});}
 const hq=city.headquarters,oldHQ=hq?.group.getObjectByName('24-supplied-reflective-solar-panels');if(oldHQ)roofRecords.push({owner:hq,group:hq.group,old:oldHQ,clearance:.85,roof:{id:'hq',plan:{yaw:0},bounds:hq.panelBounds}});
 const colliders=[],batches=[],m=new T.Matrix4(),placement=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3();
 for(const owner of new Set(roofRecords.map(r=>r.owner))){for(const c of owner.colliders222??[])if(c)city.physics.world.removeCollider(c,true);owner.colliders222=[];}
 for(const {owner,group,old,roof,clearance:lift}of roofRecords){
  const panels=new T.InstancedMesh(geometry,source.material,old.count),legs=new T.InstancedMesh(rack.geometry,rack.material,old.count*supportMatrices.length),bounds=[];
  panels.name='fixed-plant-roof-panels224-'+roof.id;legs.name='fixed-plant-roof-racks224-'+roof.id;
  for(let i=0;i<old.count;i++){
   old.getMatrixAt(i,m);p.setFromMatrixPosition(m);p.y-=lift;
   const target=roof.bounds[i]?.getSize(new T.Vector3()),width=roof.plan.panelWidth??target.x,depth=roof.plan.panelDepth??target.z;
   const factor=Math.min(width/size.x,depth/size.z)*.96;q.setFromAxisAngle(new T.Vector3(0,1,0),roof.plan.yaw??0);placement.compose(p,q,scale.setScalar(factor));panels.setMatrixAt(i,placement);
   for(let j=0;j<supportMatrices.length;j++)legs.setMatrixAt(i*supportMatrices.length+j,m.multiplyMatrices(placement,supportMatrices[j]));
   const bound=box.clone();bound.min.y=0;bound.applyMatrix4(placement);bounds.push(bound);const c=city.physics.addStaticBox(bound.getCenter(new T.Vector3()),bound.getSize(new T.Vector3()).multiplyScalar(.5));if(c)colliders.push(c);
  }
  old.visible=false;for(const child of group.children)if(child.name.startsWith('home-solar-fixed-legs')||child.name==='solar-array-fixed-supports')child.visible=false;
  for(const mesh of [panels,legs]){mesh.castShadow=mesh.receiveShadow=true;mesh.userData={fixedPlantRoof224:true,editLocked:true};mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);batches.push(mesh);}
  if(roof.id==='hq')owner.panelBounds=bounds;else roof.bounds=bounds;
  group.userData.solarMount87={...group.userData.solarMount87,fixed:true,moving:false,source:'solar-field',slope:field.group.userData.slope,orientationRevision:224};
 }
 const api={roofIds:roofRecords.map(r=>r.roof.id),batches,moving:false};city.solarStyle224=api;
 const dispose=city.homeSolar.dispose;city.homeSolar.dispose=function(...args){for(const b of batches){b.removeFromParent();b.dispose();}geometry.dispose();for(const c of colliders)city.physics.world.removeCollider(c,true);return dispose.apply(this,args);};
 return api;
}
