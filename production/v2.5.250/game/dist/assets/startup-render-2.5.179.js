// Spread shader submission across browser tasks while keeping the same scene
// as the source of lights, fog and environment for every batch.
export async function compileStartupBatches170(renderer, scene, camera, Group, yieldTask, onProgress=()=>{}){
 const meshes=[];
 scene.traverseVisible(object=>{
  if(object.isMesh||object.isPoints||object.isLine||object.isSprite)meshes.push(object);
 });
 const batch=new Group();
 // The list is already flattened. Visiting descendants again would repeat
 // compilation and could add lights from the same scene a second time.
 batch.traverse=batch.traverseVisible=visit=>{for(const object of batch.children)visit(object);};
 const pending=[];
 try{
  for(let i=0;i<meshes.length;){
   const start=performance.now();
   do{
    batch.children=meshes.slice(i,i+24);i+=24;
    pending.push(renderer.compileAsync(batch,camera,scene));
    // Observe rejections while the remaining batches are being submitted.
    pending.at(-1).catch(()=>{});
   }while(i<meshes.length&&performance.now()-start<7);
   onProgress(meshes.length?Math.min(.9,i/meshes.length*.9):.9);
   if(i<meshes.length)await yieldTask();
  }
 }finally{batch.children=[];}
 let timeout;
 try{
  await Promise.race([Promise.all(pending),new Promise(resolve=>{timeout=setTimeout(resolve,2500);})]);
 }finally{clearTimeout(timeout);}
 onProgress(1);
}

export async function renderStartupCube170(renderer, scene, cube, yieldTask){
 cube.updateMatrixWorld();
 if(cube.coordinateSystem!==renderer.coordinateSystem){
  cube.coordinateSystem=renderer.coordinateSystem;
  cube.updateCoordinateSystem();
 }
 const target=cube.renderTarget, mipmaps=target.texture.generateMipmaps;
 for(let face=0;face<cube.children.length;face++){
  const previous=renderer.getRenderTarget(),previousFace=renderer.getActiveCubeFace();
  const previousLevel=renderer.getActiveMipmapLevel(),xr=renderer.xr.enabled;
  try{
   renderer.xr.enabled=false;
   target.texture.generateMipmaps=face===cube.children.length-1&&mipmaps;
   renderer.setRenderTarget(target,face,cube.activeMipmapLevel);
   if(renderer.state.buffers.depth.getReversed()&&!renderer.autoClear)renderer.clearDepth();
   renderer.render(scene,cube.children[face]);
  }finally{
   renderer.setRenderTarget(previous,previousFace,previousLevel);
   target.texture.generateMipmaps=mipmaps;
   renderer.xr.enabled=xr;
  }
  if(face<cube.children.length-1)await yieldTask();
 }
 target.texture.needsPMREMUpdate=true;
}
