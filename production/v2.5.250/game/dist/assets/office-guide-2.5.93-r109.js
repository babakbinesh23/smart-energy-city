(function () {
 'use strict';
 if(window.barghetoOfficeGuideInterrupt85)return;
 const speaking=state=>state==='intro'||state==='zone';
 function attach(guide){
  if(!guide||guide.interruptOnSection85)return !!guide?.interruptOnSection85;
  if(!['update','checkProximity','haltAudio'].every(key=>typeof guide[key]==='function'))return false;
  const update=guide.update,checkProximity=guide.checkProximity;
  guide.checkProximity=function(position){
   const previous=this.lastZoneId,wasSpeaking=speaking(this.state);
   const result=checkProximity.call(this,position);
   if(wasSpeaking&&this.lastZoneId&&this.lastZoneId!==previous){
    const topic=this.catalog[this.floor]?.topics?.find(item=>item.id===this.lastZoneId);
    // The original play() already halts audio before starting a valid topic.
    // Also halt the previous department when the new department has no recording.
    if(!topic?.url){this.haltAudio();this.state='exploring';}
   }
   return result;
  };
  guide.update=function(dt){
   const wasSpeaking=speaking(this.state);
   const result=update.call(this,dt);
   if(wasSpeaking&&speaking(this.state)&&this.avatar&&this.floor&&!this.elevator.inCab){
    const position=this.player.getPosition?.();
    if(position)this.checkProximity(position);
   }
   return result;
  };
  guide.interruptOnSection85=true;
  return true;
 }
 window.barghetoOfficeGuideInterrupt85={attach};
 let timer=0,stopped=false;
 function connect(){
  if(stopped)return;
  if(attach(window.__BABYLON_OFFICE__?.guide))return;
  if(window.__BABYLON_OFFICE_BOOT_STAGE__==='fatal')return;
  timer=window.setTimeout(connect,250);
 }
 window.addEventListener('pagehide',()=>{stopped=true;window.clearTimeout(timer);});
 window.addEventListener('pageshow',()=>{if(stopped){stopped=false;connect();}});
 connect();
})();

(function(){
 'use strict';
 const zones = Object.freeze({
  P: [{ id: 'p_parking', x: 17, z: 7, radius: 5 }],
  G: [{ id: 'g_dining', x: 17, z: 2, radius: 6 }],
  '1': [
    { id: '1_subscribers', x: 11.5, z: -8, radius: 3.5 },
    { id: '1_solar', x: 22, z: -8, radius: 3.5 },
    { id: '1_marketing', x: 11.5, z: 8, radius: 3.5 },
    { id: '1_sales', x: 22, z: 8, radius: 3.5 },
    { id: '1_hr', x: 4.25, z: -8, radius: 3.0 },
    { id: '1_energy', x: 4.25, z: 8, radius: 3.0 },
  ],
  '2': [
    { id: '2_finance', x: 22, z: -8, radius: 3.5 },
    { id: '2_meeting', x: 21, z: 8, radius: 3.5 },
  ],
  '3': [
    { id: '3_manager3', x: 9.05, z: -4.6, radius: 3.2 },
    { id: '3_monitoring3', x: 5.67, z: -4.6, radius: 2.8 },
    { id: '3_meeting3', x: 16.8, z: 7.7, radius: 3.2 },
    { id: '3_team3', x: 22.5, z: -1, radius: 5 },
    { id: '3_think_pod', x: 14.4, z: 3.1, radius: 2.3 },
  ],
  '4': [{ id: '4_workspace', x: 18, z: 6.5, radius: 6 }],
  R: [
    { id: 'r_solar', x: 15, z: -7.2, radius: 5 },
    { id: 'r_equipment', x: 7.1, z: 11, radius: 3.2 },
    { id: 'r_terrace', x: 14, z: 8.6, radius: 4.5 },
  ],
});


 function attach(g){
  if(!g||g.proximity90)return !!g?.proximity90;
  const bookmarks=new Map;let topic=null,rangePaused=false,pending=false;
  const save=()=>{if(topic?.url&&g.audio.getAttribute('src')&&Number.isFinite(g.audio.currentTime))bookmarks.set(topic.url,g.audio.ended?0:g.audio.currentTime);};
  const near=()=>{const p=g.player.getPosition?.();if(!p||g.elevator.inCab||document.hidden)return false;const zone=g.state==='zone'?(zones[g.floor]||[]).find(z=>z.id===topic?.id):null;const center=zone||g.home;return Math.abs(p.y-g.home.y)<=2.2&&Math.hypot(p.x-center.x,p.z-center.z)<=(zone?.radius??4.2);};
  const gate=()=>{if(!topic?.url||!['intro','zone'].includes(g.state))return;if(!near()){if(!g.audio.paused||rangePaused){rangePaused=true;g.audio.pause();save();}return;}if(rangePaused&&!pending){rangePaused=false;pending=true;Promise.resolve().then(()=>g.audio.play()).then(()=>{if(!near()){rangePaused=true;g.audio.pause();}}).catch(()=>{rangePaused=true;}).finally(()=>pending=false);}};
  const play=g.play,halt=g.haltAudio,update=g.update,stop=g.stop;
  g.haltAudio=function(){save();rangePaused=false;return halt.call(this);};
  g.play=function(next){save();const result=play.call(this,next);topic=next;const time=bookmarks.get(next?.url)||0;const seek=()=>{if(topic!==next)return;try{this.audio.currentTime=time;}catch{}};seek();if(!this.audio.readyState)this.audio.addEventListener('loadedmetadata',seek,{once:true});if(!near()){rangePaused=true;this.audio.pause();}return result;};
  g.update=function(dt){const result=update.call(this,dt);gate();return result;};
  g.stop=function(){const key=topic?.url;const result=stop.call(this);if(key)bookmarks.delete(key);topic=null;rangePaused=false;return result;};
  g.audio.addEventListener('playing',()=>{if(topic&&!near()){rangePaused=true;g.audio.pause();}});
  g.audio.addEventListener('ended',()=>{if(topic?.url)bookmarks.delete(topic.url);topic=null;rangePaused=false;});
  g.proximity90={gate,bookmarks};return true;
 }
 window.barghetoOfficeSpeech90={attach};
 let timer;function connect(){if(attach(window.__BABYLON_OFFICE__?.guide))return;if(window.__BABYLON_OFFICE_BOOT_STAGE__!=='fatal')timer=setTimeout(connect,250);}connect();window.addEventListener('pagehide',()=>clearTimeout(timer));
})();

(function(){
 let timer,guide=null,offAudio=null,control=null;
 function attach(){const g=window.__BABYLON_OFFICE__?.guide,r=window.BarghetoExpertRate93;if(!g||!r){timer=setTimeout(attach,250);return;}if(g!==guide){offAudio?.();control?.dispose();control=null;guide=g;offAudio=r.register(g.audio);}if(!control){const pause=g.stopButton??document.querySelector('.bo-guide-audio-control button');if(pause)control=r.mount(pause);else timer=setTimeout(attach,250);}}
 attach();window.addEventListener('pagehide',()=>{clearTimeout(timer);offAudio?.();control?.dispose();});
})();
