import {createCoolerEnergy100} from './cooler-energy-2.5.141.js';
import {coolerBounds141} from './cooler-vr-view-2.5.247.js';
// Reuse the original per-cooler cards, anchored above their real rigid tops.
// This independent VR instance cannot block the old web/control visibility gates.
export function createCoolerInfo248(game,T){
 let energy=null,reference=null,requested=false,disposed=false;const hit=new T.Vector3,top=new T.Vector3;
 function build(){if(energy)return;energy=createCoolerEnergy100(game,T);energy.configure(game.coolerStory93?.energy?.config??{});for(const card of energy.cards){card.canvas.width=512;card.canvas.height=250;card.canvas.getContext('2d').scale(.5,.5);}}
 function draw(){if(!energy)return;for(const card of energy.cards){const bounds=coolerBounds141(card.unit,T);bounds.getCenter(top);top.y=bounds.max.y;card.localTop.copy(card.unit.model.worldToLocal(top));}energy.update({camera:game.vr.view,vr:true,enabled:true,topic:'cooler',shot:'pair',playing:false,dt:0});}
 const api={
  get visible(){return requested&&!!energy?.visible;},get mesh(){return null;},get cards(){return energy?.cards??[];},
  show(unit){if(disposed||!game.vr?.active)return;build();reference=unit;requested=true;draw();},
  hide(){requested=false;reference=null;energy?.hide();},
  update(enabled,immersive){if(!requested)return;if(!enabled||!immersive||!game.vr.active||!reference?.group.visible||reference.model.userData.editorDeleted||game.vr.feet.distanceTo(reference.model.getWorldPosition(hit))>6){api.hide();return;}draw();},
  pick(ray){if(!api.visible)return null;let best=null;for(const card of energy.cards){if(!card.mesh.visible)continue;const h=ray.intersectObject(card.mesh)[0];if(h&&h.distance>=ray.near&&h.distance<=Math.min(5,ray.far)&&(best===null||h.distance<best))best=h.distance;}return best;},
  unit(ray){let best=null;for(const unit of game.city.coolers){if(!unit.group.visible||!unit.model.visible||unit.model.userData.editorDeleted)continue;const p=ray.ray.intersectBox(coolerBounds141(unit,T),hit),d=p?p.distanceTo(ray.ray.origin):Infinity;if(d>=ray.near&&d<=Math.min(4.6,ray.far)&&(!best||d<best.d))best={unit,d};}return best?.unit??null;},
  dispose(){if(disposed)return;disposed=true;api.hide();energy?.dispose();}
 };return api;
}
