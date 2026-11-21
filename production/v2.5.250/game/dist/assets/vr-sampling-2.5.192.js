// XR eye buffers are independent of the desktop canvas quality. Keep their
// default density stable while auto-quality changes shadows/scene cost.
export function migrateSampling192(storage){
 try{
  const marker='bargheto-vr-sampling-192';if(storage.getItem(marker))return;
  const key='bargheto-vr-image-settings-v2';
  let image;try{image=JSON.parse(storage.getItem(key)||'null');}catch{}
  if(!image){try{const legacy=JSON.parse(storage.getItem('bargheto-vr-image-settings-v1')||'null');if(typeof legacy?.fullEdges==='boolean')image={fullEdges:legacy.fullEdges};}catch{}}
  // These two old trial switches would bypass the corrected sampling path.
  // Preserve unrelated image choices and all timing/navigation preferences.
  storage.setItem(key,JSON.stringify({...image,textureFilter:true,edgeClarity:true}));
  const diagnosticKey='bargheto-vr-diagnostics-v1';let diagnostic;
  try{diagnostic=JSON.parse(storage.getItem(diagnosticKey)||'null');}catch{}
  if(diagnostic&&[.65,.8].includes(diagnostic.scale))storage.setItem(diagnosticKey,JSON.stringify({...diagnostic,scale:0}));
  storage.setItem(marker,'1');
 }catch{/* Storage can be unavailable in private/restricted contexts. */}
}
export function xrScale192(quality,state){
 const scale=quality==='ultra'?1.2:1;
 return state?.edgeClarity===false?scale/1.2:scale;
}
export function xrFoveation192(quality,state){
 return state?.fullEdges||quality==='ultra'?0:.25;
}

const chunks192=['map_fragment','alphamap_fragment','roughnessmap_fragment',
 'metalnessmap_fragment','normal_fragment_maps','emissivemap_fragment',
 'clearcoat_normal_fragment_maps','lights_physical_fragment'];
// A small positive mip bias filters subpixel detail in the world material,
// before lighting; it never blurs the eye image or the controller panels.
export function patchSampling192(shader,T,filter,soft){
 // Center the coverage ramp on the authored cutoff. Three's one-sided ramp
 // can remove half of a subpixel hair/leaf stripe when mip filtering is used.
 const alpha=T.ShaderChunk?.alphatest_fragment;
 if(alpha)shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',alpha.replace(
  'diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );',
  'float vrAlphaWidth192 = max( fwidth( diffuseColor.a ), 0.0001 );\n diffuseColor.a = smoothstep( alphaTest - 0.5 * vrAlphaWidth192, alphaTest + 0.5 * vrAlphaWidth192, diffuseColor.a );'));
 if(soft)shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor = max( roughnessFactor, 0.5 );');
 if(filter)for(const name of chunks192){
  const token='#include <'+name+'>',chunk=T.ShaderChunk?.[name];
  if(!chunk||!shader.fragmentShader.includes(token))continue;
  const filtered=chunk.replace(/texture2D\(\s*(map|alphaMap|roughnessMap|metalnessMap|normalMap|emissiveMap|clearcoatNormalMap|clearcoatRoughnessMap|specularColorMap|specularIntensityMap)\s*,\s*(v\w+Uv)\s*\)/g,'texture2D( $1, $2, 0.5 )');
  // Keep the lighting include until after the normal-variance patch below.
  if(name!=='lights_physical_fragment')shader.fragmentShader=shader.fragmentShader.replace(token,filtered);
 }
 const token='#include <lights_physical_fragment>';
 // Three's built-in geometric roughness uses the unperturbed normal only.
 // Include normal-map variation as well; this also applies without the older
 // broad "soft specular" appearance adjustment.
 const variance=`
 vec3 vrDx192 = dFdx( normal ), vrDy192 = dFdy( normal );
 float vrVariance192 = min( 0.18, 0.5 * ( dot( vrDx192, vrDx192 ) + dot( vrDy192, vrDy192 ) ) );
 material.roughness = sqrt( min( 1.0, material.roughness * material.roughness + vrVariance192 ) );
 #ifdef USE_CLEARCOAT
 vec3 vrCDx192 = dFdx( clearcoatNormal ), vrCDy192 = dFdy( clearcoatNormal );
 float vrCVariance192 = min( 0.18, 0.5 * ( dot( vrCDx192, vrCDx192 ) + dot( vrCDy192, vrCDy192 ) ) );
 material.clearcoatRoughness = sqrt( min( 1.0, material.clearcoatRoughness * material.clearcoatRoughness + vrCVariance192 ) );
 #endif
 `;
 shader.fragmentShader=shader.fragmentShader.replace(token,token+variance);
 if(filter&&T.ShaderChunk?.lights_physical_fragment){
  const chunk=T.ShaderChunk.lights_physical_fragment.replace(/texture2D\(\s*(clearcoatRoughnessMap|specularColorMap|specularIntensityMap)\s*,\s*(v\w+Uv)\s*\)/g,'texture2D( $1, $2, 0.5 )');
  shader.fragmentShader=shader.fragmentShader.replace(token,chunk);
 }
}
