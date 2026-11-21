import {repairTrackerHinge212} from './tracker-hinge-2.5.212.js';
export const TRACKERS207=Object.freeze({width:9*1.3,parkTilt:-Math.PI/4,parkYaw:Math.PI,speed:.24,sites:[{x:27.35,z:-150.5},{x:41.65,z:-150.5}],view:{position:[12,28,-121],target:[34.5,6.24,-150.5]}});
const url207=(window.barghetoCityServerMedia109?.["sun-tracker-2.5.208.glb"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./sun-tracker-2.5.208.glb',import.meta.url).href));
const wrap207=v=>Math.atan2(Math.sin(v),Math.cos(v));
export function slew207(value,target,dt,angular=false){const delta=angular?wrap207(target-value):target-value,step=Math.min(Math.abs(delta)*(1-Math.exp(-2.2*dt)),TRACKERS207.speed*dt);return value+Math.sign(delta)*step;}
export async function buildSunTrackers207(options){let gltf;try{gltf=await new options.Loader().loadAsync(url207);}catch(error){console.warn('Sun trackers unavailable; city continues.',error);return null;}return createSunTrackers207({...options,gltf});}
export function createSunTrackers207({T,gltf,physics,network,sunDirection,patch=()=>{},ground=.15}){
 const template=gltf.scene;repairTrackerHinge212(T,template);template.updateMatrixWorld(true);const raw=new T.Box3().setFromObject(template),size=raw.getSize(new T.Vector3()),scale=TRACKERS207.width/size.x;
 const group=new T.Group();group.name='solar-dual-axis-trackers207';const records=[],sweptBounds=[],ownedColliders=[];
 const q=new T.Quaternion(),sun=new T.Vector3(),box=new T.Box3();let enabled=false,disposed=false,collisionClock=0;
 const front=template.getObjectByName('Object_15');const g=front.geometry.clone().applyMatrix4(front.matrixWorld),p=g.attributes.position,index=g.index;
 const n0=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let best=0;
 for(let i=0;i<(index?.count??p.count);i+=3){a.fromBufferAttribute(p,index?index.getX(i):i);b.fromBufferAttribute(p,index?index.getX(i+1):i+1);c.fromBufferAttribute(p,index?index.getX(i+2):i+2);b.sub(a).cross(c.sub(a));if(b.lengthSq()>best){best=b.lengthSq();n0.copy(b).normalize();}}
 g.dispose();if(n0.y<0)n0.negate();const beta0=Math.atan2(n0.z,n0.y),parkTilt=-Math.PI/2-beta0;
 const materials=new Set();template.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
 for(const m of materials){m.forceSinglePass=true;for(const value of Object.values(m))if(value?.isTexture)value.anisotropy=2;patch(m,'solar-tracker207-'+m.name);}
 for(const [i,site]of TRACKERS207.sites.entries()){
  const root=new T.Group();root.name='sun-tracker-'+(i+1);root.position.set(site.x,ground-raw.min.y*scale,site.z);root.scale.setScalar(scale);const model=template.clone(true);root.add(model);group.add(root);
  const yawNode=model.getObjectByName('Bargheto_Neck_Yaw_Y_Animated_6'),tiltNode=model.getObjectByName('Bargheto_Panel_Tilt_X_Animated_8');
  if(!yawNode||!tiltNode)throw Error('Tracker axes not found');
  model.traverse(o=>{o.userData.editLocked=true;if(o.isMesh)o.castShadow=o.receiveShadow=false;});
  const pole=physics.addStaticCylinder(new T.Vector3(site.x,ground+2.2*scale,site.z),2.2*scale,.78*scale);if(pole)ownedColliders.push(pole);
  const r={site,root,yawNode,tiltNode,yaw:TRACKERS207.parkYaw,tilt:parkTilt,targetYaw:TRACKERS207.parkYaw,targetTilt:parkTilt,angularSpeed:0,collider:null};records.push(r);
  yawNode.rotation.set(0,r.yaw,0);tiltNode.rotation.set(r.tilt,0,0);root.updateMatrixWorld(true);box.setFromObject(tiltNode);r.collider=physics.addStaticBox(box.getCenter(new T.Vector3()),box.getSize(new T.Vector3()).multiplyScalar(.5));if(r.collider)ownedColliders.push(r.collider);
  root.userData={editRoot:true,editId:root.name,editLabel:'پنل خورشیدی متحرک '+(i+1),editColliders:[pole?.handle,r.collider?.handle].filter(v=>v!==undefined),tracking:false};
  sweptBounds.push({minX:site.x-6.2*1.3,maxX:site.x+6.2*1.3,minZ:site.z-6.2*1.3,maxZ:site.z+6.2*1.3});
 }
 let cable=trackerCables207(T,network,ground,records);if(cable)group.add(cable.mesh);const cableRootMatrices=records.map(r=>r.root.matrixWorld.clone());
 function refreshCables(){let dirty=false;for(const [i,r]of records.entries()){r.root.updateWorldMatrix(true,false);if(!r.root.matrixWorld.equals(cableRootMatrices[i])){dirty=true;cableRootMatrices[i].copy(r.root.matrixWorld);}}if(!dirty)return;const next=trackerCables207(T,network,ground,records);if(cable){cable.mesh.removeFromParent();cable.mesh.geometry.dispose();cable.mesh.material.dispose();}cable=next;if(cable){cable.mesh.material.color.setHex(enabled?0x3d6e75:0x343b40);group.add(cable.mesh);}group.userData.cableConnections=cable?.connections??[];}
 function targets(){sun.copy(sunDirection()).normalize();const yaw=Math.atan2(-sun.x,-sun.z),beta=-Math.atan2(Math.hypot(sun.x,sun.z),Math.max(.08,sun.y));for(const r of records){r.targetYaw=enabled?yaw:TRACKERS207.parkYaw;r.targetTilt=enabled?Math.max(-1.7,Math.min(1.7,beta-beta0)):parkTilt;}}
 function setEnabled(value){enabled=!!value;targets();for(const r of records)r.root.userData.tracking=enabled;if(cable)cable.mesh.material.color.setHex(enabled?0x3d6e75:0x343b40);}
 function park(){setEnabled(false);for(const r of records){r.yaw=TRACKERS207.parkYaw;r.tilt=parkTilt;r.angularSpeed=0;r.yawNode.rotation.set(0,r.yaw,0);r.tiltNode.rotation.set(r.tilt,0,0);}group.updateMatrixWorld(true);syncCollisions();}
 function syncCollisions(){for(const r of records){if(!r.collider)continue;box.setFromObject(r.tiltNode);r.collider.setTranslation?.(box.getCenter(new T.Vector3()));r.collider.setHalfExtents?.(box.getSize(new T.Vector3()).multiplyScalar(.5));}}
 function update(dt){if(disposed||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(.1,dt);refreshCables();targets();let moved=false;for(const r of records){const yaw=slew207(r.yaw,r.targetYaw,dt,true),tilt=slew207(r.tilt,r.targetTilt,dt);r.angularSpeed=Math.hypot(wrap207(yaw-r.yaw),tilt-r.tilt)/dt;if(Math.abs(yaw-r.yaw)>1e-8||Math.abs(tilt-r.tilt)>1e-8){moved=true;r.yaw=yaw;r.tilt=tilt;r.yawNode.rotation.set(0,r.yaw,0);r.tiltNode.rotation.set(r.tilt,0,0);}}if(moved){group.updateMatrixWorld(true);collisionClock+=dt;if(collisionClock>.1){collisionClock=0;syncCollisions();}}}
 const bounds=new T.Box3(new T.Vector3(19,ground,-159),new T.Vector3(50,ground+15,-141));
 group.userData={source:'sun-tracker-2.5.208.glb',trackerCount:2,sharedTextures:true,defaultTracking:false,cableConnections:cable?.connections??[]};
 function dispose(){if(disposed)return;disposed=true;for(const c of ownedColliders)physics.world.removeCollider(c,true);const gs=new Set(),ms=new Set(),ts=new Set();template.traverse(o=>{if(o.isMesh){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);}});if(cable){gs.add(cable.mesh.geometry);ms.add(cable.mesh.material);}for(const m of ms)for(const v of Object.values(m))if(v?.isTexture)ts.add(v);for(const g of gs)g.dispose();for(const m of ms)m.dispose();for(const t of ts)t.dispose();group.removeFromParent();}
 setEnabled(false);return {group,records,sweptBounds,bounds,setEnabled,park,update,dispose,get cable(){return cable;},get enabled(){return enabled;},get settled(){return records.every(r=>Math.abs(wrap207(r.yaw-r.targetYaw))<.012&&Math.abs(r.tilt-r.targetTilt)<.012);},normal(index=0){const r=records[index];return n0.clone().applyAxisAngle(new T.Vector3(1,0,0),r.tilt).applyAxisAngle(new T.Vector3(0,1,0),r.yaw);}};
}
function trackerCables207(T,network,ground,records){
 const positions=[],normals=[],indices=[],connections=[];
 class CableRoute extends T.Curve{constructor(points){super();this.points=points.filter((p,i)=>!i||p.distanceTo(points[i-1])>.001);this.lengths=[0];for(let i=1;i<this.points.length;i++)this.lengths.push(this.lengths.at(-1)+this.points[i].distanceTo(this.points[i-1]));this.total=this.lengths.at(-1);}getPoint(t,out=new T.Vector3()){const d=t*this.total;let i=1;while(i<this.points.length-1&&this.lengths[i]<d)i++;return out.copy(this.points[i-1]).lerp(this.points[i],(d-this.lengths[i-1])/(this.lengths[i]-this.lengths[i-1]||1));}}
 for(const [tracker,r]of records.entries()){
  r.root.updateWorldMatrix(true,true);const base=new T.Box3().setFromObject(r.root.getObjectByName('Object_5')),s=r.root.scale.x;
  for(let phase=0;phase<3;phase++){
   const start=new T.Vector3(base.max.x-.008,base.min.y+.23*s,r.root.position.z+(phase-1)*.12*s),closest=new T.Vector3();let distance=Infinity,pathIndex=-1,segment=-1;
   for(const [pi,path]of (network?.paths??[]).entries()){if(path.stage!==1)continue;for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i];if(a.y>2||b.y>2)continue;const point=new T.Line3(a,b).closestPointToPoint(start,true,new T.Vector3()),d=point.distanceToSquared(start);if(d<distance){distance=d;closest.copy(point);pathIndex=pi;segment=i-1;}}}
   if(!Number.isFinite(distance))continue;
   const lane=closest.z+(phase-1)*.10,route=new CableRoute([start,new T.Vector3(start.x+.22,ground+.10,start.z),new T.Vector3(start.x+.22,ground+.10,lane),new T.Vector3(closest.x,ground+.10,lane),closest]);
   const g=new T.TubeGeometry(route,Math.max(10,Math.ceil(route.total/.4)),.038,4,false),offset=positions.length/3;positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);indices.push(...Array.from(g.index.array,i=>i+offset));g.dispose();connections.push({tracker,phase,from:start.toArray(),to:closest.toArray(),collectorPath:pathIndex,collectorSegment:segment});
  }
 }
 if(!indices.length)return null;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setIndex(indices);g.computeBoundingSphere();const mesh=new T.Mesh(g,new T.MeshBasicMaterial({color:0x343b40}));mesh.name='sun-tracker-cables-to-existing-collectors';return {mesh,connections};
}
