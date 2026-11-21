// Move the tilt pivot onto the actual trunnion in the unchanged supplied GLB.
// Preserve every original vertex in the rest pose; bridge the small mounting gap.
export function repairTrackerHinge212(T,model){
 const yaw=model.getObjectByName('Bargheto_Neck_Yaw_Y_Animated_6'),tilt=model.getObjectByName('Bargheto_Panel_Tilt_X_Animated_8');
 const support=model.getObjectByName('Object_8'),back=model.getObjectByName('Object_17');
 if(!yaw||!tilt||!support||!back)throw Error('Tracker hinge geometry missing');
 if(tilt.userData.hinge212)return tilt.userData.hinge212;
 model.updateMatrixWorld(true);
 const transform=new T.Matrix4().copy(yaw.matrixWorld).invert().multiply(support.matrixWorld),p=support.geometry.attributes.position,points=[];
 let top=-Infinity;
 for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform);top=Math.max(top,v.y);points.push(v);}
 // The upper semicircular bearing in this GLB has a 0.133 m radius.
 const cap=points.filter(v=>v.y>top-.14),bounds=new T.Box3().setFromPoints(cap);
 const hinge=new T.Vector3((bounds.min.x+bounds.max.x)/2,top-(bounds.max.z-bounds.min.z)/2,(bounds.min.z+bounds.max.z)/2);
 const correction=tilt.position.clone().sub(hinge);
 tilt.position.copy(hinge);for(const child of tilt.children)child.position.add(correction);
 model.updateMatrixWorld(true);
 // Connect the bearing axis to the nearest real triangle on the back frame.
 const backToTilt=new T.Matrix4().copy(tilt.matrixWorld).invert().multiply(back.matrixWorld),bp=back.geometry.attributes.position,bi=back.geometry.index;
 const triangle=new T.Triangle(),origin=new T.Vector3(),nearest=new T.Vector3(),attachment=new T.Vector3();let distance=Infinity;
 for(let i=0;i<(bi?.count??bp.count);i+=3){
  for(const [vertex,offset]of [[triangle.a,0],[triangle.b,1],[triangle.c,2]])vertex.fromBufferAttribute(bp,bi?bi.getX(i+offset):i+offset).applyMatrix4(backToTilt);
  triangle.closestPointToPoint(origin,nearest);const d=nearest.lengthSq();if(d<distance){distance=d;attachment.copy(nearest);}
 }
 const axle=new T.CylinderGeometry(.075,.075,.56,10);axle.rotateZ(Math.PI/2);
 const length=attachment.length(),bridge=new T.CylinderGeometry(.105,.105,Math.max(.01,length)+.02,10);
 if(length>.0001)bridge.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),attachment.clone().normalize()));
 bridge.translate(attachment.x/2,attachment.y/2,attachment.z/2);
 const positions=[],normals=[],indices=[];
 for(const geometry of [axle,bridge]){const offset=positions.length/3;positions.push(...geometry.attributes.position.array);normals.push(...geometry.attributes.normal.array);indices.push(...Array.from(geometry.index.array,i=>i+offset));geometry.dispose();}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setIndex(indices);
 const mount=new T.Mesh(geometry,Array.isArray(support.material)?support.material[0]:support.material);mount.name='tracker-bearing-and-panel-mount212';mount.userData.editLocked=true;mount.castShadow=mount.receiveShadow=false;tilt.add(mount);
 const result={hinge:hinge.toArray(),attachment:attachment.toArray(),mountLength:length,triangles:indices.length/3};tilt.userData.hinge212=result;model.updateMatrixWorld(true);return result;
}
