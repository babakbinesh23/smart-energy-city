import {installCoolerStory96 as installPrevious167} from './cooler-story-2.5.167-media223.js';
// VR uses the existing savings voice only. The web/mobile scenario is delegated
// unchanged; no VR comparison playback, motor demonstration or camera tour runs.
export function installCoolerStory96(game,T,Speech){
 const story=installPrevious167(game,T,Speech);if(!story)return story;
 const previous={update:story.update,choose:story.choose,start:story.start,openMenu:story.openMenu,interact:story.interact,select:story.select};let wasVR=false;
 function talk(){
  if(!story.near)return false;
  if(story.active&&['playing','paused','loading'].includes(story.speech.state)){
   story.speech.pauseReasons90?.has('manual93')?story.speech.resume('manual93'):story.speech.pause('manual93');return true;
  }
  return previous.choose.call(story,'saving');
 }
 story.choose=function(id,...args){return previous.choose.call(this,game.vr?.active?'saving':id,...args);};
 story.start=function(...args){return game.vr?.active?talk():previous.start.apply(this,args);};
 story.openMenu=function(...args){return game.vr?.active?talk():previous.openMenu.apply(this,args);};
 story.interact=function(...args){return game.vr?.active?talk():previous.interact.apply(this,args);};
 story.select=function(...args){return game.vr?.active?talk():previous.select.apply(this,args);};
 story.update=function(camera,feet,enabled,immersive,dt){
  // A web comparison cannot continue driving the scene after entering VR.
  if(immersive&&!wasVR&&this.topic==='cooler')this.end(true);wasVR=!!immersive;
  const result=previous.update.call(this,camera,feet,enabled,immersive,dt);
  if(immersive){this.controls.visible=false;this.tools.hidden=true;this.root.hidden=true;this.energy.hide();}
  return result;
 };
 return story;
}
