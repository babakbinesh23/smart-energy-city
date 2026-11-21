import {LOGO218} from './bargheto-logo-shapes-2.5.218.js';

// Move the existing panel badge from the column onto the marked lower panel area.
export function addTrackerLogo218(T,model){
 const existing=model.getObjectByName('bargheto-panel-logo218');
 if(existing)return {geometry:existing.geometry,material:existing.material};
 const source=model.getObjectByName('Object_10'),front=model.getObjectByName('Object_15'),tilt=model.getObjectByName('Bargheto_Panel_Tilt_X_Animated_8');
 if(!source?.isMesh||!front?.isMesh||!tilt)throw Error('Original Bargheto logo or tracker panel missing');
 model.updateMatrixWorld(true);
 const geometry=source.geometry.clone();geometry.computeBoundingBox();const size=geometry.boundingBox.getSize(new T.Vector3()),center=geometry.boundingBox.getCenter(new T.Vector3()),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setXYZ(i,(positions.getX(i)-center.x)/size.x,(positions.getY(i)-center.y)/size.y,0);
 positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=(Array.isArray(source.material)?source.material[0]:source.material).clone();
 material.name='Bargheto_Panel_Logo218';material.transparent=true;material.depthWrite=false;material.depthTest=true;material.side=T.FrontSide;
 material.polygonOffset=true;material.polygonOffsetFactor=-1;material.polygonOffsetUnits=-1;
 const p=front.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++)points.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(front.matrixWorld));
 const normal=new T.Vector3().subVectors(points[1],points[0]).cross(new T.Vector3().subVectors(points[2],points[0])).normalize();if(normal.y<0)normal.negate();
 // Respect the panel's in-plane rotation: its lower edge is slightly slanted.
 // Using world-up would let the enlarged lettering cross that lower edge.
 const corners=points.filter((p,i)=>!points.slice(0,i).some(q=>q.distanceToSquared(p)<1e-10)),origin=corners[0];
 const edges=corners.slice(1).map(p=>p.clone().sub(origin)).sort((a,b)=>a.lengthSq()-b.lengthSq());
 const right=edges[1].clone().normalize(),up=new T.Vector3().crossVectors(normal,right).normalize();if(up.y<0){up.negate();right.negate();}
 const projected=points.map(p=>{const delta=p.clone().sub(origin);return {u:delta.dot(right),v:delta.dot(up)};});
 const minU=Math.min(...projected.map(p=>p.u)),maxU=Math.max(...projected.map(p=>p.u)),minV=Math.min(...projected.map(p=>p.v));
 // The red reference frame spans about 23.5% of the panel width at its lower edge.
 const width=(maxU-minU)*.235,height=width*size.y/size.x,margin=.065;
 const position=origin.clone().addScaledVector(right,(minU+maxU)/2).addScaledVector(up,minV+height/2+margin).addScaledVector(normal,.009);
 const inverse=new T.Matrix4().copy(tilt.matrixWorld).invert(),basis=new T.Matrix4().makeBasis(right.clone().transformDirection(inverse),up.clone().transformDirection(inverse),normal.clone().transformDirection(inverse));
 const mesh=new T.Mesh(geometry,material);mesh.name='bargheto-panel-logo218';mesh.position.copy(position.applyMatrix4(inverse));mesh.quaternion.setFromRotationMatrix(basis);mesh.scale.set(width,height,1);mesh.renderOrder=2;mesh.castShadow=mesh.receiveShadow=false;
 mesh.userData={editLocked:true,sourceLogo:'Object_10',placement:'front-lower-center-reference-frame',panelWidthFraction:.235,surfaceOffset:.009};tilt.add(mesh);
 // Remove both original column badges, including the reverse side.
 for(const name of ['Object_10','Object_12']){const badge=model.getObjectByName(name);if(badge)badge.visible=false;}
 model.updateMatrixWorld(true);return {geometry,material,width,height};
}

export function createRaisedLogo218(T){
 const width=1.15,height=1.15,depth=.024,bevel=.003;
 const path=(Path,points)=>{const p=new Path();points.forEach(([x,y],i)=>p[i?'lineTo':'moveTo']((x/LOGO218.width-.5)*width,(.5-y/LOGO218.height)*height));p.closePath();return p;};
 return LOGO218.groups.map(group=>{
  const shapes=group.shapes.map(record=>{const shape=path(T.Shape,record.outer);shape.holes=record.holes.map(h=>path(T.Path,h));return shape;});
  const geometry=new T.ExtrudeGeometry(shapes,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,curveSegments:1});
  const material=new T.MeshStandardMaterial({name:'Bargheto_Raised_'+group.color+'218',color:group.color==='gold'?0xf5a238:0x19266a,metalness:group.color==='gold'?.82:.62,roughness:.3,envMapIntensity:1.2});
  // The silhouette and letters are actual extruded geometry; no transparent quad.
  return {color:group.color,geometry,material,width,height,depth,bevel};
 });
}

// Subdivide across the curve before wrapping; wide cap triangles must not cut
// through the column between their vertices. Vertical edges need no subdivision.
function curvedGeometry218(T,source){
 const positions=[],normals=[],p=source.attributes.position,n=source.attributes.normal;
 function triangle(v){
  let edge=-1,span=.065;
  for(let i=0;i<3;i++){const dx=Math.abs(v[i][0]-v[(i+1)%3][0]);if(dx>span){span=dx;edge=i;}}
  if(edge<0){for(const point of v){positions.push(...point.slice(0,3));normals.push(...point.slice(3));}return;}
  const a=v[edge],b=v[(edge+1)%3],c=v[(edge+2)%3],mid=a.map((value,i)=>(value+b[i])/2);
  triangle([a,mid,c]);triangle([mid,b,c]);
 }
 for(let i=0;i<p.count;i+=3)triangle([0,1,2].map(j=>[p.getX(i+j),p.getY(i+j),p.getZ(i+j),n.getX(i+j),n.getY(i+j),n.getZ(i+j)]));
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));source.dispose();return g;
}

export function addWindLogos218(T,windFarm,patch=()=>{}){
 if(windFarm.logos218)return windFarm.logos218;
 const towers=windFarm.group.getObjectByName('wind-turbines-shared-towers'),records=windFarm.records;if(!towers||!records.length)return null;
 const unit=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0),q=new T.Quaternion(),placement=new T.Matrix4(),first=records[0],towerMatrix=new T.Matrix4();
 towers.getMatrixAt(0,towerMatrix);placement.compose(new T.Vector3(first.x,first.baseY,first.z),q.setFromAxisAngle(up,first.yaw),unit);
 const probe=new T.Mesh(towers.geometry,towers.material);probe.matrixAutoUpdate=false;probe.matrixWorld.copy(placement).invert().multiply(towerMatrix);
 const ray=new T.Raycaster(),direction=new T.Vector3(),normalMatrix=new T.Matrix3().getNormalMatrix(probe.matrixWorld),centerY=1.05,offset=.008;
 function surface(phi,y){direction.set(Math.sin(phi),0,Math.cos(phi));ray.set(direction.clone().multiplyScalar(4).add(new T.Vector3(0,y,0)),direction.clone().negate());ray.far=8;
  const hit=ray.intersectObject(probe,false)[0];if(!hit)throw Error('Turbine logo surface not found');const normal=hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();if(normal.dot(direction)<0)normal.negate();return {point:hit.point,normal};
 }
 const radius=surface(0,centerY).point.z,logos=[];
 for(const part of createRaisedLogo218(T)){
  part.geometry=curvedGeometry218(T,part.geometry);
  const p=part.geometry.attributes.position,n=part.geometry.attributes.normal;
  for(let i=0;i<p.count;i++){
   const phi=p.getX(i)/radius,sample=surface(phi,centerY+p.getY(i)),z=offset+p.getZ(i),tangent=new T.Vector3(Math.cos(phi),0,-Math.sin(phi));
   const normal=tangent.multiplyScalar(n.getX(i)).addScaledVector(up,n.getY(i)).addScaledVector(sample.normal,n.getZ(i)).normalize();
   p.setXYZ(i,sample.point.x+sample.normal.x*z,sample.point.y+sample.normal.y*z,sample.point.z+sample.normal.z*z);n.setXYZ(i,normal.x,normal.y,normal.z);
  }
  p.needsUpdate=n.needsUpdate=true;part.geometry.clearGroups();part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();patch(part.material,'wind-raised-logo218-'+part.color);
  const mesh=new T.InstancedMesh(part.geometry,part.material,records.length);mesh.name='bargheto-wind-raised-logo218-'+part.color;mesh.castShadow=mesh.receiveShadow=false;
  mesh.userData={editLocked:true,sourceLogo:LOGO218.sourceSHA256,placement:'lower-tower-facing-city',raisedDepth:part.depth,surfaceOffset:offset,count:records.length};
  for(const [i,r]of records.entries()){placement.compose(new T.Vector3(r.x,r.baseY,r.z),q.setFromAxisAngle(up,r.yaw),unit);mesh.setMatrixAt(i,placement);}
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();windFarm.group.add(mesh);logos.push(mesh);
 }
 windFarm.logos218=logos;windFarm.group.userData.additionalDrawCalls=(windFarm.group.userData.additionalDrawCalls??0)+logos.length;
 windFarm.group.userData.branding218={copies:records.length,drawCalls:logos.length,raisedDepth:.024,sourceSHA256:LOGO218.sourceSHA256};
 const dispose=windFarm.dispose;let disposed=false;windFarm.dispose=function(){if(disposed)return;disposed=true;for(const mesh of logos){mesh.geometry.dispose();mesh.material.dispose();mesh.dispose();mesh.removeFromParent();}dispose();};
 return logos;
}
