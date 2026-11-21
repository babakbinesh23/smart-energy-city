import {commitVRArrival186} from './vr-arrival-2.5.186.js';
import {drawXRSettings140,settingsHit140} from './vr-settings-2.5.187.js';
import {projectCity116} from './graphic-map-2.5.127-media223.js';
import {mapHover127,paintMapHover127} from './map-hover-2.5.127.js';
/* VR has one expanded city map, opened with B; it never follows the head. */
export function installVRMap113(game,T,{features,draw,hitMap,safeSpawn,beforeTeleport}){
 const sheet=document.createElement('canvas');sheet.width=sheet.height=1024;
 const map=document.createElement('canvas');map.width=1536;map.height=1024;
 const make=(canvas,width)=>{const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;const mesh=new T.Mesh(new T.PlaneGeometry(width,width),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:false,toneMapped:false}));mesh.renderOrder=11000;mesh.visible=false;game.scene.add(mesh);return mesh;};
 const panel=make(sheet,1.45);panel.name='city-vr-destinations113';let opened=false,clock=0,message='',hover=null,settings140=false;const lastTarget=game.vrTarget,rows=[];
 function paint(){if(settings140){drawXRSettings140(sheet.getContext('2d'),game.vrQuality140,hover?.id);panel.material.map.needsUpdate=true;return;}draw(map,true);const c=sheet.getContext('2d');c.clearRect(0,0,1024,1024);c.fillStyle='#102d37';c.beginPath();c.roundRect(2,2,1020,1020,32);c.fill();c.strokeStyle='#8ad4c2';c.lineWidth=5;c.stroke();c.direction='rtl';c.textAlign='right';c.fillStyle='#effff8';c.font='bold 38px Tahoma';c.fillText('نقشهٔ شهر برقتو',910,62);c.font='42px Tahoma';c.fillText('×',988,62);c.fillStyle=hover?.id==='settings140'?'#507348':'#28565d';c.fillRect(32,20,250,64);c.fillStyle='#effff8';c.font='bold 28px Tahoma';c.textAlign='center';c.fillText('تنظیمات',157,64);c.textAlign='right';c.drawImage(map,40,96,944,944*map.height/map.width);rows.length=0;
  features().forEach((feature,i)=>{const x=i%2?32:520,y=770+Math.floor(i/2)*74;c.fillStyle=hover?.id===feature.id?'#507348':'#20454c';c.beginPath();c.roundRect(x,y,472,64,14);c.fill();c.strokeStyle=feature.accent||'#8ad4c2';c.lineWidth=2;c.stroke();c.fillStyle='#effff8';c.font='bold 27px Tahoma';c.fillText(feature.title,x+452,y+41,434);rows.push({x,y,w:472,h:64,id:feature.id});});paintMapHover127(c,hover,map);if(hover?.id&&hover.id!=='close'&&hover.id!=='settings140'){c.fillStyle='#ffe36b';c.font='bold 24px Tahoma';c.fillText('انتخاب: '+(features().find(f=>f.id===hover.id)?.title||''),978,748,932);}if(message){c.fillStyle='#ffcf9c';c.font='23px Tahoma';c.fillText(message,978,1020,932);}panel.material.map.needsUpdate=true;
 }
 function close(){if(!opened)return;opened=false;settings140=false;panel.visible=false;message='';hover=null;for(const story of [game.coolerStory93,game.solarExpertStory107,game.greenAggregationStory108])story?.speech?.resume('vr-map125');}
 function open(){if(!game.vr.active||game.officeSession.active)return;game.vr.panel.visible=false;for(const story of [game.coolerStory93,game.solarExpertStory107,game.greenAggregationStory108])story?.speech?.pause('vr-map125');const view=game.vr.view;opened=true;panel.visible=true;panel.position.copy(view.position).add(new T.Vector3(0,-.05,-1.65).applyQuaternion(view.quaternion));panel.quaternion.copy(view.quaternion);panel.updateMatrixWorld(true);paint();}
 function select(hit){const x=hit.uv.x*1024,y=(1-hit.uv.y)*1024;if(settings140){const id=settingsHit140(x,y,game.vrQuality140);if(id==='back')settings140=false;else if(id)game.vrQuality140?.change(id);hover=null;paint();return true;}if(x>=32&&x<=282&&y>=20&&y<=84){settings140=true;hover=null;paint();return true;}if(x>910&&y<90){close();return true;}const id=x>=40&&x<=984&&y>=96&&y<=96+944*map.height/map.width?hitMap?.(map,(x-40)*map.width/944,(y-96)*map.width/944):null;const row=id?{id}:rows.find(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);if(!row){const point=mapPointToWorld125((x-40)*map.width/944,(y-96)*map.width/944);if(point)teleportPoint(point);return true;}
  if(row)return teleport(row.id);return true;
 }

 function arrivalFailed186(error){console.warn('VR arrival',error);if(!opened)open();message='انتقال انجام نشد؛ مقصد دیگری انتخاب کن.';paint();}
 function teleport(id){
  const vr=game.vr;if(!vr.active||vr.pending||vr.fade>0)return false;
  try{const feature=game.city.features.get(id);if(!feature?.areas.length)return false;const selection={feature,area:feature.areas[0],point:new T.Vector3},spawn=vr.resolveDestination126?.(selection)??safeSpawn(selection);game.vrTours125?.cancel(false);beforeTeleport(id);if(vr.introducing)vr.onIntroSelection();vr.queue(()=>{commitVRArrival186(vr,game,spawn.feet,spawn.heading-Math.PI,close,arrivalFailed186);});return true;}
  catch(error){console.warn('VR map destination',error);message='این مقصد در دسترس نیست؛ مقصد دیگری را انتخاب کن.';paint();return false;}
 }
 function teleportPoint(point){
  const vr=game.vr;if(!vr.active||vr.pending||vr.fade>0)return false;const feet=vr.mapPoint125?.(point);if(!feet){message='این نقطه جای ایستادن امن ندارد.';paint();return false;}
  game.vrTours125?.cancel(false);beforeTeleport('');if(vr.introducing)vr.onIntroSelection();const yaw=vr.rig.rotation.y;vr.queue(()=>{commitVRArrival186(vr,game,feet,yaw,close,arrivalFailed186);});return true;
 }
 function hoverAt140(x,y){if(settings140){const id=settingsHit140(x,y,game.vrQuality140);return id?{id,x,y}:null;}if(x>=32&&x<=282&&y>=20&&y<=84)return{id:'settings140',x,y};return mapHover127({x,y},rows,map,hitMap);}
 const target=function(ray){const mesh=panel.visible?panel:null;if(mesh){const hit=ray.intersectObject(mesh)[0];const primary=ray.handedness127!=='left'||!game.vr.hands.some(h=>h.source?.handedness==='right'&&h.group.visible);if(primary){const next=hit&&hit.distance<=4?hoverAt140(hit.uv.x*1024,(1-hit.uv.y)*1024):null;if(next?.id!==hover?.id||Math.hypot((next?.x||0)-(hover?.x||0),(next?.y||0)-(hover?.y||0))>3){hover=next;paint();}}if(hit&&hit.distance<=4)return{distance:hit.distance,select:()=>select(hit)};if(opened)return null;}return lastTarget?.call(this,ray)??null;};game.vrTarget=target;
 const previousToggle=game.vr.toggleMap125;game.vr.toggleMap125=()=>opened?close():open();Object.defineProperty(game.vr,'mapOpen125',{configurable:true,get:()=>opened});
 return {panel,open,close,teleport,teleportPoint,toggle:game.vr.toggleMap125,get opened(){return opened;},update(){const vr=game.vr,allowed=vr.active&&vr.visible!==false&&!vr.insideOffice&&!vr.menuOpen&&!game.officeSession.active&&!game.city.solarBess?.isOpen;if(!allowed){close();return;}panel.visible=opened;if(opened&&performance.now()-clock>200){clock=performance.now();paint();}},dispose(){close();game.vr.toggleMap125=previousToggle;delete game.vr.mapOpen125;if(game.vrTarget===target)game.vrTarget=lastTarget;for(const mesh of [panel]){mesh.removeFromParent();mesh.material.map.dispose();mesh.material.dispose();mesh.geometry.dispose();}}};
}

// Invert the existing calibrated perspective grid, including road areas between
// the six named districts. Sky, outside-map pixels and unsafe surfaces reject.
export function mapPointToWorld125(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 const xs=[-235,-140,0,140,160],zs=[-230,-135,0,12];
 for(let row=0;row<zs.length-1;row++)for(let col=0;col<xs.length-1;col++){
  const x0=xs[col],x1=xs[col+1],z0=zs[row],z1=zs[row+1],a=projectCity116(x0,z0),b=projectCity116(x1,z0),c=projectCity116(x0,z1),d=projectCity116(x1,z1);let u=.5,v=.5;
  for(let i=0;i<12;i++){
   const px=a.x*(1-u)*(1-v)+b.x*u*(1-v)+c.x*(1-u)*v+d.x*u*v,py=a.y*(1-u)*(1-v)+b.y*u*(1-v)+c.y*(1-u)*v+d.y*u*v;
   const ux=(b.x-a.x)*(1-v)+(d.x-c.x)*v,uy=(b.y-a.y)*(1-v)+(d.y-c.y)*v,vx=(c.x-a.x)*(1-u)+(d.x-b.x)*u,vy=(c.y-a.y)*(1-u)+(d.y-b.y)*u,det=ux*vy-uy*vx;if(Math.abs(det)<1e-8)break;
   const ex=px-x,ey=py-y;u-=(ex*vy-ey*vx)/det;v-=(ey*ux-ex*uy)/det;
  }
  if(u>=-1e-5&&u<=1.00001&&v>=-1e-5&&v<=1.00001)return{x:x0+(x1-x0)*Math.max(0,Math.min(1,u)),z:z0+(z1-z0)*Math.max(0,Math.min(1,v))};
 }return null;
}
