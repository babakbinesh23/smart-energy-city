/* Visual facing is separate from the saved editor transform and speech gestures. */
export function createOfficeExpertPresence117(root,TransformNode,Vector3){
 const scene=root.getScene(),pivot=new TransformNode('office117-guide-facing',scene),children=root.getChildren();pivot.parent=root;for(const child of children)child.parent=pivot;
 const head=root.getDescendants().find(n=>n.name==='head_07'||n.name.endsWith('/head_07')),Q=head?.rotationQuaternion?.constructor,rest=head?.rotationQuaternion?.clone(),up=new Vector3(0,1,0),front=new Vector3,right=new Vector3,dir=new Vector3,headPos=new Vector3,parentQ=Q?new Q:null,bodyQ=Q?new Q:null,desired=Q?new Q:null,gaze=Q?new Q:null;
 let gazeReady=false;
 root.computeWorldMatrix(true);const initial=root.getHierarchyBoundingVectors(true),height=initial.max.y-initial.min.y;
 if(height>.5&&height<4){pivot.scaling.scaleInPlace(1.9/height);root.computeWorldMatrix(true);}
 // The supplied model's origin is below its soles. Raise only penetrations;
 // intentional elevated placements from the administrator remain elevated.
 root.computeWorldMatrix(true);const box=root.getHierarchyBoundingVectors(true);if(box.min.y<0&&box.min.y>-.6){root.position.y+=.005-box.min.y;root.computeWorldMatrix(true);}
 return{pivot,update(dt,eye,enabled=true,editing=false){
  if(!enabled||editing||!root.isEnabled()||dt<=0)return;dt=Math.min(dt,.08);const p=root.getAbsolutePosition();if(Math.hypot(eye.x-p.x,eye.z-p.z)>8||Math.abs(eye.y-p.y)>4)return;
  root.computeWorldMatrix(true);const local=Vector3.TransformCoordinates(new Vector3(eye.x,p.y,eye.z),root.getWorldMatrix().clone().invert()),angle=Math.atan2(local.x,local.z),delta=Math.atan2(Math.sin(angle-pivot.rotation.y),Math.cos(angle-pivot.rotation.y));pivot.rotation.y+=delta*(1-Math.exp(-6*dt));pivot.computeWorldMatrix(true);
  if(!head||!Q)return;head.computeWorldMatrix(true);headPos.copyFrom(head.getAbsolutePosition());dir.copyFrom(eye).subtractInPlace(headPos);if(dir.lengthSquared()<.04)return;
  pivot.getWorldMatrix().decompose(undefined,bodyQ);front.copyFrom(Vector3.TransformNormal(new Vector3(0,0,1),pivot.getWorldMatrix()));front.y=0;front.normalize();right.copyFrom(Vector3.Cross(up,front)).normalize();
  const yaw=Math.max(-.7,Math.min(.7,Math.atan2(Vector3.Dot(dir,right),Vector3.Dot(dir,front)))),pitch=Math.max(-.38,Math.min(.38,Math.atan2(dir.y,Math.hypot(dir.x,dir.z))));
  head.parent.computeWorldMatrix(true);head.parent.getWorldMatrix().decompose(undefined,parentQ);const neutral=parentQ.multiply(rest);desired.copyFrom(Q.RotationAxis(up,yaw).multiply(Q.RotationAxis(right,-pitch)).multiply(neutral));
  if(!gazeReady){head.getWorldMatrix().decompose(undefined,gaze);gazeReady=true;}Q.SlerpToRef(gaze,desired,1-Math.exp(-12*dt),gaze);parentQ.invert().multiplyToRef(gaze,head.rotationQuaternion);head.markAsDirty('rotationQuaternion');
 }};
}
