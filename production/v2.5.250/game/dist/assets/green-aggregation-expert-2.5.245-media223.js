const GREEN_AGGREGATION_AUDIO108={label:'تجمیع برق سبز',url:(window.barghetoCityServerMedia109?.["green-aggregation-expert-2.5.108.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./green-aggregation-expert-2.5.108.mp3',import.meta.url).href))};
function round108(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
export function addGreenAggregationExpert108(T,city,cloneSkeleton){
 if(!city.expert.loaded)return null;
 const group=cloneSkeleton(city.expert.group);
 group.name='green-aggregation-expert';group.position.set(70,0,-61);group.rotation.set(0,Math.PI,0);group.scale.setScalar(1);
 group.traverse(o=>{if(o.morphTargetInfluences)o.morphTargetInfluences=o.morphTargetInfluences.map(()=>0);});
 const label=group.getObjectByName('bargheto-expert-name');let nameTexture=null,nameMaterial=null;
 if(label){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;
  const c=canvas.getContext('2d');c.fillStyle='#174b49';c.beginPath();c.roundRect(8,8,1008,176,25);c.fill();
  c.strokeStyle='#8be3c6';c.lineWidth=5;c.stroke();c.textAlign='center';c.textBaseline='middle';c.direction='rtl';
  c.fillStyle='#effffa';c.font='700 68px Vazirmatn,sans-serif';c.fillText('کارشناس تجمیع برق سبز',512,99,950);
  nameTexture=new T.CanvasTexture(canvas);nameTexture.colorSpace=T.SRGBColorSpace;
  nameMaterial=label.material.clone();nameMaterial.map=nameTexture;nameMaterial.needsUpdate=true;
  label.material=nameMaterial;label.name='green-aggregation-expert-name';label.scale.set(2.15,.42,1);
 }
 const height=city.expert.height??1.76,collider=city.physics.addStaticCylinder(group.position.clone().add(new T.Vector3(0,height/2,0)),height/2,.34);
 group.userData={role:'green-aggregation-expert',editRoot:true,editId:'green-aggregation-expert',editLabel:'کارشناس تجمیع برق سبز',editColliders:[collider.handle],height};
 city.group.add(group);const body=group.children[0],position=new T.Vector3();let clock=0;
 return {group,update(dt,viewer){if(dt<=0||group.userData.editorDeleted)return;clock+=dt;group.getWorldPosition(position);const distance=Math.hypot(viewer.x-position.x,viewer.z-position.z);if(distance>.4&&distance<9&&Math.abs(viewer.y-position.y)<3){const target=group.worldToLocal(new T.Vector3(viewer.x,position.y,viewer.z)),yaw=Math.atan2(target.x,target.z),delta=Math.atan2(Math.sin(yaw-body.rotation.y),Math.cos(yaw-body.rotation.y));body.rotation.y+=delta*(1-Math.exp(-4*dt));}body.scale.y=1+Math.sin(clock*1.4)*.0013;},dispose(){city.physics.world.removeCollider(collider,true);group.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});group.removeFromParent();nameTexture?.dispose();nameMaterial?.dispose();}};
}
export function installGreenAggregationStory108(game,T,Speech){
 const expert=game.city.greenAggregationExpert108;if(!expert)return null;
 const speech=new Speech,rate=speech.rate93;expert.speech=speech;
 const tools=document.createElement('div');tools.className='green-aggregation-expert-tools108';tools.hidden=true;tools.dir='rtl';
 tools.innerHTML='<button type="button" data-solar-toggle108>پخش توضیحات تجمیع برق سبز · E</button><button type="button" data-solar-stop108 hidden>پایان گفتگو</button>';
 game.renderer.canvas.parentElement.append(tools);
 const toggle=tools.querySelector('[data-solar-toggle108]'),stop=tools.querySelector('[data-solar-stop108]'),rateControl=rate.mount(toggle);
 const style=document.createElement('style');style.textContent=`
 .green-aggregation-expert-tools108{position:absolute;right:20px;bottom:104px;z-index:38;display:flex;flex-wrap:wrap;gap:6px;max-width:min(620px,calc(100vw - 40px));pointer-events:auto}
 .green-aggregation-expert-tools108>button{min-height:42px;padding:8px 12px;color:#123b4c;background:#f1f9fc;border:1px solid #87adba;border-radius:11px;font:600 13px Vazirmatn,sans-serif;cursor:pointer}
 .green-aggregation-expert-tools108[hidden],.green-aggregation-expert-tools108 [hidden]{display:none!important}
 @media(max-width:700px){.green-aggregation-expert-tools108{bottom:155px;right:12px}}
 `;document.head.append(style);
 const controlsCanvas=document.createElement('canvas');controlsCanvas.width=1024;controlsCanvas.height=360;const texture=new T.CanvasTexture(controlsCanvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
 const controls=new T.Mesh(new T.PlaneGeometry(1.9,1.9*360/1024),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));controls.name='green-aggregation-expert-controls108';controls.visible=false;game.scene.add(controls);
 const anchor=new T.Vector3,box=new T.Box3,hit=new T.Vector3,faces=[];expert.group.traverse(o=>{if(o.morphTargetDictionary&&o.morphTargetInfluences)faces.push(o);});
 let active=false,allowed=false,disposed=false,lastControls='',mixer,action;
 const clip=game.city.expert.action?.getClip();if(clip){const c=clip.clone();c.tracks=c.tracks.filter(t=>!t.name.includes('morphTargetInfluences'));mixer=new T.AnimationMixer(expert.group);action=mixer.clipAction(c);action.play();action.paused=true;}
 const session=()=>active&&['loading','playing','paused'].includes(speech.state);
 function drawControls(){
  const playLabel=session()?(speech.pauseReasons90?.has('manual108')?'ادامهٔ صدا':'مکث صدا'):'پخش گفتگو',signature=playLabel+rate.value+session()+!!game.vr?.active;
  if(lastControls===signature)return;lastControls=signature;const c=controlsCanvas.getContext('2d');c.clearRect(0,0,1024,360);round108(c,4,4,1016,352,25,'#f3f9fc');c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#163e50';c.font='800 40px Vazirmatn,sans-serif';c.fillText('کارشناس تجمیع برق سبز',512,66);c.font='500 26px Vazirmatn,sans-serif';c.fillText('A/ماشه: انتخاب · نزدیک شوید و گفتگوی کارشناس را پخش کنید',512,120);const labels=[playLabel,'◴ '+rate.label(),'پایان'];for(let i=0;i<3;i++){round108(c,12+i*337,156,325,158,18,'#e0eeee');c.fillStyle='#173e4e';c.font='700 34px Vazirmatn,sans-serif';c.fillText(labels[i],174+i*337,236,300);}texture.needsUpdate=true;
 }
 function startPlayback(restart=false){
  if(!allowed||disposed)return false;active=true;speech.audioUrl93=GREEN_AGGREGATION_AUDIO108.url;
  if(restart)speech.stop();
  if(session()&&speech.pauseReasons90?.has('manual108'))speech.resume('manual108');
  else if(session())speech.pause('manual108');
  else speech.start();
  game.renderer.canvas.focus?.({preventScroll:true});if(game.paused)game.resume?.();drawControls();return true;
 }
 function finish(){active=false;speech.stop();drawControls();}
 toggle.onclick=()=>startPlayback();stop.onclick=()=>finish();const offRate=rate.subscribe(drawControls);
 function update(camera,feet,enabled,vr,dt=0){
  if(disposed)return;expert.group.getWorldPosition(anchor);expert.update(Math.min(.08,dt),feet);const near=Math.hypot(feet.x-anchor.x,feet.z-anchor.z)<=4.2&&Math.abs(feet.y-anchor.y)<=2.2;allowed=enabled&&near&&!expert.group.userData.editorDeleted&&expert.group.visible;
  if(session()){allowed?speech.resume('distance'):speech.pause('distance');enabled?speech.resume('environment'):speech.pause('environment');}
  if(active&&['idle','error'].includes(speech.state))active=false;
  tools.hidden=!allowed||vr||game.settings.hideHud;toggle.textContent=session()?(speech.pauseReasons90?.has('manual108')?'ادامهٔ صدا · E':'مکث صدا · E'):'پخش توضیحات تجمیع برق سبز · E';stop.hidden=!session();controls.visible=false;controls.position.copy(anchor).add(new T.Vector3(0,(expert.group.userData.height??1.76)+.72,0));controls.quaternion.copy(camera.quaternion);drawControls();
  if(action){action.paused=!speech.playing;mixer.update(speech.playing?Math.min(.08,dt)*rate.value:0);}const pose=speech.mouthPose();for(const face of faces)for(const[name,index]of Object.entries(face.morphTargetDictionary))if(/^(mouthOpen|jawOpen|viseme_)/.test(name))face.morphTargetInfluences[index]=pose[name]??0;
 }
 function expertDistance(ray){if(!allowed)return null;box.setFromCenterAndSize(anchor.clone().add(new T.Vector3(0,.9,0)),new T.Vector3(.8,1.8,.8));const p=ray.ray.intersectBox(box,hit),label=expert.group.getObjectByName('green-aggregation-expert-name'),labelHit=label?.visible&&ray.camera?ray.intersectObject(label)[0]:null,d=Math.min(p?p.distanceTo(ray.ray.origin):Infinity,labelHit?.distance??Infinity);return d<=4.6&&d>=ray.near&&d<=ray.far&&(!game.vrLineOfSight||game.vrLineOfSight(ray,d))?d:null;}
 const visibility=()=>{if(document.hidden)speech.pause('environment');};
 document.addEventListener('visibilitychange',visibility);
 const api={speech,tools,controls,get active(){return active},get near(){return allowed},update,
  interact(){if(!allowed)return false;return startPlayback();},
  rayDistance(ray){if(!controls.visible)return expertDistance(ray);const h=ray.intersectObject(controls)[0];if(h?.distance<=6)return h.distance;return expertDistance(ray);},
  selectDesktop(ray){if(game.vr?.active||expertDistance(ray)===null)return false;return startPlayback();},
  select(ray){if(this.rayDistance(ray)===null)return false;const h=controls.visible?ray.intersectObject(controls)[0]:null;if(h?.uv){const i=Math.min(2,Math.floor(h.uv.x*3));if(i===0)startPlayback();else if(i===1)rate.next();else finish();}else startPlayback();return true;},
  dispose(){if(disposed)return;disposed=true;finish();offRate();rateControl.dispose();mixer?.stopAllAction();mixer?.uncacheRoot(expert.group);controls.geometry.dispose();controls.material.dispose();texture.dispose();controls.removeFromParent();tools.remove();style.remove();document.removeEventListener('visibilitychange',visibility);}
 };
 game.greenAggregationStory108=api;return api;
}
