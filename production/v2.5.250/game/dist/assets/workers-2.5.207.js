import {WorkerAudio86} from "./worker-audio-2.5.89-r109-media223.js";
// Fifteen solar/VPP workers in five groups of three. Shared original mesh; individual skeletons and social state.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t;
const GROUPS=[
 {id:'solar-01',zone:'solar',count:3,x:32,z:-152},
 {id:'solar-03',zone:'solar',count:3,x:112,z:-138},
 {id:'vpp-01',zone:'vpp',count:3,x:64,z:-48},
 {id:'vpp-02',zone:'vpp',count:3,x:88,z:-77},
 {id:'vpp-03',zone:'vpp',count:3,x:47,z:-82}
];
function random79(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
export class WorkerRig79{
 constructor(T,template,motion){this.T=T;this.template=template;this.motion=motion;this.root=new T.Group;this.visual=new T.Group;this.root.add(this.visual);this.bones=[];this.byName=new Map;this.time=0;this.phase=0;this.weight=0;this.a=new T.Quaternion;this.b=new T.Quaternion;this.q149=new T.Quaternion;this.walk149=new T.Quaternion;this.p149=new T.Vector3;this.v149=new T.Vector3;this.lerp149=new T.Vector3;this.sole149=new T.Vector3;
  for(const joint of template.joints){const bone=new T.Bone;bone.name=joint.name;bone.position.copy(joint.position);bone.quaternion.copy(joint.quaternion);this.bones.push(bone);this.byName.set(joint.name,bone);if(joint.parent<0)this.visual.add(bone);else this.bones[joint.parent].add(bone);}
  this.mesh=new T.SkinnedMesh(template.geometry,template.material);this.mesh.name='chinese-worker-skinned-body';this.visual.add(this.mesh);this.visual.updateMatrixWorld(true);this.skeleton=new T.Skeleton(this.bones);this.mesh.bind(this.skeleton,new T.Matrix4);this.mesh.boundingSphere=new T.Sphere(new T.Vector3(0,.91,0),1.7);this.mesh.frustumCulled=true;this.mesh.receiveShadow=true;this.mesh.castShadow=true;this.mesh.userData.editLocked=true;this.update(0,0,0,0);
 }
 sample(clip,phase,index,out){const n=((phase%1+1)%1)*clip.frames.length,i=Math.floor(n);return out.fromArray(clip.frames[i].q[index]).slerp(this.b.fromArray(clip.frames[(i+1)%clip.frames.length].q[index]),n-i);}
 vector(clip,phase,out){const n=((phase%1+1)%1)*clip.frames.length,i=Math.floor(n);return out.fromArray(clip.frames[i].p).lerp(this.lerp149.fromArray(clip.frames[(i+1)%clip.frames.length].p),n-i);}
 update(dt,speed,distance,talk){const T=this.T,m=this.motion;this.time+=dt;const blend=clamp((speed-.8)/.6,0,1),cycle=mix(m.clips.slow.cycle,m.clips.walk.cycle,blend)*this.template.height/m.height;
  this.phase=(this.phase+distance/Math.max(.2,cycle))%1;this.weight+=(Number(speed>.025)-this.weight)*(1-Math.exp(-dt*8));
  for(let i=0;i<m.names.length;i++){const name=m.names[i],q=this.sample(m.clips.slow,this.phase,i,this.q149).slerp(this.sample(m.clips.walk,this.phase,i,this.walk149),blend);q.slerp(this.sample(m.clips.idle,this.time/m.clips.idle.duration,i,this.a),1-this.weight);if(i===0)q.premultiply(this.template.hipsParent);this.byName.get(name).quaternion.copy(q);}
  const head=this.byName.get('Head'),spine=this.byName.get('Spine2'),forearm=this.byName.get('RightForeArm');
  head.rotateY((1-this.weight)*Math.sin(this.time*.63+.7)*.085);head.rotateX((1-this.weight)*Math.sin(this.time*1.2)*.035);
  spine.rotateY((1-this.weight)*Math.sin(this.time*.42)*.022);forearm.rotateX((1-this.weight)*talk*(-.14-.10*Math.sin(this.time*2.1)));
  const p=this.vector(m.clips.slow,this.phase,this.p149).lerp(this.vector(m.clips.walk,this.phase,this.v149),blend).lerp(this.vector(m.clips.idle,this.time/m.clips.idle.duration,this.v149),1-this.weight).multiplyScalar(this.template.height/m.height);
  this.visual.position.copy(p);this.root.updateMatrixWorld(true);let sole=Infinity;
  for(const index of this.template.soles){const v=this.mesh.getVertexPosition(index,this.sole149);sole=Math.min(sole,v.y+this.visual.position.y);}
  if(Number.isFinite(sole))this.visual.position.y-=clamp(sole,-.28,.28);this.root.updateMatrixWorld(true);this.skeleton.update();
 }
 dispose(){this.skeleton.dispose();this.root.removeFromParent();}
}
export function rigWorker79(T,source,driver,merge,patchMaterial){const height=1.90;source.updateMatrixWorld(true);driver.updateMatrixWorld(true);const box=new T.Box3().setFromObject(source),scale=height/(box.max.y-box.min.y),center=box.getCenter(new T.Vector3),normalise=new T.Matrix4().makeRotationY(Math.PI).multiply(new T.Matrix4().makeScale(scale,scale,scale)).multiply(new T.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
 const parts=[];let originalMaterial;source.traverse(o=>{if(!o.isMesh)return;parts.push(o.geometry.clone().applyMatrix4(normalise.clone().multiply(o.matrixWorld)));originalMaterial??=Array.isArray(o.material)?o.material[0]:o.material;});const geometry=merge(parts,false);parts.forEach(g=>g.dispose());if(!geometry||!originalMaterial)throw Error('Worker mesh unavailable');const material=originalMaterial.clone();patchMaterial?.(material);
 const names=['Hips','Spine','Spine1','Spine2','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','LeftToe','RightUpLeg','RightLeg','RightFoot','RightToe'];
 const parents=[-1,0,1,2,3,4,3,6,7,8,3,10,11,12,0,14,15,16,0,18,19,20];
 const points=[[0,.52,0],[0,.58,0],[0,.66,0],[0,.735,0],[0,.85,0],[0,.90,0],[.055,.77,0],[.125,.765,0],[.235,.65,0],[.305,.535,.025],[-.055,.77,0],[-.125,.765,0],[-.235,.65,0],[-.305,.535,.025],[.06,.52,0],[.068,.29,.015],[.073,.075,-.01],[.073,.035,.075],[-.06,.52,0],[-.068,.29,.015],[-.073,.075,-.01],[-.073,.035,.075]].map(p=>new T.Vector3(...p).multiplyScalar(height));
 const sourceBones=new Map;driver.traverse(o=>{if(o.isBone)sourceBones.set(o.name.replace(/_\d+$/,''),o);});const sourceBone=name=>sourceBones.get(name.endsWith('Toe')?name+'Base':name);const hips=sourceBone('Hips');if(!hips)throw Error('Main character rig unavailable');const hipsParent=hips.parent.getWorldQuaternion(new T.Quaternion);
 const worlds=names.map(name=>{const bone=sourceBone(name);if(!bone)throw Error('Missing locomotion joint '+name);return bone.getWorldQuaternion(new T.Quaternion);});
 const joints=names.map((name,i)=>{const parent=parents[i],inverse=parent<0?new T.Quaternion:worlds[parent].clone().invert();return {name,parent,position:parent<0?points[i].clone():points[i].clone().sub(points[parent]).applyQuaternion(inverse),quaternion:inverse.clone().multiply(worlds[i])};});
 const pos=geometry.getAttribute('position'),weights=new Float32Array(pos.count*4),indices=new Uint16Array(pos.count*4),soles=[],soleSides=[[],[]];
 const segment=(p,a,b)=>{const ab=b.clone().sub(a),t=clamp(p.clone().sub(a).dot(ab)/Math.max(1e-8,ab.lengthSq()),0,1);return p.distanceTo(a.clone().addScaledVector(ab,t));};
 for(let i=0;i<pos.count;i++){const p=new T.Vector3().fromBufferAttribute(pos,i),h=p.y/height,x=Math.abs(p.x)/height,side=p.x>=0?0:1;let candidates;
  if(h<.515&&!(x>.19&&h>.32)){const start=side?18:14;candidates=[[start,segment(p,points[start],points[start+1])],[start+1,segment(p,points[start+1],points[start+2])],[start+2,segment(p,points[start+2],points[start+3])],[0,p.distanceTo(points[0])+.04]];}
  else if(x>.145&&h<.83){const start=side?11:7;candidates=[[start,segment(p,points[start],points[start+1])],[start+1,segment(p,points[start+1],points[start+2])],[start+2,p.distanceTo(points[start+2])],[3,segment(p,points[2],points[3])+.05]];}
  else if(h>.855)candidates=[[5,0],[4,.12]];
  else candidates=[[0,p.distanceTo(points[0])],[1,p.distanceTo(points[1])],[2,p.distanceTo(points[2])],[3,p.distanceTo(points[3])],[4,p.distanceTo(points[4])]];
  candidates.sort((a,b)=>a[1]-b[1]);const list=candidates.slice(0,4),raw=list.map(([bone,d])=>1/Math.pow(.018+d,6)),sum=raw.reduce((s,v)=>s+v,0);for(let k=0;k<4;k++){indices[i*4+k]=list[k]?.[0]??0;weights[i*4+k]=(raw[k]??0)/sum;}
  if(h<.022)soleSides[side].push(i);
 }
 for(const side of soleSides)for(let n=0;n<Math.min(32,side.length);n++)soles.push(side[Math.floor(n*side.length/Math.min(32,side.length))]);
 geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geometry.computeBoundingBox();geometry.computeBoundingSphere();if(!soles.length)throw Error('Worker sole samples unavailable');return {height,geometry,material,joints,hipsParent,soles};
}
export class WorkerCrowd79{
 constructor(city,T,options){this.city=city;this.T=T;this.options=options;this.group=new T.Group;this.group.name='solar-vpp-workers';this.group.userData.editLocked=true;this.actors=[];this.teams=[];this.random=random79((city.seed??123)+79020);this.time=0;this.disposed=false;this.status='loading';this.audio=new WorkerAudio86(this);this.ready=this.build();}
 async build(){const {load,workerUrl,driverUrl,motion,merge,patchMaterial}=this.options;try{const [worker,driver]=await Promise.all([load(workerUrl),load(driverUrl)]);if(this.disposed)return;this.template=rigWorker79(this.T,worker,driver,merge,patchMaterial);this.motion=motion;this.refreshObstacles();
  let id=0;for(const spec of GROUPS){const group=new this.T.Group;group.name='chinese-worker-team-'+spec.id;group.position.set(spec.x,.15,spec.z);group.userData={editRoot:true,editId:group.name,editLabel:'گروه کارگران '+(spec.zone==='solar'?'خورشیدی':'نیروگاه مجازی'),editColliders:[],workerCount:spec.count,zone:spec.zone};const located=this.findGroupCenter(spec);group.position.x=located.x;group.position.z=located.z;const team={...spec,group,slots:[],walking:0};this.group.add(group);this.teams.push(team);
   for(let i=0;i<spec.count;i++){const angle=i/spec.count*Math.PI*2+.15+(this.random()-.5)*.14,r=1.05+(spec.count===4?.15:0)+(this.random()-.5)*.10,slot=new this.T.Vector3(Math.sin(angle)*r,0,Math.cos(angle)*r);team.slots.push(slot);const rig=new WorkerRig79(this.T,this.template,motion);rig.root.name='chinese-worker-'+String(++id).padStart(2,'0');rig.root.userData={role:'solar-vpp-worker',editLocked:true,group:spec.id};rig.root.position.copy(slot);rig.root.rotation.y=Math.atan2(-slot.x,-slot.z);rig.time=this.random()*18;rig.phase=this.random();this.random();rig.root.scale.setScalar(1);rig.root.userData.height=1.9;team.group.add(rig.root);const actor={id,team,rig,slot:slot.clone(),target:slot.clone(),state:'talking',wait:3+this.random()*16,speed:0,pace:.72+this.random()*.36,accumulator:0,gesture:this.random()*Math.PI*2,collider:null};this.actors.push(actor);}
  }
  this.city.group.add(this.group);this.group.updateMatrixWorld(true);for(const actor of this.actors){const p=actor.rig.root.getWorldPosition(new this.T.Vector3);actor.collider=this.city.physics.addStaticCylinder(p.clone().add(new this.T.Vector3(0,.95,0)),.93,.30,(1<<4)<<16|(1<<2)|(1<<3));if(actor.collider)actor.team.group.userData.editColliders.push(actor.collider.handle);}this.status='ready';this.group.userData.count=this.actors.length;
 }catch(error){this.status='unavailable';this.dispose();console.warn('Optional worker crowd unavailable; city continues.',error);}}
 refreshObstacles(){const T=this.T;this.obstacles=[];for(const record of this.city.group.userData.buildingRecords??[]){if(record.retained)this.obstacles.push({minX:record.rect.minX-.8,maxX:record.rect.maxX+.8,minZ:record.rect.minZ-.8,maxZ:record.rect.maxZ+.8});}
  const panels=this.city.fieldSolar?.group?.getObjectByName('supplied-solar-panels-in-solar-field');if(panels){panels.updateWorldMatrix(true,false);const matrix=new T.Matrix4;panels.geometry.computeBoundingBox();for(let i=0;i<panels.count;i++){panels.getMatrixAt(i,matrix);const b=panels.geometry.boundingBox.clone().applyMatrix4(matrix.premultiply(panels.matrixWorld));this.obstacles.push({minX:b.min.x-.7,maxX:b.max.x+.7,minZ:b.min.z-.7,maxZ:b.max.z+.7});}}
  for(const bounds of this.city.sunTrackers207?.sweptBounds??[])this.obstacles.push({...bounds});
  this.obstacles.push({minX:66,maxX:74,minZ:-69,maxZ:-61});
  const battery=this.city.solarBess?.runtime?.data;for(const root of [battery?.group,battery?.lcdMount]){if(!root)continue;root.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(root);if(!box.isEmpty())this.obstacles.push({minX:box.min.x-.7,maxX:box.max.x+.7,minZ:box.min.z-.7,maxZ:box.max.z+.7});}
 }
 roadClear(x,z,margin=0){const onRoad=this.options.roadContains;if(typeof onRoad!=='function')return true;const r=1.9+margin;return !([0,r,-r].some(dx=>[0,r,-r].some(dz=>onRoad(x+dx,z+dz))));}
 clear(x,z,margin=0){return this.roadClear(x,z,margin)&&!this.obstacles.some(o=>x>o.minX-margin&&x<o.maxX+margin&&z>o.minZ-margin&&z<o.maxZ+margin);}
 findGroupCenter(spec){for(let radius=0;radius<26;radius+=1.5)for(let k=0;k<(radius?24:1);k++){const a=k/24*Math.PI*2,x=spec.x+Math.sin(a)*radius,z=spec.z+Math.cos(a)*radius;if(spec.zone==='solar'&&(x<18||x>126||z< -220||z> -139.5))continue;if(spec.zone==='vpp'&&(x<20||x>124||z< -118||z> -20))continue;if(this.teams.some(t=>Math.hypot(t.group.position.x-x,t.group.position.z-z)<8))continue;if(this.clear(x,z,3))return{x,z};}throw Error('No safe group area for '+spec.id);}
 destination(actor){const T=this.T,team=actor.team;if(team.walking>=1)return false;const radius=2.4+this.random()*.8,angle=Math.atan2(actor.slot.x,actor.slot.z)+(this.random()>.5?1:-1)*(.8+this.random()*.6),target=actor.rig.root.position.distanceTo(actor.slot)>.55?actor.slot.clone():new T.Vector3(Math.sin(angle)*radius,0,Math.cos(angle)*radius);team.group.updateWorldMatrix(true,false);for(let n=0;n<=12;n++){const p=actor.rig.root.position.clone().lerp(target,n/12).applyMatrix4(team.group.matrixWorld);if(!this.clear(p.x,p.z))return false;if(this.actors.some(other=>other!==actor&&other.rig.root.getWorldPosition(new T.Vector3).distanceTo(p)<1.05))return false;}actor.target.copy(target);actor.state='walking';team.walking++;return true;}
 update(dt,viewer,immersive=false){if(this.status!=='ready'||this.disposed||dt<=0)return;dt=clamp(dt,0,.1);this.time+=dt;if(this.city.editing){for(const actor of this.actors)actor.rig.root.visible=!actor.team.group.userData.editorDeleted;return;}const T=this.T;this.group.updateWorldMatrix(true,true);
  for(const actor of this.actors){if(actor.team.group.userData.editorDeleted)continue;const root=actor.rig.root,world=root.getWorldPosition(new T.Vector3),distance=viewer.distanceTo(world);root.visible=distance<125;actor.rig.mesh.castShadow=distance<32&&!immersive;actor.wait-=dt;let step=0;
   if(actor.state==='talking'){actor.speed=Math.max(0,actor.speed-dt*2);if(actor.wait<=0){if(!this.destination(actor))actor.wait=4+this.random()*8;}}
   if(actor.state==='walking'){const delta=actor.target.clone().sub(root.position),remaining=delta.length();actor.speed=Math.min(actor.pace,actor.speed+dt*.9,Math.sqrt(2*.9*remaining));step=Math.min(remaining,actor.speed*dt);const next=root.position.clone().addScaledVector(delta.normalize(),step),candidate=next.clone().applyMatrix4(actor.team.group.matrixWorld);let blocked=viewer.distanceTo(candidate)<1.2||!this.clear(candidate.x,candidate.z)||this.actors.some(other=>other!==actor&&other.rig.root.getWorldPosition(new T.Vector3).distanceTo(candidate)<1.0);
    if(!blocked&&step>.00001){const move=candidate.clone().sub(world),length=move.length();if(length>0&&this.city.physics.castSphere(world.clone().add(new T.Vector3(0,.95,0)),move.normalize(),.3,length+.05,(1<<5)<<16|1,null))blocked=true;}
    if(blocked){actor.speed=0;step=0;}else{root.position.copy(next);const yaw=Math.atan2(delta.x,delta.z);root.rotation.y+=Math.atan2(Math.sin(yaw-root.rotation.y),Math.cos(yaw-root.rotation.y))*(1-Math.exp(-dt*5));}
    if(remaining<.04||blocked){actor.state='talking';actor.team.walking--;actor.wait=7+this.random()*15;actor.speed=0;}
   }else{const yaw=Math.atan2(-root.position.x,-root.position.z);root.rotation.y+=Math.atan2(Math.sin(yaw-root.rotation.y),Math.cos(yaw-root.rotation.y))*(1-Math.exp(-dt*1.3));}
   actor.accumulator+=dt;actor.travel=(actor.travel??0)+step;const interval=distance<32?1/30:distance<70?1/15:1/5;if(root.visible&&actor.accumulator>=interval){actor.rig.update(actor.accumulator,actor.speed,actor.travel,actor.state==='talking'&&Math.sin(this.time*.35+actor.gesture)>.2?1:0);actor.accumulator=0;actor.travel=0;}
   if(actor.collider){const p=root.getWorldPosition(actor.colliderPoint149??=new T.Vector3),last=actor.colliderLast149;if(!last||!last.equals(p)){actor.collider.setTranslation({x:p.x,y:p.y+.95,z:p.z});(actor.colliderLast149??=new T.Vector3).copy(p);}}
  }
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.audio?.dispose();for(const actor of this.actors){if(actor.collider)this.city.physics.world.removeCollider(actor.collider,true);actor.rig.dispose();}this.template?.geometry.dispose();this.template?.material.dispose();this.group.removeFromParent();}
}
