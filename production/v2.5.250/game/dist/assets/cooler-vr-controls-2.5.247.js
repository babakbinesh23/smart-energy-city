import {installCoolerControls94 as installPrevious126} from './cooler-controls-2.5.126.js';
import {coolerBounds141} from './cooler-vr-view-2.5.247.js';
// The previous HTML controls and all web/mobile behavior remain delegated.
// Immersive users point at the physical cabinet and toggle its motor directly.
export function installCoolerControls94(game,T){
 const api=installPrevious126(game,T),previous={update:api.update,select:api.select,rayDistance:api.rayDistance,use:api.use,open:api.openUnit126,dispose:api.dispose};
 const timers=new Map(),hit=new T.Vector3;let xr=false,allowed=false,disposed=false;
 const available=unit=>!!unit&&unit.group.visible&&unit.model.visible&&!unit.model.userData.editorDeleted&&!unit.group.parent?.userData.editorDeleted;
 function clear(unit){const entry=timers.get(unit);if(entry)clearTimeout(entry.timer);timers.delete(unit);}
 function off(unit){
  clear(unit);
  // A narrated demonstration temporarily owns power. Expire its saved manual
  // state, so finishing the explanation cannot restore an unattended motor.
  const saved=game.coolerStory93?.demo?.saved?.find(s=>s.u===unit);
  if(saved){saved.state.powered=false;return;}
  unit.state.setPowered(false);
 }
 function expire(){const now=Date.now();for(const[unit,entry]of timers)if(now>=entry.until)off(unit);}
 function stopManual(){for(const unit of [...timers.keys()])off(unit);}
 function toggle(unit){
  if(disposed||!xr||!game.vr.active||!allowed||!available(unit))return false;
  if(unit.state.powered){clear(unit);unit.togglePower();return true;}
  unit.togglePower();if(!unit.state.powered)return false;
  clear(unit);const until=Date.now()+60000,timer=setTimeout(()=>off(unit),60000);timers.set(unit,{until,timer});return true;
 }
 function pick(ray){
  if(disposed||!xr||!game.vr.active||!allowed)return null;
  let best=null;for(const unit of game.city.coolers){if(!available(unit))continue;
   const box=coolerBounds141(unit,T),point=ray.ray.intersectBox(box,hit),distance=point?point.distanceTo(ray.ray.origin):Infinity;
   if(distance>=ray.near&&distance<=Math.min(4.6,ray.far)&&(!game.vrLineOfSight||game.vrLineOfSight(ray,distance))&&(!best||distance<best.distance))best={unit,distance};
  }return best;
 }
 api.update=function(camera,feet,enabled,immersive){
  expire();if(xr!==!!immersive){if(immersive)api.close();else stopManual();}xr=!!immersive;allowed=!!enabled;
  const result=previous.update.call(this,camera,feet,enabled,immersive);
  if(immersive){api.mesh.visible=false;api.button.hidden=true;game.coolerPanel.element.hidden=true;}
  return result;
 };
 api.rayDistance=function(ray){return xr?pick(ray)?.distance??null:previous.rayDistance.call(this,ray);};
 api.select=function(ray){if(!xr)return previous.select.call(this,ray);const found=pick(ray);return found?toggle(found.unit):false;};
 api.use=function(){return xr?toggle(api.nearest(game.vr.feet)):previous.use.call(this);};
 api.openUnit126=function(unit){return xr?toggle(unit):previous.open.call(this,unit);};
 const end=game.vr.onEnd;game.vr.onEnd=function(...args){stopManual();return end?.apply(this,args);};
 const visibility=()=>expire();document.addEventListener('visibilitychange',visibility);
 api.dispose=function(){if(disposed)return;disposed=true;stopManual();game.vr.onEnd=end;document.removeEventListener('visibilitychange',visibility);return previous.dispose.call(this);};
 return api;
}
