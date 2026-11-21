// Reposition the motor before static batching. The original server GLBs remain
// byte-for-byte unchanged; both variants use the same belt-plane/pulley geometry.
export function beltPath94(T,fan,motor,R=.109,r=.034){
 const d=motor.clone().sub(fan),D=d.length();if(D<=R+r)throw Error('Cooler pulley clearance is invalid');
 const alpha=Math.acos((R-r)/D),angle=Math.atan2(d.y,d.x),plus=angle+alpha,minus=angle-alpha;
 const norm=a=>new T.Vector2(Math.cos(a),Math.sin(a)),p=fan.clone().addScaledVector(norm(plus),R),q=motor.clone().addScaledVector(norm(plus),r),p2=fan.clone().addScaledVector(norm(minus),R),q2=motor.clone().addScaledVector(norm(minus),r);
 const line=p.distanceTo(q),small=2*alpha*r,large=(2*Math.PI-2*alpha)*R,length=2*line+small+large;
 const at=(distance)=>{
  let s=((distance%length)+length)%length,point,tangent;
  if(s<line){point=p.clone().lerp(q,s/line);tangent=q.clone().sub(p).normalize();}
  else if((s-=line)<small){const a=plus-s/r;point=motor.clone().addScaledVector(norm(a),r);tangent=new T.Vector2(Math.sin(a),-Math.cos(a));}
  else if((s-=small)<line){point=q2.clone().lerp(p2,s/line);tangent=p2.clone().sub(q2).normalize();}
  else{const a=minus-(s-line)/R;point=fan.clone().addScaledVector(norm(a),R);tangent=new T.Vector2(Math.sin(a),-Math.cos(a));}
  return{point,tangent};
 };
 return{length,at,fan,motor,R,r,tangentLength:line};
}
function cable94(T,parent,name,points,material){const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),32,.006,5,false),material);mesh.name=name;parent.add(mesh);return mesh;}
function beltGeometry94(T,path,x=-.294){
 const count=160,positions=[],indices=[];
 for(let i=0;i<=count;i++){
  const{point,tangent}=path.at(path.length*i/count),normal=new T.Vector2(-tangent.y,tangent.x);
  // Narrow trapezoidal section, seated in the existing V grooves.
  for(const [axial,radial]of[[-.005,.002],[.005,.002],[.003,-.002],[-.003,-.002]])positions.push(x+axial,point.y+normal.y*radial,point.x+normal.x*radial);
  if(i<count)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+j,d=(i+1)*4+(j+1)%4;indices.push(a,b,c,b,d,c);}
 }
 const geometry=new T.BufferGeometry;geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
export function relocateCoolerMotor94(T,scene,variant){
 const motor=scene.getObjectByName('DRIVE_MOTOR_SHAFT_AND_PULLEY'),fan=scene.getObjectByName('DRIVE_FAN_AND_MAIN_PULLEY');
 if(!motor||!fan)throw Error('Supplied cooler drive hierarchy is missing');
 const parent=motor.parent,delta=new T.Vector3(0,0,.20-motor.position.z),old=motor.position.clone(),moved=[],markers=[];
 scene.traverse(o=>{
  if(o.name.startsWith('DRIVE_BELT_RIDGE_'))markers.push(o);
  if(o!==motor&&(/^(Motor_|Capacitor_clamps)/.test(o.name)||o.name==='BLDC_MOTOR_REPLACEMENT'||o.name==='BLDC-adapter-on-original-cradle'||o.name==='BLDC-sealed-controller'))moved.push(o);
 });
 // The shaft children inherit the pivot translation; never translate them twice.
 for(const o of moved){if(o.parent===motor||o.name.startsWith('Motor_power_cable'))continue;o.position.add(delta);}
 motor.position.add(delta);
 const oldBelt=[];scene.traverse(o=>{if(o.name.startsWith('Continuous_rubber_V_belt')||o.name.startsWith('Motor_power_cable')||o.name==='BLDC-motor-phase-harness'||o.name==='BLDC-controller-supply-harness')oldBelt.push(o);});
 const beltMaterial=oldBelt.find(o=>o.name.startsWith('Continuous_rubber_V_belt'))?.material??new T.MeshStandardMaterial({color:0x202529,roughness:.88});
 for(const o of oldBelt)o.removeFromParent();
 const path=beltPath94(T,new T.Vector2(fan.position.z,fan.position.y),new T.Vector2(motor.position.z,motor.position.y));
 const belt=new T.Mesh(beltGeometry94(T,path),beltMaterial);belt.name='relocated-continuous-V-belt94';belt.castShadow=true;belt.receiveShadow=true;parent.add(belt);
 const wireMaterial=new T.MeshStandardMaterial({color:0x232b2d,roughness:.8});
 const z=motor.position.z;
 if(variant==='bldc'){
  const cz=-.22+delta.z;
  cable94(T,parent,'BLDC-motor-phase-harness',[ [.29,.88,cz],[.29,.96,cz+.03],[.02,.96,z+.03],[-.02,.91,z-.036] ],wireMaterial);
  cable94(T,parent,'BLDC-controller-supply-harness',[ [-.345,.797,.327],[-.35,.90,.32],[-.35,.965,.30],[.29,.965,.30],[.29,.88,cz-.035] ],wireMaterial);
 }else cable94(T,parent,'Motor_power_cable_rerouted94',[ [-.345,.797,.327],[-.35,.90,.32],[-.35,.965,.30],[-.10,.965,.30],[-.10,.91,z+.05],[-.10,.88,z+.026] ],wireMaterial);
 const dynamicNames=markers.map(o=>o.name),speed=2*Math.PI*450/60*path.R;
 const update=time=>{for(let i=0;i<markers.length;i++){const o=markers[i],{point,tangent}=path.at(i/markers.length*path.length+time*speed);o.position.set(-.3003,point.y,point.x);o.rotation.set(Math.atan2(-tangent.y,tangent.x),0,0);}};
 update(0);scene.updateMatrixWorld(true);
 const report={version:'2.5.94',variant,from:old.toArray(),to:motor.position.toArray(),delta:delta.toArray(),beltLength:path.length,pulleyRatio:path.R/path.r,markers:markers.length,moved:moved.filter(o=>o.parent!==motor).map(o=>o.name),fanPivotUnchanged:fan.position.toArray(),junctionAnchor:[-.345,.797,.327],reroutedCables:variant==='bldc'?['BLDC-motor-phase-harness','BLDC-controller-supply-harness']:['Motor_power_cable_rerouted94']};
 scene.userData.motorRelocation94=report;return{update,dynamicNames,path,report};
}
