import {createCoolerEnergy100} from './cooler-energy-2.5.141.js';
import {CoolerCamera95,coolerShot95,COOLER_END95} from './cooler-camera-2.5.95-r110.js';
export class CoolerDemo95{
 constructor(units){this.units=units;this.saved=null;}
 unlock(){for(const u of this.units)u.audio.start(u.position);}
 get active(){return !!this.saved;}
 begin(){if(this.saved)return;this.saved=this.units.map(u=>({u,state:Object.fromEntries(['powered','setting','speed','waterElapsed','waterClock','airPhase'].filter(k=>k in u.state).map(k=>[k,u.state[k]])),volume:u.audio.volume,muted:u.audio.muted}));}
 update(shot,time,playing){
  this.begin();for(const u of this.units){
   const on=shot==='pair'||shot===u.variant;if(on&&!u.state.powered)u.audio.start(u.position);u.state.setPowered(on);
   const variable=u.variant==='bldc'&&time>=81.34&&time<91.02,speed=variable?.4+.4*(.5+.5*Math.sin((time-81.34)*.6)):u.variant==='standard'&&time>=80.42&&time<81.34?.65:1;u.state.setSpeed(speed);
   u.storyPaused95=!playing;u.audio.muted=!playing||!on;u.audio.volume=(u.variant==='bldc'?.035:.36)*(shot==='pair'?.8:1);
  }
 }
 hold(){if(!this.saved)return;for(const u of this.units){u.storyPaused95=true;u.audio.muted=true;}}
 restore(){if(!this.saved)return;for(const s of this.saved){Object.assign(s.u.state,s.state);s.u.audio.volume=s.volume;s.u.audio.muted=s.muted;s.u.storyPaused95=false;}this.saved=null;}
}
export const EXPERT_TOPICS96=Object.freeze({
 saving:{label:'صرفه‌جویی',url:(window.barghetoCityServerMedia109?.["expert-saving-2.5.96.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./expert-saving-2.5.96.mp3',import.meta.url).href)),duration:42.840816,offset:0},
 cooler:{label:'کولر آبی',url:(window.barghetoCityServerMedia109?.["expert-cooler-2.5.96.mp3"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./expert-cooler-2.5.96.mp3',import.meta.url).href)),duration:89.6,offset:44.72}
});
function round(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
export function installCoolerStory96(game,T,Speech){
 const expert=game.city.coolerExpert87;if(!expert)return null;
 const speech=new Speech,rate=speech.rate93;expert.speech=speech;
 const cameraGuide=new CoolerCamera95(game,T),demo=new CoolerDemo95(game.city.coolers),bookmarks=new Map,energy=createCoolerEnergy100(game,T);
 const tools=document.createElement('div');tools.className='cooler-talk96';tools.dir='rtl';tools.hidden=true;
 tools.innerHTML='<button type="button" data-expert-topics96>انتخاب موضوع کارشناس · E</button><button type="button" data-cooler-pause hidden>مکث صدا</button><button type="button" data-cooler-stop hidden>پایان گفتگو</button><button type="button" data-cooler-restart hidden>شروع دوباره</button><button type="button" data-cooler-camera hidden>بازگشت به دید من</button>';
 const root=document.createElement('div');root.className='cooler-topic-overlay96';root.hidden=true;root.dir='rtl';root.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="cooler-topic-title96"><header><strong id="cooler-topic-title96">با کدام بخش شروع کنیم؟</strong><button type="button" data-topic-close96 aria-label="بستن انتخاب موضوع">×</button></header><p>موضوع موردنظر را انتخاب کن.</p><div class="cooler-topic-grid96"><button type="button" data-topic96="saving"><span class="topic-symbol96" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M26 5C12 3 5 10 7 19c2 9 14 9 17 0 1-4 0-9 2-14Z"/><path d="m5 28 15-16M12 20l-1-7M16 16h7"/></svg></span><strong>صرفه‌جویی</strong><span>توضیحات کارشناس درباره بهینه‌سازی انرژی</span><small>فقط گفتار · حدود ۴۳ ثانیه</small><em></em></button><button type="button" data-topic96="cooler"><span class="topic-symbol96" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13"/><circle cx="16" cy="16" r="3"/><path d="M15 13C6 2 28 3 20 14M19 17c14-2 4 16-3 3M14 18c-6 13-17-4-1-5"/></svg></span><strong>کولر آبی</strong><span>مقایسهٔ موتور القایی و BLDC از داخل کولرها</span><small>گفتار و بازدید تصویری · حدود ۹۰ ثانیه</small><em></em></button></div></section>';
 game.renderer.canvas.parentElement.append(tools,root);
 const topicButton=tools.querySelector('[data-expert-topics96]'),pause=tools.querySelector('[data-cooler-pause]'),stop=tools.querySelector('[data-cooler-stop]'),restart=tools.querySelector('[data-cooler-restart]'),back=tools.querySelector('[data-cooler-camera]'),rateControl=rate.mount(pause);
 const style=document.createElement('style');style.textContent=`
 .cooler-talk96{position:absolute;right:20px;bottom:104px;z-index:38;display:flex;flex-wrap:wrap;gap:6px;max-width:min(600px,calc(100vw - 40px));pointer-events:auto}.cooler-talk96>button{min-height:42px;padding:8px 12px;color:#123b4c;background:#f1f9fc;border:1px solid #87adba;border-radius:11px;font:600 13px Vazirmatn,sans-serif;cursor:pointer}.cooler-talk96 [hidden],.cooler-talk96[hidden],.cooler-topic-overlay96[hidden]{display:none!important}
 .cooler-topic-overlay96{position:absolute;inset:0;z-index:65;display:flex;align-items:center;justify-content:center;padding:16px;background:#123b4b33;pointer-events:auto;font-family:Vazirmatn,sans-serif}.cooler-topic-overlay96>section{width:min(620px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:23px;background:#f3f9fc;border:1px solid #a0bdc9;border-radius:21px;box-shadow:0 12px 45px #16334845;color:#153e50}.cooler-topic-overlay96 header{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:20px}.cooler-topic-overlay96 header button{border:0;background:#e0edf2;color:#214f61;border-radius:50%;min-width:38px;min-height:38px;font:26px sans-serif;cursor:pointer}.cooler-topic-overlay96 p{color:#527281;font-size:14px;margin:8px 0 20px}.cooler-topic-grid96{display:grid;grid-template-columns:1fr 1fr;gap:14px}.cooler-topic-grid96>button{display:flex;align-items:flex-start;gap:9px;flex-direction:column;text-align:right;min-height:215px;padding:20px;border:1px solid #a4c8ca;background:#e4f4ed;color:#143e4a;border-radius:16px;font:14px/1.9 Vazirmatn,sans-serif;cursor:pointer}.cooler-topic-grid96>button[data-topic96=cooler]{background:#e5eefb;border-color:#acbfdc}.cooler-topic-grid96 strong{font-size:22px}.cooler-topic-grid96 small{font-size:12px;color:#486b7c}.cooler-topic-grid96 em{font-style:normal;font-size:12px;color:#0a7569}.topic-symbol96{display:block;width:36px;height:36px;color:#087c70}.topic-symbol96 svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.cooler-topic-grid96>button:hover{border-color:#267b91;box-shadow:0 2px 10px #26627b20}.cooler-topic-overlay96 button:focus-visible{outline:3px solid #efaa4e;outline-offset:3px}
 @media(max-width:700px){.cooler-talk96{bottom:155px;right:12px}}@media(max-width:500px){.cooler-topic-grid96{grid-template-columns:1fr}.cooler-topic-overlay96>section{padding:18px}.cooler-topic-grid96>button{min-height:160px;padding:15px;gap:5px}.cooler-topic-grid96 strong{font-size:20px}.topic-symbol96{font-size:29px}}@media(max-height:480px){.cooler-talk96{bottom:65px;max-width:390px}.cooler-topic-overlay96>section{padding:14px}.cooler-topic-grid96>button{min-height:180px;padding:12px;gap:4px}.cooler-topic-overlay96 p{margin:5px 0 10px}}
 `;document.head.append(style);
 const controlsCanvas=document.createElement('canvas');controlsCanvas.width=1024;controlsCanvas.height=420;const texture=new T.CanvasTexture(controlsCanvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
 const controls=new T.Mesh(new T.PlaneGeometry(1.9,1.9*420/1024),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));controls.name='cooler-expert-controls96';controls.visible=false;game.scene.add(controls);
 const anchor=new T.Vector3,box=new T.Box3,hit=new T.Vector3,faces=[];expert.group.traverse(o=>{if(o.morphTargetDictionary&&o.morphTargetInfluences)faces.push(o);});
 let active=false,allowed=false,disposed=false,menuOpen=false,current=null,narrationShot100=null,lastControls='',mixer,action,choiceGeneration=0,unbind=()=>{};
 const clip=game.city.expert.action?.getClip();if(clip){const c=clip.clone();c.tracks=c.tracks.filter(t=>!t.name.includes('morphTargetInfluences'));mixer=new T.AnimationMixer(expert.group);action=mixer.clipAction(c);action.play();action.paused=true;}
 const session=()=>active&&['loading','playing','paused'].includes(speech.state);
 const save=()=>{if(current&&session()&&Number.isFinite(speech.currentTime)){if(speech.state==='loading'&&speech.currentTime===0&&(bookmarks.get(current)??0)>0)return;bookmarks.set(current,speech.media?.ended?0:speech.currentTime);}};
 function renderMenu(){for(const b of root.querySelectorAll('[data-topic96]'))b.querySelector('em').textContent=(bookmarks.get(b.dataset.topic96)??0)>.1?'ادامه از محل قبلی':'شروع از ابتدا';}
 function drawControls(){
  const label=game.vr?.active&&current==='cooler'&&!menuOpen?(narrationShot100==='standard'?'اکنون: کولر القایی':narrationShot100==='bldc'?'اکنون: کولر BLDC':'مقایسهٔ دو کولر'):(current?EXPERT_TOPICS96[current].label:'کارشناس کولر'),text=session()?(speech.pauseReasons90?.has('manual93')?'ادامه':'مکث'):'انتخاب موضوع',signature=label+text+rate.value+menuOpen+!!game.vr?.active;
  if(lastControls===signature)return;lastControls=signature;const c=controlsCanvas.getContext('2d');c.clearRect(0,0,1024,420);round(c,4,4,1016,412,25,'#f3f9fc');c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#163e50';c.font='800 40px Vazirmatn,sans-serif';c.fillText(menuOpen?'موضوع گفتگو را انتخاب کنید':label,512,64);if(!menuOpen&&game.vr?.active&&current==='cooler'){c.font='500 27px Vazirmatn,sans-serif';c.fillText('برای دیدن اعداد، به بالای کولر نگاه کنید',512,122);}
  if(menuOpen){for(const[i,label]of['صرفه‌جویی','کولر آبی'].entries()){round(c,12+i*510,125,490,185,18,i?'#e0eafa':'#def2e8');c.fillStyle='#174656';c.font='800 43px Vazirmatn,sans-serif';c.fillText(label,257+i*510,190);c.font='500 28px Vazirmatn,sans-serif';c.fillText(i?'بازدید از داخل دو کولر':'فقط توضیحات صوتی',257+i*510,255);}c.font='600 31px Vazirmatn,sans-serif';c.fillText('بستن انتخاب موضوع',512,365);}
  else for(let i=0;i<3;i++){round(c,12+i*337,165,325,180,18,'#e0eeee');c.fillStyle='#173e4e';c.font='700 35px Vazirmatn,sans-serif';c.fillText([text,'◴ '+rate.label(),'پایان'][i],174+i*337,255,310);}texture.needsUpdate=true;
 }
 function openMenu(){if(!allowed||disposed)return false;save();menuOpen=true;if(session())speech.pause('menu96');demo.hold();cameraGuide.returnToPlayer(game.camera.camera);renderMenu();root.hidden=!!game.vr?.active;if(!game.vr?.active){game.input?.exitPointerLock();root.querySelector('[data-topic96]')?.focus({preventScroll:true});}game.input?.clear();drawControls();return true;}
 function closeMenu(resume=true){menuOpen=false;root.hidden=true;if(current==='cooler')cameraGuide.reset();if(session()){speech.pauseReasons90?.delete('menu96');if(cameraGuide.active)speech.pause('view-return96');else if(resume)speech.resume('view-return96');}game.renderer.canvas.focus?.({preventScroll:true});drawControls();}
 function bind(token,id,time){
  const media=speech.media;if(!media)return;unbind();const seek=()=>{if(token!==choiceGeneration||speech.media!==media)return;try{media.currentTime=time;}catch{}};
  if(time>0){seek();if(!media.readyState)media.addEventListener('loadedmetadata',seek,{once:true});}
  const ended=()=>{if(token!==choiceGeneration)return;bookmarks.set(id,0);};media.addEventListener('ended',ended);unbind=()=>{media.removeEventListener('loadedmetadata',seek);media.removeEventListener('ended',ended);};
 }
 function choose(id,restart=false){
  if(!EXPERT_TOPICS96[id]||!allowed||disposed)return false;save();unbind();speech.stop();demo.restore();cameraGuide.returnToPlayer(game.camera.camera);const returning=cameraGuide.active;
  current=id;menuOpen=false;root.hidden=true;active=true;if(restart)bookmarks.set(id,0);if(id==='cooler'){cameraGuide.reset();demo.unlock();}
  speech.audioUrl93=EXPERT_TOPICS96[id].url;const token=++choiceGeneration,time=bookmarks.get(id)??0,pending=speech.start();bind(token,id,time);if(returning)speech.pause('view-return96');
  Promise.resolve(pending).then(()=>{if(token===choiceGeneration&&speech.media&&speech.currentTime<time-.05)bind(token,id,time);});game.renderer.canvas.focus?.({preventScroll:true});if(game.paused)game.resume?.();drawControls();return true;
 }
 function finish(immediate=false){energy.hide();if(current)bookmarks.set(current,0);unbind();++choiceGeneration;active=false;menuOpen=false;root.hidden=true;speech.stop();demo.restore();cameraGuide.returnToPlayer(game.camera.camera,immediate);drawControls();}
 function togglePause(){if(!session())return openMenu();speech.pauseReasons90?.has('manual93')?speech.resume('manual93'):speech.pause('manual93');}
 function cancelCamera(immediate=false){cameraGuide.returnToPlayer(game.camera.camera,immediate);}
 topicButton.onclick=openMenu;pause.onclick=togglePause;stop.onclick=()=>finish();restart.onclick=()=>current&&choose(current,true);back.onclick=()=>cancelCamera();root.querySelector('[data-topic-close96]').onclick=()=>closeMenu();root.onclick=e=>{if(e.target===root)closeMenu();};for(const b of root.querySelectorAll('[data-topic96]'))b.onclick=()=>choose(b.dataset.topic96);const offRate=rate.subscribe(drawControls);
 function update(camera,feet,enabled,vr,dt=0){
  if(disposed)return;expert.group.getWorldPosition(anchor);const near=Math.hypot(feet.x-anchor.x,feet.z-anchor.z)<=4.2&&Math.abs(feet.y-anchor.y)<=2.2;allowed=enabled&&near&&!expert.group.userData.editorDeleted&&expert.group.visible;
  if(session()){allowed?speech.resume('distance'):speech.pause('distance');enabled?speech.resume('environment'):speech.pause('environment');}
  if(menuOpen&&!allowed)closeMenu(false);
  if(active&&['idle','error'].includes(speech.state))finish();
  const live=session(),cooler=live&&current==='cooler',time=cooler?Math.min(COOLER_END95-.001,Math.round((speech.currentTime+EXPERT_TOPICS96.cooler.offset)*1e6)/1e6):null,shot=cooler?coolerShot95(time):null;
  const takeover=vr||game.cinematic?.active||game.editor?.active||game.officeSession?.active;
  if(takeover&&cameraGuide.active)cameraGuide.release(game.camera.camera,false);
  if(cameraGuide.returning)cameraGuide.update(camera,0,false,enabled?dt:0);
  if(live&&!cameraGuide.active&&speech.pauseReasons90?.has('view-return96'))speech.resume('view-return96');
  if(shot&&allowed&&!menuOpen&&!cameraGuide.returning&&(speech.playing||cameraGuide.active)){
   demo.update(shot,time,speech.playing);if(!vr)cameraGuide.update(camera,time,speech.playing,speech.playing?dt:0);
  }else{if(demo.active){if(!cooler)demo.restore();else demo.hold();}if(cameraGuide.active&&!cameraGuide.returning)cameraGuide.hold(camera);}
  narrationShot100=shot;
  energy.update({camera,vr,enabled:enabled&&allowed&&!menuOpen&&!game.cinematic?.active&&!game.editor?.active&&!game.officeSession?.active,topic:cooler?'cooler':null,shot,playing:speech.playing,dt});
  tools.hidden=!allowed||vr||game.settings.hideHud;topicButton.textContent=live?'انتخاب موضوع':'انتخاب موضوع کارشناس · E';pause.hidden=stop.hidden=restart.hidden=rateControl.element.hidden=!live;pause.textContent=speech.pauseReasons90?.has('manual93')?'ادامهٔ صدا':'مکث صدا';back.hidden=!cameraGuide.active;root.hidden=!menuOpen||!allowed||vr;
  controls.visible=allowed&&vr;controls.position.copy(anchor).add(new T.Vector3(0,(expert.group.userData.height??1.76)+(vr&&live?1.15:.65),0));controls.quaternion.copy(camera.quaternion);drawControls();
  if(action){action.paused=!speech.playing;mixer.update(speech.playing?Math.min(.08,dt)*rate.value:0);}const pose=speech.mouthPose();for(const face of faces)for(const[name,index]of Object.entries(face.morphTargetDictionary))if(/^(mouthOpen|jawOpen|viseme_)/.test(name))face.morphTargetInfluences[index]=pose[name]??0;
 }
 function expertDistance(ray){if(!allowed)return null;box.setFromCenterAndSize(anchor.clone().add(new T.Vector3(0,.9,0)),new T.Vector3(.8,1.8,.8));const p=ray.ray.intersectBox(box,hit),label=expert.group.getObjectByName('bargheto-expert-name'),labelHit=label?.visible&&ray.camera?ray.intersectObject(label)[0]:null,d=Math.min(p?p.distanceTo(ray.ray.origin):Infinity,labelHit?.distance??Infinity);return d<=4.6&&d>=ray.near&&d<=ray.far&&(!game.vrLineOfSight||game.vrLineOfSight(ray,d))?d:null;}
 const visibility=()=>{if(document.hidden){speech.pause('environment');demo.hold();}};
 const key=e=>{
  if(menuOpen){if(e.code==='Escape'||e.code==='KeyE'){e.preventDefault();e.stopImmediatePropagation();closeMenu();}else if(e.code==='Tab'&&!game.vr?.active){const buttons=[...root.querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}e.stopPropagation();return;}
  if(!cameraGuide.active||/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target?.tagName??''))return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();cancelCamera();}else if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))cancelCamera(true);
 };
 document.addEventListener('visibilitychange',visibility);window.addEventListener('keydown',key,true);
 const api={speech,tools,root,controls,energy,cameraGuide,demo,bookmarks,get topic(){return current},get menuOpen(){return menuOpen},get cameraActive(){return cameraGuide.active},get active(){return active},get near(){return allowed},start:openMenu,openMenu,closeMenu,choose,end:finish,cancelCamera,update,
  interact(){if(!allowed)return false;if(menuOpen){closeMenu();return true;}session()?togglePause():openMenu();return true;},
  selectDesktop(ray){if(game.vr?.active||expertDistance(ray)===null)return false;return openMenu();},
  rayDistance(ray){if(!controls.visible)return null;const h=ray.intersectObject(controls)[0];if(h?.distance<=6)return h.distance;return expertDistance(ray);},
  select(ray){if(this.rayDistance(ray)===null)return false;const h=ray.intersectObject(controls)[0];if(h?.uv){const x=h.uv.x*1024,y=(1-h.uv.y)*420;if(menuOpen){if(y>=125&&y<=310)choose(x<512?'saving':'cooler');else if(y>=330)closeMenu();}else{const i=Math.min(2,Math.floor(h.uv.x*3));if(i===0)togglePause();else if(i===1)rate.next();else finish();}}else openMenu();return true;},
  dispose(){if(disposed)return;finish(true);disposed=true;energy.dispose();offRate();rateControl.dispose();mixer?.stopAllAction();mixer?.uncacheRoot(expert.group);controls.geometry.dispose();controls.material.dispose();texture.dispose();controls.removeFromParent();tools.remove();root.remove();style.remove();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('keydown',key,true);}
 };
 game.coolerStory93=api;return api;
}
