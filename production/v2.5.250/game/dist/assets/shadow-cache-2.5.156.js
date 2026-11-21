// Exact shadow geometry, native cascade cameras and native depth materials.
// Static depth is copied into the live target; moving casters depth-test over it.
const same=(a,b)=>{if(!a||!b||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
const now=()=>performance.now();
export class ShadowPipeline156{
 constructor(renderer,T,{geometryBudget=24*1048576,cacheBudget=48*1048576}={}){
  this.renderer=renderer;this.T=T;this.geometryBudget=geometryBudget;this.cacheBudget=cacheBudget;
  this.records=new Map();this.batches=[];this.lights=new Map();this.frame=0;this.revision=0;this.geometryBytes=0;this.cacheBytes=0;this.disabled=false;this.scratch=[];
  this.static=[];this.dynamic=[];this.report={version:156,active:true,frames:0,sourceCasters:0,staticCasters:0,dynamicCasters:0,batches:0,batchedSources:0,cacheHits:0,staticBuilds:0,uncachedFrames:0,cacheInvalidations:0,culledByLight:0,fallbacks:0,prepareCpuMs:0,geometryBytes:0,cacheBytes:0,quality:{nativeShadowSize:true,nativeCascadeCameras:true,nativeFilter:true,nativeDynamicCadence:true}};
  this.multiDraw=!!T.BatchedMesh&&renderer.extensions?.has('WEBGL_multi_draw');
 }
 stamp(mesh,values=[]){
  const g=mesh.geometry,m=mesh.material,array=Array.isArray(m);values.length=0;values.push(g,g?.attributes.position,g?.attributes.position?.version,g?.attributes.position?.data,g?.attributes.position?.data?.version,g?.index,g?.index?.version,g?.drawRange.start,g?.drawRange.count,g?.morphAttributes?.position,g?.isInstancedBufferGeometry,mesh.morphTargetInfluences,mesh.morphTargetInfluences?.length,mesh.isSkinnedMesh,mesh.isBatchedMesh,mesh.instanceMatrix,mesh.instanceMatrix?.version,mesh.count,mesh.castShadow,mesh.layers.mask,mesh.customDepthMaterial,mesh.customDistanceMaterial,mesh.onBeforeShadow,mesh.onAfterShadow,...mesh.matrixWorld.elements);
  for(let i=0;i<(array?m.length:1);i++){const mat=array?m[i]:m;values.push(mat,mat?.version,mat?.visible,mat?.side,mat?.shadowSide,mat?.alphaTest,mat?.alphaMap,mat?.map,mat?.displacementMap,mat?.displacementScale,mat?.displacementBias,mat?.wireframe,mat?.clipShadows,mat?.clippingPlanes?.length);}
  return values;
 }
 eligible(mesh){
  const T=this.T,g=mesh.geometry,m=mesh.material;
  return mesh.isMesh&&!mesh.isSkinnedMesh&&!mesh.isBatchedMesh&&!g?.isInstancedBufferGeometry&&!mesh.morphTargetInfluences?.length&&g?.attributes.position?.array&&!Object.keys(g.morphAttributes??{}).length&&!mesh.customDepthMaterial&&!mesh.customDistanceMaterial&&
   mesh.onBeforeShadow===T.Object3D.prototype.onBeforeShadow&&mesh.onAfterShadow===T.Object3D.prototype.onAfterShadow&&m&&!Array.isArray(m)&&m.visible&&!m.isShaderMaterial&&!m.isRawShaderMaterial&&!m.displacementMap&&!m.clippingPlanes?.length&&!m.clipShadows&&!m.alphaTest&&!m.alphaToCoverage&&!m.transparent&&!m.wireframe;
 }
 batchEligible(mesh){
  const g=mesh.geometry,m=mesh.material;
  return !mesh.isInstancedMesh&&g.attributes.position.itemSize===3&&g.attributes.position.count<=65535&&mesh.matrixWorld.determinant()>0&&
   !m.wireframe&&!m.alphaTest&&!m.alphaToCoverage&&!m.transparent&&!m.transmission&&mesh.intersectsFrustum===this.T.Mesh.prototype.intersectsFrustum;
 }
 prepare(scene,viewCamera){
  if(this.disabled)return;const start=now();this.frame++;this.report.frames++;this.static.length=0;this.dynamic.length=0;this.camera=viewCamera;
  const promote=[];
  const visit=(node,visible)=>{
   visible=visible&&node.visible;
   if((node.isMesh||node.isLine||node.isPoints)&&node.castShadow){
    let r=this.records.get(node);const signature=this.stamp(node,this.scratch),active=!!visible;
    if(!r){r={mesh:node,signature:signature.slice(),settled:0,changed:false,isStatic:false,active:false,seen:this.frame,binding:null,box:null};this.records.set(node,r);}
    const changed=!same(r.signature,signature);
    if(changed){r.signature=signature.slice();r.settled=0;r.changed=true;if(r.isStatic){r.isStatic=false;this.revision++;}if(r.binding){r.binding.batch.setVisibleAt?.(r.binding.id,false);r.binding=null;}}
    else r.settled++;
    if(r.active!==active){if(r.isStatic)this.revision++;r.active=active;}
    r.seen=this.frame;
    if(!r.isStatic&&r.settled>=(r.changed?60:3)&&this.eligible(node)){
     r.isStatic=true;r.changed=false;this.revision++;r.box=node.isInstancedMesh?null:new this.T.Box3().setFromBufferAttribute(node.geometry.attributes.position).applyMatrix4(node.matrixWorld).expandByScalar(.001);
     if(this.batchEligible(node))promote.push(r);
    }
    if(active){if(r.isStatic)this.static.push(r);else this.dynamic.push(node);}
   }
   for(const child of node.children)visit(child,visible);
  };visit(scene,true);
  for(const [mesh,r]of this.records)if(r.seen!==this.frame){
   if(r.active&&r.isStatic)this.revision++;r.active=false;if(r.binding)r.binding.batch.setVisibleAt?.(r.binding.id,false);
   r.isStatic=false;r.binding=null;this.records.delete(mesh);
  }
  this.pruneBatches();
  if(promote.length)this.buildBatches(promote);
  let batchedSources=0;for(const r of this.static)if(r.binding)batchedSources++;
  Object.assign(this.report,{sourceCasters:this.static.length+this.dynamic.length,staticCasters:this.static.length,dynamicCasters:this.dynamic.length,batches:this.batches.length,batchedSources,geometryBytes:this.geometryBytes,cacheBytes:this.cacheBytes});
  this.report.prepareCpuMs+=now()-start;
 }
 pruneBatches(){
  let bins=0;for(const bin of this.batches){let entries=0;for(const entry of bin.records){if(entry.r.binding?.batch===bin.mesh)bin.records[entries++]=entry;else if(bin.mesh.isBatchedMesh)bin.mesh.deleteInstance(entry.id);}bin.records.length=entries;
   if(entries)this.batches[bins++]=bin;else{bin.mesh.dispose();bin.mesh.material.dispose();this.geometryBytes-=bin.bytes;}
  }this.batches.length=bins;
 }
 normalizedGeometry(source){
  const T=this.T,g=new T.BufferGeometry(),p=source.attributes.position,positions=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){positions[3*i]=p.getX(i);positions[3*i+1]=p.getY(i);positions[3*i+2]=p.getZ(i);}
  g.setAttribute('position',new T.BufferAttribute(positions,3));
  const length=source.index?.count??p.count,start=Math.max(0,source.drawRange.start),end=Math.min(length,start+source.drawRange.count),count=Math.max(0,Math.floor((end-start)/3)*3),indices=new Uint32Array(count);
  for(let i=0;i<count;i++)indices[i]=source.index?source.index.getX(start+i):start+i;
  g.setIndex(new T.BufferAttribute(indices,1));return g;
 }
 buildBatches(records){
  if(!this.multiDraw){this.buildInstances(records);return;}
  const T=this.T,groups=new Map();
  for(const r of records){const m=r.mesh.material,key=[m.side,m.shadowSide,r.mesh.layers.mask].join(':');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
  for(const group of groups.values()){
   let bin=[],geometries=new Set(),vertices=0,indices=0;
   const flush=()=>{
    if(bin.length<2){bin=[];geometries=new Set();vertices=indices=0;return;}
    const matrixSize=Math.max(4,Math.ceil(Math.sqrt(bin.length*4)/4)*4),bytes=vertices*12+indices*(vertices>65535?4:2)+matrixSize**2*16+Math.ceil(Math.sqrt(bin.length))**2*4;
    if(this.geometryBytes+bytes>this.geometryBudget){bin=[];geometries=new Set();vertices=indices=0;return;}
    let batch=null,material=null;
    try{
     const source=bin[0].mesh.material;material=new T.MeshBasicMaterial({side:source.side});material.shadowSide=source.shadowSide;
     batch=new T.BatchedMesh(bin.length,vertices,indices,material);batch.name='static-shadow-batch156';batch.castShadow=true;batch.frustumCulled=false;batch.perObjectFrustumCulled=false;batch.sortObjects=false;batch.layers.mask=bin[0].mesh.layers.mask;
     const ids=new Map();for(const g of geometries){const normalized=this.normalizedGeometry(g);try{ids.set(g,batch.addGeometry(normalized));}finally{normalized.dispose();}}
     const entries=[];for(const r of bin){const id=batch.addInstance(ids.get(r.mesh.geometry));batch.setMatrixAt(id,r.mesh.matrixWorld);r.binding={batch,id};entries.push({r,id});}
     this.batches.push({mesh:batch,records:entries,bytes});this.geometryBytes+=bytes;
    }catch(error){batch?.dispose();material?.dispose();for(const r of bin)if(r.binding?.batch===batch)r.binding=null;this.report.fallbacks++;}
    bin=[];geometries=new Set();vertices=indices=0;
   };
   for(const r of group){const g=r.mesh.geometry,p=g.attributes.position,drawCount=Math.max(0,Math.floor((Math.min(g.index?.count??p.count,g.drawRange.start+g.drawRange.count)-g.drawRange.start)/3)*3);
    if(drawCount>196608)continue;
    if(!geometries.has(g)&&(vertices+p.count>65535||indices+drawCount>196608)||bin.length>=512)flush();
    if(!geometries.has(g)){geometries.add(g);vertices+=p.count;indices+=drawCount;}bin.push(r);
   }flush();
  }
 }
 buildInstances(records){
  const T=this.T,groups=new Map();
  for(const r of records){const m=r.mesh.material,key=[r.mesh.geometry.id,m.side,m.shadowSide,r.mesh.layers.mask].join(':');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
  for(const list of groups.values()){
   if(list.length<2||this.geometryBytes+list.length*64>this.geometryBudget)continue;
   const source=list[0].mesh,m=source.material,material=new T.MeshBasicMaterial({side:m.side});material.shadowSide=m.shadowSide;
   const mesh=new T.InstancedMesh(source.geometry,material,list.length);mesh.name='static-shadow-instances156';mesh.castShadow=true;mesh.frustumCulled=false;mesh.layers.mask=source.layers.mask;
   const entries=list.map((r,id)=>{r.binding={batch:mesh,id};return{r,id};});const bytes=list.length*64;this.batches.push({mesh,records:entries,bytes});this.geometryBytes+=bytes;
  }
 }
 lightKey(light,type,viewCamera){
  const s=light.shadow,key=[this.revision,type,s.map.width,s.map.height,s.map.depthTexture.type,s.map.depthTexture.format,viewCamera.layers.mask,s.radius];
  for(let i=0;i<s.getViewportCount();i++)key.push(...s.getCamera(i).projectionMatrix.elements,...s.getCamera(i).matrixWorldInverse.elements,...s.getViewport(i).toArray());
  return key;
 }
 staticObjects(frustum,viewCamera){
  const result=[];
  const contributes=r=>r.active&&r.seen===this.frame&&r.isStatic&&r.mesh.layers.test(viewCamera.layers)&&(!r.mesh.frustumCulled||!r.box||frustum.intersectsBox(r.box));
  for(const bin of this.batches){let count=0;for(const {r,id}of bin.records){const visible=r.binding?.batch===bin.mesh&&contributes(r);if(bin.mesh.isBatchedMesh){if(bin.mesh.getVisibleAt(id)!==visible)bin.mesh.setVisibleAt(id,visible);}else if(visible)bin.mesh.setMatrixAt(count,r.mesh.matrixWorld);if(visible)count++;}if(!bin.mesh.isBatchedMesh){bin.mesh.count=count;bin.mesh.instanceMatrix.needsUpdate=true;}if(count)result.push(bin.mesh);}
  for(const r of this.static){if(r.binding)continue;if(contributes(r))result.push(r.mesh);else this.report.culledByLight++;}
  return result;
 }
 dropCache(state){if(state.target){state.target.dispose();this.cacheBytes-=state.bytes;state.target=null;state.valid=false;state.bytes=0;state.copyVerified=false;}}
 createCache(state,light){
  const T=this.T,map=light.shadow.map,bytes=map.width*map.height*5;
  if(bytes+this.cacheBytes>this.cacheBudget)return false;
  const depth=map.depthTexture.clone();
  const target=new T.WebGLRenderTarget(map.width,map.height,{format:T.RedFormat,type:T.UnsignedByteType,minFilter:T.NearestFilter,magFilter:T.NearestFilter,generateMipmaps:false,depthBuffer:true,depthTexture:depth,stencilBuffer:false});
  state.target=target;state.bytes=bytes;this.cacheBytes+=bytes;
  this.renderer.initRenderTarget(map);this.renderer.initRenderTarget(target);this.renderer.setRenderTarget(target);
  const gl=this.renderer.getContext();if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE){this.dropCache(state);state.failed=true;return false;}
  return true;
 }
 lightPass({light,scene,viewCamera,type,renderObjects}){
  const renderer=this.renderer,shadow=light.shadow;
  if(this.disabled||![0,1].includes(type)||light.isPointLight||!shadow?.map?.depthTexture||renderer.localClippingEnabled||renderer.clippingPlanes?.length)return false;
  let state=this.lights.get(light);if(!state){state={key:null,target:null,valid:false,bytes:0,failed:false};this.lights.set(light,state);}
  try{
   const key=this.lightKey(light,type,viewCamera),unchanged=same(key,state.key);
   if(!unchanged){if(state.valid)this.report.cacheInvalidations++;state.valid=false;state.key=key;}
   if(state.target&&(state.target.width!==shadow.map.width||state.target.height!==shadow.map.height||state.target.depthTexture.type!==shadow.map.depthTexture.type||state.target.depthTexture.format!==shadow.map.depthTexture.format))this.dropCache(state);
   const drawStatic=target=>{renderer.setRenderTarget(target);renderer.clear();for(let i=0;i<shadow.getViewportCount();i++)renderObjects(i,this.staticObjects(shadow.getFrustum(i),viewCamera),target);};
   const canCache=this.static.length>0&&unchanged&&!state.failed&&(state.target||this.createCache(state,light));
   if(canCache){
    if(!state.valid){drawStatic(state.target);state.valid=true;this.report.staticBuilds++;}else this.report.cacheHits++;
    renderer.initRenderTarget(shadow.map);renderer.copyTextureToTexture(state.target.depthTexture,shadow.map.depthTexture);
    if(!state.copyVerified){const gl=renderer.getContext();if(gl.getError()!==gl.NO_ERROR)throw Error('Shadow depth copy unavailable');state.copyVerified=true;}
    // copyTextureToTexture unbinds read/draw framebuffers. Rebind before drawing.
    renderer.setRenderTarget(shadow.map);
   }else{drawStatic(shadow.map);this.report.uncachedFrames++;}
   for(let i=0;i<shadow.getViewportCount();i++)renderObjects(i,this.dynamic,shadow.map);
   this.report.cacheBytes=this.cacheBytes;return true;
  }catch(error){
   // A complete native redraw is safe even after a partially drawn depth pass.
   this.report.fallbacks++;this.report.active=false;this.report.failure=String(error?.message??'shadow pipeline unavailable').slice(0,160);this.disabled=true;
   this.dropCache(state);renderer.setRenderTarget(shadow.map);renderer.clear();return false;
  }
 }
 invalidate(){this.revision++;for(const s of this.lights.values()){this.dropCache(s);s.key=null;s.failed=false;}}
 async warmup(scene,camera){
  try{
   scene.updateMatrixWorld(true);for(let i=0;i<3;i++)this.prepare(scene,camera);this.report.warmupPasses=3;
   if(!this.renderer.compileAsync||!this.batches.length)return;
   const T=this.T,warmScene=new T.Scene,materials=new Map(),saved=[];this.warmMaterials=[];
   for(const bin of this.batches){const mesh=bin.mesh,source=mesh.material,side=source.shadowSide??({0:1,1:0,2:2}[source.side]);let depth=materials.get(side);if(!depth){depth=new T.MeshDepthMaterial({side});materials.set(side,depth);this.warmMaterials.push(depth);}saved.push([mesh,source]);mesh.material=depth;warmScene.add(mesh);}
   let pending;try{pending=this.renderer.compileAsync(warmScene,camera,scene);}finally{for(const [mesh,material]of saved){mesh.material=material;warmScene.remove(mesh);}}
   let timer;try{await Promise.race([pending,new Promise(resolve=>{timer=setTimeout(resolve,2000);})]);}finally{clearTimeout(timer);}
  }catch{this.report.warmupDeferred=true;}
 }
 dispose(){for(const state of this.lights.values())this.dropCache(state);for(const bin of this.batches){bin.mesh.dispose();bin.mesh.material.dispose();}for(const material of this.warmMaterials??[])material.dispose();this.warmMaterials=[];this.batches=[];this.records.clear();this.lights.clear();this.report.active=false;}
}
export function installShadows156(game,T){
 if(game.shadowOptimization156)return game.shadowOptimization156;
 const renderer=game.renderer.webgl,shadow=renderer.shadowMap,memoryHint=globalThis.navigator?.deviceMemory,limited=Number.isFinite(memoryHint)&&memoryHint<=4,manager=new ShadowPipeline156(renderer,T,{geometryBudget:(limited?8:24)*1048576,cacheBudget:(limited?16:48)*1048576}),previousPrepare=shadow.prepare156,previousPass=shadow.lightPass156;
 manager.report.memoryBudgetBasis=limited?'conservative device-memory hint; not measured VRAM':'bounded additional allocations; not measured VRAM';
 const prepare=(scene,camera)=>{if(scene===game.scene&&[0,1].includes(shadow.type))try{manager.prepare(scene,camera);}catch(error){manager.disabled=true;manager.report.active=false;manager.report.fallbacks++;manager.report.failure=String(error?.message??'shadow collection unavailable').slice(0,160);}};
 const pass=options=>options.scene===game.scene&&manager.lightPass(options);
 shadow.prepare156=prepare;shadow.lightPass156=pass;game.shadowOptimization156=manager;
 const oldContext=game.performanceContext;game.performanceContext=function(...args){return{...oldContext.apply(this,args),shadowOptimization:{...manager.report,prepareCpuMs:Math.round(manager.report.prepareCpuMs*1000)/1000}};};
 const lost=()=>manager.invalidate();renderer.domElement.addEventListener('webglcontextrestored',lost);
 game.disposers.push(()=>{if(shadow.prepare156===prepare)shadow.prepare156=previousPrepare;if(shadow.lightPass156===pass)shadow.lightPass156=previousPass;renderer.domElement.removeEventListener('webglcontextrestored',lost);game.performanceContext=oldContext;manager.dispose();if(game.shadowOptimization156===manager)delete game.shadowOptimization156;});return manager;
}
