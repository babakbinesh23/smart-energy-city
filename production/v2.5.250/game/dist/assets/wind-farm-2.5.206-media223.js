// Three low-poly turbines share two instanced model meshes, one clip evaluator
// and one optimized texture set. No animated physics, lights or shadow passes.
export const WIND206=Object.freeze({hubHeight:35,sites:[
 {x:-32,z:-242},{x:8,z:-242},{x:48,z:-242}
]});
const modelURL206=(window.barghetoMediaURL223||((url)=>url))(new URL('./wind-turbine-2.5.206.glb',import.meta.url).href);

export async function buildWindFarm206({T,Loader,physics,terrainHeight,transformers,palms=[],patch=()=>{},ground=.15}){
 let gltf;
 try{gltf=await new Loader().loadAsync(modelURL206);}
 catch(error){console.warn('Wind turbines unavailable; city continues.',error);return null;}
 return createWindFarm206({T,gltf,physics,terrainHeight,transformers,palms,patch,ground});
}

export function createWindFarm206({T,gltf,physics,terrainHeight,transformers,palms=[],patch=()=>{},ground=.15}){
 const source=gltf.scene;source.updateMatrixWorld(true);
 const meshes=[];source.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const rotorNode=source.getObjectByName('Blades');
 const bladeMesh=meshes.find(m=>{for(let p=m;p;p=p.parent)if(p===rotorNode)return true;return false;});
 const towerMesh=meshes.find(m=>m!==bladeMesh);
 if(!rotorNode||!bladeMesh||!towerMesh||!gltf.animations.length)throw Error('Wind model has no animated blades');
 const raw=new T.Box3().setFromObject(towerMesh),hub=rotorNode.getWorldPosition(new T.Vector3());
 const center=raw.getCenter(new T.Vector3()),scale=WIND206.hubHeight/(hub.y-raw.min.y);
 const normalize=new T.Matrix4().makeScale(scale,scale,scale).multiply(new T.Matrix4().makeTranslation(-center.x,-raw.min.y,-center.z));
 const group=new T.Group();group.name='wind-farm-three-turbines206';
 const height=(x,z)=>{const h=terrainHeight?.(x,z);return Number.isFinite(h)?h:ground;};
 const up=new T.Vector3(0,1,0),temp=new T.Matrix4(),quaternion=new T.Quaternion(),position=new T.Vector3();
 const bases=[],records=[],colliders=[];
 let rotorRadius=0;const p=bladeMesh.geometry.attributes.position,v=new T.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(bladeMesh.matrixWorld);rotorRadius=Math.max(rotorRadius,v.distanceTo(hub)*scale);}
 const getTarget=site=>{
  let best=null,distance=Infinity;
  for(const palm of palms){if(palm.z<=site.z+5)continue;const d=Math.hypot(palm.x-site.x,palm.z-site.z);if(d<distance){best=palm;distance=d;}}
  return best??{x:site.x,z:-220};
 };
 const material=Array.isArray(towerMesh.material)?towerMesh.material[0]:towerMesh.material;
 material.roughness=Math.max(.7,material.roughness??.8);
 material.envMapIntensity=.6;for(const map of [material.map,material.normalMap,material.roughnessMap,material.metalnessMap])if(map)map.anisotropy=2;
 patch(material,'wind-turbines206');
 const towers=new T.InstancedMesh(towerMesh.geometry,material,3),blades=new T.InstancedMesh(bladeMesh.geometry,material,3);
 towers.name='wind-turbines-shared-towers';blades.name='wind-turbines-shared-animated-blades';
 blades.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const padGeometry=new T.CylinderGeometry(1.7,2.2,.35,12),padMaterial=new T.MeshStandardMaterial({color:'#a3a39a',roughness:1});patch(padMaterial,'wind-foundations206');
 const pads=new T.InstancedMesh(padGeometry,padMaterial,3);pads.name='wind-turbine-foundations';
 for(const [index,site]of WIND206.sites.entries()){
  const target=getTarget(site),yaw=Math.atan2(target.x-site.x,target.z-site.z),baseY=height(site.x,site.z)+.35;
  const base=new T.Matrix4().compose(position.set(site.x,baseY,site.z),quaternion.setFromAxisAngle(up,yaw),new T.Vector3(1,1,1)).multiply(normalize);
  bases.push(base);towers.setMatrixAt(index,temp.multiplyMatrices(base,towerMesh.matrixWorld));blades.setMatrixAt(index,temp.multiplyMatrices(base,bladeMesh.matrixWorld));
  temp.makeTranslation(site.x,baseY-.175,site.z);pads.setMatrixAt(index,temp);
  const add=c=>{if(c)colliders.push(c);};
  add(physics.addStaticCylinder(new T.Vector3(site.x,baseY+WIND206.hubHeight/2,site.z),WIND206.hubHeight/2,1.65));
  add(physics.addStaticCylinder(new T.Vector3(site.x,baseY-.175,site.z),.175,2.2));
  records.push({...site,baseY,yaw,target:{x:target.x,z:target.z},rotorCenter:hub.clone().applyMatrix4(base).toArray(),hubHeight:WIND206.hubHeight,rotorRadius});
 }
 // A fixed bound encloses every blade angle, so culling never cuts rotating tips.
 const bounds=new T.Box3();for(const record of records){const c=new T.Vector3().fromArray(record.rotorCenter);bounds.expandByPoint(c.clone().addScalar(rotorRadius));bounds.expandByPoint(c.clone().addScalar(-rotorRadius));}
 blades.boundingBox=bounds;blades.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
 for(const mesh of[towers,blades,pads]){mesh.castShadow=false;mesh.receiveShadow=false;mesh.instanceMatrix.needsUpdate=true;}
 towers.computeBoundingBox();towers.computeBoundingSphere();pads.computeBoundingBox();pads.computeBoundingSphere();group.add(towers,blades,pads);
 const cable=createWindCables206(T,records,transformers,height);if(cable)group.add(cable.mesh);
 const mixer=new T.AnimationMixer(source);mixer.clipAction(gltf.animations[0]).play();mixer.timeScale=.6;
 const triangles=meshes.reduce((sum,m)=>sum+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0)*3;
 group.userData={editRoot:true,editId:'wind-farm206',editLabel:'سه توربین بادی',editColliders:colliders.map(c=>c.handle),
  turbineCount:3,records,modelTriangles:triangles,additionalDrawCalls:cable?4:3,sharedTextureSet:true,animationEvaluators:1,
  shadows:false,dynamicLights:0,source:'wind-turbine-2.5.206.glb',cableConnections:cable?.connections??[],educational:true};
 let clock=0,disposed=false;
 function update(dt){
  if(disposed||!Number.isFinite(dt)||dt<=0)return;
  const delta=Math.min(.1,dt);clock+=delta;mixer.update(delta);source.updateMatrixWorld(true);
  for(let i=0;i<3;i++)blades.setMatrixAt(i,temp.multiplyMatrices(bases[i],bladeMesh.matrixWorld));
  blades.instanceMatrix.needsUpdate=true;if(cable)cable.uniforms.time.value=clock;
 }
 function dispose(){
  if(disposed)return;disposed=true;mixer.stopAllAction();mixer.uncacheRoot(source);
  for(const collider of colliders)physics.world.removeCollider(collider,true);
  const geometries=new Set(),materials=new Set(),textures=new Set();
  source.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
  geometries.add(padGeometry);materials.add(padMaterial);if(cable){geometries.add(cable.mesh.geometry);materials.add(cable.mesh.material);}
  for(const m of materials)for(const value of Object.values(m))if(value?.isTexture)textures.add(value);
  for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();
  towers.dispose();blades.dispose();pads.dispose();group.removeFromParent();
 }
 return {group,records,update,dispose,mixer,blades,cable};
}

function createWindCables206(T,records,transformers,height){
 if(!transformers?.length)return null;
 const position=[],normal=[],distance=[],phase=[],indices=[],connections=[];
 class Route extends T.Curve{
  constructor(points){super();this.points=points;this.lengths=[0];for(let i=1;i<points.length;i++)this.lengths.push(this.lengths.at(-1)+points[i].distanceTo(points[i-1]));this.total=this.lengths.at(-1);}
  getPoint(t,out=new T.Vector3()){const d=t*this.total;let i=1;while(i<this.lengths.length-1&&this.lengths[i]<d)i++;return out.copy(this.points[i-1]).lerp(this.points[i],(d-this.lengths[i-1])/(this.lengths[i]-this.lengths[i-1]||1));}
 }
 for(const [index,record]of records.entries()){
  const transformer=transformers.reduce((best,t)=>Math.hypot(t.group.position.x-record.x,t.group.position.z-record.z)<Math.hypot(best.group.position.x-record.x,best.group.position.z-record.z)?t:best);
  for(let circuit=0;circuit<3;circuit++){
   const port=transformer.secondary[circuit].clone(),lane=record.z-3-index*.65-circuit*.18;
   const points=[new T.Vector3(record.x+.6+circuit*.14,record.baseY+.18,record.z+.5),
    new T.Vector3(record.x+.6+circuit*.14,height(record.x,lane)+.16,lane),
    new T.Vector3(port.x,height(port.x,lane)+.16,lane),
    new T.Vector3(port.x,height(port.x,port.z-1)+.16,port.z-1),
    new T.Vector3(port.x,port.y,port.z-1),port];
   // Follow the actual desert terrain between bends without dynamic geometry.
   const sampled=[points[0]];
   for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],steps=i<4?Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/4)):1;
    for(let k=1;k<=steps;k++){const p=a.clone().lerp(b,k/steps);if(i<4&&k<steps)p.y=Math.max(p.y,height(p.x,p.z)+.14);sampled.push(p);}
   }
   const route=new Route(sampled),geometry=new T.TubeGeometry(route,Math.max(12,Math.ceil(route.total/3)),.065,4,false);
   const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv,base=position.length/3;
   position.push(...p.array);normal.push(...n.array);for(let k=0;k<p.count;k++){distance.push(uv.getX(k)*route.total);phase.push(circuit);}
   indices.push(...Array.from(geometry.index.array,i=>i+base));
   connections.push({turbine:index,phase:circuit,transformer:transformer.group.userData.site??transformer.group.name,terminal:port.toArray(),start:points[0].toArray(),length:route.total});geometry.dispose();
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geometry.setAttribute('aWindDistance',new T.Float32BufferAttribute(distance,1));geometry.setAttribute('aWindPhase',new T.Float32BufferAttribute(phase,1));geometry.setIndex(indices);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const uniforms={time:{value:0}},material=new T.MeshBasicMaterial({color:0xffffff,fog:true});
 material.onBeforeCompile=shader=>{
  shader.uniforms.uWindTime=uniforms.time;
  shader.vertexShader='attribute float aWindDistance;attribute float aWindPhase;varying float vWindDistance;varying float vWindPhase;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWindDistance=aWindDistance;vWindPhase=aWindPhase;');
  shader.fragmentShader='uniform float uWindTime;varying float vWindDistance;varying float vWindPhase;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat pulse=pow(max(0.,1.-abs(fract((vWindDistance-uWindTime*5.)/14.-vWindPhase*.15)-.5)*9.),2.);vec3 flowColor=mix(vec3(1.,.12,.04),vec3(.04,.55,1.),step(.5,mod(vWindPhase,2.)));diffuseColor.rgb=mix(vec3(.07,.09,.105),flowColor,pulse);');
 };
 material.customProgramCacheKey=()=> 'wind-power-flow206';
 const mesh=new T.Mesh(geometry,material);mesh.name='wind-three-phase-cables-with-generation-flow';mesh.castShadow=false;mesh.receiveShadow=false;
 return {mesh,connections,uniforms};
}
