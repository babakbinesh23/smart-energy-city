// Conservative spatial submission. Original vertex attributes and shaders stay intact.
export function installPowerFlow150(T,flow,source){
 if(!source?.index)return;
 const position=source.getAttribute('position'),stage=source.getAttribute('aStage');
 const src=source.index.array,cells=[],byKey=new Map,triangleCell=new Uint32Array(src.length/3);
 const point=new T.Vector3;
 for(let i=0;i<src.length;i+=3){
  const a=src[i],b=src[i+1],c=src[i+2];
  const x=(position.getX(a)+position.getX(b)+position.getX(c))/3,z=(position.getZ(a)+position.getZ(b)+position.getZ(c))/3;
  const level=Math.min(stage.getX(a),stage.getX(b),stage.getX(c));
  const key=Math.floor(x/32)+':'+Math.floor(z/32)+':'+level;
  let cell=byKey.get(key);if(!cell){cell={id:cells.length,stage:level,bounds:new T.Box3().makeEmpty(),visible:false};cells.push(cell);byKey.set(key,cell);}
  triangleCell[i/3]=cell.id;
  for(const v of [a,b,c])cell.bounds.expandByPoint(point.fromBufferAttribute(position,v));
 }
 // Halo vertex displacement is 0.14 along unit normals; expand before world scaling.
 for(const cell of cells)cell.bounds.expandByScalar(.15);
 const geometry=new T.BufferGeometry;
 for(const [name,attribute]of Object.entries(source.attributes))geometry.setAttribute(name,attribute);
 const output=new src.constructor(src.length),index=new T.BufferAttribute(output,1);index.setUsage(T.DynamicDrawUsage);geometry.setIndex(index);geometry.setDrawRange(0,0);
 const frustums=[],projection=new T.Matrix4,box=new T.Box3;
 let initialized=false,lastStage=NaN,disposed=false;
 const stats={lossless:true,sourceTriangles:src.length/3,submittedTriangles:0,cells:cells.length,indexUploads:0};
 function before(renderer,scene,camera){
  if(disposed)return;
  // XR cameras are finalized by the renderer, after the application's update.
  const xr=renderer.xr?.isPresenting?renderer.xr.getCamera():null;
  const cameras=xr?.isArrayCamera&&xr.cameras.length?xr.cameras:camera?.isArrayCamera&&camera.cameras.length?camera.cameras:[camera];
  const activeStage=flow.uniforms.uStage.value;let dirty=!initialized||lastStage!==activeStage;
  for(let i=0;i<cameras.length;i++){
   const cam=cameras[i];
   projection.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
   (frustums[i]??=new T.Frustum).setFromProjectionMatrix(projection);
  }
  for(const cell of cells){
   let visible=false;
   if(cell.stage<=activeStage){box.copy(cell.bounds).applyMatrix4(flow.group.matrixWorld);for(let i=0;i<cameras.length;i++)if(frustums[i].intersectsBox(box)){visible=true;break;}}
   if(visible!==cell.visible){cell.visible=visible;dirty=true;}
  }
  if(!dirty)return;
  let count=0;
  // Keep source triangle order and winding, including overlapping additive surfaces.
  for(let i=0;i<src.length;i+=3)if(cells[triangleCell[i/3]].visible){output[count++]=src[i];output[count++]=src[i+1];output[count++]=src[i+2];}
  geometry.setDrawRange(0,count);
  if(count){index.clearUpdateRanges();index.addUpdateRange(0,count);index.needsUpdate=true;stats.indexUploads++;}
  stats.submittedTriangles=count/3;initialized=true;lastStage=activeStage;
 }
 // Release obsolete duplicated chunk attributes, then render shared original attributes.
 for(const g of flow.geometries)if(g!==source)g.dispose();
 flow.chunks.clear();flow.fallback.clear();flow.geometries=[source,geometry];flow.chunks.visible=false;flow.fallback.visible=true;
 const meshes=[];
 for(let i=0;i<flow.materials.length;i++){
  const mesh=new T.Mesh(geometry,flow.materials[i]);mesh.name=i?'laser-halo-visible150':'laser-core-visible150';mesh.frustumCulled=false;
  mesh.onBeforeRender=before;flow.fallback.add(mesh);meshes.push(mesh);
 }
 flow.group.userData.flowOptimization150=stats;
 const originalUpdate=flow.update,originalDispose=flow.dispose;
 flow.update=function(time,level){this.uniforms.uTime.value=time;this.uniforms.uStage.value=level;this.group.visible=level>0;};
 flow.dispose=function(){disposed=true;originalDispose.call(this);};
 return {stats,geometry,cells,meshes,before,originalUpdate};
}
