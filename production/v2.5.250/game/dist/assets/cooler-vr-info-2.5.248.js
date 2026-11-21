import {sampleEnergy100} from './cooler-energy-2.5.141.js';
import {coolerBounds141} from './cooler-vr-view-2.5.247.js';
// One static, small texture, created only on the first deliberate VR selection.
export function createCoolerInfo248(game,T){
 let panel=null,texture=null,material=null,canvas=null,reference=null,last='',disposed=false;
 const hit=new T.Vector3;
 function build(){if(panel)return;canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;material=new T.MeshBasicMaterial({map:texture,depthWrite:false,depthTest:false,toneMapped:false,side:T.DoubleSide});panel=new T.Mesh(new T.PlaneGeometry(1.2,.75),material);panel.name='vr-cooler-comparison-info248';panel.renderOrder=3300;panel.visible=false;game.scene.add(panel);}
 function paint(){
  const config=game.coolerStory93?.energy?.config??{},key=JSON.stringify(config);if(key===last)return;last=key;
  const standard=sampleEnergy100('standard',null,0,config),bldc=sampleEnergy100('bldc',null,0,config),number=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}),c=canvas.getContext('2d');
  c.fillStyle='#143742';c.fillRect(0,0,512,320);c.direction='rtl';c.textBaseline='middle';c.textAlign='center';c.fillStyle='#effff8';c.font='bold 25px Vazirmatn,Tahoma';c.fillText('مقایسهٔ مصرف کولرها',256,32,480);
  c.font='bold 20px Vazirmatn,Tahoma';c.fillText('القایی',204,79);c.fillStyle='#79e4b8';c.fillText('BLDC',70,79);
  const row=(title,a,b,y)=>{c.textAlign='right';c.fillStyle='#c7e0e5';c.font='17px Vazirmatn,Tahoma';c.fillText(title,488,y,205);c.textAlign='center';c.font='bold 21px Vazirmatn,Tahoma';c.fillStyle='#effff8';c.fillText(number.format(a),204,y,115);c.fillStyle='#79e4b8';c.fillText(number.format(b),70,y,115);};
  row('توان (وات)',standard.watts,bldc.watts,128);row('جریان تخمینی (آمپر)',standard.amps,bldc.amps,178);row('صرفه‌جویی (kWh)',0,bldc.savingKWh,228);c.font='14px Vazirmatn,Tahoma';c.fillStyle='#a8cbd0';c.fillText('اطلاعات نمونه · برای بستن، این کادر را انتخاب کنید',256,288,480);texture.needsUpdate=true;
 }
 const api={
  get visible(){return !!panel?.visible;},get mesh(){return panel;},
  show(unit){if(disposed||!game.vr?.active)return;build();reference=unit;paint();const camera=game.vr.view;panel.position.copy(camera.position).add(new T.Vector3(.85,-.05,-1.8).applyQuaternion(camera.quaternion));panel.quaternion.copy(camera.quaternion);panel.updateMatrixWorld(true);panel.visible=true;},
  hide(){if(panel)panel.visible=false;reference=null;},
  update(enabled,immersive){if(!api.visible)return;if(!enabled||!immersive||!game.vr.active||!reference?.group.visible||reference.model.userData.editorDeleted){api.hide();return;}const point=reference.model.getWorldPosition(hit);if(game.vr.feet.distanceTo(point)>6)api.hide();},
  pick(ray){if(!api.visible)return null;const h=ray.intersectObject(panel)[0];return h&&h.distance>=ray.near&&h.distance<=Math.min(5,ray.far)?h.distance:null;},
  unit(ray){let best=null;for(const unit of game.city.coolers){if(!unit.group.visible||!unit.model.visible||unit.model.userData.editorDeleted)continue;const p=ray.ray.intersectBox(coolerBounds141(unit,T),hit),d=p?p.distanceTo(ray.ray.origin):Infinity;if(d>=ray.near&&d<=Math.min(4.6,ray.far)&&(!best||d<best.d))best={unit,d};}return best?.unit??null;},
  dispose(){if(disposed)return;disposed=true;api.hide();panel?.geometry.dispose();material?.dispose();texture?.dispose();panel?.removeFromParent();}
 };return api;
}
