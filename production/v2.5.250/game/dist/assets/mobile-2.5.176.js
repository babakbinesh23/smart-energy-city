import {coolerShot95} from './cooler-camera-2.5.95-r110.js';

// Mobile owns its framing; the existing desktop/immersive camera is untouched.
export function installMobile121(game,T){
 const host=game.renderer.canvas.parentElement,story=game.coolerStory93;
 if(!host||!story)return;
 const coarse=matchMedia('(pointer: coarse)');
 const isMobile=()=>navigator.maxTouchPoints>0&&coarse.matches&&!/OculusBrowser|Quest/i.test(navigator.userAgent)&&!game.vr.active;
 const style=document.createElement('style');
 style.textContent=`
 [data-city-mobile121] .city-control-stack{left:max(8px,env(safe-area-inset-left));top:max(8px,env(safe-area-inset-top));gap:4px;max-width:calc(100% - 16px)}
 [data-city-mobile121] .city-small-title{font-size:10px;padding:3px 7px}
 [data-city-mobile121] .performance-hud{font-size:10px;padding:4px 7px}
 [data-city-mobile121] .performance-hud span{font-size:8px;margin-top:2px}
 [data-city-mobile121] .city-quick-actions button{width:36px;height:36px}
 [data-city-mobile121] .social-notice{max-width:210px;font-size:10px;line-height:1.65;overflow-wrap:anywhere}
 [data-city-mobile121] .social-notice[data-mobile-quiet121=true]{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%);padding:0!important;margin:0!important}
 [data-city-mobile121] .city-minimap113{width:102px;height:102px;right:max(100px,calc(env(safe-area-inset-right) + 90px));bottom:max(26px,env(safe-area-inset-bottom));border-width:0}
 [data-city-mobile121] .city-minimap113 span{font-size:9px}
 [data-city-mobile121][data-mobile-camera121=true] .city-minimap113{display:none!important}
 [data-city-mobile121] .cooler-talk96{box-sizing:border-box;right:max(10px,env(safe-area-inset-right));left:max(10px,env(safe-area-inset-left));bottom:max(168px,calc(env(safe-area-inset-bottom) + 156px));width:auto;max-width:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-items:stretch}
 [data-city-mobile121] .cooler-talk96>button,[data-city-mobile121] .cooler-talk96 .expert-rate93{box-sizing:border-box;min-width:0;min-height:44px;max-width:100%;padding:5px 7px;font-size:11px;line-height:1.5;white-space:normal;overflow-wrap:anywhere;touch-action:manipulation}
 [data-city-mobile121] .cooler-talk96:not([data-live121=true]){left:auto;display:flex;max-width:calc(100% - 150px)}
 [data-city-mobile121] .cooler-talk96 .expert-rate-button93{width:100%;justify-content:center;min-height:44px}
 [data-city-mobile121] .cooler-talk96 .expert-rate-menu93{right:50%;transform:translateX(50%);padding:6px;gap:4px}
 [data-city-mobile121] .cooler-talk96 [data-expert-topics96]{font-size:0}
 [data-city-mobile121] .cooler-talk96 [data-expert-topics96]::after{content:'صحبت با کارشناس';font-size:11px}
 [data-city-mobile121] .cooler-talk96[data-live121=true] [data-expert-topics96]::after{content:'انتخاب موضوع'}
 [data-city-mobile121] .cooler-talk96 [data-cooler-pause]{order:1}
 [data-city-mobile121] .cooler-talk96 .expert-rate93{order:2;justify-content:center}
 [data-city-mobile121] .cooler-talk96 [data-cooler-stop]{order:3}
 [data-city-mobile121] .cooler-talk96 [data-expert-topics96]{order:4}
 [data-city-mobile121] .cooler-talk96 [data-cooler-camera]{order:5}
 [data-city-mobile121] .cooler-talk96 [data-cooler-restart]{order:6}
 [data-city-mobile121][data-mobile-camera121=true] .cooler-talk96{bottom:max(10px,env(safe-area-inset-bottom))}
 [data-city-mobile121] .cooler-energy100{box-sizing:border-box;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));top:var(--mobile-stats-top121,122px);bottom:auto;width:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:180px;overflow:auto;align-items:start;justify-content:normal;scrollbar-width:thin}
 [data-city-mobile121] .cooler-energy100.single{grid-template-columns:minmax(0,1fr);max-width:270px;margin-left:auto}
 [data-city-mobile121] .cooler-meter100{box-sizing:border-box;min-width:0;padding:8px;border-radius:11px;backdrop-filter:none;box-shadow:none}
 [data-city-mobile121] .cooler-meter100 h3{font-size:11px;line-height:1.6;min-height:35px;margin:0 0 5px;overflow-wrap:anywhere}
 [data-city-mobile121] .cooler-energy100.single h3{min-height:0}
 [data-city-mobile121] .cooler-meter100 dl{margin:0}
 [data-city-mobile121] .cooler-meter100 dl>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px;align-items:center;margin:4px 0}
 [data-city-mobile121] .cooler-meter100 dt{font-size:9px;line-height:1.6;min-width:0}
 [data-city-mobile121] .cooler-meter100 dd{margin:0;font-size:15px;line-height:1.5;min-width:0}
 [data-city-mobile121] .cooler-meter100 dd span{display:block;font-size:8px;white-space:normal;line-height:1.5}
 [data-city-mobile121] .cooler-meter100 .saving100{padding-top:5px;margin-bottom:0}
 [data-city-mobile121] .cooler-topic-overlay96{padding:10px}
 [data-city-mobile121] .cooler-topic-overlay96>section{box-sizing:border-box;max-height:calc(100% - 20px);padding:14px;overflow:auto;overscroll-behavior:contain}
 [data-city-mobile121] .cooler-topic-overlay96 header{font-size:17px}
 [data-city-mobile121] .cooler-topic-grid96{gap:9px}
 [data-city-mobile121] .cooler-topic-grid96>button{min-height:120px;padding:12px;font-size:12px;gap:4px}
 [data-city-mobile121] .cooler-topic-grid96 strong{font-size:18px}
 [data-city-mobile121] .cooler-topic-grid96 small{font-size:11px}
 [data-city-mobile121] .cooler-topic-overlay96 p{margin:6px 0 12px;font-size:12px}
 .mobile-shot-fade121{position:absolute;inset:0;pointer-events:none;z-index:30;background:#142b35;opacity:0;display:none}
 [data-city-mobile121] .mobile-shot-fade121{display:block}
 @media(orientation:landscape){
  [data-city-mobile121] .cooler-topic-grid96{grid-template-columns:1fr 1fr}
  [data-city-mobile121] .cooler-topic-grid96>button{min-height:116px}
  [data-city-mobile121][data-mobile-camera121=true] .cooler-talk96{grid-template-columns:repeat(6,minmax(0,1fr))}
  [data-city-mobile121] .cooler-energy100,[data-city-mobile121] .cooler-energy100.single{left:auto;right:max(10px,env(safe-area-inset-right));top:10px;bottom:72px;width:170px;max-width:170px;max-height:none;margin:0;grid-template-columns:1fr;align-content:start}
  [data-city-mobile121] .cooler-energy100:not(.single){width:min(340px,48vw);max-width:none;grid-template-columns:repeat(2,minmax(0,1fr))}
  [data-city-mobile121] .cooler-meter100 h3{min-height:0}
 }
 `;
 document.head.append(style);
 const fade=document.createElement('div');fade.className='mobile-shot-fade121';fade.setAttribute('aria-hidden','true');host.append(fade);
 const guide=story.cameraGuide,energy=story.energy,originalUpdate=story.update,originalCameraUpdate=guide.update;
 const boxes=energy.cards.map(c=>({unit:c.unit,local:c.localBounds.clone(),box:new T.Box3}));
 let disposed=false,lastLayout='',lastSaved=null,transition=null,framed=false,lastFrame='',lastNotice='',dirty=true,layout={width:1,height:1,x:0,y:0,w:1,h:1};
 const observer=new ResizeObserver(()=>{dirty=true;});for(const el of[host,energy.root,story.tools])observer.observe(el);
 function attr(node,key,value){if(node.dataset[key]!==value)node.dataset[key]=value;}
 function bounds(){for(const b of boxes){b.unit.model.updateWorldMatrix(true,true);b.box.copy(b.local).applyMatrix4(b.unit.model.matrixWorld);}return boxes;}
 function measure(){
  const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight),portrait=height>=width;
  // Reserve the actual card and toolbar rectangles. The 3D object uses the
  // entire remaining width in portrait, instead of a very narrow left rail.
  const hostRect=host.getBoundingClientRect(),hud=host.querySelector('.city-control-stack');
  if(portrait&&hud){const top=Math.max(108,Math.ceil(hud.getBoundingClientRect().bottom-hostRect.top)+10)+'px';if(host.style.getPropertyValue('--mobile-stats-top121')!==top)host.style.setProperty('--mobile-stats-top121',top);}
  const cards=energy.root.getBoundingClientRect(),tools=story.tools.getBoundingClientRect();
  const bottom=story.tools.hidden?height-106:Math.min(height-8,tools.top-hostRect.top-10);
  const x=10,y=portrait?Math.max(112,energy.root.hidden?286:cards.bottom-hostRect.top+12):10;
  const right=portrait?width-10:Math.min(width-10,energy.root.hidden?width-190:cards.left-hostRect.left-12);
  layout={width,height,x,y,w:Math.max(80,right-x),h:Math.max(80,bottom-y)};dirty=false;return layout;
 }
 function clearFrame(){if(framed){game.camera.camera.clearViewOffset();game.camera.camera.aspect=Math.max(1,host.clientWidth)/Math.max(1,host.clientHeight);game.camera.camera.updateProjectionMatrix();framed=false;lastFrame='';}}
 function frame(){
  if(!isMobile()||!energy.visible||!guide.active||guide.returning){clearFrame();return;}
  const m=dirty?measure():layout,key=[m.width,m.height,m.x,m.y,m.w,m.h].join('/'),c=game.camera.camera;
  if(key!==lastFrame||!c.view?.enabled){c.setViewOffset(m.w,m.h,-m.x,-m.y,m.width,m.height);lastFrame=key;framed=true;}
 }
 function target(shot){
  const m=measure(),all=bounds(),unit=all.find(b=>b.unit.variant===shot)||all[0],box=new T.Box3;
  for(const b of shot==='pair'?all:[unit])box.union(b.box);
  const look=box.getCenter(new T.Vector3),fov=54,tanY=Math.tan(T.MathUtils.degToRad(fov/2)),tanX=tanY*m.w/m.h;
  function fit(direction){
   const rotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(look.clone().add(direction),look,new T.Vector3(0,1,0))),inverse=rotation.clone().invert();let distance=1.5;
   for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){const p=new T.Vector3(x,y,z).sub(look).applyQuaternion(inverse);distance=Math.max(distance,p.z+Math.max(Math.abs(p.x)/tanX,Math.abs(p.y)/tanY)*1.12);}
   return {position:look.clone().addScaledVector(direction,distance+.20),rotation,fov};
  }
  const q=unit.unit.model.getWorldQuaternion(new T.Quaternion);
  if(shot==='pair')return fit(new T.Vector3(-1,.18,.9).applyQuaternion(q).normalize());
  let fallback;
  for(const [z,y]of[[.5,.10],[-.5,.10],[.85,.14],[-.85,.14],[1.2,.2],[-1.2,.2]]){
   const candidate=fit(new T.Vector3(-1,y,z).applyQuaternion(q).normalize());fallback=candidate;
   const blocked=all.some(b=>{
    if(b===unit)return false;const obstacle=b.box.clone().expandByScalar(.15);
    if(obstacle.containsPoint(candidate.position))return true;
    for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){
     const point=new T.Vector3(x,y,z),distance=point.distanceTo(candidate.position),ray=new T.Ray(candidate.position,point.sub(candidate.position).normalize()),hit=ray.intersectBox(obstacle,new T.Vector3);
     if(hit&&hit.distanceTo(candidate.position)<distance-.01)return true;
    }return false;
   });if(!blocked)return candidate;
  }return fallback;
 }
 function place(to){guide.position.copy(to.position);guide.rotation.copy(to.rotation);guide.fov=to.fov;guide.apply(game.camera.camera);}
 function paintTransition(){
  if(!transition)return;
  const t=(performance.now()-transition.start)/1000;
  if(!transition.placed&&t>=.12){place(transition.target);transition.placed=true;}
  const alpha=transition.initial?1-t/.22:t<.12?t/.12:1-(t-.12)/.22;
  fade.style.opacity=String(Math.max(0,Math.min(1,alpha)));
  if(t>=(transition.initial?.22:.34)){transition=null;fade.style.opacity='0';}
 }
 guide.update=function(camera,time,playing,dt){
  if(!isMobile()||this.returning)return originalCameraUpdate.call(this,camera,time,playing,dt);
  const shot=coolerShot95(time);if(!this.auto||!shot)return;
  this.begin(camera);attr(host,'mobileCamera121','true');
  const key=[host.clientWidth,host.clientHeight,shot].join('/'),initial=lastSaved!==this.saved;
  if(initial||this.shot!==shot||time<(this.lastTime??time)-.05||key!==lastLayout||dirty){
   const to=target(shot);transition={target:to,start:performance.now(),placed:initial,initial};
   if(initial)place(to);
   this.shot=shot;lastSaved=this.saved;lastLayout=key;
  }
  this.lastTime=time;this.lastAspect=camera.aspect;paintTransition();this.apply(camera);
 };
 const label=game.city.coolerExpert87?.group.getObjectByName('bargheto-expert-name'),labelScale=label?.scale.clone();let labelHidden=false,labelClock=0;
 function restoreLabel(){if(labelScale)label.scale.copy(labelScale);if(labelHidden){label.visible=true;labelHidden=false;}}
 function updateLabel(dt){
  if(!label||guide.active)return;labelClock+=dt;if(labelClock<.2)return;labelClock=0;
  const camera=game.camera.camera,p=label.getWorldPosition(new T.Vector3),depth=p.clone().applyMatrix4(camera.matrixWorldInverse).z;
  if(depth>=0)return;
  const parentScale=label.parent.getWorldScale(new T.Vector3).x,pixels=labelScale.x*parentScale*host.clientHeight/(-2*depth*Math.tan(camera.fov*Math.PI/360));
  label.scale.copy(labelScale).multiplyScalar(Math.min(1,Math.min(180,host.clientWidth*.55)/Math.max(1,pixels)));
  const screen=p.project(camera),outside=screen.y> .93||screen.y<-.93||Math.abs(screen.x)>.90;
  if(outside&&label.visible){label.visible=false;labelHidden=true;}else if(!outside&&labelHidden){label.visible=true;labelHidden=false;}
 }
 story.update=function(...args){
  const enabled=isMobile();if(host.hasAttribute('data-city-mobile121')!==enabled)host.toggleAttribute('data-city-mobile121',enabled);
  const result=originalUpdate.apply(this,args);
  if(enabled){
   attr(host,'mobileCamera121',String(guide.active));attr(this.tools,'live121',String(!this.tools.querySelector('[data-cooler-pause]').hidden));
   const notice=game.multiplayer?.notice;if(notice&&notice.textContent!==lastNotice){lastNotice=notice.textContent;attr(notice,'mobileQuiet121',String(!lastNotice||/میکروفن (روشن|خاموش)|فقط افراد نزدیک|برای بعضی اینترنت|مدیر سرور/.test(lastNotice)));}
   if(!guide.active||guide.returning){transition=null;fade.style.opacity='0';lastSaved=null;lastLayout='';}else paintTransition();
   frame();updateLabel(args[4]||0);
  }else{clearFrame();restoreLabel();transition=null;fade.style.opacity='0';if(host.hasAttribute('data-mobile-camera121'))host.removeAttribute('data-mobile-camera121');lastSaved=null;lastLayout='';}
  return result;
 };
 const api={get enabled(){return !disposed&&isMobile();},get layout(){return layout;},target,dispose(){if(disposed)return;disposed=true;clearFrame();restoreLabel();observer.disconnect();story.update=originalUpdate;guide.update=originalCameraUpdate;style.remove();fade.remove();host.removeAttribute('data-city-mobile121');host.removeAttribute('data-mobile-camera121');}};
 game.mobile121=api;game.disposers.push(()=>api.dispose());return api;
}
