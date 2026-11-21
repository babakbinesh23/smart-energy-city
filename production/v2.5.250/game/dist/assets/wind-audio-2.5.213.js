import {setAudioListener122,setAudioPosition122} from './audio-compat-2.5.122.js';
// The file is already trimmed at original second 7 and has a baked four-second tail fade.
export const WIND_AUDIO_URL213=(window.barghetoCityServerMedia109?.["wind-turbines-2.5.213.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./wind-turbines-2.5.213.mp3',import.meta.url).href));
export class WindAudio213{
 constructor(game,T){
  this.game=game;this.T=T;this.context=null;this.bytes=null;this.loading=null;this.buffer=null;this.output=null;this.voice=null;
  this.inside=false;this.finished=false;this.offset=0;this.failed=false;this.disposed=false;this.lastTick=0;this.watchdog=null;
  this.position=new T.Vector3();this.target=new T.Vector3();this.candidate=new T.Vector3();this.sourcePosition=new T.Vector3();this.forward=new T.Vector3();this.up=new T.Vector3();this.rotation=new T.Quaternion();
  this.hidden=()=>{if(document.hidden)this.halt(this.inside);};this.pagehide=()=>this.halt(this.inside);
  document.addEventListener('visibilitychange',this.hidden);window.addEventListener('pagehide',this.pagehide);
 }
 load(ctx){
  if(this.failed||this.disposed)return;
  if(this.context!==ctx){this.halt(this.inside);this.output?.disconnect();this.output=null;this.context=ctx;this.buffer=null;this.loading=null;}
  if(this.buffer||this.loading)return;
  this.bytes??=fetch(WIND_AUDIO_URL213).then(r=>{if(!r.ok)throw Error('Turbine recording unavailable');return r.arrayBuffer();});
  const promise=this.bytes.then(bytes=>ctx.decodeAudioData(bytes.slice(0))).then(buffer=>{if(!this.disposed&&this.context===ctx)this.buffer=buffer;}).catch(error=>{if(this.context===ctx){this.failed=true;console.warn('Turbine ambience unavailable',error);}}).finally(()=>{if(this.loading===promise)this.loading=null;});
  this.loading=promise;
 }
 start(ctx){
  if(!this.output){this.output=ctx.createDynamicsCompressor();this.output.threshold.value=-9;this.output.knee.value=12;this.output.ratio.value=6;this.output.attack.value=.01;this.output.release.value=.2;this.output.connect(ctx.destination);}
  const source=ctx.createBufferSource(),gain=ctx.createGain(),panner=ctx.createPanner();source.buffer=this.buffer;source.loop=false;
  gain.gain.value=0;panner.panningModel='equalpower';panner.distanceModel='inverse';panner.refDistance=14;panner.maxDistance=60;panner.rolloffFactor=1;
  source.connect(gain).connect(panner).connect(this.output);
  const voice={source,gain,panner,ctx,startedAt:ctx.currentTime,offset:this.offset,stopAt:null};this.voice=voice;this.sourcePosition.copy(this.target);
  source.onended=()=>{if(this.voice!==voice)return;this.disconnect(voice);this.voice=null;this.finished=true;this.offset=0;this.clearWatchdog();};
  // Start at buffer zero: original second 7 was physically removed during encoding.
  source.start(0,Math.min(this.offset,Math.max(0,this.buffer.duration-.01)));
  this.watchdog??=setInterval(()=>{if(document.hidden||this.game.officeSession?.active||this.game.vr?.active&&!this.game.vr.visible||performance.now()-this.lastTick>1500)this.halt(this.inside);},300);
 }
 disconnect(v){for(const node of [v.source,v.gain,v.panner])node.disconnect();}
 clearWatchdog(){if(this.watchdog){clearInterval(this.watchdog);this.watchdog=null;}}
 halt(save=false){
  const v=this.voice;if(!v)return;
  this.offset=save?Math.min(this.buffer?.duration??Infinity,v.offset+Math.max(0,v.ctx.currentTime-v.startedAt)):0;
  v.source.onended=null;try{v.source.stop();}catch{}this.disconnect(v);this.voice=null;this.clearWatchdog();
 }
 update(dt){
  if(this.disposed)return;this.lastTick=performance.now();
  const g=this.game,farm=g.city.windFarm206,camera=g.vr.active?g.vr.view:g.camera.camera;
  const allowed=!document.hidden&&!g.manualPause&&!g.officeSession?.active&&(!g.vr.active||g.vr.visible&&!g.vr.menuOpen&&!g.vr.insideOffice)&&(!g.paused||g.sunTracking207?.previewing||g.city.solarBess?.isOpen);
  if(!allowed||!farm||!farm.group.visible||farm.group.userData.editorDeleted){this.halt(this.inside);return;}
  camera.getWorldPosition(this.position);farm.group.updateWorldMatrix(true,false);let distance=Infinity;
  for(const r of farm.records){const p=this.candidate.set(r.x,r.baseY+8,r.z).applyMatrix4(farm.group.matrixWorld),d=p.distanceTo(this.position);if(d<distance){distance=d;this.target.copy(p);}}
  if(!this.inside&&distance<=42){this.inside=true;this.finished=false;this.offset=0;if(this.voice)this.voice.stopAt=null;}
  if(this.inside&&distance>=58){this.inside=false;this.finished=false;this.offset=0;if(this.voice)this.voice.stopAt=this.voice.ctx.currentTime+.6;}
  const ctx=g.city.plantAudio?.context;
  if(!ctx||ctx.state!=='running'){this.halt(this.inside);return;}
  if(this.inside&&!this.finished){this.load(ctx);if(this.buffer&&!this.voice){if(this.offset>=this.buffer.duration-.01){this.finished=true;}else this.start(ctx);}}
  const v=this.voice;if(!v)return;
  if(v.stopAt!==null&&ctx.currentTime>=v.stopAt){this.halt(false);return;}
  this.sourcePosition.lerp(this.target,1-Math.exp(-7*Math.max(0,Math.min(.1,Number(dt)||0))));
  camera.getWorldQuaternion(this.rotation);camera.getWorldDirection(this.forward);this.up.set(0,1,0).applyQuaternion(this.rotation);
  setAudioListener122(ctx.listener,this.position,this.forward,this.up);setAudioPosition122(v.panner,this.sourcePosition.x,this.sourcePosition.y,this.sourcePosition.z);
  const fade=this.inside?Math.max(0,Math.min(1,(58-distance)/20)):0;v.gain.gain.setTargetAtTime(.9*fade,ctx.currentTime,this.inside ? .18 : .12);
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.halt(false);this.output?.disconnect();this.buffer=null;this.bytes=null;document.removeEventListener('visibilitychange',this.hidden);window.removeEventListener('pagehide',this.pagehide);}
}
export function installWindAudio213(game,T){
 const audio=new WindAudio213(game,T),render=game.renderer.render;
 game.renderer.render=function(...args){audio.update(game.time.rawDelta);return render.apply(this,args);};
 const dispose=()=>{audio.dispose();game.renderer.render=render;};game.disposers.push(dispose);game.windAudio213=audio;return audio;
}
