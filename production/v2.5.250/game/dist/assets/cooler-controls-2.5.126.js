export function installCoolerControls94(game,T){
 const panel=game.coolerPanel,oldUpdate=panel.update,oldSelect=panel.select,oldDispose=panel.dispose;
 const button=document.createElement('button');button.type='button';button.className='cooler-use94';button.dir='rtl';button.hidden=true;
 panel.element.id='cooler-controls94';button.setAttribute('aria-controls',panel.element.id);
 const close=document.createElement('button');close.type='button';close.className='cooler-close94';close.textContent='بستن کنترل کولر ×';close.setAttribute('aria-label','بستن کنترل کولر');panel.element.prepend(close);
 const style=document.createElement('style');style.textContent=`.cooler-use94{position:absolute;left:50%;transform:translateX(-50%);bottom:112px;z-index:39;min-height:44px;max-width:calc(100vw - 30px);padding:10px 17px;border:1px solid #94c5bd;border-radius:14px;background:#edf9f7;color:#123f48;font:700 13px Vazirmatn,sans-serif;cursor:pointer;pointer-events:auto;box-shadow:0 3px 12px #142e4128}.cooler-use94[hidden]{display:none!important}.cooler-close94{min-height:38px;font:600 12px Vazirmatn,sans-serif!important;margin:0 0 10px!important}.cooler-use94:focus-visible{outline:3px solid #ffbc63;outline-offset:3px}@media(max-width:650px){.cooler-use94{bottom:205px;white-space:nowrap}}`;
 document.head.append(style);game.renderer.canvas.parentElement.append(button);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
 const mesh=new T.Mesh(new T.PlaneGeometry(1.9,1.9*576/1024),material);mesh.name='cooler-use-and-controls94';mesh.visible=false;game.scene.add(mesh);
 const position=new T.Vector3,box=new T.Box3,hit=new T.Vector3,expertTalk=game.coolerStory93?.tools?.querySelector('[data-cooler-talk]');let selected=null,candidate=null,enabled=false,xr=false,disposed=false,lastSignature='',lastRefresh=-Infinity,buttons=[],placeXR126=true;
 const title=u=>u?.variant==='bldc'?'کولر BLDC':'کولر القایی';
 function available(u){return !!u&&u.group.visible&&u.model.visible&&!u.model.userData.editorDeleted&&!u.group.parent?.userData.editorDeleted;}
 function distance(u,feet){u.model.getWorldPosition(position);const roofY=position.y-.85;return Math.abs(feet.y-roofY)<=2.2?Math.hypot(feet.x-position.x,feet.z-position.z):Infinity;}
 function nearest(feet){
  if(selected&&available(selected)&&distance(selected,feet)<=(xr?5:2.6))return selected;
  return game.city.coolers.filter(available).map(u=>({u,d:distance(u,feet)})).filter(o=>o.d<=(xr?4.6:2.1)).sort((a,b)=>a.d-b.d)[0]?.u??null;
 }
 function closePanel(){const focusInside=panel.element.contains(document.activeElement);selected=null;panel.opened94=null;oldUpdate.call(panel,false);lastSignature='';if(focusInside)game.renderer.canvas.focus({preventScroll:true});}
 function use(){if(!enabled||!candidate)return false;if(selected===candidate){closePanel();return true;}selected=candidate;panel.opened94=selected;oldSelect.call(panel,selected);panel.element.classList.remove('expanded');const more=panel.element.querySelector('.cooler-more');more.setAttribute('aria-expanded','false');more.textContent='تنظیمات بیشتر';oldUpdate.call(panel,!xr&&!game.settings.hideHud);lastSignature='';placeXR126=true;game.paused&&game.resume?.();return true;}
 button.onclick=use;close.onclick=closePanel;
 panel.update=function(show){return oldUpdate.call(this,!!show&&!!selected&&enabled&&!xr);};
 panel.select=function(unit){if(!selected||selected===unit)return oldSelect.call(this,unit);};
 const actions={power(){selected.togglePower();},low(){selected.setSpeed(.65);},high(){selected.setSpeed(1);},slower(){selected.setSpeed(Math.max(.35,selected.state.setting-.05));},faster(){selected.setSpeed(Math.min(1,selected.state.setting+.05));},sound(){selected.audio.muted=!selected.audio.muted;},quieter(){selected.audio.volume=Math.max(0,selected.audio.volume-.1);},louder(){selected.audio.volume=Math.min(1,selected.audio.volume+.1);},close:closePanel,use};
 function rect(c,x,y,w,h,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,16);c.fill();}
 function draw(){
  const unit=selected??candidate;if(!unit)return;
  const signature=unit.variant+'/'+!!selected+'/'+unit.state.powered+'/'+Math.round(unit.state.setting*100)+'/'+unit.audio.muted+'/'+Math.round(unit.audio.volume*100);
  if(signature===lastSignature)return;lastSignature=signature;const c=canvas.getContext('2d');c.clearRect(0,0,1024,576);buttons=[];
  const add=(text,action,x,y,w,h=84)=>{rect(c,x,y,w,h,'#e4f2f1');c.fillStyle='#173e4b';c.font='700 31px Vazirmatn,sans-serif';c.fillText(text,x+w/2,y+h/2,w-16);buttons.push({x,y,w,h,action});};
  c.direction='rtl';c.textAlign='center';c.textBaseline='middle';rect(c,4,4,1016,568,'#f5fbfd');c.fillStyle='#143d50';c.font='800 44px Vazirmatn,sans-serif';c.fillText(title(unit),512,59);
  if(!selected){c.font='500 32px Vazirmatn,sans-serif';c.fillStyle='#52717f';c.fillText('برای باز کردن کنترل، دکمه را انتخاب کنید.',512,162);add('استفاده از کولر','use',60,240,904,210);}
  else{
   add(unit.state.powered?'خاموش کردن':'روشن کردن','power',40,110,574);add('بستن ×','close',640,110,344);
   add('دور کم','low',40,212,295);add('دور زیاد','high',364,212,295);add('دور: '+new Intl.NumberFormat('fa-IR').format(Math.round(unit.state.setting*100))+'٪',unit.state.setting>=.95?'slower':'faster',688,212,296);
   add('کاهش دور −','slower',40,314,295);add('افزایش دور +','faster',364,314,295);add(unit.audio.muted?'پخش صدای کولر':'قطع صدای کولر','sound',688,314,296);
   add('صدا −','quieter',40,416,295);add('صدا +','louder',364,416,295);c.fillStyle='#426777';c.font='600 30px Vazirmatn,sans-serif';c.fillText('صدا: '+new Intl.NumberFormat('fa-IR').format(Math.round(unit.audio.volume*100))+'٪',836,458,284);
  }
  texture.needsUpdate=true;
 }
 function pickUnit126(ray){if(!enabled||!xr)return null;let best=null;for(const unit of game.city.coolers){if(!available(unit))continue;box.setFromObject(unit.model);const p=ray.ray.intersectBox(box,hit),d=p?p.distanceTo(ray.ray.origin):Infinity;if(d>=ray.near&&d<=Math.min(4.6,ray.far)&&(!game.vrLineOfSight||game.vrLineOfSight(ray,d))&&(!best||d<best.distance))best={unit,distance:d};}return best;}
 function openUnit126(unit){if(!enabled||!xr||!available(unit))return false;if(selected===unit)return true;closePanel();candidate=unit;return use();}
 const api={button,mesh,canvas,get opened(){return selected},get near(){return enabled&&!!candidate},nearest,use,close:closePanel,
  update(camera,feet,allowed,vr){
   if(disposed)return;enabled=allowed;xr=vr;candidate=nearest(feet);
   // Losing range, changing world or entering the editor closes the panel. Range
   // alone never opens it, and approaching the other unit cannot transfer it.
   if(selected&&(!allowed||!available(selected)||distance(selected,feet)>(vr?5:2.6))){closePanel();candidate=nearest(feet);}
   button.hidden=!allowed||vr||!candidate||game.settings.hideHud;
   button.textContent=selected?'بستن کنترل '+title(selected)+' · E':'استفاده از '+title(candidate)+' · E';button.setAttribute('aria-expanded',String(!!selected));
   if(expertTalk){const label=allowed&&candidate?'صحبت با کارشناس کولر':'صحبت با کارشناس کولر · E';if(expertTalk.textContent!==label)expertTalk.textContent=label;}
   const now=performance.now(),show=allowed&&!game.settings.hideHud&&!!selected&&!vr;
   if(panel.element.hidden===show||show&&now-lastRefresh>=200){panel.update(show);lastRefresh=now;}mesh.visible=allowed&&vr&&!!selected;
   if(mesh.visible){const u=selected??candidate;u.model.getWorldPosition(position);if(placeXR126){mesh.position.copy(camera.position).add(new T.Vector3(0,-.16,-1.65).applyQuaternion(camera.quaternion));mesh.quaternion.copy(camera.quaternion);placeXR126=false;}mesh.updateMatrixWorld(true);draw();}
  },
  rayDistance(ray){if(!xr)return null;if(!enabled)return null;const p=mesh.visible?ray.intersectObject(mesh)[0]:null;if(p?.distance<=5)return p.distance;return pickUnit126(ray)?.distance??null;},
  select(ray){if(!xr)return false;const h=mesh.visible?ray.intersectObject(mesh)[0]:null;if(h?.uv&&h.distance<=5&&selected){const x=h.uv.x*1024,y=(1-h.uv.y)*576,b=buttons.find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(b){actions[b.action]?.();lastSignature='';if(selected)draw();}return true;}const picked=pickUnit126(ray);return picked?openUnit126(picked.unit):false;},
  openUnit126,
  dispose(){if(disposed)return;disposed=true;closePanel();button.remove();close.remove();style.remove();mesh.geometry.dispose();material.dispose();texture.dispose();mesh.removeFromParent();panel.update=oldUpdate;panel.select=oldSelect;panel.dispose=oldDispose;}
 };
 panel.dispose=function(){api.dispose();oldDispose.call(this);};game.coolerUse94=api;return api;
}
