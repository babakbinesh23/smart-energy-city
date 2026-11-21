// Preserve original nodes for animation tracks; batch only compatible opaque meshes.
export function installCoolerBatches152(game,T,owners){
 const supported=!!T.BatchedMesh&&game.renderer.webgl.extensions.has('WEBGL_multi_draw');
 const report={supported,sourceMeshes:0,batches:0,active:true};game.coolerBatches152=report;
 if(!supported)return report;
 const signature=g=>Object.keys(g.attributes).sort().map(k=>{const a=g.attributes[k];return [k,a.itemSize,a.normalized,a.array.constructor.name,a.gpuType].join(':');}).join('|')+'|'+!!g.index;
 const regular=m=>{const e=m.elements;for(const [a,b]of [[0,4],[0,8],[4,8]]){const aa=Math.hypot(e[a],e[a+1],e[a+2]),bb=Math.hypot(e[b],e[b+1],e[b+2]);if(!aa||!bb||Math.abs(e[a]*e[b]+e[a+1]*e[b+1]+e[a+2]*e[b+2])>aa*bb*1e-6)return false;}return m.determinant()>0;};
 for(const unit of game.city.coolers){
  const root=unit.model;root.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),matrix=new T.Matrix4,groups=[];
  root.traverse(mesh=>{
   const g=mesh.geometry,m=mesh.material;
   if(!mesh.isMesh||mesh.isInstancedMesh||mesh.isBatchedMesh||mesh.isSkinnedMesh||!g?.attributes.position||!m||Array.isArray(m)||!m.isMeshStandardMaterial||m.transparent||m.transmission>0||m.wireframe||g.groups.length||Object.keys(g.morphAttributes).length||mesh.customDepthMaterial||mesh.customDistanceMaterial||mesh.userData.airflow||mesh.name==='Sump_water_surface'||mesh.onBeforeRender!==T.Mesh.prototype.onBeforeRender||g.drawRange.start!==0||Number.isFinite(g.drawRange.count))return;
   if(Object.values(g.attributes).some(a=>a.isInterleavedBufferAttribute||a.count!==g.attributes.position.count))return;
   matrix.multiplyMatrices(inverse,mesh.matrixWorld);if(!regular(matrix))return;
   const sig=signature(g);let group=groups.find(x=>x.material===m&&x.signature===sig&&x.cast===mesh.castShadow&&x.receive===mesh.receiveShadow&&x.order===mesh.renderOrder&&x.layers===mesh.layers.mask&&x.depth===mesh.customDepthMaterial&&x.distance===mesh.customDistanceMaterial);
   if(!group){group={material:m,signature:sig,cast:mesh.castShadow,receive:mesh.receiveShadow,order:mesh.renderOrder,layers:mesh.layers.mask,depth:mesh.customDepthMaterial,distance:mesh.customDistanceMaterial,sources:[]};groups.push(group);}group.sources.push(mesh);
  });
  const installed=[];
  for(const group of groups){
   if(group.sources.length<2)continue;
   let batch;try{
    const unique=[...new Set(group.sources.map(m=>m.geometry))];
    batch=new T.BatchedMesh(group.sources.length,unique.reduce((n,g)=>n+g.attributes.position.count,0),unique.reduce((n,g)=>n+(g.index?.count??0),0),group.material);
    batch.name='cooler-multidraw152-'+unit.variant+'-'+installed.length;batch.castShadow=group.cast;batch.receiveShadow=group.receive;batch.renderOrder=group.order;batch.layers.mask=group.layers;batch.customDepthMaterial=group.depth;batch.customDistanceMaterial=group.distance;batch.frustumCulled=false;batch.perObjectFrustumCulled=true;
    const ids=new Map(unique.map(g=>[g,batch.addGeometry(g)]));
    group.records=group.sources.map(mesh=>({mesh,geometry:mesh.geometry,id:batch.addInstance(ids.get(mesh.geometry)),isMesh:mesh.isMesh,raycast:mesh.raycast,versions:[...Object.values(mesh.geometry.attributes),...(mesh.geometry.index?[mesh.geometry.index]:[])].map(a=>[a,a.version]),last:new T.Matrix4().set(...Array(16).fill(NaN))}));
    group.batch=batch;group.active=true;root.add(batch);owners.set(batch,root);batch.userData.losslessCoolerBatch152=true;
    for(const r of group.records){r.mesh.isMesh=false;r.mesh.raycast=()=>{};}
    installed.push(group);report.sourceMeshes+=group.sources.length;report.batches++;
   }catch(error){batch?.dispose();console.warn('Cooler batching unavailable; original meshes retained',error);}
  }
  const restore=group=>{if(!group.active)return;group.active=false;for(const r of group.records){r.mesh.isMesh=r.isMesh;r.mesh.raycast=r.raycast;}group.batch.removeFromParent();owners.delete(group.batch);group.batch.dispose();};
  const update=()=>{
   if(!installed.some(g=>g.active))return;
   root.updateWorldMatrix(true,true);inverse.copy(root.matrixWorld).invert();
   for(const group of installed){if(!group.active)continue;
    if(group.records.some(r=>r.mesh.geometry!==r.geometry||r.mesh.material!==group.material||r.mesh.castShadow!==group.cast||r.mesh.receiveShadow!==group.receive||r.mesh.layers.mask!==group.layers||r.mesh.renderOrder!==group.order||r.mesh.customDepthMaterial!==group.depth||r.mesh.customDistanceMaterial!==group.distance||r.versions.some(([a,v])=>a.version!==v))){restore(group);continue;}
    for(const r of group.records){matrix.multiplyMatrices(inverse,r.mesh.matrixWorld);if(!regular(matrix)){restore(group);break;}
     if(!r.last.equals(matrix)){group.batch.setMatrixAt(r.id,matrix);r.last.copy(matrix);}
     let visible=true;for(let n=r.mesh;n&&n!==root;n=n.parent)if(!n.visible||n.userData.editorDeleted){visible=false;break;}
     if(group.batch.getVisibleAt(r.id)!==visible)group.batch.setVisibleAt(r.id,visible);
    }
   }
  };
  const previous=unit.renderOptimization,oldUpdate=previous.update.bind(previous),oldDispose=previous.dispose.bind(previous);
  previous.update=()=>{oldUpdate();update();};previous.dispose=()=>{for(const g of installed)restore(g);oldDispose();};
  update();
 }
 return report;
}
