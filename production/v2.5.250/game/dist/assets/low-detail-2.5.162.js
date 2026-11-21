// Keep the first web upgrade modest. Ultra uses the full city preset.
export const webCityPresets162 = presets => ({
 ...presets,
 medium: {...presets.medium, pixelRatioCap:1.1, msaaSamples:0, shadowMapSize:512, shadowDistance:85},
 high: {...presets.high, pixelRatioCap:1.35, renderScale:.94, msaaSamples:2, shadowMapSize:1024, shadowDistance:145, bloom:false}
});

// Web Low uses diffuse lighting while retaining geometry, texture maps and facade detail.
export function patchLowShader161(shader, original, renderer) {
 const unused = ['roughnessmap_fragment', 'metalnessmap_fragment', 'lights_physical_fragment'];
 for (const chunk of unused) {
  const token = '#include <' + chunk + '>';
  if (!shader.fragmentShader.includes(token)) {
   shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>',
    '/*low161-' + chunk + '-start*/\n' + token + '\n/*low161-' + chunk + '-end*/\n#include <lights_fragment_begin>');
  }
 }
 original.onBeforeCompile(shader, renderer);
 for (const chunk of unused) {
  const start = shader.fragmentShader.indexOf('/*low161-' + chunk + '-start*/');
  const endToken = '/*low161-' + chunk + '-end*/';
  const end = shader.fragmentShader.indexOf(endToken);
  if (start >= 0 && end >= start) shader.fragmentShader = shader.fragmentShader.slice(0, start) + shader.fragmentShader.slice(end + endToken.length);
 }
}

export function createLowMaterial161(original, T) {
 const low = new T.MeshLambertMaterial();
 for (const key of ['name','color','map','alphaMap','alphaTest','opacity','transparent','side','shadowSide',
  'vertexColors','emissive','emissiveMap','emissiveIntensity','lightMap','lightMapIntensity','aoMap','aoMapIntensity',
  'depthTest','depthWrite','depthFunc','colorWrite','polygonOffset','polygonOffsetFactor','polygonOffsetUnits',
  'blending','blendSrc','blendDst','blendEquation','premultipliedAlpha','visible','fog','toneMapped',
  'clippingPlanes','clipIntersection','clipShadows','wireframe','displacementMap','displacementScale','displacementBias']) {
  if (key in original) low[key] = original[key];
 }
 // Keep the normal inputs needed by procedural terrain/facade patches.
 low.normalMap = original.normalMap;
 low.normalMapType = original.normalMapType;
 if (original.normalScale) low.normalScale.copy(original.normalScale);
 low.onBeforeCompile = (shader, renderer) => patchLowShader161(shader, original, renderer);
 low.customProgramCacheKey = () => 'web-low161-' + original.customProgramCacheKey();
 return low;
}

export function installLowDetail161(game, T, presets, webPresets) {
 const replacements = new Map(), bindings = new Map();
 const renderer = game.renderer, xr = renderer.webgl.xr;
 const active = () => game.settings.quality === 'low' && !xr.isPresenting && !game.vr.active;
 function convert(material) {
  if (!material?.isMeshStandardMaterial) return material;
  if (!replacements.has(material)) replacements.set(material, createLowMaterial161(material, T));
  return replacements.get(material);
 }
 function restore() {
  for (const [mesh, binding] of bindings) {
   if (mesh.material === binding.low) mesh.material = binding.original;
  }
  bindings.clear();
 }
 function update() {
  if (!active()) {restore();return;}
  game.scene.traverse(mesh => {
   if (!mesh.isMesh || !mesh.material) return;
   const binding=bindings.get(mesh);
   if(binding&&mesh.material===binding.low)return;
   const original = mesh.material;
   const low = Array.isArray(original) ? original.map(convert) : convert(original);
   if (low !== original) {bindings.set(mesh, {original, low});mesh.material = low;}
  });
 }
 const select = game.setQuality;
 game.setQuality = function (...args) {const result=select.apply(this,args);update();return result;};
 // Apply a Web-only resolution floor through the normal renderer entry point.
 const applyQuality = renderer.applyQuality;
 let requestedPreset=renderer.qualityPreset;
 renderer.applyQuality = function (preset) {
  requestedPreset=preset;
  const webLow = preset.label === 'Low' && !xr.isPresenting && !game.vr.active && game.overlay.mode !== 'vr';
  const web = !xr.isPresenting && !game.vr.active && game.overlay.mode !== 'vr';
  const tier = preset.label.toLowerCase();
  const tuned = web && preset === presets[tier] ? webPresets[tier] : preset;
  return applyQuality.call(this, webLow ? {...tuned,renderScale:.8,adaptiveFloor:.85} : tuned);
 };
 const onXR = () => {restore();renderer.applyQuality(requestedPreset);update();};
 xr.addEventListener('sessionstart', onXR);
 xr.addEventListener('sessionend', onXR);
 const removeTask = game.scheduler.add('web-low-materials161', 1, () => {
  if (active()) update();
 });
 renderer.applyQuality(presets[game.settings.quality]);
 game.environment.applyQuality(renderer.qualityPreset);
 update();
 game.disposers.push(() => {
  removeTask();restore();
  game.setQuality=select;renderer.applyQuality=applyQuality;
  xr.removeEventListener('sessionstart',onXR);xr.removeEventListener('sessionend',onXR);
  for (const low of replacements.values()) low.dispose();
 });
}
