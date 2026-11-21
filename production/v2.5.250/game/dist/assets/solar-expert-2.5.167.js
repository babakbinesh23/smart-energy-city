const SOLAR_EXPERT_AUDIO107={label:'مدیریت نیروگاه خورشیدی',url:(window.barghetoCityServerMedia109?.["solar-expert-2.5.107.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./solar-expert-2.5.107.mp3',import.meta.url).href))};
function round107(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
export function addSolarExpert107(T,city,cloneSkeleton){
 if(!city.expert.loaded)return null;
 const group=cloneSkeleton(city.expert.group),record=city.group.userData.buildingRecords?.find(r=>r.id==='solar-control');
 group.name='solar-management-expert';group.position.set(record?.rect?record.rect.minX-2.4:99.6,0,record?.rect?record.rect.maxZ-.8:-151.8);group.rotation.set(0,Math.PI/2,0);group.scale.setScalar(1);
 group.traverse(o=>{if(o.morphTargetInfluences)o.morphTargetInfluences=o.morphTargetInfluences.map(()=>0);});
 const height=city.expert.height??1.76,collider=city.physics.addStaticCylinder(group.position.clone().add(new T.Vector3(0,height/2,0)),height/2,.34);
 group.userData={role:'solar-management-expert',editRoot:true,editId:'solar-management-expert',editLabel:'کارشناس مدیریت نیروگاه خورشیدی',editColliders:[collider.handle],height};
 city.group.add(group);const body=group.children[0],position=new T.Vector3();let clock=0;
 return {group,update(dt,viewer){if(dt<=0||group.userData.editorDeleted)return;clock+=dt;group.getWorldPosition(position);const distance=Math.hypot(viewer.x-position.x,viewer.z-position.z);if(distance>.4&&distance<9&&Math.abs(viewer.y-position.y)<3){const target=group.worldToLocal(new T.Vector3(viewer.x,position.y,viewer.z)),yaw=Math.atan2(target.x,target.z),delta=Math.atan2(Math.sin(yaw-body.rotation.y),Math.cos(yaw-body.rotation.y));body.rotation.y+=delta*(1-Math.exp(-4*dt));}body.scale.y=1+Math.sin(clock*1.4)*.0013;},dispose(){city.physics.world.removeCollider(collider,true);group.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});group.removeFromParent();}};
}
export function installSolarExpertStory107(game,T,Speech){
 const expert=game.city.solarExpert107;if(!expert)return null;
 const speech=new Speech,rate=speech.rate93;expert.speech=speech;
 const tools=document.createElement('div');tools.className='solar-expert-tools107';tools.hidden=true;tools.dir='rtl';
 tools.innerHTML='<button type="button" data-solar-toggle107>پخش توضیحات خورشیدی · E</button><button type="button" data-solar-stop107 hidden>پایان گفتگو</button>';
 game.renderer.canvas.parentElement.append(tools);
 const toggle=tools.querySelector('[data-solar-toggle107]'),stop=tools.querySelector('[data-solar-stop107]'),rateControl=rate.mount(toggle);
 const style=document.createElement('style');style.textContent=`
 .solar-expert-tools107{position:absolute;right:20px;bottom:104px;z-index:38;display:flex;flex-wrap:wrap;gap:6px;max-width:min(620px,calc(100vw - 40px));pointer-events:auto}
 .solar-expert-tools107>button{min-height:42px;padding:8px 12px;color:#123b4c;background:#f1f9fc;border:1px solid #87adba;border-radius:11px;font:600 13px Vazirmatn,sans-serif;cursor:pointer}
 .solar-expert-tools107[hidden],.solar-expert-tools107 [hidden]{display:none!important}
 @media(max-width:700px){.solar-expert-tools107{bottom:155px;right:12px}}
 `;document.head.append(style);
 const controlsCanvas=document.createElement('canvas');controlsCanvas.width=1024;controlsCanvas.height=360;const texture=new T.CanvasTexture(controlsCanvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
 const controls=new T.Mesh(new T.PlaneGeometry(1.9,1.9*360/1024),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));controls.name='solar-expert-controls107';controls.visible=false;game.scene.add(controls);
 const anchor=new T.Vector3,box=new T.Box3,hit=new T.Vector3,faces=[];expert.group.traverse(o=>{if(o.morphTargetDictionary&&o.morphTargetInfluences)faces.push(o);});
 let active=false,allowed=false,disposed=false,lastControls='',mixer,action;
 const clip=game.city.expert.action?.getClip();if(clip){const c=clip.clone();c.tracks=c.tracks.filter(t=>!t.name.includes('morphTargetInfluences'));mixer=new T.AnimationMixer(expert.group);action=mixer.clipAction(c);action.play();action.paused=true;}
 const session=()=>active&&['loading','playing','paused'].includes(speech.state);
 function drawControls(){
  const playLabel=session()?(speech.pauseReasons90?.has('manual107')?'ادامهٔ صدا':'مکث صدا'):'پخش گفتگو',signature=playLabel+rate.value+session()+!!game.vr?.active;
  if(lastControls===signature)return;lastControls=signature;const c=controlsCanvas.getContext('2d');c.clearRect(0,0,1024,360);round107(c,4,4,1016,352,25,'#f3f9fc');c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#163e50';c.font='800 40px Vazirmatn,sans-serif';c.fillText('کارشناس مدیریت نیروگاه خورشیدی',512,66);c.font='500 26px Vazirmatn,sans-serif';c.fillText('A/ماشه: انتخاب · نزدیک شوید و گفتگوی کارشناس را پخش کنید',512,120);const labels=[playLabel,'◴ '+rate.label(),'پایان'];for(let i=0;i<3;i++){round107(c,12+i*337,156,325,158,18,'#e0eeee');c.fillStyle='#173e4e';c.font='700 34px Vazirmatn,sans-serif';c.fillText(labels[i],174+i*337,236,300);}texture.needsUpdate=true;
 }
 function startPlayback(restart=false){
  if(!allowed||disposed)return false;active=true;speech.audioUrl93=SOLAR_EXPERT_AUDIO107.url;
  if(restart)speech.stop();
  if(session()&&speech.pauseReasons90?.has('manual107'))speech.resume('manual107');
  else if(session())speech.pause('manual107');
  else speech.start();
  game.renderer.canvas.focus?.({preventScroll:true});if(game.paused)game.resume?.();drawControls();return true;
 }
 function finish(){active=false;speech.stop();drawControls();}
 toggle.onclick=()=>startPlayback();stop.onclick=()=>finish();const offRate=rate.subscribe(drawControls);
 function update(camera,feet,enabled,vr,dt=0){
  if(disposed)return;expert.group.getWorldPosition(anchor);expert.update(Math.min(.08,dt),feet);const near=Math.hypot(feet.x-anchor.x,feet.z-anchor.z)<=4.2&&Math.abs(feet.y-anchor.y)<=2.2;allowed=enabled&&near&&!expert.group.userData.editorDeleted&&expert.group.visible;
  if(session()){allowed?speech.resume('distance'):speech.pause('distance');enabled?speech.resume('environment'):speech.pause('environment');}
  if(active&&['idle','error'].includes(speech.state))active=false;
  tools.hidden=!allowed||vr||game.settings.hideHud;toggle.textContent=session()?(speech.pauseReasons90?.has('manual107')?'ادامهٔ صدا · E':'مکث صدا · E'):'پخش توضیحات خورشیدی · E';stop.hidden=!session();controls.visible=allowed&&vr;controls.position.copy(anchor).add(new T.Vector3(0,(expert.group.userData.height??1.76)+.72,0));controls.quaternion.copy(camera.quaternion);drawControls();
  if(action){action.paused=!speech.playing;mixer.update(speech.playing?Math.min(.08,dt)*rate.value:0);}const pose=speech.mouthPose();for(const face of faces)for(const[name,index]of Object.entries(face.morphTargetDictionary))if(/^(mouthOpen|jawOpen|viseme_)/.test(name))face.morphTargetInfluences[index]=pose[name]??0;
 }
 function expertDistance(ray){if(!allowed)return null;box.setFromCenterAndSize(anchor.clone().add(new T.Vector3(0,.9,0)),new T.Vector3(.8,1.8,.8));const p=ray.ray.intersectBox(box,hit),label=expert.group.getObjectByName('bargheto-expert-name'),labelHit=label?.visible&&ray.camera?ray.intersectObject(label)[0]:null,d=Math.min(p?p.distanceTo(ray.ray.origin):Infinity,labelHit?.distance??Infinity);return d<=4.6&&d>=ray.near&&d<=ray.far&&(!game.vrLineOfSight||game.vrLineOfSight(ray,d))?d:null;}
 const visibility=()=>{if(document.hidden)speech.pause('environment');};
 document.addEventListener('visibilitychange',visibility);
 const api={speech,tools,controls,get active(){return active},get near(){return allowed},update,
  interact(){if(!allowed)return false;return startPlayback();},
  rayDistance(ray){if(!controls.visible)return expertDistance(ray);const h=ray.intersectObject(controls)[0];if(h?.distance<=6)return h.distance;return expertDistance(ray);},
  selectDesktop(ray){if(game.vr?.active||expertDistance(ray)===null)return false;return startPlayback();},
  select(ray){if(this.rayDistance(ray)===null)return false;const h=ray.intersectObject(controls)[0];if(h?.uv){const i=Math.min(2,Math.floor(h.uv.x*3));if(i===0)startPlayback();else if(i===1)rate.next();else finish();}else startPlayback();return true;},
  dispose(){if(disposed)return;disposed=true;finish();offRate();rateControl.dispose();mixer?.stopAllAction();mixer?.uncacheRoot(expert.group);controls.geometry.dispose();controls.material.dispose();texture.dispose();controls.removeFromParent();tools.remove();style.remove();document.removeEventListener('visibilitychange',visibility);}
 };
 game.solarExpertStory107=api;return api;
}
