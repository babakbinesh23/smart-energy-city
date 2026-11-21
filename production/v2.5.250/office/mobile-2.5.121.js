// Babylon hardware scaling is an inverse pixel ratio: 0.5 means 2x CSS pixels.
// Multiplying it by phone DPR previously made high-density screens blurrier.
export function installOfficeMobile121({engine,scene,canvas,getPlaying=()=>true}){
 const coarse=matchMedia('(pointer: coarse)'),originalScale=engine.getHardwareScalingLevel();
 const mobile=()=>navigator.maxTouchPoints>0&&coarse.matches&&!/OculusBrowser|Quest/i.test(navigator.userAgent);
 const active=()=>mobile()&&!window.Office97?.xrActive;
 const style=document.createElement('style');
 // Remove exactly the two requested controls. Playback recovery stays available.
 style.textContent='[data-office-mobile121] #office119-social>button:first-child,[data-office-mobile121] #office119-social>span{display:none!important}';document.head.append(style);
 let disposed=false,base=1,ratio=1,slow=0,fast=0,elapsed=0,frames=0,wasXR=false,wasMobile=false;
 const textures=new Map();
 function textureQuality(){
  const anisotropy=Math.max(1,Math.min(8,engine.getCaps().maxAnisotropy||1));
  for(const texture of scene.textures){
   if(texture.isCube||texture.isRenderTarget||textures.has(texture)||typeof texture.updateSamplingMode!=='function')continue;
   textures.set(texture,{anisotropy:texture.anisotropicFilteringLevel,sampling:texture.samplingMode});
   texture.anisotropicFilteringLevel=anisotropy;texture.updateSamplingMode(3);
  }
 }
 function apply(){
  if(!active())return;
  const scale=1/ratio;
  if(Math.abs(engine.getHardwareScalingLevel()-scale)>.005){engine.setHardwareScalingLevel(scale);engine.resize();}
 }
 function resize(){
  if(!active())return;
  const area=Math.max(1,canvas.clientWidth*canvas.clientHeight);
  base=Math.max(1,Math.min(window.devicePixelRatio||1,2,Math.sqrt(2000000/area)));
  ratio=base;slow=fast=elapsed=frames=0;apply();
 }
 function restoreTextures(){for(const [texture,previous]of textures){texture.anisotropicFilteringLevel=previous.anisotropy;texture.updateSamplingMode(previous.sampling);}textures.clear();}
 function sync(){
  const enabled=active(),xr=!!window.Office97?.xrActive;
  if(document.documentElement.hasAttribute('data-office-mobile121')!==enabled)document.documentElement.toggleAttribute('data-office-mobile121',enabled);
  if(enabled&&!wasMobile){resize();textureQuality();}
  // XR owns its framebuffer. Never resize it from a mobile quality callback.
  if(!enabled&&wasMobile&&!xr){engine.setHardwareScalingLevel(originalScale);engine.resize();restoreTextures();}
  if(wasXR&&!xr&&enabled)resize();wasXR=xr;wasMobile=enabled;
  return enabled;
 }
 function update(){
  if(disposed||!sync()||document.hidden||!getPlaying()){slow=fast=elapsed=frames=0;return;}
  const dt=engine.getDeltaTime()/1000;if(!(dt>0)||dt>.25){slow=fast=elapsed=frames=0;return;}
  elapsed+=dt;frames++;if(elapsed<2)return;
  const fps=frames/elapsed;slow=fps<24?slow+elapsed:0;fast=fps>42?fast+elapsed:0;elapsed=frames=0;
  if(slow>=6){ratio=Math.max(Math.min(base,1.25),ratio-.125);slow=0;apply();}
  else if(fast>=10){ratio=Math.min(base,ratio+.125);fast=0;apply();}
 }
 const observer=scene.onBeforeRenderObservable.add(update);
 const resized=new ResizeObserver(resize);resized.observe(canvas);
 coarse.addEventListener('change',sync);window.addEventListener('resize',resize);
 const api={get enabled(){return active();},get ratio(){return ratio;},get maximumRatio(){return base;},resize,dispose(){if(disposed)return;disposed=true;scene.onBeforeRenderObservable.remove(observer);resized.disconnect();coarse.removeEventListener('change',sync);window.removeEventListener('resize',resize);style.remove();document.documentElement.removeAttribute('data-office-mobile121');if(!window.Office97?.xrActive){engine.setHardwareScalingLevel(originalScale);engine.resize();}restoreTextures();}};
 sync();scene.onDisposeObservable.add(()=>api.dispose());return api;
}
