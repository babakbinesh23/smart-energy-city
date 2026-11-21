import {setAudioListener122,setAudioPosition122} from './audio-compat-2.5.122.js';
/* Industrial ambience uses one distance curve, anchored to the actual buildings. */
export class PlantAudio117{
 constructor(T,Birds){this.T=T;this.Birds=Birds;this.context=null;this.emitters=[];this.sources=[];this.position=new T.Vector3;this.forward=new T.Vector3;this.up=new T.Vector3;this.rotation=new T.Quaternion;this.resumePending=null;this.lastResume=0;this.disposed=false;
  this.unlock=()=>{if(this.disposed)return;try{if(!this.context||this.context.state==='closed')this.create();this.resume();}catch(error){console.warn('Industrial audio unavailable',error);}};
  this.events=['pointerdown','pointerup','keydown','click'];for(const name of this.events)window.addEventListener(name,this.unlock,{capture:true});
  this.onVisible=()=>{if(!document.hidden)this.resume();};document.addEventListener('visibilitychange',this.onVisible);
 }
 resume(){const ctx=this.context;if(!ctx||ctx.state==='running'||ctx.state==='closed'||this.resumePending)return;this.lastResume=performance.now();this.resumePending=ctx.resume().catch(()=>{}).finally(()=>this.resumePending=null);}
 create(){
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const ctx=this.context=new Audio;
  this.master=ctx.createGain();this.master.gain.value=0;
  const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=18;limiter.ratio.value=4;this.master.connect(limiter).connect(ctx.destination);
  this.birds=new this.Birds(ctx,this.master);
  const noise=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate),data=noise.getChannelData(0);let value=0;for(let i=0;i<data.length;i++){value=(value+.025*(Math.random()*2-1))/1.025;data[i]=value*3+(Math.random()*2-1)*.15;}
  const emitter=(position,kind)=>{const gain=ctx.createGain(),panner=ctx.createPanner();gain.gain.value=0;panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=kind==='transformer'?5:18;panner.maxDistance=90;panner.rolloffFactor=.85;gain.connect(panner).connect(this.master);const e={gain,panner,kind,position:new this.T.Vector3(...position)};this.emitters.push(e);return e;};
  const tone=(e,hz,amount)=>{const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.frequency.value=hz;gain.gain.value=amount;oscillator.connect(gain).connect(e.gain);oscillator.start();this.sources.push(oscillator);};
  const hiss=(e,hz,type,amount=1)=>{const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=noise;source.loop=true;filter.type=type;filter.frequency.value=hz;filter.Q.value=.4;gain.gain.value=amount;source.connect(filter).connect(gain).connect(e.gain);source.start(0,Math.random()*3);this.sources.push(source);};
  for(const x of[-210,-191,-172]){const e=emitter([x,2.8,-151],'transformer');for(const [hz,amount]of[[50,.08],[100,.6],[200,.2]])tone(e,hz,amount);hiss(e,1800,'bandpass',.06);}
  const factory=emitter([-67,2.5,-188],'factory');for(const [hz,amount]of[[70,.32],[140,.1],[280,.04]])tone(factory,hz,amount);hiss(factory,520,'lowpass');
  for(const z of[-192,-163])hiss(emitter([-224.5,2.8,z],'steam'),950,'bandpass');
  if(this.city)this.bindCity(this.city);
 }
 bindCity(city){this.city=city;if(!this.emitters.length)return;
  for(const kind of['factory','steam']){const owner=kind==='factory'?city.factory.group:city.coolingTowers?.group;if(!owner)continue;owner.updateWorldMatrix(true,true);const box=new this.T.Box3().setFromObject(owner);if(box.isEmpty())continue;const records=this.emitters.filter(e=>e.kind===kind);records.forEach((e,i)=>{box.getCenter(e.position);e.position.y=box.min.y+2.6;if(records.length>1)e.position.z=box.min.z+(box.max.z-box.min.z)*(i+.5)/records.length;e.local=owner.worldToLocal(e.position.clone());e.owner=owner;});}
 }
 update(camera,powered,paused,factoryPowered=powered,immersive=false){
  const ctx=this.context;if(!ctx||ctx.state==='closed')return;
  if(ctx.state!=='running'&&!paused&&performance.now()-this.lastResume>1000)this.resume();
  const time=ctx.currentTime,listener=ctx.listener;camera.getWorldPosition(this.position);camera.getWorldQuaternion(this.rotation);camera.getWorldDirection(this.forward);this.up.set(0,1,0).applyQuaternion(this.rotation);
  setAudioListener122(listener,this.position,this.forward,this.up);
  const silent=paused||!immersive&&document.hidden;this.master.gain.setTargetAtTime(silent?0:.85,time,.15);this.birds?.update(!silent);
  for(const e of this.emitters){if(e.owner)e.position.copy(e.local).applyMatrix4(e.owner.matrixWorld);setAudioPosition122(e.panner,e.position.x,e.position.y,e.position.z);
   const distance=this.position.distanceTo(e.position),range=e.kind==='transformer'?32:90,fade=Math.max(0,Math.min(1,(range-distance)/15)),enabled=e.kind==='factory'?factoryPowered:powered,volume=e.kind==='factory'?.22:e.kind==='steam'?.28:.065;
   e.gain.gain.setTargetAtTime(!silent&&enabled&&!e.owner?.userData.editorDeleted&&e.owner?.visible!==false?volume*fade:0,time,.25);
  }
 }
 dispose(){this.disposed=true;for(const name of this.events)window.removeEventListener(name,this.unlock,true);document.removeEventListener('visibilitychange',this.onVisible);this.birds?.dispose();for(const source of this.sources){try{source.stop();}catch{}source.disconnect();}this.context?.close().catch(()=>{});}
}
