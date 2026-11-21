import {isMobile235} from './mobile-scope-2.5.235.js';
import {setAudioListener122,setAudioPosition122} from './audio-compat-2.5.122.js';
export const TRACKER_MOTOR_URL210=(window.barghetoCityServerMedia109?.["tracker-motor-2.5.210.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./tracker-motor-2.5.210.mp3',import.meta.url).href));
// A short mono excerpt of the supplied electric-door recording. Decode once,
// share it between both heads, and stop the sources whenever movement stops.
export class TrackerDriveAudio209{
 constructor(game,T,trackers){this.game=game;this.trackers=trackers;this.context=null;this.output=null;this.buffer=null;this.loading=null;this.failed=false;this.voices=new Map();this.clock=0;this.watchdog=null;this.disposed=false;this.position=new T.Vector3();this.forward=new T.Vector3();this.up=new T.Vector3();this.rotation=new T.Quaternion();this.motorPosition=new T.Vector3();
  this.bytes=fetch(TRACKER_MOTOR_URL210).then(r=>{if(!r.ok)throw Error('Tracker motor sample unavailable');return r.arrayBuffer();}).catch(error=>{console.warn('Tracker motor sound unavailable',error);return null;});
  this.unlock=()=>{const ctx=game.city.plantAudio?.context;if(!ctx||ctx.state==='closed')return Promise.resolve();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return this.load(ctx);};
  this.events=['pointerdown','pointerup','click','keydown','touchend'];for(const e of this.events)window.addEventListener(e,this.unlock,true);
  this.hidden=()=>{if(document.hidden)this.stop();};this.pagehide=()=>this.stop();document.addEventListener('visibilitychange',this.hidden);window.addEventListener('pagehide',this.pagehide);
 }
 load(ctx){if(this.disposed||this.failed)return Promise.resolve();if(ctx!==this.context){this.stop();this.output?.disconnect();this.output=null;this.context=ctx;this.buffer=null;this.loading=null;}if(this.buffer)return Promise.resolve(this.buffer);if(this.loading)return this.loading;
  const promise=this.bytes.then(bytes=>bytes?ctx.decodeAudioData(bytes.slice(0)):null).then(buffer=>{if(!buffer)this.failed=true;if(!this.disposed&&ctx===this.context)this.buffer=buffer;return buffer;}).catch(error=>{this.failed=true;console.warn('Tracker sample decode unavailable',error);return null;}).finally(()=>{if(this.loading===promise)this.loading=null;});this.loading=promise;return promise;
 }
 createVoice(index,ctx){if(!this.output){this.output=ctx.createDynamicsCompressor();this.output.threshold.value=-6;this.output.knee.value=9;this.output.ratio.value=12;this.output.attack.value=.003;this.output.release.value=.2;this.output.connect(ctx.destination);}const source=ctx.createBufferSource(),gain=ctx.createGain(),panner=ctx.createPanner();source.buffer=this.buffer;source.loop=true;source.loopStart=0;source.loopEnd=this.buffer.duration;source.playbackRate.value=1;gain.gain.value=0;source.connect(gain).connect(panner).connect(this.output);panner.panningModel='equalpower';panner.distanceModel='inverse';panner.refDistance=12;panner.maxDistance=65;panner.rolloffFactor=.8;source.start(0,index*.07);
  const voice={source,gain,panner,silentSince:null};this.voices.set(index,voice);if(!this.watchdog)this.watchdog=setInterval(()=>{if(performance.now()-this.lastUpdate>350||document.hidden||this.game.officeSession?.active||this.game.vr?.active&&this.game.vr.visible===false)this.stop();},250);return voice;
 }
 release(index){const v=this.voices.get(index);if(!v)return;try{v.source.stop();}catch{}for(const n of[v.source,v.gain,v.panner])n.disconnect();this.voices.delete(index);if(!this.voices.size&&this.watchdog){clearInterval(this.watchdog);this.watchdog=null;}}
 stop(){for(const i of [...this.voices.keys()])this.release(i);}
 update(camera,dt,allowed=true){if(this.disposed)return;this.lastUpdate=performance.now();const ctx=this.game.city.plantAudio?.context;if(!allowed||document.hidden||!ctx||ctx.state!=='running'){this.stop();return;}if(this.failed)return;if(ctx!==this.context||!this.buffer){this.load(ctx);return;}this.clock+=Math.max(0,Math.min(.1,Number(dt)||0));if(this.clock<.05)return;this.clock=0;if(!this.voices.size&&!this.trackers.records.some(r=>r.angularSpeed>.008))return;
  camera.getWorldPosition(this.position);camera.getWorldQuaternion(this.rotation);camera.getWorldDirection(this.forward);this.up.set(0,1,0).applyQuaternion(this.rotation);setAudioListener122(ctx.listener,this.position,this.forward,this.up);
  for(const [i,r]of this.trackers.records.entries()){r.yawNode.getWorldPosition(this.motorPosition);const distance=this.position.distanceTo(this.motorPosition),active=r.angularSpeed>.008&&distance<65&&!r.root.userData.editorDeleted&&r.root.visible!==false;let v=this.voices.get(i);
   if(active){v??=this.createVoice(i,ctx);v.silentSince=null;const speed=Math.min(1,r.angularSpeed/.24),fade=Math.max(0,Math.min(1,(65-distance)/15));setAudioPosition122(v.panner,this.motorPosition.x,this.motorPosition.y,this.motorPosition.z);const web=!this.game.vr?.active,mobile235=isMobile235(this.game);v.panner.refDistance=web?22:12;v.panner.rolloffFactor=web ? .55 : .8;v.gain.gain.setTargetAtTime((mobile235?4.8:web?1.6:.48)*(.5+.5*speed)*fade,ctx.currentTime,.1);
   }else if(v){v.gain.gain.setTargetAtTime(0,ctx.currentTime,.09);v.silentSince??=ctx.currentTime;if(ctx.currentTime-v.silentSince>.4)this.release(i);}
  }
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.stop();this.output?.disconnect();this.output=null;this.buffer=null;for(const e of this.events)window.removeEventListener(e,this.unlock,true);document.removeEventListener('visibilitychange',this.hidden);window.removeEventListener('pagehide',this.pagehide);}
}
