import {installXRDiagnostics187} from './vr-diagnostics-2.5.191.js';
import {QUALITY157,xrScale157,foveation157} from './quality-2.5.164.js';
import {createVRImageStability189,xrAntialias189} from './vr-image-stability-2.5.189.js';
export const XR_OPTIONS140=[
 {id:'fullEdges',title:'کیفیت کامل حاشیهٔ تصویر',detail:'کاهش وضوح کناره‌ها را خاموش می‌کند؛ ممکن است FPS کمتر شود'},
 {id:'textureFilter',title:'فیلتر بافت‌های دور و مورب',detail:'برای کاهش برق‌زدن بافت کف، سقف و سطوح دور'},
 {id:'softSpecular',title:'کاهش درخشش سطوح براق',detail:'کاهش شیمر انعکاس، پوشش براق و جزئیات نور سطح'},
 {id:'edgeClarity',title:'وضوح بیشتر لبهٔ اجسام',detail:'وضوح کامل سطح انتخابی؛ پس از ورود دوباره به VR'}
];
const defaults=()=>({fullEdges:false,textureFilter:true,softSpecular:true,edgeClarity:true});
function basicHit187(x,y){
 if(y>=142&&y<=207){for(let i=0;i<4;i++)if(x>=32+i*244&&x<=256+i*244)return 'quality:'+Object.keys(QUALITY157)[i];}
 if(x>=32&&x<=992&&y>=230&&y<710){const i=Math.floor((y-230)/120);if(y<230+i*120+108)return XR_OPTIONS140[i]?.id??null;}
 if(x>=32&&x<=492&&y>=780&&y<=860)return 'reset';
 if(x>=532&&x<=992&&y>=780&&y<=860)return 'back';
 return null;
}
function basicDraw187(c,api,hover){
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
 const desiredScale=()=>game.vrDiagnostics187?.state.scale||xrScale157(game.settings.quality,state);
 const key='bargheto-vr-image-settings-v2';let state=defaults();try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved){for(const id of Object.keys(state))if(typeof saved[id]==='boolean')state[id]=saved[id];}else{const legacy=JSON.parse(localStorage.getItem('bargheto-vr-image-settings-v1')||'null');for(const id of ['fullEdges','edgeClarity'])if(typeof legacy?.[id]==='boolean')state[id]=legacy[id];localStorage.setItem(key,JSON.stringify(state));}}catch{}
 const stability=createVRImageStability189(T),officeMaterials=new Map(),officeTextures=new Map();let office=null,lastSession=null,revision=0,applied=-1,cityScale=null,officeApplied=-1,officeSession=null;
 function applyCity(){if(!game.renderer.webgl.xr.isPresenting)return;game.renderer.webgl.xr.setFoveation(foveation157(game.settings.quality,state));stability.apply(game.scene,state,game.renderer.webgl);}
 function applyOffice(){if(!activeOffice())return;const {debug,helper}=office,scene=debug.scene;
  helper.baseExperience.sessionManager.fixedFoveation=foveation157(game.settings.quality,state);
  for(const mat of scene.materials||[]){if(typeof mat.roughness!=='number')continue;if(!officeMaterials.has(mat))officeMaterials.set(mat,{roughness:mat.roughness,clearcoat:mat.clearCoat?.roughness});const saved=officeMaterials.get(mat);mat.roughness=state.softSpecular?Math.max(.65,saved.roughness):saved.roughness;if(typeof saved.clearcoat==='number')mat.clearCoat.roughness=state.softSpecular?Math.max(.4,saved.clearcoat):saved.clearcoat;}
  const max=Math.min(16,debug.engine.getCaps?.().maxAnisotropy||1);
  for(const tex of scene.textures||[]){if(['DynamicTexture','VideoTexture','RenderTargetTexture','RawTexture'].includes(tex.getClassName?.()))continue;if(!tex.updateSamplingMode)continue;
   if(!officeTextures.has(tex))officeTextures.set(tex,{anisotropy:tex.anisotropicFilteringLevel,sampling:tex.samplingMode});const saved=officeTextures.get(tex),anisotropy=state.textureFilter?max:saved.anisotropy,mode=state.textureFilter&&!tex.noMipmap?3:saved.sampling;
   tex.anisotropicFilteringLevel=anisotropy;if(tex.samplingMode!==mode)tex.updateSamplingMode(mode);
  }
 }
 function restoreOffice(){for(const [mat,s]of officeMaterials){mat.roughness=s.roughness;if(typeof s.clearcoat==='number'&&mat.clearCoat)mat.clearCoat.roughness=s.clearcoat;}for(const [tex,s]of officeTextures){tex.anisotropicFilteringLevel=s.anisotropy;if(tex.samplingMode!==s.sampling)tex.updateSamplingMode(s.sampling);}officeMaterials.clear();officeTextures.clear();officeApplied=-1;officeSession=null;}
 function restore(){stability.restore();restoreOffice();applied=-1;}
 function configureEdges(){if(!game.renderer.webgl.xr.isPresenting){cityScale=desiredScale();game.vr.framebufferScaleFactor=cityScale;game.renderer.webgl.xr.setFramebufferScaleFactor(cityScale);}}
 configureEdges();
 const begin142=game.vr.onBegin;game.vr.onBegin=function(...args){configureEdges();return begin142?.apply(this,args);};
 const activeOffice=()=>office?.helper.baseExperience.sessionManager.inXRSession&&office.helper.baseExperience.state===2?office:null;
 function supported(id){if(id!=='fullEdges')return true;const active=activeOffice();if(active)return active.helper.baseExperience.sessionManager.isFixedFoveationSupported!==false;const layer=game.renderer.webgl.xr.getBaseLayer?.();return !layer||typeof layer.fixedFoveation==='number';}
 function change(id){if(id.startsWith('quality:'))return game.setQuality(id.slice(8));if(id!=='reset'&&!supported(id))return false;if(id==='reset')state=defaults();else if(id in state)state[id]=!state[id];else return false;revision++;if(!game.vr.active)configureEdges();try{localStorage.setItem(key,JSON.stringify(state));}catch{}if(game.vr.active){applyCity();applied=revision;applyOffice();}return true;}
 const update=game.vr.update,end=game.vr.onEnd;
 game.vr.update=function(...args){const value=update.apply(this,args);if(this.active){if(lastSession!==this.session||applied!==revision){lastSession=this.session;applyCity();applied=revision;}if(this.renderer.xr.getFoveation?.()!==(foveation157(game.settings.quality,state)))this.renderer.xr.setFoveation(foveation157(game.settings.quality,state));}return value;};
 game.vr.onEnd=function(...args){restore();lastSession=null;return end?.apply(this,args);};
 const api={get quality157(){return game.settings.quality;},qualityChanged157(){configureEdges();if(game.vr.active){applyCity();applyOffice();}revision++;game.vr.panelClock=1;},supported,get antialiasActive(){const active=activeOffice();return active?(typeof active.helper.renderTarget?.xrLayer?.antialias==='boolean'?active.helper.renderTarget.xrLayer.antialias:null):xrAntialias189(game.renderer.webgl);},get activeScale(){const active=activeOffice();return active?active.helper.renderTarget?.edgeScale142??null:cityScale;},get pendingEdges(){return this.activeScale!==null&&this.activeScale!==desiredScale();},officeOptions142(stencil=false){return {canvasOptions:{antialias:true,depth:true,stencil:!!stencil,alpha:true,framebufferScaleFactor:desiredScale()}};},get state(){return {...state};},get fps(){const active=activeOffice();return active?active.debug.engine.getFps?.():game.debug?.currentFps;},change,
  stability189:stability,attachOffice(debug,helper){restoreOffice();const current=office={debug,helper};const detachDiagnostics=game.vrDiagnostics187?.attach(debug,helper);applyOffice();let done=false;const observer=debug.scene.onBeforeRenderObservable.add(()=>{if(activeOffice()){const manager=helper.baseExperience.sessionManager;if(officeApplied!==revision||officeSession!==manager.session){applyOffice();officeApplied=revision;officeSession=manager.session;}manager.fixedFoveation=foveation157(game.settings.quality,state);}else if(officeApplied!==-1)restoreOffice();});return()=>{if(done)return;done=true;detachDiagnostics?.();debug.scene.onBeforeRenderObservable.remove(observer);if(office===current){restoreOffice();office=null;}};},restore};
 game.vrQuality140=api;installXRDiagnostics187(game,api);configureEdges();game.disposers.push(()=>{restore();delete game.vrQuality140;});return api;
}

// The office iframe and city load separate module instances, but share this
// API. Keep the visible page on the API so both renderers hit the same rows.
const page187=api=>[0,1,2].includes(api?.settingsPage188)?api.settingsPage188:0;
export function selectXRSettings188(api,id){
 if(!api||typeof id!=='string')return false;
 if(id.startsWith('page187:')){const page=Number(id.slice(8));if(![0,1,2].includes(page))return false;api.settingsPage188=page;return true;}
 return api.change?.(id)??false;
}
const labels187=['تصویر','نرخ و بار رندر','اندازه‌گیری'];
function focus188(c,x,y,w,h,active){if(!active)return;c.strokeStyle='#ffe36b';c.lineWidth=6;c.strokeRect(x+3,y+3,w-6,h-6);}
function row187(c,y,title,value,detail,active){
 c.fillStyle=active?'#416b69':'#20454c';c.fillRect(32,y,960,108);
 focus188(c,32,y,960,108,active);
 c.textAlign='right';c.fillStyle='#effff8';c.font='bold 30px Vazirmatn,sans-serif';c.fillText(title,968,y+39,620);
 c.textAlign='left';c.fillStyle='#88ebba';c.font='25px Vazirmatn,sans-serif';c.fillText(value,56,y+39,310);
 c.textAlign='right';c.fillStyle='#c9e9df';c.font='22px Vazirmatn,sans-serif';c.fillText(detail,968,y+83,910);
}
export function settingsHit140(x,y,api){
 if(y>=142&&y<=207){for(let i=0;i<3;i++)if(x>=32+i*324&&x<=344+i*324)return 'page187:'+i;}
 const page=page187(api);
 if(page===0){if(y>=230&&y<710)return basicHit187(x,y);if(y>=714&&y<=766){for(let i=0;i<4;i++)if(x>=32+i*244&&x<=256+i*244)return 'quality:'+Object.keys(QUALITY157)[i];}}
 else if(x>=32&&x<=992&&y>=230&&y<710){const i=Math.floor((y-230)/120);if(y<230+i*120+108)return (page===1?['diag:rate','diag:scale','diag:shadows','diag:lockAuto']:['diag:freezeOverview','diag:baseline','diag:measure'])[i]??null;}
 if(y>=780&&y<=860&&x>=32&&x<=992)return x<=492?'reset':x>=532?'back':null;
 return null;
}
export function drawXRSettings140(c,api,hover){
 const pointer=typeof hover==='object'&&hover?hover:null;hover=pointer?.id??hover;
 basicDraw187(c,api,hover);
 c.fillStyle='#102d37';c.fillRect(0,88,1024,132);
 c.textAlign='center';c.fillStyle='#c9e9df';c.font='23px Vazirmatn';c.fillText('هر بار فقط یک گزینه را تغییر بده و همان صحنه را مقایسه کن',512,122,960);
 for(let i=0;i<3;i++){const active=hover==='page187:'+i;c.fillStyle=active?'#416b69':page187(api)===i?'#4d8060':'#20454c';c.fillRect(32+i*324,142,312,65);focus188(c,32+i*324,142,312,65,active);c.fillStyle='#fff';c.font='bold 27px Vazirmatn';c.fillText(labels187[i],188+i*324,184,300);}
 const d=api?.diagnostics187,report=d?.report(),state=d?.state,page=page187(api);
 if(page){c.fillStyle='#102d37';c.fillRect(0,220,1024,550);
 if(!d){c.fillStyle='#fff';c.fillText('برای ابزار تشخیص از داخل شهر وارد ساختمان شو',512,300,950);}
 else if(page===1){
 row187(c,230,'نرخ نوسازی هدست',report.supportedHz.length?state.rate+' Hz':'پشتیبانی‌نشده','نرخ واقعی: '+(report.actualHz??'نامشخص')+' Hz · '+(d.busy?'در حال درخواست':report.supportedHz.join(' / ')),hover==='diag:rate');
 row187(c,350,'مقیاس وضوح رندر',state.scale?Math.round(state.scale*100)+'٪':'طبق کیفیت','۶۵، ۸۰، ۱۰۰، ۱۲۰، ۱۴۰٪ · اعمال با ورود دوباره به VR',hover==='diag:scale');
 row187(c,470,'سایه‌ها',state.shadows?'طبق کیفیت':'خاموش','خاموش کن تا لرزش لبهٔ سایه‌ها و هزینهٔ رندر را مقایسه کنی',hover==='diag:shadows');
 row187(c,590,'قفل کیفیت خودکار',state.lockAuto?'روشن':'خاموش','در زمان آزمایش، ارتقا یا کاهش خودکار کیفیت متوقف می‌شود',hover==='diag:lockAuto');
 }else{
 row187(c,230,'توقف چرخش نمای ۳۶۰',state.freezeOverview?'روشن':'خاموش','حرکت سر فعال می‌ماند؛ برای بررسی شیمر در یک نمای ثابت',hover==='diag:freezeOverview');
 row187(c,350,'ذخیرهٔ نمونه برای مقایسه',d.baseline?'ذخیره شد':'ثبت نمونه','اعداد فعلی و تنظیمات در گزارش عملکرد بازی ثبت می‌شوند',hover==='diag:baseline');
 row187(c,470,'شروع اندازه‌گیری تازه','پاک‌کردن نمونه','نمونهٔ مقایسه و پنجرهٔ فریم‌ها پاک می‌شود',hover==='diag:measure');
 const b=d.baseline?.stats;c.fillStyle='#c9e9df';c.textAlign='center';c.font='24px Vazirmatn';c.fillText(b?'نمونه: FPS '+b.fps.toFixed(1)+' · P95 '+b.p95.toFixed(1)+' ms':'برای شروع، چند ثانیه به صحنه نگاه کن',512,644,950);
 c.fillText('این اعداد زمان‌بندی برنامه‌اند؛ زمان GPU یا FPS نمایشگر نیستند',512,692,960);
 }}
 if(page===0){c.fillStyle='#102d37';c.fillRect(0,712,1024,58);for(const [i,id]of Object.keys(QUALITY157).entries()){const active=hover==='quality:'+id;c.fillStyle=active?'#416b69':api?.quality157===id?'#4d8060':'#20454c';c.fillRect(32+i*244,714,224,52);focus188(c,32+i*244,714,224,52,active);c.fillStyle='#fff';c.textAlign='center';c.font='26px Vazirmatn';c.fillText(QUALITY157[id].label,144+i*244,749,210);}}
 if(page===0&&XR_OPTIONS140.some(row=>row.id===hover))focus188(c,32,230+XR_OPTIONS140.findIndex(row=>row.id===hover)*120,960,108,true);
 if(hover==='reset'||hover==='back')focus188(c,hover==='reset'?32:532,780,460,80,true);
 if(report){c.fillStyle='#102d37';c.fillRect(0,870,1024,154);c.textAlign='center';c.fillStyle='#ffe36b';c.font='24px Vazirmatn';const m=report.stats;
 c.fillText('Hz واقعی: '+(report.actualHz??'—')+' · FPS برنامه: '+(m?m.fps.toFixed(1):'—')+' · '+(report.scope==='office'?'ساختمان':'شهر'),512,904,970);
 c.fillText(m?'میانگین: '+m.mean.toFixed(1)+' ms · P95: '+m.p95.toFixed(1)+' ms · دیررس: '+(m.late===null?'—':m.late.toFixed(1)+'٪'):'در انتظار فریم‌های نشست VR',512,941,970);
 c.fillStyle='#c9e9df';c.font='21px Vazirmatn';c.fillText(report.pendingScale?'وضوح جدید منتظر ورود دوباره به VR است':report.notice||'دیررس: فاصلهٔ فریم بیشتر از ۱٫۵ برابر بودجهٔ نرخ هدست',512,978,970);
 c.fillText('رندر فعال: '+(report.activeScale===null?'—':Math.round(report.activeScale*100)+'٪')+' · ضدلبه: '+(api.antialiasActive===true?'فعال':api.antialiasActive===false?'غیرفعال':'نامشخص'),512,1010,970);}
 if(pointer&&Number.isFinite(pointer.x)&&Number.isFinite(pointer.y)){c.beginPath();c.arc(pointer.x,pointer.y,9,0,Math.PI*2);c.fillStyle='#ffe36b';c.fill();c.strokeStyle='#102d37';c.lineWidth=3;c.stroke();}
}
