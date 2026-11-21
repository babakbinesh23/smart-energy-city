// Apply only to the solar and aggregation experts. Their original web/mobile
// controls, narration and pause semantics remain delegated.
export function installVRExpertSpeech250(game,T,story,expert){
 if(!story||!expert)return story;
 const speech=story.speech,original={update:story.update,select:story.select,dispose:story.dispose,pause:speech.pause,resume:speech.resume,start:speech.start};
 const anchor=new T.Vector3;let immersive=false,wasVR=false,gain=1,lastMedia=null,baseVolume=.72;
 const reason='vr-expert-distance250';
 function apply(){const media=speech.media;if(!media)return;if(media!==lastMedia){lastMedia=media;baseVolume=Number.isFinite(media.volume)?media.volume:.72;}media.volume=Math.max(0,Math.min(1,baseVolume*gain));}
 function restore(){if(lastMedia&&speech.media===lastMedia)lastMedia.volume=baseVolume;speech.pauseReasons90?.delete(reason);lastMedia=null;gain=1;wasVR=false;}
 speech.pause=function(why='distance'){if(game.vr?.active&&why==='distance')return;return original.pause.call(this,why);};
 speech.start=function(...args){const result=original.start.apply(this,args);if(game.vr?.active)apply();return result;};
 story.update=function(camera,feet,enabled,vr,dt=0){
  immersive=!!vr&&!!game.vr?.active;
  if(!immersive){if(wasVR)restore();return original.update.call(this,camera,feet,enabled,vr,dt);}
  expert.group.getWorldPosition(anchor);const distance=Math.hypot(feet.x-anchor.x,feet.y-anchor.y,feet.z-anchor.z),t=Math.max(0,Math.min(1,(distance-2)/6)),target=1-t*t*(3-2*t);
  gain=wasVR?gain+(target-gain)*(1-Math.exp(-Math.max(0,Math.min(.1,dt))/.22)):target;wasVR=true;if(target===0&&gain<.002)gain=0;apply();
  const result=original.update.call(this,camera,feet,enabled,vr,dt);
  if(this.active){
   if(target>0){original.resume.call(speech,'distance');original.resume.call(speech,reason);}
   else if(gain===0&&!speech.pauseReasons90?.has(reason))original.pause.call(speech,reason);
  }
  apply();this.controls.visible=false;this.tools.hidden=true;return result;
 };
 story.select=function(ray){if(!game.vr?.active)return original.select.call(this,ray);if(this.rayDistance(ray)===null)return false;return this.interact();};
 const end=game.vr.onEnd;game.vr.onEnd=function(...args){restore();original.pause.call(speech,'environment');return end?.apply(this,args);};
 story.dispose=function(){restore();speech.pause=original.pause;speech.start=original.start;game.vr.onEnd=end;return original.dispose.call(this);};
 return story;
}
