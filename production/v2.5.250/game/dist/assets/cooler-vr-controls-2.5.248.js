import {installCoolerControls94 as installPrevious247} from './cooler-vr-controls-2.5.247.js';
import {createCoolerInfo248} from './cooler-vr-info-2.5.248.js';
export function installCoolerControls94(game,T){
 const api=installPrevious247(game,T),info=createCoolerInfo248(game,T),previous={update:api.update,select:api.select,rayDistance:api.rayDistance,use:api.use,open:api.openUnit126,dispose:api.dispose};let immersive=false,allowed=false;
 api.comparisonInfo248=info;
 api.update=function(camera,feet,enabled,vr){immersive=!!vr;allowed=!!enabled;const result=previous.update.call(this,camera,feet,enabled,vr);info.update(enabled,vr);return result;};
 api.rayDistance=function(ray){if(immersive&&allowed){const d=info.pick(ray);if(d!==null)return d;}return previous.rayDistance.call(this,ray);};
 api.select=function(ray){if(immersive&&allowed&&info.pick(ray)!==null){info.hide();return true;}const unit=immersive?info.unit(ray):null,result=previous.select.call(this,ray);if(result&&immersive&&unit)info.show(unit);return result;};
 api.use=function(){const result=previous.use.call(this);if(result&&immersive)info.show(api.nearest(game.vr.feet));return result;};
 api.openUnit126=function(unit){const result=previous.open.call(this,unit);if(result&&immersive)info.show(unit);return result;};
 const end=game.vr.onEnd;game.vr.onEnd=function(...args){info.hide();return end?.apply(this,args);};
 api.dispose=function(){info.dispose();game.vr.onEnd=end;return previous.dispose.call(this);};return api;
}
