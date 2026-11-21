export const SOLAR_CLEARANCE196=.55*1.3;
// Keep the supplied panel's actual face normal, including any tilt in its GLB.
export function panelNormal196(T,geometry){
 const p=geometry.attributes.position,index=geometry.index,bins=new Map(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();
 for(let i=0;i<(index?.count??p.count);i+=3){
  a.fromBufferAttribute(p,index?index.getX(i):i);b.fromBufferAttribute(p,index?index.getX(i+1):i+1);c.fromBufferAttribute(p,index?index.getX(i+2):i+2);
  b.sub(a);c.sub(a);const n=b.cross(c),area=n.length();if(!area)continue;n.divideScalar(area);if(n.y<0)n.negate();if(n.y<.6)continue;
  const key=[n.x,n.y,n.z].map(v=>Math.round(v*100)).join(':');const entry=bins.get(key)||{area:0,n:n.clone()};entry.area+=area;bins.set(key,entry);
 }
 return [...bins.values()].sort((a,b)=>b.area-a.area)[0]?.n??new T.Vector3(0,Math.cos(.24),Math.sin(.24));
}
export function buildSolarField196(owner,T,physics,legacy,material,slots,patch,ground){
 const normal=panelNormal196(T,legacy),across=new T.Vector3(1,0,0).addScaledVector(normal,-normal.x).normalize(),along=new T.Vector3().crossVectors(across,normal).normalize();
 if(along.z<0)along.negate();const geometry=legacy.clone(),p=geometry.attributes.position,v=new T.Vector3();
 // A module section becomes 30% deeper along its own plane. This affine
 // transform leaves its surface angle unchanged, unlike scaling world Y/Z.
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);v.multiplyScalar(5.7);v.addScaledVector(along,v.dot(along)*.3);p.setXYZ(i,v.x,v.y,v.z);}
 geometry.computeBoundingBox();const base=geometry.boundingBox;geometry.translate(-(base.min.x+base.max.x)/2,-base.min.y,-(base.min.z+base.max.z)/2);geometry.computeBoundingBox();
 const bounds=geometry.boundingBox.clone(),depth=bounds.max.z-bounds.min.z,oldWidth=bounds.max.x-bounds.min.x;
 const glass=new T.MeshPhysicalMaterial({side:T.FrontSide,map:material.map,color:'#ffffff',metalness:.36,roughness:.16,clearcoat:1,clearcoatRoughness:.055,envMapIntensity:1.35});patch(glass,'home-solar-clearcoat');
 if(material.map&&material.map.anisotropy<4){material.map.anisotropy=4;material.map.needsUpdate=true;}
 const steel=new T.MeshStandardMaterial({color:'#aeb5b4',metalness:.7,roughness:.35});patch(steel,'home-solar-supports');
 const rows=new Map();slots.forEach((s,i)=>{const row=rows.get(s.z)||[];row.push({s,i});rows.set(s.z,row);});
 const runs=[];for(const row of rows.values()){row.sort((a,b)=>a.s.x-b.s.x);let run=[];for(const item of row){if(run.length&&item.s.x-run.at(-1).s.x>7.2){runs.push(run);run=[];}run.push(item);}if(run.length)runs.push(run);}
 const panels=new T.InstancedMesh(geometry,glass,slots.length),boxes=[],groups=[],rails=[],matrix=new T.Matrix4(),rotation=new T.Quaternion(),position=new T.Vector3(),scale=new T.Vector3(),contacts=new Array(slots.length),sectionBounds=[];
 panels.name='supplied-solar-panels-in-solar-field';panels.castShadow=panels.receiveShadow=true;
 const planeY=z=>SOLAR_CLEARANCE196+depth/2*Math.abs(normal.z/normal.y)-z*normal.z/normal.y;
 const box=(x,y,z,w,h,d)=>boxes.push({x,y,z,w,h,d});
 for(const run of runs){
  const left=run[0].s.x-2.85,right=run.at(-1).s.x+2.85,z=run[0].s.z;
  for(const[{s,i},j]of run.map((item,j)=>[item,j])){
   const start=boxes.length;
   const lo=j===0?left:s.x-3.53,hi=j===run.length-1?right:s.x+3.53,cx=(lo+hi)/2;
   matrix.compose(position.set(cx,ground+SOLAR_CLEARANCE196,z),rotation,scale.set((hi-lo)/oldWidth,1,1));panels.setMatrixAt(i,matrix);
   const world=bounds.clone().applyMatrix4(matrix);sectionBounds.push(world);physics.addStaticBox(world.getCenter(new T.Vector3()),world.getSize(new T.Vector3()).multiplyScalar(.5));
   for(const localZ of[-depth*.32,depth*.32]){const height=planeY(localZ)-.07;box(s.x,ground+height/2,z+localZ,.1,height,.1);box(s.x,ground+.045,z+localZ,.32,.09,.3);}
   const braceStart=new T.Vector3(s.x,ground+.12,z+depth*.32),braceEnd=new T.Vector3(s.x,ground+planeY(-depth*.32)-.1,z-depth*.32),delta=braceEnd.clone().sub(braceStart);
   const center=braceStart.clone().add(braceEnd).multiplyScalar(.5);boxes.push({x:center.x,y:center.y,z:center.z,w:.07,h:delta.length(),d:.07,q:new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize())});
   // The existing collector network consumes these same indexed contacts.
   // Put each connector on the front support, just under the panel rail.
   contacts[i]=new T.Vector3(s.x,ground+planeY(depth*.32)-.09,z+depth*.32);
   box(s.x,contacts[i].y,contacts[i].z,.22,.12,.13);
   groups[i]=boxes.splice(start);
  }
  for(const localZ of[-depth*.32,depth*.32])rails.push({x:(left+right)/2,y:ground+planeY(localZ)-.04,z:z+localZ,w:right-left,h:.08,d:.1});
 }
 boxes.push(...groups.flat());
 const supports=new T.BoxGeometry(1,1,1),rack=new T.InstancedMesh(supports,steel,boxes.length);rack.name='field-solar-fixed-legs-and-rails';rack.castShadow=rack.receiveShadow=true;
 boxes.forEach((b,i)=>{matrix.compose(position.set(b.x,b.y,b.z),b.q||rotation,scale.set(b.w,b.h,b.d));rack.setMatrixAt(i,matrix);});
 const sharedRails=new T.InstancedMesh(supports,steel,rails.length);sharedRails.name='field-solar-shared-rails';sharedRails.castShadow=sharedRails.receiveShadow=true;
 rails.forEach((b,i)=>{matrix.compose(position.set(b.x,b.y,b.z),rotation,scale.set(b.w,b.h,b.d));sharedRails.setMatrixAt(i,matrix);});
 for(const mesh of[panels,rack,sharedRails]){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();}
 owner.group.add(panels,rack,sharedRails);owner.geometry=geometry;owner.supports=supports;owner.glass=glass;owner.steel=steel;owner.map=material.map;owner.fieldContacts=contacts;owner.roofs=[{id:'solar-field',bounds:sectionBounds,plan:{slots,panelDepth:depth}}];
 owner.group.userData={panelSource:'roof-solar-panel.glb',moduleCount:slots.length,mountClearance:SOLAR_CLEARANCE196,continuousRows:runs.length,planeNormal:normal.toArray(),depthGrowth:1.3};legacy.dispose();
 return owner;
}
