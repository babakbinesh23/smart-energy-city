/* Independent short Opus segments travel over the existing authenticated HTTPS poll. */
export function createVoiceFallback114(mp){
 let stream=null,recorder=null,timer=0,captureGeneration=0,sequence=0,queue=[],sent=[],cursor='0',initialized=false,context=null,dead=false,lastSession='',clock=0,decoding=Promise.resolve(),blocked=false,spaceGeneration119=0;
 const playAt=new Map,playback=new Map;
 const direct=peer=>peer.pc?.connectionState==='connected'&&!!peer.audio.srcObject;
 const needsReceive=()=>[...mp.peers].filter(([,peer])=>!direct(peer)&&peer.inRange&&peer.remote.buffer.sample(performance.now())?.muted===false).map(([id])=>id);
 const needsSend=()=>!!stream&&mp.active&&[...mp.peers.values()].some(peer=>peer.inRange&&!direct(peer));
 function stopCapture(){captureGeneration++;clearTimeout(timer);timer=0;const old=recorder;recorder=null;if(old?.state==='recording')try{old.stop();}catch{}}
 function format(){if(!globalThis.MediaRecorder)return null;return ['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'].find(type=>MediaRecorder.isTypeSupported(type))||null;}
 function capture(){
  if(dead||recorder||!needsSend())return;const mime=format();if(!mime)return;
  const generation=captureGeneration,parts=[];let current;
  try{current=new MediaRecorder(stream,{mimeType:mime,audioBitsPerSecond:24000});recorder=current;}catch{return;}
  current.ondataavailable=event=>{if(event.data.size)parts.push(event.data);};
  current.onstop=()=>{if(recorder===current)recorder=null;if(dead||generation!==captureGeneration)return;capture();const blob=new Blob(parts,{type:mime});if(blob.size<32||blob.size>32768)return;void blob.arrayBuffer().then(bytes=>{if(dead||generation!==captureGeneration)return;const data=btoa(String.fromCharCode(...new Uint8Array(bytes)));queue.push({seq:++sequence,mime,data});if(queue.length>4)queue.shift();});};
  current.onerror=()=>{if(recorder===current)recorder=null;};current.start();timer=setTimeout(()=>{if(current.state==='recording')current.stop();},360);
 }
 async function unlock(){
  if(dead)return;try{context??=new (window.AudioContext||window.webkitAudioContext);if(context.state!=='running')await context.resume();blocked=context.state!=='running';}catch{blocked=true;}
 }
 function enqueue(packet){
  const generation119=spaceGeneration119;
  const peer=mp.peers.get(packet.sender);if(!peer||direct(peer)||!peer.inRange||peer.userMuted||typeof packet.data!=='string'||packet.data.length>44000)return;
  decoding=decoding.then(async()=>{if(dead||generation119!==spaceGeneration119||!mp.active||direct(peer))return;await unlock();if(!context||context.state!=='running'){blocked=true;mp.hear.hidden=false;return;}const raw=Uint8Array.from(atob(packet.data),c=>c.charCodeAt(0)),buffer=await context.decodeAudioData(raw.buffer);if(dead||generation119!==spaceGeneration119||!mp.active||mp.peers.get(packet.sender)!==peer||direct(peer)||!peer.inRange||peer.userMuted)return;
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;source.connect(gain);gain.connect(context.destination);const now=context.currentTime;let start=Math.max(now+.04,playAt.get(packet.sender)||0);if(start>now+.9)start=now+.06;
   const volume=Math.max(0,Math.min(1,peer.audio.volume||0)),end=start+buffer.duration;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.setValueAtTime(volume,Math.max(start+.009,end-.008));gain.gain.linearRampToValueAtTime(0,end);playAt.set(packet.sender,end);
   const active=playback.get(packet.sender)||new Set;active.add({source,gain});playback.set(packet.sender,active);source.onended=()=>{for(const node of active)if(node.source===source)active.delete(node);source.disconnect();gain.disconnect();};source.start(start);
  }).catch(()=>{});
 }
 const gesture=()=>void unlock();window.addEventListener('pointerdown',gesture,{once:true,capture:true});
 return {
  setSpace119(){spaceGeneration119++;stopCapture();queue=[];sent=[];cursor='0';initialized=false;for(const nodes of playback.values())for(const {source}of nodes)try{source.stop();}catch{}playback.clear();playAt.clear();},
  setStream(value){if(value===stream)return;stopCapture();stream=value;queue=[];if(value){void unlock();capture();}},
  outgoing(){if(lastSession!==mp.id){lastSession=mp.id;cursor='0';initialized=false;queue=[];}sent=queue.slice(0,2);return{voice114:JSON.stringify(sent),voiceCursor114:cursor,voiceInit114:initialized?'1':'0',voiceWant114:JSON.stringify(needsReceive())};},
  accept(data){if(!data)return;const acknowledged=new Set(sent.map(p=>p.seq));queue=queue.filter(p=>!acknowledged.has(p.seq));sent=[];cursor=String(data.cursor||'0');initialized=true;for(const packet of data.packets||[])enqueue(packet);},
  update(){if(dead)return;const now=performance.now();if(now-clock<120)return;clock=now;if(needsSend())capture();else if(recorder)stopCapture();for(const [id,nodes]of playback){const peer=mp.peers.get(id),allowed=mp.active&&peer?.inRange&&!peer.userMuted&&!direct(peer);if(!allowed){for(const {source}of nodes)try{source.stop();}catch{}nodes.clear();playAt.delete(id);}else for(const node of nodes)if(context)node.gain.gain.setTargetAtTime(Math.max(0,peer.audio.volume||0),context.currentTime,.025);if(!nodes.size)playback.delete(id);}},
  unlock,get blocked(){return blocked;},get needed(){return needsSend()||needsReceive().length>0;},
  dispose(){dead=true;stopCapture();queue=[];for(const nodes of playback.values())for(const {source}of nodes)try{source.stop();}catch{}playback.clear();context?.close().catch(()=>{});window.removeEventListener('pointerdown',gesture,true);}
 };
}
