// Copies the real metallic logo already embedded in the tracker GLB.
// Both surfaces share its texture; no replacement drawing or extra image download.
export function addTrackerLogo215(T,model){
 const existing=model.getObjectByName('bargheto-panel-logo215');
 if(existing)return {geometry:existing.geometry,material:existing.material};
 const source=model.getObjectByName('Object_10'),front=model.getObjectByName('Object_15'),tilt=model.getObjectByName('Bargheto_Panel_Tilt_X_Animated_8');
 if(!source?.isMesh||!front?.isMesh||!tilt)throw Error('Original Bargheto logo or tracker panel missing');
 model.updateMatrixWorld(true);
 const geometry=source.geometry.clone();geometry.computeBoundingBox();const box=geometry.boundingBox,size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),positions=geometry.attributes.position;
 // Normalize the original quad without altering its UV orientation or indices.
 for(let i=0;i<positions.count;i++)positions.setXYZ(i,(positions.getX(i)-center.x)/size.x,(positions.getY(i)-center.y)/size.y,0);
 positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=(Array.isArray(source.material)?source.material[0]:source.material).clone();
 material.name='Bargheto_Original_Metallic_Logo_Copy215';material.transparent=true;material.depthWrite=false;material.depthTest=true;material.side=T.FrontSide;
 material.polygonOffset=true;material.polygonOffsetFactor=-1;material.polygonOffsetUnits=-1;
 const p=front.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++)points.push(new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(front.matrixWorld));
 const normal=new T.Vector3().subVectors(points[1],points[0]).cross(new T.Vector3().subVectors(points[2],points[0])).normalize();if(normal.y<0)normal.negate();
 const up=new T.Vector3(0,1,0).addScaledVector(normal,-normal.y).normalize(),right=new T.Vector3().crossVectors(up,normal).normalize(),origin=points[0];
 const projected=points.map(p=>{const delta=p.clone().sub(origin);return {u:delta.dot(right),v:delta.dot(up)};});
 const minU=Math.min(...projected.map(p=>p.u)),maxU=Math.max(...projected.map(p=>p.u)),minV=Math.min(...projected.map(p=>p.v));
 const width=size.x,height=width*size.y/size.x,margin=.055;
 const position=origin.clone().addScaledVector(right,(minU+maxU)/2).addScaledVector(up,minV+height/2+margin).addScaledVector(normal,.006);
 const inverse=new T.Matrix4().copy(tilt.matrixWorld).invert(),basis=new T.Matrix4().makeBasis(right.clone().transformDirection(inverse),up.clone().transformDirection(inverse),normal.clone().transformDirection(inverse));
 const mesh=new T.Mesh(geometry,material);mesh.name='bargheto-panel-logo215';mesh.position.copy(position.applyMatrix4(inverse));mesh.quaternion.setFromRotationMatrix(basis);mesh.scale.set(width,height,1);mesh.renderOrder=2;mesh.castShadow=mesh.receiveShadow=false;
 mesh.userData={editLocked:true,sourceLogo:'Object_10',placement:'front-lower-center',surfaceOffset:.006};tilt.add(mesh);model.updateMatrixWorld(true);
 return {geometry,material,width,height};
}

export function addWindLogos215(T,windFarm,branding){
 if(windFarm.logos215)return windFarm.logos215;
 const towers=windFarm.group.getObjectByName('wind-turbines-shared-towers'),records=windFarm.records;if(!towers||!records.length)return null;
 const unit=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0),q=new T.Quaternion(),placement=new T.Matrix4(),first=records[0],towerMatrix=new T.Matrix4();
 towers.getMatrixAt(0,towerMatrix);placement.compose(new T.Vector3(first.x,first.baseY,first.z),q.setFromAxisAngle(up,first.yaw),unit);
 const probe=new T.Mesh(towers.geometry,towers.material);probe.matrixAutoUpdate=false;probe.matrixWorld.copy(placement).invert().multiply(towerMatrix);
 const ray=new T.Raycaster(),direction=new T.Vector3(),normalMatrix=new T.Matrix3().getNormalMatrix(probe.matrixWorld),offset=.008;
 function surface(phi,y){direction.set(Math.sin(phi),0,Math.cos(phi));ray.set(direction.clone().multiplyScalar(4).add(new T.Vector3(0,y,0)),direction.clone().negate());ray.far=8;
  const hit=ray.intersectObject(probe,false)[0];if(!hit)throw Error('Turbine logo surface not found');const normal=hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();if(normal.dot(direction)<0)normal.negate();return {point:hit.point.clone().addScaledVector(normal,offset),normal};
 }
 const height=1.15,width=1.15,centerY=1.05,radius=surface(0,centerY).point.z-offset,columns=32,rows=6,positions=[],normals=[],uv=[],indices=[];
 for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
  const u=col/columns,v=row/rows,phi=(u-.5)*width/radius,sample=surface(phi,centerY+height*(.5-v));
  positions.push(...sample.point.toArray());normals.push(...sample.normal.toArray());uv.push(u,v);
 }
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const a=row*(columns+1)+col,b=a+columns+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);
 const mesh=new T.InstancedMesh(geometry,branding.material,records.length);mesh.name='bargheto-wind-base-logos215';mesh.renderOrder=2;mesh.castShadow=mesh.receiveShadow=false;mesh.userData={editLocked:true,sourceLogo:'Object_10',placement:'lower-tower-facing-city',surfaceOffset:offset,count:records.length};
 for(const [i,r]of records.entries()){placement.compose(new T.Vector3(r.x,r.baseY,r.z),q.setFromAxisAngle(up,r.yaw),unit);mesh.setMatrixAt(i,placement);}
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();windFarm.group.add(mesh);windFarm.logos215=mesh;
 windFarm.group.userData.additionalDrawCalls=(windFarm.group.userData.additionalDrawCalls??0)+1;
 windFarm.group.userData.branding215={copies:records.length,drawCalls:1,triangles:indices.length/3*records.length,texture:'original-tracker-logo'};
 const dispose=windFarm.dispose;windFarm.dispose=function(){mesh.geometry.dispose();mesh.dispose();mesh.removeFromParent();dispose();};
 return mesh;
}
