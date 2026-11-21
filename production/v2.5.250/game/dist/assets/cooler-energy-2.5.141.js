// Educational model only. No live meter or verified BLDC power-factor data is
// available. Energy projections use rated, equivalent-airflow comparison, never
// the changing demonstration state (an idle unit is not an efficiency gain).
export const DEFAULT_ENERGY100=Object.freeze({standardWatts:759,standardAmps:3.45,bldcWatts:300,volts:220,bldcPF:1,hoursPerDay:16,days:30});
export function validateEnergy100(input={}){
 const c={...DEFAULT_ENERGY100,...input};
 for(const k of Object.keys(DEFAULT_ENERGY100))if(!Number.isFinite(c[k]))throw new TypeError('Invalid cooler energy value: '+k);
 if(c.standardWatts<=0||c.bldcWatts<=0||c.standardWatts>20000||c.bldcWatts>20000||c.standardAmps<=0||c.standardAmps>100||c.volts<100||c.volts>300||c.bldcPF<=0||c.bldcPF>1||c.hoursPerDay<=0||c.hoursPerDay>24||c.days<=0||c.days>366)throw new RangeError('Cooler energy values outside supported range');
 if(c.standardWatts>c.volts*c.standardAmps+.01)throw new RangeError('Real power cannot exceed apparent power');
 return Object.freeze(c);
}
export function compareEnergy100(input={}){
 const c=validateEnergy100(input),hours=c.days*c.hoursPerDay;
 return {hours,standardKWh:c.standardWatts*hours/1000,bldcKWh:c.bldcWatts*hours/1000,savingKWh:(c.standardWatts-c.bldcWatts)*hours/1000,reductionWatts:c.standardWatts-c.bldcWatts,percent:100*(c.standardWatts-c.bldcWatts)/c.standardWatts};
}
export function sampleEnergy100(variant,state,time=0,input={}){
 const c=validateEnergy100(input),bldc=variant==='bldc',running=!!state?.powered,speed=Math.max(0,Math.min(1,Number(state?.speed)||0));
 // Fixed reference figures for comparison. Animation, load and power state
 // deliberately do not alter the numbers shown to the visitor.
 const watts=bldc?c.bldcWatts:c.standardWatts;
 const amps=bldc?c.bldcWatts/(c.volts*c.bldcPF):c.standardAmps;
 const comparison=compareEnergy100(c);
 return {watts,amps,running,speed,savingKWh:bldc?comparison.savingKWh:0,percent:bldc?comparison.percent:0,...{comparison}};
}
const number=new Intl.NumberFormat('fa-IR',{minimumFractionDigits:2,maximumFractionDigits:2});
const integer=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:0});
const fmt=(v,digits=2)=>(digits?number:integer).format(Math.abs(v)<.000001?0:v);
export function createCoolerEnergy100(game,T){
 let config=validateEnergy100(),comparison=compareEnergy100(config),disposed=false,clock=0,lastDraw=-Infinity,visible=false,immersive=false;
 const parent=game.renderer.canvas.parentElement,root=document.createElement('div');root.className='cooler-energy100';root.hidden=true;root.dir='rtl';root.setAttribute('aria-label','مقایسهٔ شبیه‌سازی مصرف دو کولر');
 const style=document.createElement('style');style.textContent=`
 .cooler-energy100{position:absolute;top:92px;right:14px;bottom:150px;width:250px;z-index:36;display:flex;flex-direction:column;justify-content:safe center;gap:12px;overflow:auto;pointer-events:auto;font-family:Vazirmatn,sans-serif}.cooler-energy100[hidden],.cooler-energy100 [hidden]{display:none!important}
 .cooler-meter100{position:relative;flex:0 0 auto;width:100%;max-width:none;padding:12px 15px;color:#e9f7ff;background:linear-gradient(135deg,#102f43eF,#16384ceF);border:1px solid #6195ab99;border-radius:14px;box-shadow:0 5px 18px #09273926;box-sizing:border-box;backdrop-filter:blur(8px)}
 .cooler-meter100.active{border-color:#4bd2b1}.cooler-meter100 h3{font-size:15px;margin:0 0 4px;font-weight:750}.cooler-meter100 small{display:block;font-size:10px;line-height:1.6;color:#b6cfdd}.cooler-meter100 dl{margin:8px 0}.cooler-meter100 dl>div{display:flex;justify-content:space-between;align-items:baseline;gap:9px;margin:7px 0}.cooler-meter100 dt{font-size:11px;color:#bed6e2}.cooler-meter100 dd{margin:0;font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}.cooler-meter100 dd span{font-size:10px;font-weight:500;color:#c3dde8}.cooler-meter100 .saving100{border-top:1px solid #5f9caa66;padding-top:7px;color:#e9f7ff}.cooler-meter100[data-variant="bldc"] .saving100 dd,.cooler-meter100[data-variant="bldc"] .saving100 dd span{color:#62ed9b}.cooler-meter100[data-variant="standard"] .saving100 dd{color:#ff6b70}.cooler-meter100 p{margin:3px 0;font-size:10px;line-height:1.7;color:#bbd4df}.cooler-meter100 [data-basis]{display:none}.cooler-meter100 .meter-cue100{color:#79e2c6;font-weight:600;font-size:10px;min-height:16px}
 @media(max-width:700px){.cooler-energy100{top:116px;right:8px;bottom:165px;width:148px;gap:10px}.cooler-meter100{width:100%;padding:9px 10px;border-radius:12px}.cooler-meter100 h3{font-size:12px}.cooler-meter100 dl>div{display:block;margin:4px 0}.cooler-meter100 dd{font-size:18px}.cooler-meter100 dt{font-size:10px}.cooler-meter100 small{font-size:9px}.cooler-meter100 p,.cooler-meter100 .meter-cue100{font-size:9px}}
 @media(max-height:500px){.cooler-meter100{padding:8px 12px}.cooler-meter100 dl{margin:3px 0}.cooler-meter100 dl>div{margin:3px 0}.cooler-meter100 small{line-height:1.4}.cooler-meter100[data-variant="standard"] .saving100 dd{color:#ff6b70}.cooler-meter100 p{margin:1px 0}}

 `;document.head.append(style);parent.append(root);
 const units=game.city.coolers.map(unit=>{
  const element=document.createElement('section');element.className='cooler-meter100';element.dataset.variant=unit.variant;
  element.innerHTML='<h3></h3><dl><div><dt>توان مصرفی</dt><dd data-watts></dd></div><div><dt>جریان تخمینی</dt><dd data-amps></dd></div><div class="saving100"><dt>صرفه‌جویی ماهانه</dt><dd data-saving></dd></div></dl>';
  root.append(element);const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=500;
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
  const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide});
  const mesh=new T.Mesh(new T.PlaneGeometry(2.1,2.1*500/1024),material);mesh.name='cooler-energy100-'+unit.variant;mesh.visible=false;mesh.userData.coolerEnergy100=true;game.scene.add(mesh);
  const bounds=new T.Box3,inv=new T.Matrix4;unit.model.updateWorldMatrix(true,true);inv.copy(unit.model.matrixWorld).invert();unit.model.traverse(o=>{if(!o.isMesh||o.userData.airflow)return;let parent=o.parent;while(parent&&parent!==unit.model){if(parent.userData.airflow)return;parent=parent.parent;}if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld)));});const localTop=new T.Vector3;if(bounds.isEmpty())localTop.set(0,1.5,0);else{bounds.getCenter(localTop);localTop.y=bounds.max.y;}
  return {unit,element,canvas,texture,mesh,localTop,localBounds:bounds.clone(),watts:element.querySelector('[data-watts]'),amps:element.querySelector('[data-amps]'),saving:element.querySelector('[data-saving]'),anchor:new T.Vector3,sample:null,active:false};
 });
 const eye=new T.Vector3,target=new T.Vector3,side=new T.Vector3,corner=new T.Vector3,up=new T.Vector3(0,1,0),worldCenter=new T.Vector3;
 function paint(card){
  const {sample:s,unit:u}=card,bldc=u.variant==='bldc',title=bldc?'کولر آبی • موتور BLDC':'کولر آبی • موتور القایی';
  const periodLabel=config.days===30?'صرفه‌جویی ماهانه':'صرفه‌جویی '+fmt(config.days,0)+' روزه';card.element.querySelector('.saving100 dt').textContent=periodLabel;
  card.element.querySelector('h3').textContent=title;card.element.classList.toggle('active',card.active);
  card.watts.innerHTML=fmt(s.watts,0)+' <span>وات</span>';card.amps.innerHTML=fmt(s.amps)+' <span>آمپر</span>';card.saving.innerHTML=fmt(s.savingKWh)+' <span>کیلووات‌ساعت</span>';
  const c=card.canvas.getContext('2d'),round=(x,y,w,h,r,fill)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  c.clearRect(0,0,1024,500);round(3,3,1018,494,28,card.active?'#4bd2b1':'#6195ab');
  const gradient=c.createLinearGradient(0,0,1024,500);gradient.addColorStop(0,'rgba(16,47,67,.94)');gradient.addColorStop(1,'rgba(22,56,76,.94)');round(7,7,1010,486,24,gradient);
  c.direction='rtl';c.textBaseline='middle';c.textAlign='right';c.fillStyle='#e9f7ff';c.font='800 46px Vazirmatn,sans-serif';c.fillText(title,966,54);
  const row=(label,value,unit,y,green=false)=>{c.textAlign='right';c.fillStyle='#bed6e2';c.font='600 34px Vazirmatn,sans-serif';c.fillText(label,966,y);c.textAlign='left';c.fillStyle=green?'#62ed9b':'#e9f7ff';c.font='800 64px Vazirmatn,sans-serif';if(label===periodLabel&&!bldc)c.fillStyle='#ff6b70';c.fillText(value,56,y+58);c.textAlign='right';c.font='500 30px Vazirmatn,sans-serif';c.fillText(unit,966,y+58);};
  row('توان مصرفی',fmt(s.watts,0),'وات',135);row('جریان تخمینی',fmt(s.amps),'آمپر',256);
  round(30,347,964,130,17,bldc?'#28665e55':'#33526466');row(periodLabel,fmt(s.savingKWh),'کیلووات‌ساعت',380,bldc);
  card.texture.needsUpdate=true;
 }
 function position(card,camera,vr,width,height,shot){
  const {unit:u,mesh,anchor,element}=card;
  // The card belongs to this cooler's rigid top, in world space. Its lower
  // edge clears the lid even when looking down from the raised pair view.
  if(!vr){element.style.left='';element.style.top='';return;}
  anchor.copy(card.localTop);u.model.localToWorld(anchor);
  mesh.position.copy(anchor);mesh.position.y+=.28+mesh.geometry.parameters.height/2;
  if(eye.distanceToSquared(mesh.position)>.01)mesh.lookAt(eye);
  mesh.updateMatrixWorld(true);

 }
 let framedCamera=null,frameKey='';
 function releaseFraming(){if(!framedCamera)return;const c=framedCamera;framedCamera=null;frameKey='';c.clearViewOffset();c.aspect=Math.max(1,parent.clientWidth||innerWidth)/Math.max(1,parent.clientHeight||innerHeight);c.updateProjectionMatrix();}
 function frameScene(camera,vr,show){
  if(game.mobile121?.enabled){releaseFraming();return;}
  if(vr||!show){releaseFraming();return;}
  const c=game.camera?.camera??camera,w=Math.max(1,parent.clientWidth||innerWidth),h=Math.max(1,parent.clientHeight||innerHeight),reserve=w<=700?166:280,content=Math.max(160,w-reserve),key=[w,h,content].join('/');
  if(framedCamera&&framedCamera!==c)releaseFraming();
  if(!c.setViewOffset)return;
  if(c!==framedCamera||key!==frameKey||!c.view?.enabled||Math.abs(c.aspect-content/h)>.001){framedCamera=c;frameKey=key;
   // The entire canvas still renders. An asymmetric frustum places the focus
   // in the free left area while scenery continues behind the right cards.
   c.setViewOffset(content,h,0,0,w,h);
  }
 }
 const api={root,cards:units,get config(){return config},get comparison(){return comparison},get visible(){return visible},get reservedWidth(){return visible&&!immersive?((parent.clientWidth||innerWidth)<=700?166:280):0},
  configure(values){config=validateEnergy100({...config,...values});comparison=compareEnergy100(config);lastDraw=-Infinity;return comparison;},
  update({camera,vr=false,enabled=true,topic=null,shot=null,playing=false,dt=0}={}){
   if(disposed)return;immersive=vr;visible=enabled&&topic==='cooler'&&!!shot;root.hidden=!visible||vr;frameScene(camera,vr,visible);
   if(playing&&enabled)clock+=Math.min(.1,Math.max(0,dt||0));
   if(!visible){for(const card of units)card.mesh.visible=false;return;}
   // ArrayCamera may have a renderer-owned matrix that getWorldPosition would
   // recompute. Use the midpoint of the eye matrices; one shared pose per frame
   // keeps the card stable and identical for both eyes.
   if(vr&&camera.isArrayCamera&&camera.cameras.length){eye.set(0,0,0);for(const c of camera.cameras)eye.add(target.setFromMatrixPosition(c.matrixWorld));eye.multiplyScalar(1/camera.cameras.length);}
   else camera.getWorldPosition(eye);
   const width=parent.clientWidth||innerWidth,height=parent.clientHeight||innerHeight;
   root.classList.toggle('single',shot!=='pair');const redraw=lastDraw===-Infinity||units.some(c=>c.active!==(shot==='pair'||shot===c.unit.variant)||c.sample?.running!==!!c.unit.state.powered);
   for(const card of units){
    const available=card.unit.group.visible&&!card.unit.model.userData.editorDeleted&&!card.unit.group.userData.editorDeleted;
    card.mesh.visible=visible&&vr&&available;card.element.hidden=!available||shot!=='pair'&&shot!==card.unit.variant;
    card.active=shot==='pair'||shot===card.unit.variant;
    if(redraw){card.sample=sampleEnergy100(card.unit.variant,card.unit.state,clock,config);paint(card);}
    if(available&&(vr||!card.element.hidden))position(card,camera,vr,width,height,shot);
   }if(redraw)lastDraw=clock;
  },
  hide(){releaseFraming();visible=false;root.hidden=true;for(const c of units)c.mesh.visible=false;},
  dispose(){if(disposed)return;disposed=true;api.hide();for(const c of units){c.mesh.geometry.dispose();c.mesh.material.dispose();c.texture.dispose();c.mesh.removeFromParent();}root.remove();style.remove();}
 };return api;
}
