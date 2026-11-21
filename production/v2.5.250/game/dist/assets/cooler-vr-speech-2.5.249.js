import {installCoolerStory96 as installPrevious167} from './cooler-story-2.5.167-media223.js';
// Both original voices remain selectable. Only the visual demonstration is
// disabled in VR; web/mobile continue using the original implementation.
export function installCoolerStory96(game,T,Speech){
 const story=installPrevious167(game,T,Speech);if(!story)return story;
 const previous={update:story.update,dispose:story.dispose,energy:story.energy.update},demo=new Map(),camera=new Map();let wasVR=false;
 for(const name of ['begin','unlock','update','hold']){const fn=story.demo[name];demo.set(name,fn);story.demo[name]=function(...args){if(game.vr?.active)return;return fn.apply(this,args);};}
 for(const name of ['update','hold']){const fn=story.cameraGuide[name];camera.set(name,fn);story.cameraGuide[name]=function(...args){if(game.vr?.active)return;return fn.apply(this,args);};}
 story.energy.update=function(options){if(options?.vr){this.hide();return;}return previous.energy.call(this,options);};
 const label=game.city.coolerExpert87.group.getObjectByName('bargheto-expert-name'),labelVisible=label?.visible;
 const restoreLabel=()=>{if(label)label.visible=labelVisible;};
 story.update=function(view,feet,enabled,immersive,dt){
  if(immersive&&!wasVR&&this.demo.active)this.demo.restore();
  if(immersive){if(label)label.visible=false;}else if(wasVR)restoreLabel();wasVR=!!immersive;
  const result=previous.update.call(this,view,feet,enabled,immersive,dt);
  if(immersive){this.controls.visible=false;this.tools.hidden=true;this.root.hidden=true;}
  return result;
 };
 const end=game.vr.onEnd;game.vr.onEnd=function(...args){restoreLabel();return end?.apply(this,args);};
 story.dispose=function(){restoreLabel();game.vr.onEnd=end;for(const[name,fn]of demo)this.demo[name]=fn;for(const[name,fn]of camera)this.cameraGuide[name]=fn;this.energy.update=previous.energy;return previous.dispose.call(this);};
 return story;
}
