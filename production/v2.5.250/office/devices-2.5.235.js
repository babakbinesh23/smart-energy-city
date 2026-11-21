import 'kit/ray-DccRG74w.js';

// Analytic acceleration/coasting: the angle is the integral of rotor speed,
// so both the transition and rotation stay consistent across frame rates.
export function stepFan232(f,dt){
 dt=Math.max(0,Math.min(.1,dt));const target=f.on?1:0,speed=f.speed232??1,tau=target?.4:.65,e=Math.exp(-dt/tau);
 const angle=13.5*(target*dt+(speed-target)*tau*(1-e));
 f.speed232=target+(speed-target)*e;if(Math.abs(f.speed232-target)<.002)f.speed232=target;
 return angle;
}

export function createOpenEdge232(){let opened=false;return(amount,target)=>{const full=amount>=.99999,edge=full&&target>0&&!opened;opened=full;return edge;};}

export function installOfficeDevices232({debug,office,toggleLift,getAudio,getMaster}){
 if(debug.devices232)return debug.devices232;
 const scene=debug.scene,canvas=scene.getEngine().getRenderingCanvas(),root=debug.liftRoot,openEdge=createOpenEdge232(),bindings=[],voices=new Set();let disposed=false,chimes=0;
 function stopVoice(voice){if(!voices.delete(voice))return;for(const s of voice.sources){try{s.stop();}catch{}s.disconnect();}for(const n of voice.nodes)n.disconnect();}
 function stopSound(){for(const voice of [...voices])stopVoice(voice);}
 function chime(){
  if(!debug.playing||!root.isEnabled())return;
  const ctx=getAudio(),master=getMaster();if(!ctx||!master||ctx.state!=='running')return;
  // A short two-tone lift bell, generated locally and routed through office mute/volume.
  stopSound();const gain=ctx.createGain(),panner=ctx.createPanner(),t=ctx.currentTime,p=root.getAbsolutePosition();gain.gain.value=0;panner.panningModel='equalpower';panner.distanceModel='inverse';panner.refDistance=1.3;panner.maxDistance=12;panner.rolloffFactor=1.2;
  if(panner.positionX){panner.positionX.value=p.x;panner.positionY.value=p.y+2;panner.positionZ.value=p.z;}else panner.setPosition(p.x,p.y+2,p.z);
  gain.connect(panner);panner.connect(master);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.16,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+.48);
  const voice={sources:[],nodes:[gain,panner],ended:0};voices.add(voice);
  try{for(const [frequency,delay]of [[1046.5,0],[784,.18]]){const oscillator=ctx.createOscillator(),level=ctx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;level.gain.setValueAtTime(0,t);level.gain.setValueAtTime(.7,t+delay);level.gain.exponentialRampToValueAtTime(.001,t+delay+.27);oscillator.connect(level);level.connect(gain);voice.sources.push(oscillator);voice.nodes.push(level);oscillator.onended=()=>{if(++voice.ended===voice.sources.length)stopVoice(voice);};oscillator.start(t+delay);oscillator.stop(t+delay+.30);}chimes++;}
  catch(error){stopVoice(voice);console.warn('Office elevator bell unavailable',error);}
 }
 const action=()=>{if(disposed||canvas.__editorDragging||canvas.__editorPlacing||debug.editor?.selected)return false;return toggleLift(!!office?.xrActive);};
 for(const mesh of root.getChildMeshes()){
  let button=false;for(let n=mesh;n&&n!==root;n=n.parent)if(/^Elevator(?:Calling|Interior)Buttons_\d+$/i.test(n.name)){button=true;break;}
  if(!button)continue;bindings.push({mesh,metadata:mesh.metadata,pickable:mesh.isPickable});mesh.isPickable=true;mesh.metadata={...mesh.metadata,elevatorButton232:true,officeAction97:action};
 }
 function click(event){if(disposed||office?.xrActive||event.button!==0||!debug.playing||performance.now()<(canvas.__ignoreEditorClickUntil||0))return;const r=canvas.getBoundingClientRect(),hit=scene.pick(event.clientX-r.left,event.clientY-r.top,m=>m.isPickable!==false&&m.isEnabled()&&m.isVisible&&m.visibility>0);if(hit?.pickedMesh?.metadata?.elevatorButton232)action();}
 canvas.addEventListener('click',click);addEventListener('pagehide',stopSound);
 const api={updateDoor(amount,target){if(disposed)return;const edge=openEdge(amount,target);if(!debug.playing)stopSound();else if(edge)chime();},stopSound,get state(){return{buttonMeshes:bindings.length,chimes,activeSounds:voices.size};},dispose(){if(disposed)return;disposed=true;stopSound();canvas.removeEventListener('click',click);removeEventListener('pagehide',stopSound);for(const b of bindings){b.mesh.metadata=b.metadata;b.mesh.isPickable=b.pickable;}}};
 debug.devices232=api;scene.onDisposeObservable.addOnce(()=>api.dispose());return api;
}
