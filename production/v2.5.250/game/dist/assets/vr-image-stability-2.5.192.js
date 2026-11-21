import {patchSampling192} from './vr-sampling-2.5.192.js';
// Reversible material/sampler changes for the native XR render path only.
const mapKeys189=['map','normalMap','roughnessMap','metalnessMap','aoMap','alphaMap','emissiveMap','bumpMap','clearcoatMap','clearcoatNormalMap','clearcoatRoughnessMap','specularColorMap','specularIntensityMap'];
export function xrAntialias189(renderer){
 const layer=renderer.xr.getBaseLayer?.();
 if(typeof layer?.antialias==='boolean')return layer.antialias;
 const target=renderer.getRenderTarget?.();
 return target?.isXRRenderTarget?target.samples>0:null;
}
export function createVRImageStability189(T){
 const textures=new Map(),materials=new Map(),coverage=new Map(),shaders=new Map();
 let renderer=null,originalDraw=null,draw=null,state=null,revision=0,seen=new WeakMap(),cap=1;
 function sampler(texture,values){let changed=false;for(const [key,value]of Object.entries(values))if(texture[key]!==value){texture[key]=value;changed=true;}if(changed)texture.needsUpdate=true;}
 function texture(tex,enabled,cap){
  if(!tex?.isTexture||tex.isVideoTexture||tex.isRenderTargetTexture||tex.isDepthTexture||tex.isCubeTexture||tex.isData3DTexture||tex.isDataArrayTexture||tex.isCompressedArrayTexture)return;
  if(!textures.has(tex))textures.set(tex,{anisotropy:tex.anisotropy,minFilter:tex.minFilter,magFilter:tex.magFilter,generateMipmaps:tex.generateMipmaps});
  const saved=textures.get(tex);if(!enabled){sampler(tex,saved);return;}
  const canMip=tex.isCompressedTexture?tex.mipmaps?.length>1:tex.image?.width>1&&tex.image?.height>1;
  sampler(tex,{anisotropy:Math.min(cap,Math.max(saved.anisotropy||1,8)),magFilter:T.LinearFilter,
   minFilter:canMip?T.LinearMipmapLinearFilter:saved.minFilter,
   generateMipmaps:canMip&&!tex.isCompressedTexture?true:saved.generateMipmaps});
 }
 function restoreMaterial(mat,s){
  for(const key of ['roughness','envMapIntensity','clearcoatRoughness'])if(s[key]!==undefined)mat[key]=s[key];
  for(const key of ['normalScale','clearcoatNormalScale'])if(s[key])mat[key]?.copy(s[key]);
  if(s.compile&&mat.onBeforeCompile===s.compile){mat.onBeforeCompile=s.beforeCompile;mat.customProgramCacheKey=s.cacheKey;mat.needsUpdate=true;}
 }
 function material(mat,enabled){
  if(!enabled){const saved=materials.get(mat);if(saved){restoreMaterial(mat,saved);materials.delete(mat);}return;}
  if(!mat.isMeshStandardMaterial&&!mat.isMeshPhysicalMaterial)return;
  if(!materials.has(mat)){
   const s={};for(const key of ['roughness','envMapIntensity','clearcoatRoughness'])if(typeof mat[key]==='number')s[key]=mat[key];
   for(const key of ['normalScale','clearcoatNormalScale'])if(mat[key]?.clone)s[key]=mat[key].clone();
   materials.set(mat,s);
  }
  const s=materials.get(mat);
  if(s.roughness!==undefined)mat.roughness=Math.max(.65,s.roughness);
  if(s.envMapIntensity!==undefined)mat.envMapIntensity=s.envMapIntensity*.5;
  if(s.clearcoatRoughness!==undefined)mat.clearcoatRoughness=Math.max(.4,s.clearcoatRoughness);
  for(const key of ['normalScale','clearcoatNormalScale'])if(s[key])mat[key].copy(s[key]).multiplyScalar(.65);
 }
 function shader(mat){
  if(!(mat.isMeshStandardMaterial||mat.isMeshPhysicalMaterial||mat.isMeshBasicMaterial||mat.isMeshLambertMaterial||mat.isMeshPhongMaterial))return;
  let s=shaders.get(mat);
  if(!s){
   s={before:mat.onBeforeCompile,key:mat.customProgramCacheKey,filter:state.textureFilter,soft:state.softSpecular};
   s.compile=function(code,...args){s.before?.call(this,code,...args);patchSampling192(code,T,s.filter,s.soft);};
   s.cache=function(){return(s.key?.call(this)||'')+'|vr-sampling192:'+Number(s.filter)+':'+Number(s.soft);};
   mat.onBeforeCompile=s.compile;mat.customProgramCacheKey=s.cache;mat.needsUpdate=true;shaders.set(mat,s);
  }else if(s.filter!==state.textureFilter||s.soft!==state.softSpecular){s.filter=state.textureFilter;s.soft=state.softSpecular;mat.needsUpdate=true;}
 }
 function prepare(mat,node){
  if(!mat||node?.isSprite||mat.depthTest===false)return;
  // Coverage follows the real eye target, after any old onBeforeRender hook.
  // Include imported hair/face cutouts, not just three named foliage materials.
  if(mat.alphaTest>0&&!mat.transparent){
   const aa=xrAntialias189(renderer);
   if(aa!==null){if(!coverage.has(mat))coverage.set(mat,mat.alphaToCoverage);if(mat.alphaToCoverage!==aa){mat.alphaToCoverage=aa;mat.needsUpdate=true;}}
  }
  const prior=seen.get(mat);
  if(prior?.revision===revision&&prior.version===mat.version&&!prior.pending&&mapKeys189.every((key,i)=>prior.maps[i]===mat[key]))return;
  material(mat,state.softSpecular);shader(mat);
  let pending=false;
  for(const key of mapKeys189)if(mat[key]){texture(mat[key],state.textureFilter,cap);if((!mat[key].image||mat[key].image.width===0||mat[key].image.height===0)&&!mat[key].isCompressedTexture)pending=true;}
  seen.set(mat,{revision,version:mat.version,pending,maps:mapKeys189.map(key=>mat[key])});
 }
 return{
  apply(scene,next,r){
   if(!r.xr.isPresenting)return;
   state={...next};revision++;renderer=r;cap=Math.max(1,r.capabilities.getMaxAnisotropy());
   if(!draw&&typeof r.renderBufferDirect==='function'){
    const delegated=r.renderBufferDirect;originalDraw=delegated;
    draw=function(camera,scene,geometry,mat,node,group){
     const target=this.getRenderTarget?.();
     if(state&&renderer===this&&this.xr.isPresenting&&(!target||target.isXRRenderTarget))prepare(mat,node);
     return delegated.call(this,camera,scene,geometry,mat,node,group);
    };
    r.renderBufferDirect=draw;
   }
   scene.traverse(node=>{for(const mat of Array.isArray(node.material)?node.material:[node.material]){
    prepare(mat,node);
   }});
  },
  restore(){
   if(renderer?.renderBufferDirect===draw)renderer.renderBufferDirect=originalDraw;
   for(const [mat,s]of materials)restoreMaterial(mat,s);
   for(const [mat,s]of shaders)if(mat.onBeforeCompile===s.compile){mat.onBeforeCompile=s.before;if(mat.customProgramCacheKey===s.cache)mat.customProgramCacheKey=s.key;mat.needsUpdate=true;}
   for(const [mat,alpha]of coverage)if(mat.alphaToCoverage!==alpha){mat.alphaToCoverage=alpha;mat.needsUpdate=true;}
   for(const [tex,s]of textures)sampler(tex,s);
   materials.clear();textures.clear();coverage.clear();shaders.clear();seen=new WeakMap();renderer=originalDraw=draw=state=null;
  },
  report(){return{materials:shaders.size,textures:textures.size,cutouts:coverage.size};}
 };
}
