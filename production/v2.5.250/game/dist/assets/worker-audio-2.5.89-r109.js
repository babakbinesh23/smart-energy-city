const AUDIO_URL=(window.barghetoCityServerMedia109?.["chinese-workers-2.5.86.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./chinese-workers-2.5.86.mp3',import.meta.url).href));
const clamp=x=>Math.max(0,Math.min(1,x));
export function workerGain86(distance){return Number.isFinite(distance)&&distance>=0&&distance<=2?.65*(1-.25*clamp(distance/2)):0;}
// Share the city's audio context/listener; decode the supplied recording once.
export class WorkerAudio86{
 constructor(crowd){this.crowd=crowd;this.disposed=false;this.unlocked=false;this.loading=null;this.emitters=[];this.abort=null;this.retryAt=0;this.context=null;this.buffer=null;this.immersive=false;this.unlock=this.unlock.bind(this);this.onVisibility=()=>{if(document.hidden&&!this.immersive)this.silence();};this.onHide=()=>this.silence();window.addEventListener('pointerdown',this.unlock,true);window.addEventListener('keydown',this.unlock,true);document.addEventListener('visibilitychange',this.onVisibility);window.addEventListener('pagehide',this.onHide);}
 unlock(){if(this.disposed)return;this.unlocked=true;this.crowd.city.plantAudio?.unlock();const context=this.crowd.city.plantAudio?.context;if(context?.state==='suspended')context.resume().catch(()=>{});}
 async prepare(context){
  if(this.loading||this.buffer||this.disposed||performance.now()<this.retryAt)return;
  this.context=context;this.abort=new AbortController();const signal=this.abort.signal;
  this.loading=(async()=>{try{const response=await fetch(AUDIO_URL,{signal});if(!response.ok)throw Error('Worker audio HTTP '+response.status);const data=await response.arrayBuffer();if(this.disposed)return;const buffer=await context.decodeAudioData(data);if(this.disposed)return;this.buffer=buffer;this.startEmitters();}catch(error){if(!this.disposed){this.retryAt=performance.now()+30000;console.warn('Worker ambience unavailable; city continues',error);}}finally{this.loading=null;this.abort=null;}})();
  return this.loading;
 }
 targets(){const result=this.crowd.teams.map(team=>({key:team.id,group:team.group,members:this.crowd.actors.filter(actor=>actor.team===team).map(actor=>actor.rig.root)}));const manager=this.crowd.city.factoryManager;if(manager?.loaded)result.push({key:'factory-manager',group:manager.group});return result;}
 startEmitters(){const context=this.context;for(const target of this.targets()){
  const source=context.createBufferSource(),gain=context.createGain(),panner=context.createPanner();source.buffer=this.buffer;source.loop=true;gain.gain.value=0;
  panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=1;panner.maxDistance=2;panner.rolloffFactor=.4;
  source.connect(gain).connect(panner).connect(context.destination);source.start(0,(this.emitters.length*3.17)%Math.max(.1,this.buffer.duration));this.emitters.push({...target,source,gain,panner});
 }}
 update(camera,muted=false,immersive=false){
  if(this.disposed)return;this.immersive=immersive;const targets=this.targets(),positions=targets.map(target=>{
   let position=null,distance=Infinity,deleted=false;
   for(let node=target.group;node;node=node.parent)if(node.userData.editorDeleted||!node.visible){deleted=true;break;}
   for(const member of target.members?.length?target.members:[target.group]){
    if(member.userData.editorDeleted||!member.visible)continue;
    member.updateWorldMatrix(true,false);const point=member.getWorldPosition(new this.crowd.T.Vector3);point.y+=1.55;
    const d=point.distanceTo(camera.position);if(d<distance){distance=d;position=point;}
   }
   return {...target,position:position??new this.crowd.T.Vector3,distance,deleted};
  });
  const active=positions.filter(p=>!p.deleted&&p.distance<=2).sort((a,b)=>a.distance-b.distance).slice(0,2);const audible=!muted&&(immersive||!document.hidden);
  const context=this.crowd.city.plantAudio?.context;
  if(audible&&active.length&&this.unlocked&&context?.state==='running'&&!this.buffer&&!this.loading)void this.prepare(context);
  if(!this.context)return;const time=this.context.currentTime;
  for(const emitter of this.emitters){const target=positions.find(p=>p.key===emitter.key);let volume=0;if(target){emitter.panner.positionX.setValueAtTime(target.position.x,time);emitter.panner.positionY.setValueAtTime(target.position.y,time);emitter.panner.positionZ.setValueAtTime(target.position.z,time);if(audible&&active.some(p=>p.key===emitter.key))volume=workerGain86(target.distance);}emitter.gain.gain.setTargetAtTime(volume,time,volume>0?.08:.04);}
 }
 silence(){if(!this.context)return;for(const emitter of this.emitters)emitter.gain.gain.setTargetAtTime(0,this.context.currentTime,.05);}
 dispose(){if(this.disposed)return;this.disposed=true;this.abort?.abort();window.removeEventListener('pointerdown',this.unlock,true);window.removeEventListener('keydown',this.unlock,true);document.removeEventListener('visibilitychange',this.onVisibility);window.removeEventListener('pagehide',this.onHide);for(const emitter of this.emitters){try{emitter.source.stop();}catch(_){}emitter.source.disconnect();emitter.gain.disconnect();emitter.panner.disconnect();}this.emitters.length=0;this.buffer=null;}
}
