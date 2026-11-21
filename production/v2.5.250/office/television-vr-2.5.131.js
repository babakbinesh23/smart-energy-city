import {R as RawTexture} from 'kit/rawTexture-C-I2TQcg.js';
import {ShaderMaterial} from 'kit/shaderMaterial-ur6GpZrh.js';

// Full volume nearby, a smooth falloff, then complete silence beyond 7.5 metres.
export function televisionDistanceGain(distance){
 const t=Math.max(0,Math.min(1,(distance-1.25)/(7.5-1.25)));
 return 1-t*t*(3-2*t);
}
export function mountTelevision({scene,engine,record,videoBase64,getListener,getPlaying,getAudio,getMaster,onStatus}){
 if(!record||!videoBase64)return null;
 const screen=record.node.getChildMeshes().find(m=>m.material?.albedoTexture);
 if(!screen){onStatus?.('صفحهٔ تلویزیون پیدا نشد.');return null;}
 const url=new URL(videoBase64,window.OfficeHost97.mediaBase).href;
 const video=document.createElement('video');
 video.id='officeTelevisionVideo';video.loop=true;video.preload='auto';video.autoplay=false;video.controls=false;
 video.crossOrigin='anonymous';video.playsInline=true;video.muted=true;video.volume=1;video.disablePictureInPicture=true;
 video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.setAttribute('aria-hidden','true');
 video.style.cssText='position:fixed;left:-10px;top:-10px;width:1px;height:1px;opacity:0;pointer-events:none';
 document.body.appendChild(video);
 let texture=null,material=null,sound=null,needsGesture=false,dirty=true,lastTime=-1,frameCallback=null,request=0,disposed=false,failed=false,lastGain=null,powered=true,lastPlay=0,inFlight=null,lastUploadError=0,audibleDenied=false;
 const active=()=>!record.deleted&&record.node.isEnabled()&&screen.isEnabled();
 const position=()=>{screen.computeWorldMatrix(true);return screen.getBoundingInfo().boundingBox.centerWorld;};
 const distance=()=>{const a=getListener(),b=position();return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);};
 function connectAudio(){
  if(sound)return true;
  const audio=getAudio(),master=getMaster();if(!audio||!master)return false;
  try{
   const source=audio.createMediaElementSource(video),gain=audio.createGain(),panner=audio.createPanner();
   gain.gain.value=0;panner.panningModel='equalpower';panner.distanceModel='inverse';panner.refDistance=1;panner.maxDistance=7.5;
   // The smooth distance envelope owns attenuation, so the panner only adds direction.
   panner.rolloffFactor=0;source.connect(gain);gain.connect(panner);panner.connect(master);
   sound={source,gain,panner};lastGain=0;return true;
  }catch(e){onStatus?.('صدای تلویزیون فعال نشد؛ نزدیک آن دکمهٔ پخش را بزن.');return false;}
 }
 function updateSound(){
  if(!sound)return;
  const p=position(),audio=getAudio();
  const gain=powered&&getPlaying()&&active()&&!video.paused&&!failed?televisionDistanceGain(distance()):0;
  if(lastGain===null||Math.abs(gain-lastGain)>.002||gain===0&&lastGain!==0){
   sound.gain.gain.cancelScheduledValues(audio.currentTime);
   sound.gain.gain.setTargetAtTime(gain,audio.currentTime,.12);lastGain=gain;
  }
  if(sound.panner.positionX){sound.panner.positionX.value=p.x;sound.panner.positionY.value=p.y;sound.panner.positionZ.value=p.z;}
  else sound.panner.setPosition(p.x,p.y,p.z);
 }
 function prepareTexture(allowBlank=false){
  if(texture||!allowBlank&&(!video.videoWidth||!video.videoHeight))return;
  const mipmaps=false; // Avoid rebuilding a video mip chain for every XR frame.
  texture=new RawTexture(null,video.videoWidth||1280,video.videoHeight||720,5,scene,mipmaps,true,mipmaps?3:2);
  texture.name='Bargheto television video';texture.gammaSpace=true;
  texture.anisotropicFilteringLevel=Math.max(1,Math.min(8,engine.getCaps?.()?.maxAnisotropy||1));
  // A display shows the decoded pixels, without room reflections or PBR tone mapping.
  material=new ShaderMaterial('Television video display',scene,{
   vertexSource:'precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 worldViewProjection; varying vec2 vUV; void main(void){vUV=uv; gl_Position=worldViewProjection*vec4(position,1.0);}',
   fragmentSource:'precision highp float; varying vec2 vUV; uniform sampler2D videoSampler; uniform float displayPower; void main(void){vec3 color=texture2D(videoSampler,vUV).rgb; gl_FragColor=vec4(clamp(color,0.0,1.0)*displayPower,1.0);}'
  },{attributes:['position','uv'],uniforms:['worldViewProjection','displayPower'],samplers:['videoSampler'],needAlphaBlending:false,needAlphaTesting:false});
  material.setTexture('videoSampler',texture);material.setFloat('displayPower',powered?1:0);material.backFaceCulling=true;material.unlit=true;
  screen.material=material;

 }
 function uploadFrame(){
  if(!powered||video.readyState<2||!active())return;
  prepareTexture();if(!texture)return;
  const internal=texture.getInternalTexture(),gl=engine._gl;if(!internal||!gl||engine._contextWasLost||gl.isContextLost?.())return;
  // Upload the decoded video directly to the GPU, without canvas pixel readbacks.
  engine._bindTextureDirectly(gl.TEXTURE_2D,internal,true);
  try{engine._unpackFlipY(true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);if(internal.generateMipMaps)gl.generateMipmap(gl.TEXTURE_2D);internal.isReady=true;dirty=false;lastTime=video.currentTime;}
  finally{engine._bindTextureDirectly(gl.TEXTURE_2D,null);}
 }
 function watchFrames(){
  if(!video.requestVideoFrameCallback||disposed)return;
  frameCallback=video.requestVideoFrameCallback(()=>{dirty=true;watchFrames();});
 }
 function play(){if(inFlight)return inFlight;inFlight=playOnce().finally(()=>{inFlight=null;});return inFlight;}
 async function playOnce(){
  if(disposed||!powered||!getPlaying()||!active())return false;
  lastPlay=performance.now();const id=++request;const hasAudio=connectAudio();video.muted=!(hasAudio&&getAudio()?.state==='running');
  try{
   await video.play();if(id!==request)return false;
   needsGesture=video.muted||!hasAudio;dirty=true;updateSound();return true;
  }catch(e){
   if(id!==request||!getPlaying())return false;
   needsGesture=true;audibleDenied=true;
   // Keep the picture available if the browser requires another tap for sound.
   video.muted=true;try{await video.play();}catch{}
   onStatus?.('برای پخش صدای تلویزیون، نزدیک آن دکمهٔ پخش را بزن.');return false;
  }
 }
 async function unlock(){
  if(disposed||!powered||!getPlaying()||!active())return false;
  connectAudio();const audio=getAudio();audibleDenied=false;
  // Controller events need not expose DOM userActivation. Resume the shared
  // context and retry audible playback instead of permanently muting the video.
  try{await audio?.resume();}catch{}
  if(disposed||!powered||!getPlaying())return false;
  if(inFlight)await inFlight;
  return play();
 }
 function pause(){++request;video.pause();updateSound();}
 function update(){
  if(disposed||failed)return;
  if(!powered||!getPlaying()||!active()){if(!video.paused)pause();else updateSound();return;}
  updateSound();
  if(video.muted&&needsGesture&&sound&&!audibleDenied&&!inFlight&&getAudio()?.state==='running')void play();
  // Quest may suspend rVFC while immersive rendering continues. XR's own frame
  // loop must also observe media time, otherwise the last decoded picture sticks.
  if(video.paused&&performance.now()-lastPlay>1500)void play();
  const newFrame=dirty||Math.abs(video.currentTime-lastTime)>=1/60;
  if(newFrame&&video.readyState>=2&&performance.now()-lastUploadError>200){try{uploadFrame();}catch(e){lastUploadError=performance.now();dirty=true;console.warn('Office VR video frame deferred',e);}}
 }
 function setPower(on){
  if(disposed)return;powered=!!on;needsGesture=false;audibleDenied=false;
  if(!powered){pause();video.muted=true;prepareTexture(true);material?.setFloat('displayPower',0);}
  else{material?.setFloat('displayPower',1);dirty=true;if(getPlaying()&&active())void play();}
  return powered;
 }
 function refresh(){if(!powered||!active())pause();else if(getPlaying()&&video.paused)void play();}
 video.addEventListener('loadeddata',()=>{dirty=true;});
 video.addEventListener('playing',()=>{dirty=true;updateSound();});
 video.addEventListener('pause',updateSound);
 video.addEventListener('error',()=>{failed=true;updateSound();onStatus?.('بارگذاری ویدئوی تلویزیون انجام نشد.');});
 video.addEventListener('ended',()=>{if(powered&&getPlaying()&&active()){video.currentTime=0;void play();}});
 const restoreObserver=engine.onContextRestoredObservable?.add(()=>{dirty=true;lastTime=-1;});
 const dispose=()=>{if(disposed)return;pause();disposed=true;if(frameCallback!==null)video.cancelVideoFrameCallback?.(frameCallback);
  if(restoreObserver)engine.onContextRestoredObservable.remove(restoreObserver);
  if(sound){sound.source.disconnect();sound.gain.disconnect();sound.panner.disconnect();}
  texture?.dispose();material?.dispose(false,false);video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(url);
 };
 scene.onDisposeObservable?.add(dispose);
 video.src=url;video.load();watchFrames();
 return {play,pause,update,refresh,connectAudio,unlock,dispose,distance,setPower,togglePower:()=>setPower(!powered),get powered(){return powered;},get needsGesture(){return needsGesture;},get video(){return video;},get sound(){return sound;},get screen(){return screen;}};
}
