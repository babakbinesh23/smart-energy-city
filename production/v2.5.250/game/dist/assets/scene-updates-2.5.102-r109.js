// Oriented rooftop arrays: full model footprints stay inside the roof and clear of equipment.
export function roofPlan87(home,aspect,factory={x:-67,z:-188}){
 const rect=home.rect,cx=(rect.minX+rect.maxX)/2,cz=(rect.minZ+rect.maxZ)/2;
 const yaw=Math.atan2(factory.x-cx,factory.z-cz),c=Math.cos(yaw),s=Math.sin(yaw);
 const width=3.9,depth=width*aspect,margin=1.05,gap=.8,slots=[];
 const world=(x,z)=>({x:cx+c*x+s*z,z:cz-s*x+c*z});
 const local=(x,z)=>({x:c*(x-cx)-s*(z-cz),z:s*(x-cx)+c*(z-cz)});
 const corners=[local(rect.minX,rect.minZ),local(rect.minX,rect.maxZ),local(rect.maxX,rect.minZ),local(rect.maxX,rect.maxZ)];
 const ex=Math.max(...corners.map(p=>Math.abs(p.x))),ez=Math.max(...corners.map(p=>Math.abs(p.z)));
 const nx=Math.floor(2*ex/(width+.35)),nz=Math.floor(2*ez/(depth+gap));
 for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){
  const x=(ix-(nx-1)/2)*(width+.35),z=(iz-(nz-1)/2)*(depth+gap);
  const points=[[-1,-1],[-1,1],[1,-1],[1,1]].map(([a,b])=>world(x+a*width/2,z+b*depth/2));
  const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minZ=Math.min(...points.map(p=>p.z)),maxZ=Math.max(...points.map(p=>p.z));
  if(minX<rect.minX+margin||maxX>rect.maxX-margin||minZ<rect.minZ+margin||maxZ>rect.maxZ-margin)continue;
  if((home.roofFixtures??[]).some(f=>minX<f.maxX+.3&&maxX>f.minX-.3&&minZ<f.maxZ+.3&&maxZ>f.minZ-.3))continue;
  slots.push({...world(x,z),minX,maxX,minZ,maxZ});
 }
 const roofArea=(rect.maxX-rect.minX)*(rect.maxZ-rect.minZ),panelArea=slots.length*width*depth;
 return {yaw,slots,panelWidth:width,panelDepth:depth,columns:nx,rows:nz,roofArea,panelArea,coverage:panelArea/roofArea,serviceBay:{minX:rect.minX,maxX:rect.minX+margin,minZ:rect.minZ,maxZ:rect.maxZ}};
}
export function addSolarMast87(T,city,makeMast,patch){
 const home=city.group.getObjectByName('building-solar-control');
 const record=city.group.userData.buildingRecords?.find(r=>r.id==='solar-control');
 const mast=makeMast();mast.name='solar-management-radio-mast-10m';
 const box=new T.Box3().setFromObject(mast),height=box.max.y-box.min.y;
 mast.scale.set(.75,10/height,.75);mast.position.set(119,record?record.height+.15:5.55,-163);
 mast.userData={...mast.userData,height:10,editId:'solar-radio-mast-10m',editLabel:'دکل رادیویی ۱۰ متری مدیریت خورشیدی'};
 mast.traverse(o=>{if(o.isMesh)patch(o.material,'solar-radio-mast87',[city.atmosphere.patch]);});
 city.group.add(mast);mast.updateWorldMatrix(true,true);
 const b=new T.Box3().setFromObject(mast),collider=city.physics.addStaticBox(b.getCenter(new T.Vector3()),b.getSize(new T.Vector3()).multiplyScalar(.5));
 mast.userData.editColliders=[collider.handle];city.solarMastCollider87=collider;return mast;
}
export function addCoolerExpert87(T,city,cloneSkeleton){
 if(!city.expert.loaded)return null;
 const group=cloneSkeleton(city.expert.group),roof=city.cooler.roofY;
 group.name='cooler-efficiency-expert';group.position.set(-190,roof,-71.3);group.rotation.set(0,Math.PI,0);group.scale.setScalar(1);
 // The clone shares immutable geometry/textures, while its skeleton and facial weights are independent.
 group.traverse(o=>{if(o.morphTargetInfluences)o.morphTargetInfluences=o.morphTargetInfluences.map(()=>0);});
 const collider=city.physics.addStaticCylinder(group.position.clone().add(new T.Vector3(0,city.expert.height/2,0)),city.expert.height/2,.34);
 group.userData={role:'cooler-expert',editRoot:true,editId:'cooler-efficiency-expert',editLabel:'کارشناس کولرهای آبی',editColliders:[collider.handle],height:city.expert.height};
 city.group.add(group);const body=group.children[0],position=new T.Vector3(),head=group.getObjectByName('Head'),headRest=head?.quaternion.clone();let clock=0;
 return {group,update(dt,viewer){if(dt<=0||group.userData.editorDeleted)return;clock+=dt;group.getWorldPosition(position);const distance=Math.hypot(viewer.x-position.x,viewer.z-position.z);if(distance>.4&&distance<8&&Math.abs(viewer.y-position.y)<3){group.updateWorldMatrix(true,false);const target=group.worldToLocal(new T.Vector3(viewer.x,position.y,viewer.z)),yaw=Math.atan2(target.x,target.z),delta=Math.atan2(Math.sin(yaw-body.rotation.y),Math.cos(yaw-body.rotation.y));body.rotation.y+=delta*(1-Math.exp(-4*dt));}faceExpertHead102(T,head,new T.Vector3(viewer.x,viewer.y+1.6,viewer.z),dt,distance>.4&&distance<8&&Math.abs(viewer.y-position.y)<3,headRest);body.scale.y=1+Math.sin(clock*1.4)*.0013;},dispose(){city.physics.world.removeCollider(collider,true);group.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});group.removeFromParent();}};
}

// Aim the GLB head's +Z (the same axis as its eye bones) at the visitor's eyes.
// Only bone rotation changes; collision, root placement and conversation state stay intact.
export function faceExpertHead102(T,head,target,delta,near,rest){
 if(!head||!delta||!head.parent)return;
 const rate=1-Math.exp(-Math.min(delta,.06)*(near?8:2));
 if(!near){if(rest)head.quaternion.slerp(rest,rate);return;}
 head.updateWorldMatrix(true,false);
 const eye=head.getWorldPosition(new T.Vector3());
 if(eye.distanceToSquared(target)<.04)return;
 const neutral=rest?.clone()??head.quaternion.clone();
 const neutralWorld=head.parent.getWorldQuaternion(new T.Quaternion()).multiply(neutral);
 const direction=target.clone().sub(eye).normalize().applyQuaternion(neutralWorld.invert());
 const yaw=Math.max(-.7,Math.min(.7,Math.atan2(direction.x,direction.z)));
 const pitch=Math.max(-.38,Math.min(.38,-Math.atan2(direction.y,Math.hypot(direction.x,direction.z))));
 const localAim=neutral.multiply(new T.Quaternion().setFromEuler(new T.Euler(pitch,yaw,0,'YXZ')));
 head.quaternion.slerp(localAim,rate);
}
