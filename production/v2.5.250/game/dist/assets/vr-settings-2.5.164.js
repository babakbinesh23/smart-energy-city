import {QUALITY157,xrScale157,foveation157} from './quality-2.5.164.js';
import {xrAntialias142} from './vr-edge-2.5.142.js';
export const XR_OPTIONS140=[
 {id:'fullEdges',title:'کیفیت کامل حاشیهٔ تصویر',detail:'کاهش وضوح کناره‌ها را خاموش می‌کند؛ ممکن است FPS کمتر شود'},
 {id:'textureFilter',title:'فیلتر بافت‌های دور و مورب',detail:'برای کاهش برق‌زدن بافت کف، سقف و سطوح دور'},
 {id:'softSpecular',title:'کاهش درخشش سطوح براق',detail:'درخشش ریز فلزها و سطوح براق را کمتر می‌کند'},
 {id:'edgeClarity',title:'وضوح بیشتر لبهٔ اجسام',detail:'وضوح کامل سطح انتخابی؛ پس از ورود دوباره به VR'}
];
const defaults=()=>({fullEdges:false,textureFilter:false,softSpecular:false,edgeClarity:true});
export function settingsHit140(x,y){
 if(y>=142&&y<=207){for(let i=0;i<4;i++)if(x>=32+i*244&&x<=256+i*244)return 'quality:'+Object.keys(QUALITY157)[i];}
 if(x>=32&&x<=992&&y>=230&&y<710){const i=Math.floor((y-230)/120);if(y<230+i*120+108)return XR_OPTIONS140[i]?.id??null;}
 if(x>=32&&x<=492&&y>=780&&y<=860)return 'reset';
 if(x>=532&&x<=992&&y>=780&&y<=860)return 'back';
 return null;
}
export function drawXRSettings140(c,api,hover){
 c.fillStyle='#102d37';c.fillRect(0,0,1024,1024);c.direction='rtl';c.textAlign='right';c.fillStyle='#effff8';c.font='bold 44px Vazirmatn,sans-serif';c.fillText('تنظیمات تصویر VR',970,78,900);
 c.font='25px Vazirmatn,sans-serif';c.fillText('وضوح لبه‌ها در ورود بعدی؛ سایر گزینه‌ها همین حالا',970,125,920);
 for(const [i,id]of Object.keys(QUALITY157).entries()){const x=32+i*244;c.fillStyle=api?.quality157===id?'#4d8060':'#20454c';c.fillRect(x,142,224,65);c.strokeStyle=hover==='quality:'+id?'#ffe36b':'#88b6a7';c.lineWidth=3;c.strokeRect(x,142,224,65);c.fillStyle='#fff';c.textAlign='center';c.font='bold 28px Vazirmatn,sans-serif';c.fillText(QUALITY157[id].label,x+112,184,210);}
 const state=api?.state||defaults();
 XR_OPTIONS140.forEach((row,i)=>{const y=230+i*120;c.fillStyle=hover===row.id?'#416b69':'#20454c';c.fillRect(32,y,960,108);const supported=api?.supported?.(row.id)!==false;c.fillStyle=supported?(state[row.id]?'#88ebba':'#d7dde3'):'#9ba5ab';c.font='bold 31px Vazirmatn,sans-serif';c.textAlign='left';if(!supported)c.font='22px Vazirmatn,sans-serif';c.fillText(!supported?'پشتیبانی‌نشده':state[row.id]?'روشن ✓':'خاموش',58,y+43,190);c.textAlign='right';c.fillStyle='#effff8';c.font='bold 32px Vazirmatn,sans-serif';c.fillText(row.title,968,y+43,700);c.font='23px Vazirmatn,sans-serif';c.fillText(row.detail,968,y+85,900);});
 c.fillStyle='#c9e9df';c.font='25px Vazirmatn,sans-serif';c.fillText('وضوح بیشتر ممکن است FPS را کاهش دهد',970,742,920);
 for(const [id,x,label]of [['reset',32,'بازگردانی پیش‌فرض'],['back',532,'بازگشت به نقشه']]){c.fillStyle=hover===id?'#507348':'#28565d';c.fillRect(x,780,460,80);c.fillStyle='#effff8';c.textAlign='center';c.font='bold 29px Vazirmatn,sans-serif';c.fillText(label,x+230,830,440);}
 c.font='26px Vazirmatn,sans-serif';c.fillStyle='#ffe36b';c.fillText('FPS: '+(Number.isFinite(api?.fps)?Math.round(api.fps):'—'),512,924);
 c.fillStyle='#c9e9df';c.font='23px Vazirmatn,sans-serif';c.fillText('ضدلبه: '+(api?.antialiasActive===true?'فعال':api?.antialiasActive===false?'مرورگر نپذیرفت':'نامشخص')+(api?.pendingEdges?' · وضوح جدید: نیاز به ورود دوباره':''),512,960,970);
 c.fillText('A یا ماشه: تغییر گزینه · B: بستن نقشه',512,1000,950);
}
export function installVRSettings140(game,T){
 const key='bargheto-vr-image-settings-v1';let state=defaults();try{const saved=JSON.parse(localStorage.getItem(key)||'null');for(const id of Object.keys(state))if(typeof saved?.[id]==='boolean')state[id]=saved[id];}catch{}
 const materials=new Map(),textures=new Map(),officeMaterials=new Map(),officeTextures=new Map();let office=null,lastSession=null,revision=0,applied=-1,cityScale=null;
 const mapKeys=['map','normalMap','roughnessMap','metalnessMap','aoMap','alphaMap','emissiveMap','bumpMap'];
 function applyCity(){
  game.renderer.webgl.xr.setFoveation(foveation157(game.settings.quality,state));
  const max=Math.min(16,game.renderer.webgl.capabilities.getMaxAnisotropy());
  game.scene.traverse(node=>{for(const mat of (Array.isArray(node.material)?node.material:[node.material])){
   if(!mat)continue;
   if(typeof mat.roughness==='number'){if(!materials.has(mat))materials.set(mat,{roughness:mat.roughness,env:mat.envMapIntensity});const saved=materials.get(mat);mat.roughness=state.softSpecular?Math.max(.65,saved.roughness):saved.roughness;if(typeof saved.env==='number')mat.envMapIntensity=state.softSpecular?saved.env*.5:saved.env;}
   for(const name of mapKeys){const tex=mat[name];if(!tex?.isTexture||tex.isCanvasTexture||tex.isVideoTexture||tex.isRenderTargetTexture||tex.isDepthTexture)continue;
    if(!textures.has(tex))textures.set(tex,{anisotropy:tex.anisotropy,minFilter:tex.minFilter,generateMipmaps:tex.generateMipmaps});const saved=textures.get(tex);
    const canMip=tex.isCompressedTexture?tex.mipmaps?.length>1:!!(tex.image?.width>1&&tex.image?.height>1);
    const anisotropy=state.textureFilter?max:saved.anisotropy,minFilter=state.textureFilter&&canMip?T.LinearMipmapLinearFilter:saved.minFilter,generate=state.textureFilter&&canMip&&!tex.isCompressedTexture?true:saved.generateMipmaps;
    if(tex.anisotropy!==anisotropy||tex.minFilter!==minFilter||tex.generateMipmaps!==generate){tex.anisotropy=anisotropy;tex.minFilter=minFilter;tex.generateMipmaps=generate;tex.needsUpdate=true;}
   }
  }});
 }
 function applyOffice(){if(!office)return;const {debug,helper}=office,scene=debug.scene;
  helper.baseExperience.sessionManager.fixedFoveation=foveation157(game.settings.quality,state);
  for(const mat of scene.materials||[]){if(typeof mat.roughness!=='number')continue;if(!officeMaterials.has(mat))officeMaterials.set(mat,{roughness:mat.roughness});mat.roughness=state.softSpecular?Math.max(.65,officeMaterials.get(mat).roughness):officeMaterials.get(mat).roughness;}
  const max=Math.min(16,debug.engine.getCaps?.().maxAnisotropy||1);
  for(const tex of scene.textures||[]){if(['DynamicTexture','VideoTexture','RenderTargetTexture','RawTexture'].includes(tex.getClassName?.()))continue;if(!tex.updateSamplingMode)continue;
   if(!officeTextures.has(tex))officeTextures.set(tex,{anisotropy:tex.anisotropicFilteringLevel,sampling:tex.samplingMode});const saved=officeTextures.get(tex),anisotropy=state.textureFilter?max:saved.anisotropy,mode=state.textureFilter&&!tex.noMipmap?3:saved.sampling;
   tex.anisotropicFilteringLevel=anisotropy;if(tex.samplingMode!==mode)tex.updateSamplingMode(mode);
  }
 }
 function restore(){for(const [mat,s]of materials){mat.roughness=s.roughness;if(typeof s.env==='number')mat.envMapIntensity=s.env;}for(const [tex,s]of textures){tex.anisotropy=s.anisotropy;tex.minFilter=s.minFilter;tex.generateMipmaps=s.generateMipmaps;tex.needsUpdate=true;}materials.clear();textures.clear();applied=-1;}
 function configureEdges(){if(!game.renderer.webgl.xr.isPresenting){cityScale=xrScale157(game.settings.quality,state);game.vr.framebufferScaleFactor=cityScale;game.renderer.webgl.xr.setFramebufferScaleFactor(cityScale);}}
 configureEdges();
 const begin142=game.vr.onBegin;game.vr.onBegin=function(...args){configureEdges();return begin142?.apply(this,args);};
 const activeOffice=()=>office?.helper.baseExperience.sessionManager.inXRSession&&office.helper.baseExperience.state===2?office:null;
 function supported(id){if(id!=='fullEdges')return true;const active=activeOffice();if(active)return active.helper.baseExperience.sessionManager.isFixedFoveationSupported!==false;const layer=game.renderer.webgl.xr.getBaseLayer?.();return !layer||typeof layer.fixedFoveation==='number';}
 function change(id){if(id.startsWith('quality:'))return game.setQuality(id.slice(8));if(id!=='reset'&&!supported(id))return false;if(id==='reset')state=defaults();else if(id in state)state[id]=!state[id];else return false;revision++;if(!game.vr.active)configureEdges();try{localStorage.setItem(key,JSON.stringify(state));}catch{}if(game.vr.active){applyCity();applied=revision;applyOffice();}return true;}
 const update=game.vr.update,end=game.vr.onEnd;
 game.vr.update=function(...args){const value=update.apply(this,args);if(this.active){if(lastSession!==this.session||applied!==revision){lastSession=this.session;applyCity();applied=revision;}if(this.renderer.xr.getFoveation?.()!==(foveation157(game.settings.quality,state)))this.renderer.xr.setFoveation(foveation157(game.settings.quality,state));}return value;};
 game.vr.onEnd=function(...args){restore();lastSession=null;return end?.apply(this,args);};
 const api={get quality157(){return game.settings.quality;},qualityChanged157(){configureEdges();if(game.vr.active){applyCity();applyOffice();}revision++;game.vr.panelClock=1;},supported,get antialiasActive(){const active=activeOffice();return xrAntialias142(active?active.helper.renderTarget?.xrLayer:game.renderer.webgl.xr.getBaseLayer?.());},get activeScale(){const active=activeOffice();return active?active.helper.renderTarget?.edgeScale142??null:cityScale;},get pendingEdges(){return this.activeScale!==null&&this.activeScale!==xrScale157(game.settings.quality,state);},officeOptions142(stencil=false){return {canvasOptions:{antialias:true,depth:true,stencil:!!stencil,alpha:true,framebufferScaleFactor:xrScale157(game.settings.quality,state)}};},get state(){return {...state};},get fps(){const active=activeOffice();return active?active.debug.engine.getFps?.():game.debug?.currentFps;},change,
  attachOffice(debug,helper){officeMaterials.clear();officeTextures.clear();const current=office={debug,helper};applyOffice();let done=false;const observer=debug.scene.onBeforeRenderObservable.add(()=>{if(helper.baseExperience.state===2)helper.baseExperience.sessionManager.fixedFoveation=foveation157(game.settings.quality,state);});return()=>{if(done)return;done=true;debug.scene.onBeforeRenderObservable.remove(observer);if(office===current){office=null;officeMaterials.clear();officeTextures.clear();}};},restore};
 game.vrQuality140=api;game.disposers.push(()=>{restore();delete game.vrQuality140;});return api;
}
