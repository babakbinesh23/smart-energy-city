import {coolerShot95} from './cooler-camera-2.5.95-r110.js';
import {installSolarDashboard146} from './solar-dashboard-2.5.147.js';
import {planCoolerView141} from './cooler-vr-view-2.5.141.js';
import {installVRSettings140} from './vr-settings-2.5.187.js';
import {installVRScale137} from './vr-scale-2.5.137.js';
export function introOpacity125(age){const t=Math.max(0,Math.min(1,(age-.8)/3.6));return 1-t*t*(3-2*t);}
export function installVR125(game,T,{safeFeet,groups,safeSpawn}){
 installSolarDashboard146(game,T);
 const vr=game.vr;if(!vr)return;
 const handRay127=vr.handRay;vr.handRay=function(hand){handRay127.call(this,hand);this.raycaster.handedness127=hand.source?.handedness;this.raycaster.camera=this.view;};
 const down=new T.Vector3(0,-1,0),up=new T.Vector3(0,1,0),identity={x:0,y:0,z:0,w:1};
 const original={update:vr.update,teleport:vr.teleportLanding,request:vr.requestTeleport,blocked:vr.navigationBlocked};
 const clearHead=feet=>!game.physics.world.intersectionWithShape(feet.clone().addScaledVector(up,vr.introducing?vr.calibrationEyeHeight:Math.max(1.3,vr.view.position.y-vr.feet.y)),identity,vr.headShape,game.physics.rapier.QueryFilterFlags.EXCLUDE_SENSORS,groups,game.player.body.collider);
 const safe=feet=>safeFeet(feet)&&clearHead(feet);
 function ground(x,z,top,length){const w=game.physics,o=new T.Vector3(x,top,z),r=new w.rapier.Ray(o,down),h=w.world.castRayAndGetNormal(r,length,true,w.rapier.QueryFilterFlags.EXCLUDE_SENSORS,groups,game.player.body.collider);if(!h||h.normal.y<.85)return null;const p=o.addScaledVector(down,h.timeOfImpact);p.y+=.035;return safe(p)?p:null;}
 vr.resolveDestination126=function(selection){
  const feature=selection?.feature;if(feature?.id!=='efficiency'){
   const spawn=safeSpawn?.(selection);if(!spawn)throw Error('مقصد پیدا نشد.');
   if(safe(spawn.feet))return spawn;
   // The web capsule spawn alone does not validate the tracked headset volume.
   for(const radius of [1.5,3,5,8])for(let i=0;i<12;i++){
    const angle=i*Math.PI/6,feet=ground(spawn.feet.x+Math.cos(angle)*radius,spawn.feet.z+Math.sin(angle)*radius,spawn.feet.y+2.5,4);
    if(feet&&Math.abs(feet.y-spawn.feet.y)<.35)return{feet,heading:spawn.heading};
   }throw Error('فضای امن برای هدست در این مقصد پیدا نشد.');
  }
  const anchor=game.city.coolerExpert87?.group.getWorldPosition(new T.Vector3);
  if(!anchor)throw Error('کارشناس کولر در دسترس نیست.');
  const roof=anchor.y,entry=feature.entry;
  const areas=feature.areas.filter(a=>anchor.x>=a.minX&&anchor.x<=a.maxX&&anchor.z>=a.minZ&&anchor.z<=a.maxZ);
  if(!areas.length)throw Error('محدودهٔ پشت‌بام کولر پیدا نشد.');
  const candidates=[];
  for(const distance of [2.2,2.8,3.5,4.2,5.5,7])for(let i=0;i<16;i++){const angle=i*Math.PI/8;candidates.push({x:anchor.x+Math.sin(angle)*distance,z:anchor.z+Math.cos(angle)*distance});}
  if(entry)candidates.push({x:entry.x,z:entry.z});
  for(const point of candidates){if(!areas.some(a=>point.x>a.minX+.7&&point.x<a.maxX-.7&&point.z>a.minZ+.7&&point.z<a.maxZ-.7))continue;
   const feet=ground(point.x,point.z,roof+2.5,4);if(!feet||Math.abs(feet.y-roof)>.35)continue;
   return{feet,heading:Math.atan2(anchor.x-feet.x,anchor.z-feet.z)};
  }throw Error('جای ایستادن امن روی پشت‌بام کولر پیدا نشد.');
 };
 vr.selectIntro=function(hit){if(!hit||!this.intro?.selectable||this.pending||this.fade>0)return false;return game.navigation113?.vrMap?.teleport(hit.feature?.id)??false;};
 vr.mapPoint125=point=>ground(point.x,point.z,110,120);
 vr.navigationBlocked=()=>vr.mapOpen125||original.blocked?.call(vr);
 vr.teleportLanding=function(origin,direction){
  if(!this.active||this.insideOffice)return original.teleport.call(this,origin,direction);
  if(this.navigationBlocked())return null;
  const roof=game.city.cooler?.roofY;
  if(!Number.isFinite(roof)||Math.abs(this.feet.y-roof)>1.8)return original.teleport.call(this,origin,direction);
  const w=game.physics,hit=w.world.castRayAndGetNormal(new w.rapier.Ray(origin,direction),18,true,w.rapier.QueryFilterFlags.EXCLUDE_SENSORS,groups,game.player.body.collider);
  if(!hit||hit.normal.y<.85)return null;const p=origin.clone().addScaledVector(direction,hit.timeOfImpact);p.y+=.035;
  return Math.abs(p.y-this.anchor.y)<=1.6&&Math.abs(p.y-roof)<=1.6&&safe(p)?p:null;
 };
 // Intro uses XR frames throughout; no window animation callbacks are required.
 vr.toggleIntroMenu=()=>vr.toggleMap125?.();
 vr.updateIntroduction=function(dt){
  const intro=this.intro;if(!intro)return;
  const frozen=this.mapOpen125;intro.update(frozen?0:dt,this.view);this.notifyIntro();this.rig.rotation.set(0,intro.yaw,0);this.rig.position.copy(intro.position);this.anchor.y=intro.position.y-this.eyeOffset;this.syncView();intro.update(0,this.view);if(intro.caption)intro.caption.visible=false;
  this.blocked=false;this.marker.visible=this.smallTitle.visible=false;this.curtain.position.copy(this.view.position);
  this.revealAge125=(this.revealAge125??0)+Math.max(0,Math.min(.05,dt));
  const teleport=this.fade>.12?(.24-this.fade)/.12:this.fade/.12;
  this.curtain.material.opacity=Math.max(teleport,introOpacity125(this.revealAge125));this.curtain.visible=this.curtain.material.opacity>.001;
  for(const hand of this.hands){const pad=hand.source?.gamepad,poll=pad?.buttons.map(b=>b.pressed)??[];hand.cursor.visible=false;hand.line.visible=intro.selectable;
   if(!pad||!hand.group.visible)continue;if(hand.needsRelease){hand.buttons=poll;if(!poll.slice(0,6).some(Boolean)&&pad.axes.every(x=>Math.abs(x)<.25))hand.needsRelease=false;continue;}
   const edge=i=>!!poll[i]&&!hand.buttons[i],right=hand.source.handedness==='right';if(right&&edge(5))this.toggleMap125?.();this.handRay(hand);
   const mapped=this.mapOpen125,distance=mapped?this.onRaycast(this.raycaster):null,pick=mapped?null:intro.pick(this.raycaster);
   hand.line.scale.z=distance??(pick?this.origin.distanceTo(pick.point):10);hand.line.material.color.set(distance!==null||pick?0xffd43a:0x8cdec0);hand.cursor.visible=distance!==null||!!pick;hand.cursor.position.copy(this.direction).multiplyScalar(hand.line.scale.z).add(this.origin);hand.cursor.scale.setScalar(mapped?1:Math.max(1,hand.line.scale.z*.2));if(pick)intro.hover(pick.feature.id);
   if(edge(0)||right&&edge(4)){if(hand.selectHandled)hand.selectHandled=false;else if(mapped)this.onSelectRay(this.raycaster);else if(pick)this.selectIntro(pick);}if(!poll[0])hand.selectHandled=false;hand.buttons=poll;
  }
 };
 // The same DOM actions drive a readable controller panel, so topic, pause,
 // restart and speed stay in sync with the web conversations.
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=650;const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.generateMipmaps=false;
 const panel=new T.Mesh(new T.PlaneGeometry(1.65,.89375),new T.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,side:T.DoubleSide}));panel.name='vr-expert-actions125';panel.renderOrder=3300;panel.visible=false;game.scene.add(panel);
 let selected=null,signature='',rows=[],saved=null,tourMedia=null,auto=true,lastSession=null,hoverRow=-1,panelNeedsPlacement=true,tourLift=0,tourGeneration=0,lastTourShot147=null,lastTourTime147=null,placingTour144=false,returnPending144=null;
 const specs=[['coolerStory93','coolerExpert87','کارشناس کولر'],['solarExpertStory107','solarExpert107','کارشناس خورشیدی'],['greenAggregationStory108','greenAggregationExpert108','کارشناس تجمیع سبز']];
 // Eye height belongs to a tour placement, never to per-frame head tracking.
 // Remove the extra offset only inside the next actual placement (under its
 // fade), not by moving the rig immediately while a visible frame is rendered.
 const place144=vr.place;
 function releaseLift144(){if(tourLift){vr.eyeOffset-=tourLift;tourLift=0;}}
 vr.place=function(feet,yaw){if(!placingTour144)releaseLift144();return place144.call(this,feet,yaw);};
 function queueReturn144(){
  if(!returnPending144||!vr.active||vr.pending||vr.fade>0)return;
  const restore=returnPending144,generation=tourGeneration;returnPending144=null;
  vr.queue(()=>{if(generation!==tourGeneration)return;vr.place(restore.feet,restore.yaw);vr.syncView();panelNeedsPlacement=true;if(selected)positionPanel();});
 }
 function cancel(returnToStart=false){
  ++tourGeneration;const restore=saved;saved=null;lastTourShot147=lastTourTime147=null;tourMedia=game.coolerStory93?.speech.media??null;auto=false;panelNeedsPlacement=true;
  returnPending144=returnToStart&&restore&&vr.active?restore:null;
  if(!vr.active)releaseLift144();queueReturn144();
 }
 game.vrTours125={cancel};
 function positionPanel(){
  if(!panelNeedsPlacement)return;panelNeedsPlacement=false;
  // World locked near the viewer, including after each tour move. Keeping it
  // above the distant expert made the topic buttons unreachable during a tour.
  panel.position.copy(vr.view.position).add(new T.Vector3(0,selected?.menuOpen?-.12:-.65,-1.8).applyQuaternion(vr.view.quaternion));
  panel.quaternion.copy(vr.view.quaternion);panel.updateMatrixWorld(true);
 }
 const topicButtons139=new WeakMap();
 function consume139(){for(const hand of vr.hands||[])topicButtons139.set(hand,{locked:true,a:true,trigger:true});}
 function coolerNear139(){const group=game.city.coolerExpert87?.group;if(!group?.visible||group.userData?.editorDeleted)return false;const p=group.getWorldPosition(new T.Vector3);return Math.hypot(vr.feet.x-p.x,vr.feet.z-p.z)<=4.2&&Math.abs(vr.feet.y-p.y)<=2.2;}
 function openCooler139(){
  if(!coolerNear139())return false;
  const story=game.coolerStory93;cancel(true);story.update(vr.view,vr.feet,true,true,0);
  if(story.openMenu()===false)return false;
  consume139();selected=story;signature='';hoverRow=-1;panelNeedsPlacement=true;positionPanel();paint();return true;
 }
 function pollTopics139(){
  for(const hand of vr.hands||[]){
   const pad=hand.source?.gamepad;if(!pad)continue;
   const a=hand.source.handedness==='right'&&!!pad.buttons[4]?.pressed,trigger=!!pad.buttons[0]?.pressed;
   const previous=topicButtons139.get(hand)||{a:false,trigger:false,locked:false};
   if(previous.locked){topicButtons139.set(hand,{a,trigger,locked:a||trigger});continue;}
   topicButtons139.set(hand,{a,trigger,locked:false});
   if(!vr.active||vr.introducing||vr.insideOffice||vr.mapOpen125||vr.panel.visible||vr.pending||vr.fade>0||hand.needsRelease||!hand.group.visible)continue;
   if((a&&!previous.a)||(trigger&&!previous.trigger)){
    vr.handRay(hand);const target=game.vrTarget(vr.raycaster);if(target?.topic139)target.select();
   }
  }
 }
 function available(story){if(story===game.coolerStory93)return [...story.root.querySelectorAll('[data-topic96]'),...(story.tools?.querySelectorAll('button')??[])].filter(b=>{if(b.matches('[data-expert-topics96],[data-cooler-camera]'))return false;if(b.matches('[data-topic96]'))return true;let n=b;while(n&&n!==story.tools){if(n.hidden)return false;n=n.parentElement;}return true;});if(story.menuOpen)return [...story.root.querySelectorAll('[data-topic96]')];return [...(story.tools?.querySelectorAll('button')??[])].filter(b=>{if(b.matches('[data-cooler-camera]'))return !!saved;let n=b;while(n&&n!==story.tools){if(n.hidden)return false;n=n.parentElement;}return true;});}
 function paint(){if(selected===game.coolerStory93&&selected?.topic==='cooler'&&!selected.menuOpen){panel.visible=false;rows=[];hoverRow=-1;signature='';return;}const spec=specs.find(s=>game[s[0]]===selected);if(!selected||!spec){panel.visible=false;return;}positionPanel();const buttons=available(selected),key=hoverRow+'|'+spec[2]+'|'+selected.menuOpen+'|'+buttons.map(b=>b.textContent+b.disabled).join('|');panel.visible=!vr.mapOpen125&&!vr.panel.visible;if(key===signature)return;signature=key;rows=[];const c=canvas.getContext('2d');c.clearRect(0,0,1200,650);c.fillStyle='#102d37';c.beginPath();c.roundRect(2,2,1196,646,28);c.fill();c.strokeStyle='#8ad4c2';c.lineWidth=4;c.stroke();c.direction='rtl';c.textAlign='right';c.fillStyle='#effff8';c.font='bold 40px Vazirmatn,sans-serif';c.fillText(spec[2],1110,65);c.fillText('×',70,65);c.strokeStyle=hoverRow===0?'#ffe36b':'#8ad4c2';c.lineWidth=hoverRow===0?7:3;c.strokeRect(15,10,95,80);rows.push({x:15,y:10,w:95,h:80,action:()=>{selected?.closeMenu?.();selected=null;panel.visible=false;signature='';}});
  const cols=buttons.length>2?3:2,cellW=1120/cols,h=Math.min(160,510/Math.max(1,Math.ceil(buttons.length/cols)));
  buttons.forEach((b,i)=>{const x=40+(cols-1-i%cols)*cellW,y=108+Math.floor(i/cols)*h,w=cellW-14;c.fillStyle=b.disabled?'#293c42':hoverRow===i+1?'#416b69':'#28565d';c.beginPath();c.roundRect(x,y,w,h-14,16);c.fill();c.strokeStyle=hoverRow===i+1?'#ffe36b':'#8ad4c2';c.lineWidth=hoverRow===i+1?7:3;c.stroke();c.fillStyle='#effff8';c.font='bold 31px Vazirmatn,sans-serif';let label=b.querySelector('strong')?.textContent||b.textContent.trim();if(b.matches('[data-cooler-camera]'))label='بازگشت به دید من';c.textAlign='center';c.fillText(label,x+w/2,y+(h-14)/2+10,w-24);rows.push({x,y,w,h:h-14,action:()=>{if(b.disabled)return;if(b.matches('[data-cooler-camera]'))cancel(true);else{if(b.matches('[data-topic96],[data-cooler-restart]'))auto=true;b.click();panelNeedsPlacement=true;hoverRow=-1;}signature='';}});});tex.needsUpdate=true;
 }
 function tour(){
  const story=game.coolerStory93;if(!vr.active){cancel(false);return;}
  const live=story?.active&&story.topic==='cooler';if(!live){if(saved)cancel(true);return;}
  if(story.menuOpen)return;
  if(story.speech.media!==tourMedia){auto=true;tourMedia=story.speech.media;lastTourShot147=lastTourTime147=null;}
  const time=story.speech.currentTime+44.72,shot=coolerShot95(time);
  if(lastTourTime147!==null&&time<lastTourTime147-.05)lastTourShot147=null;
  lastTourTime147=time;
  if(!auto||!shot||shot===lastTourShot147||!story.speech.playing||vr.pending||vr.fade>0||vr.mapOpen125)return;
  // Follow audio cues in XR, with one placement per cue inside the native
  // teleport fade. The origin never changes between cues as the head turns.
  const plan=planCoolerView141(game.city.coolers,shot,game.city.cooler.roofY,ground,T);if(!plan)return;
  if(!saved)saved={feet:vr.feet.clone(),yaw:vr.rig.rotation.y};
  const generation=++tourGeneration,media=story.speech.media;
  vr.queue(()=>{
   if(generation!==tourGeneration)return;
   if(!vr.active||!story.active||story.topic!=='cooler'||story.menuOpen||story.speech.media!==media||!story.speech.playing||coolerShot95(story.speech.currentTime+44.72)!==shot)return;
   // Read tracked orientation at commit, not several XR frames before the fade.
   const forward=new T.Vector3(0,0,-1).applyQuaternion(vr.localRotation),headYaw=Math.atan2(-forward.x,-forward.z);
   const yaw=Math.atan2(plan.feet.x-plan.target.x,plan.feet.z-plan.target.z)-headYaw;
   releaseLift144();tourLift=plan.lift+.20;vr.eyeOffset+=tourLift;placingTour144=true;
   try{vr.place(plan.feet,yaw);}finally{placingTour144=false;}
   lastTourShot147=shot;vr.syncView();panelNeedsPlacement=true;if(selected===story)positionPanel();
  });signature='';
 }

 for(const [name]of specs){const story=game[name];if(!story)continue;if(!story.end)story.end=()=>vr.active&&story.tools.querySelector('[data-solar-stop107],[data-solar-stop108]')?.click();const update=story.update;story.update=function(camera,feet,enabled,immersive,dt){if(immersive&&name==='coolerStory93'&&saved){const expert=game.city.coolerExpert87.group.getWorldPosition(new T.Vector3);feet=expert;}const result=update.call(this,camera,feet,enabled,immersive,dt);if(immersive){if(story.root)story.root.hidden=true;if(story.tools)story.tools.hidden=true;story.controls.visible=false;if(selected===story){paint();}}return result;};}
 const previousTarget=game.vrTarget;game.vrTarget=function(ray){if(!vr.active||vr.mapOpen125)return previousTarget?.call(this,ray)??null;
  if(panel.visible){panel.updateMatrixWorld(true);const hit=ray.intersectObject(panel)[0],valid=hit&&hit.distance>=ray.near&&hit.distance<=Math.min(8,ray.far),index=valid?rows.findIndex(r=>hit.uv.x*1200>=r.x&&hit.uv.x*1200<=r.x+r.w&&(1-hit.uv.y)*650>=r.y&&(1-hit.uv.y)*650<=r.y+r.h):-1;
   const primary=ray.handedness127!=='left'||!vr.hands.some(h=>h.source?.handedness==='right'&&h.group.visible);
   if(primary&&index!==hoverRow){hoverRow=index;signature='';paint();}
   if(valid)return{distance:hit.distance,topic139:selected===game.coolerStory93,select:()=>{consume139();rows[index]?.action();paint();return true;}};
   // While choosing a topic, a missed button must not reopen the expert or
   // fall through to a cooler behind the panel.
   if(selected?.menuOpen)return null;
  }const candidates=[];
  for(const [key,expertKey]of specs){const story=game[key],group=game.city[expertKey]?.group;if(!story||!group?.visible||!(key==='coolerStory93'?coolerNear139():story.near))continue;const point=group.getWorldPosition(new T.Vector3).add(new T.Vector3(0,.95,0)),box=new T.Box3().setFromCenterAndSize(point,new T.Vector3(.85,1.9,.85)),hit=ray.ray.intersectBox(box,new T.Vector3),d=hit?.distanceTo(ray.ray.origin);if(d>=ray.near&&d<=Math.min(4.6,ray.far)&&(!game.vrLineOfSight||game.vrLineOfSight(ray,d))){const target={distance:d,topic139:key==='coolerStory93',select:()=>{if(key==='coolerStory93')return openCooler139();story.interact();selected=story;signature='';hoverRow=-1;panelNeedsPlacement=true;positionPanel();paint();return true;}};if(key==='coolerStory93')return target;candidates.push(target);}}
  const controls=game.coolerUse94;if(controls?.mesh.visible){const hit=ray.intersectObject(controls.mesh)[0];if(hit&&hit.distance<=5)candidates.push({distance:hit.distance,select:()=>controls.select(ray)});}
  const prior=previousTarget?.call(this,ray);if(prior)candidates.push(prior);return candidates.sort((a,b)=>a.distance-b.distance)[0]??null;
 };
 vr.requestTeleport=function(feet){if(saved){cancel(false);game.coolerStory93.end();}return original.request.call(this,feet);};
 vr.update=function(dt,frame){if(this.session!==lastSession){lastSession=this.session;this.revealAge125=0;selected=null;panel.visible=false;signature='';hoverRow=-1;panelNeedsPlacement=true;cancel(false);}if(this.intro?.caption)this.intro.caption.visible=false;
  const result=original.update.call(this,dt,frame);pollTopics139();if(!this.active){panel.visible=false;return result;}queueReturn144();tour();if(selected&&!selected.active&&!selected.menuOpen){selected=null;panel.visible=false;signature='';}else if(selected)paint();return result;
 };
 const end141=vr.onEnd;vr.onEnd=function(...args){cancel(false);releaseLift144();returnPending144=null;panel.visible=false;selected=null;return end141?.apply(this,args);};
 installVRScale137(game,T);
 installVRSettings140(game,T);
 game.disposers.push(()=>{cancel(false);releaseLift144();vr.place=place144;panel.removeFromParent();panel.geometry.dispose();panel.material.dispose();tex.dispose();});
}
