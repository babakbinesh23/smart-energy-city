// Reversible material/sampler changes for the native XR render path only.
const mapKeys189=['map','normalMap','roughnessMap','metalnessMap','aoMap','alphaMap','emissiveMap','bumpMap','clearcoatMap','clearcoatNormalMap','clearcoatRoughnessMap','specularColorMap','specularIntensityMap'];
export function xrAntialias189(renderer){
 const layer=renderer.xr.getBaseLayer?.();
 if(typeof layer?.antialias==='boolean')return layer.antialias;
 const target=renderer.getRenderTarget?.();
 return target?.isXRRenderTarget?target.samples>0:null;
}
export function createVRImageStability189(T){
 const textures=new Map(),materials=new Map(),foliageMaterials=new Map();
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
   // Preserve all existing atmosphere, wind and GLTF shader hooks. The floor
   // follows roughness-map multiplication, which otherwise restores sharp glints.
   s.beforeCompile=mat.onBeforeCompile;s.cacheKey=mat.customProgramCacheKey;
   s.compile=function(shader,...args){s.beforeCompile?.call(this,shader,...args);shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor = max( roughnessFactor, 0.5 );');};
   mat.onBeforeCompile=s.compile;mat.customProgramCacheKey=function(){return(s.cacheKey?.call(this)||'')+'|vr-roughness-floor189';};mat.needsUpdate=true;
   materials.set(mat,s);
  }
  const s=materials.get(mat);
  if(s.roughness!==undefined)mat.roughness=Math.max(.65,s.roughness);
  if(s.envMapIntensity!==undefined)mat.envMapIntensity=s.envMapIntensity*.5;
  if(s.clearcoatRoughness!==undefined)mat.clearcoatRoughness=Math.max(.4,s.clearcoatRoughness);
  for(const key of ['normalScale','clearcoatNormalScale'])if(s[key])mat[key].copy(s[key]).multiplyScalar(.65);
 }
 function foliage(mat){
  if(!['leaves','feather-frond','fan-frond'].includes(mat.name))return;
  if(foliageMaterials.has(mat))return;
  const s={};foliageMaterials.set(mat,s);
  s.beforeRender=mat.onBeforeRender;s.alphaToCoverage=mat.alphaToCoverage;
  // A native XRWebGLLayer can have AA even when its Three render target has
  // samples=0. The previous hook only inspected the latter and disabled A2C.
  s.render=function(renderer,...args){if(!renderer.xr.isPresenting)return s.beforeRender?.call(this,renderer,...args);const active=xrAntialias189(renderer);if(active!==null&&this.alphaToCoverage!==active){this.alphaToCoverage=active;this.needsUpdate=true;}};
  mat.onBeforeRender=s.render;
 }
 return{
  apply(scene,state,renderer){
   if(!renderer.xr.isPresenting)return;
   const cap=Math.max(1,renderer.capabilities.getMaxAnisotropy());
   scene.traverse(node=>{for(const mat of Array.isArray(node.material)?node.material:[node.material]){
    if(!mat||node.isSprite||mat.depthTest===false)continue;
    material(mat,state.softSpecular);foliage(mat);
    for(const key of mapKeys189)if(mat[key])texture(mat[key],state.textureFilter,cap);
   }});
  },
  restore(){for(const [mat,s]of materials)restoreMaterial(mat,s);for(const [mat,s]of foliageMaterials)if(mat.onBeforeRender===s.render){mat.onBeforeRender=s.beforeRender;if(mat.alphaToCoverage!==s.alphaToCoverage){mat.alphaToCoverage=s.alphaToCoverage;mat.needsUpdate=true;}}for(const [tex,s]of textures)sampler(tex,s);materials.clear();textures.clear();foliageMaterials.clear();},
  report(){return{materials:materials.size,textures:textures.size};}
 };
}
