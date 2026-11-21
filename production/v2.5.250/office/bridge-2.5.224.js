/* Source HTML is immutable; only integration modules are substituted. */
(()=>{'use strict';
 const cfg=Object.freeze({...window.OfficeHost97});window.OfficeHost97=cfg;const parse=JSON.parse;
 JSON.parse=function(text,reviver){const d=parse.call(JSON,text,reviver);if(d?.modules?.['game.js']&&d?.models?.office&&d?.layout?.width===15){for(const [name,code]of Object.entries(window.OfficePatches97))d.modules[name]=code;JSON.parse=parse;window.Office97.sourceObjects=d.objects.length;window.Office97.sourceMedia=Object.keys(d.media?.guideVoices||{});}return d;};
 const api=window.Office97={xrActive:false,helper:null};let debug,xrButton,saveButton,saving=false,saver113=null,revision=cfg.saved?.revision||0,nonce=cfg.nonce,lib,menu,rig,editMode=false,drag=null,turnReady=true;const buttons=new WeakMap();let shared119=null,sharedLeaving119=false;const menuLabels119=[];
 const token=new URLSearchParams(location.search).get('city-host'),embedded=parent!==window&&!!token;
 const message=(type,extra={})=>{if(embedded)parent.postMessage({type,protocol:1,token,...extra},location.origin);};
 let cityMap125=null,pollOffice126=null,navigation127=null,warmLoops127=null;
 let visibilitySession127=null,visibilityHandler127=null;
 const unlockAudio127=()=>{if(api.xrActive)debug.openAudio97();};
 function releaseVisibility127(){if(visibilitySession127){visibilitySession127.removeEventListener('visibilitychange',visibilityHandler127);visibilitySession127.removeEventListener('selectstart',unlockAudio127);}visibilitySession127=visibilityHandler127=null;}
 api.activateWarm127=()=>{if(warmLoops127){for(const loop of warmLoops127)debug.engine.runRenderLoop(loop);warmLoops127=null;}debug.start97();void api.qualityPromise157.then(scheduleXRPreparation).catch(()=>{});};
 // Keep one ready web scene in standby after leaving the office. Its render
 // loop and media stop while the city owns the screen; re-entry resumes it.
 api.suspendWeb99=()=>{if(api.xrActive||!debug?.ready)return false;api.webHUD195?.suspend();debug.pause97();debug.network119?.connect(null);if(!warmLoops127){warmLoops127=[...debug.engine._activeRenderLoops];debug.engine.stopRenderLoop();}return true;};
 // Immersive sessions can suspend window RAF in the embedded document. Borrow
 // the already authorised city's XR clock while its building is loading.
 if(embedded){
  const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),pending=new Map();let next=0,stopped125=false;
  window.requestAnimationFrame=callback=>{if(stopped125)return 0;const id=++next,session=parent.__BARGHETO_CITY87__?.vr?.session;let entry;
   const run=time=>{pending.delete(id);callback(time);};
   if(session)entry={session,handle:session.requestAnimationFrame(run)};else entry={session:null,handle:raf(run)};
   pending.set(id,entry);return id;};
  window.cancelAnimationFrame=id=>{const entry=pending.get(id);if(!entry)return;pending.delete(id);if(entry.session)entry.session.cancelAnimationFrame(entry.handle);else cancel(entry.handle);};
  addEventListener('pagehide',()=>{stopped125=true;for(const id of pending.keys())window.cancelAnimationFrame(id);},{once:true});
 }

 function announce(text){debug?.toast97(text);}
 function exitHost180(){
  try{const office=parent.__BARGHETO_CITY87__?.officeSession;
   if(office?.token===token&&office.frame?.contentWindow===window){office.close();return;}
  }catch(error){console.warn('Office direct return',error);}
  message('bargheto-office-exit');
 }
 async function leave(){endGrab();if(saver113?.pending&&!await saver113.flush()){announce('تغییرها هنوز روی سرور ذخیره نشده‌اند؛ دوباره ذخیره را بزنید.');return;}if(shared119?.session){exitHost180();return;}if(api.xrActive)await api.helper?.baseExperience.exitXRAsync();if(embedded){exitHost180();return;}debug?.pause97();location.assign(cfg.cityUrl);}
 api.leave=leave;
 api.save=()=>saver113?.flush()??Promise.resolve(false);
 api.changed113=()=>{if(cfg.canEdit)saver113?.mark();};
 function mountSave113(){if(!cfg.canEdit)return;
  saver113=BarghetoCommitSave113({canSave:()=>!!debug&&!debug.editor.dragging&&!drag,
   save:async()=>{const body=new URLSearchParams({action:'bargheto_city_office97_save',nonce,revision:String(revision),layout:JSON.stringify(debug.editor.snapshot97())});const response=await fetch(cfg.endpoint,{method:'POST',credentials:'same-origin',cache:'no-store',body});const r=await response.json();if(!response.ok||!r.success)throw Error(r.data?.message||'ذخیره روی سرور انجام نشد.');revision=r.data.revision;nonce=r.data.nonce;},
   onStatus(state,error){saving=state==='saving';if(saveButton){saveButton.disabled=saving;saveButton.textContent=saving?'در حال ذخیره…':state==='error'?'تلاش دوباره برای ذخیره':state==='pending'?'ذخیرهٔ تغییرها':'ذخیرهٔ چیدمان';}if(state==='saved')announce('چیدمان دفتر روی سرور ذخیره شد.');else if(state==='error')announce(error?.message||'ذخیره روی سرور انجام نشد.');}
  });api.saver113=saver113;
  addEventListener('beforeunload',event=>{if(saver113.pending){event.preventDefault();event.returnValue='';}});
 }
 function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;return b;}
 function hideEditor(){if(cfg.canEdit)return;for(const id of ['selectionPanel','editNote']){const e=document.getElementById(id);if(e){e.hidden=true;e.style.display='none';}}const hints=document.getElementById('keyHints');if(hints)hints.innerHTML='<kbd>W A S D</kbd> حرکت · <kbd>E</kbd> تعامل · <kbd>Esc</kbd> توقف';for(const e of document.querySelectorAll('.rules'))for(const n of [...e.childNodes])if(/انتخاب|درگ|جابه‌جا|حذف|کپی/.test(n.textContent))n.remove();}
 api.mount=d=>{debug=d;api.qualityPromise157=import(cfg.assetBase+'../game/dist/assets/quality-2.5.222.js').then(({installOfficeQuality157})=>{let city;try{city=parent.__BARGHETO_CITY87__;}catch{}return city?.quality157?city.quality157.attachOffice(debug,window):installOfficeQuality157(debug,window);});try{parent.__BARGHETO_CITY87__?.performanceDiagnostics155?.attachOffice(debug,window);}catch(error){console.warn('Office performance diagnostics unavailable',error);}const style=document.createElement('style');style.textContent='header{align-items:flex-start}header .toolbar{display:flex;flex-wrap:wrap;max-width:calc(100vw - 230px)}@media(max-width:700px){header{display:flex;flex-direction:column;align-items:stretch;gap:5px}header>div:first-child{justify-content:flex-end}header .toolbar{max-width:none;gap:5px;justify-content:flex-start}header .toolbar button{font-size:10px;padding:6px 8px}#voiceStop,.touch-controls #voiceStop{top:150px}#office97-speed{top:194px!important;right:12px!important}#settings{top:145px}}';style.textContent+='@media(max-width:700px){header{inset:12px 12px auto;justify-content:flex-start}footer{display:none}#selectionPanel{bottom:175px!important;left:12px!important;max-width:calc(100vw - 24px)!important}#office99-voice-tools{top:125px!important;right:12px!important}}';document.head.append(style);
 const bar=document.querySelector('header .toolbar');xrButton=button('ورود VR',enterVR);xrButton.id='office97-vr';xrButton.disabled=true;bar.append(xrButton);if(cfg.canEdit){saveButton=button('ذخیرهٔ چیدمان',()=>api.save());bar.append(saveButton);}mountSave113();hideEditor();mountUndo118();
 // Remove the screenshot's top HUD, preserving the physical entrance door.
 const clean117=document.createElement('style');clean117.textContent='header{display:none!important}#office99-voice-tools{position:static!important;inset:auto!important;justify-content:center;margin-top:12px}';document.head.append(clean117);
 const webControls=document.createElement('style');
 webControls.textContent=`
  footer,#pause{display:none!important}#office119-social:not([hidden]){display:flex!important;left:max(62px,calc(env(safe-area-inset-left) + 62px))!important;top:max(12px,env(safe-area-inset-top))!important;bottom:auto!important;right:auto!important;max-width:calc(100vw - 80px);justify-content:flex-start!important}#office119-social [role=status]{display:none}#office119-social button{border-radius:10px}#office119-social[hidden]{display:none!important}
  @media (hover:none) and (pointer:coarse){
   #office119-social:not([hidden]){
    display:flex!important;left:max(62px,calc(env(safe-area-inset-left) + 62px))!important;
    top:max(12px,env(safe-area-inset-top))!important;bottom:auto!important;right:auto!important;
    flex-wrap:nowrap!important;justify-content:flex-start!important;direction:ltr!important
   }
   #office119-social [role=status]{display:none}
   #office119-social button:first-child{
    width:36px;height:36px;min-height:36px!important;padding:0!important;
    display:grid;position:relative;place-items:center;font-size:0;line-height:0;border-radius:9px
   }
   #office119-social button:first-child::before{
    content:'';width:20px;height:20px;background:currentColor;
    mask:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round'%3E%3Crect x='9' y='2' width='6' height='12' rx='3'/%3E%3Cpath d='M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8'/%3E%3C/svg%3E")
   }
   #office119-social button:first-child:not([aria-pressed=true])::after{
    content:'';position:absolute;left:8px;top:17px;width:20px;height:2px;
    background:currentColor;transform:rotate(45deg);pointer-events:none
   }
   #office119-social button[aria-pressed=true]{background:#186657!important}
  }
 `;
 document.head.append(webControls);
 const gear159=document.getElementById('settingsButton');
 if(gear159){
  gear159.textContent='⚙';gear159.title='تنظیمات';gear159.setAttribute('aria-label','تنظیمات');
  gear159.style.cssText='position:fixed;top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));z-index:12;width:42px;height:42px;font-size:23px;line-height:1;background:#202237;color:white;border:1px solid #ffffff55;border-radius:9px;cursor:pointer';
  document.body.append(gear159);
  const observer159=debug.scene.onBeforeRenderObservable.add(()=>{gear159.hidden=api.xrActive;});
  debug.scene.onDisposeObservable.addOnce(()=>{debug.scene.onBeforeRenderObservable.remove(observer159);gear159.remove();});
 }
 const pauseCard117=document.querySelector('#pause .card');if(pauseCard117)pauseCard117.append(xrButton);if(saveButton)document.querySelector('#selectionPanel')?.append(saveButton);

 const speed=document.createElement('select');speed.id='office97-speed';speed.setAttribute('aria-label','سرعت صدای کارشناس');speed.style.cssText='position:fixed;top:142px;right:24px;z-index:12;background:#202237;color:#fff;border:1px solid #9465ff;border-radius:10px;padding:7px;pointer-events:auto;direction:ltr';for(const rate of [1,1.3,1.5,2])speed.add(new Option(rate+'×',String(rate)));speed.onchange=()=>setRate(Number(speed.value));voiceTools99=document.createElement('div');voiceTools99.id='office99-voice-tools';voiceTools99.hidden=true;voiceTools99.style.cssText='position:fixed;top:96px;right:24px;z-index:18;display:flex;gap:7px;align-items:center';const stop=document.getElementById('voiceStop');stop.style.setProperty('position','static','important');speed.style.setProperty('position','static','important');voiceTools99.append(stop,speed);document.getElementById('settings')?.append(voiceTools99);
 window.__BABYLON_OFFICE__={dispose(){api.releaseSharedXR119();debug.network119?.dispose();saver113?.dispose();debug.voices?.dispose();debug.touch99?.dispose();for(const url of api.blobURLs99||[])URL.revokeObjectURL(url);debug.scene.dispose();debug.engine.dispose();}};mountTalk99();};


 let undoButton118=null;
 function updateUndo118(){if(!undoButton118)return;const depth=debug.editor.undoDepth118||0;undoButton118.hidden=api.xrActive;undoButton118.disabled=!debug.playing||debug.editor.dragging||depth===0;undoButton118.textContent='↶ بازگردانی (Undo)'+(depth?' · '+depth.toLocaleString('fa-IR'):'');}
 function mountUndo118(){if(!cfg.canEdit)return;undoButton118=button('↶ بازگردانی (Undo)',()=>{if(!cfg.canEdit||debug.editor.dragging)return;debug.editor.undo();updateUndo118();});undoButton118.id='office118-undo';undoButton118.title='Ctrl+Z · بازگردانی آخرین تغییر در همین نشست';undoButton118.setAttribute('aria-label','بازگردانی آخرین ویرایش');undoButton118.style.cssText='position:fixed;top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right));z-index:18;padding:8px 12px;min-height:42px;border:1px solid #619e8c;background:#173d43ed;color:#effff8;font:600 12px Vazirmatn,Tahoma,sans-serif';document.body.append(undoButton118);updateUndo118();}
 let talk99=null,vrTalk99=null,lastTalk99='',voiceTools99=null;
 function mountTalk99(){talk99=button('🎙 صحبت',()=>{debug.openAudio97();void debug.voices.toggleCandidate();});talk99.id='office99-talk';talk99.hidden=true;talk99.setAttribute('aria-label','شروع گفت‌وگو با کارشناس نزدیک');document.body.append(talk99);}
 function scheduleXRPreparation(){if(!api.preparePromise99)api.preparePromise99=new Promise(resolve=>setTimeout(resolve,0)).then(prepareVR);}
 api.ready99=async(office,deferStart=false)=>{
  // Wait for the entire game module (including input/state initializers).
  if(deferStart)return;
  if(!deferStart&&!api.webHUD195){
   api.webHUD195Promise??=import(cfg.assetBase+'web-hud-2.5.195.js').then(({installOfficeWebHUD195})=>api.webHUD195=installOfficeWebHUD195(debug,api,cfg));
   try{await api.webHUD195Promise;}catch(error){console.error('Office web controls',error);}
  }
  // The source can report a ready scene before its module has installed the
  // final input handlers. Notify the host now, then start after import ends.
  if(!api.webReady99){
   api.webReady99=true;
   document.documentElement.removeAttribute('data-office99-pending');
   window.Office99Progress?.(1,'ساختمان آماده است');
   message('bargheto-office-ready');
  }
  if(deferStart||api.webActivated99)return;
  api.webActivated99=true;
  window.BarghetoCleanView224?.({canvas:document.getElementById('world'),host:document.body,available:()=>!!debug.ready&&!api.xrActive,onEnter:()=>api.webHUD195?.close(false)});
  if(new URLSearchParams(location.search).get('city-prewarm')==='1'){
   debug.pause97();warmLoops127=[...debug.engine._activeRenderLoops];debug.engine.stopRenderLoop();
  }else debug.start97();
  // Optional settings and XR imports must not delay the web handoff.
  void api.qualityPromise157.then(()=>{if(!warmLoops127)scheduleXRPreparation();}).catch(error=>console.warn('Office quality controls unavailable',error));
 };
 function updateTalk99(){const speed=document.getElementById('office97-speed');if(speed&&Number(speed.value)!==debug.voices.rate)speed.value=String(debug.voices.rate);if(voiceTools99){const hidden=api.xrActive,recording=!!debug.voices.activeId&&['playing','loading','paused','blocked'].includes(debug.voices.status);if(voiceTools99.hidden!==hidden)voiceTools99.hidden=hidden;document.getElementById('voiceStop').hidden=!recording;}const c=debug.voices.getCandidate(),label=c?(debug.voices.activeId===c.id&&debug.voices.status==='playing'?'مکث گفت‌وگو با ':debug.voices.activeId===c.id&&debug.voices.status==='paused'?'ادامهٔ گفت‌وگو با ':'صحبت با ')+(c.id==='eric'?'اریک':c.label):'';if(talk99){const hidden=c?.id!=='eric'||api.xrActive||!!debug.editor.selected;if(talk99.hidden!==hidden)talk99.hidden=hidden;if(talk99.textContent!=='🎙 '+label)talk99.textContent='🎙 '+label;}
 if(vrTalk99){vrTalk99.setEnabled(!!c&&api.xrActive);if(c){const camera=api.helper.baseExperience.camera,head=camera.getWorldMatrix().getTranslation(),dir=camera.getForwardRay().direction;dir.y=0;dir.normalize();vrTalk99.position.copyFrom(head.add(dir.scale(1.4)));vrTalk99.position.y=head.y-.55;vrTalk99.lookAt(head);vrTalk99.rotation.y+=Math.PI;if(label!==lastTalk99){const ctx=vrTalk99.material.diffuseTexture.getContext();ctx.fillStyle='#173b43';ctx.fillRect(0,0,1024,160);ctx.direction='rtl';ctx.textAlign='center';ctx.fillStyle='#f5fff7';ctx.font='bold 46px Tahoma';ctx.fillText(label,512,103,980);vrTalk99.material.diffuseTexture.update(true);lastTalk99=label;}}}}
 function createVRTalk99(){const tex=new lib.DynamicTexture('office99-talk-texture',{width:1024,height:160},debug.scene,false),mat=new lib.StandardMaterial('office99-talk-material',debug.scene);tex.getContext().fillRect(0,0,1024,160);tex.update(true);mat.diffuseTexture=tex;mat.emissiveColor=lib.Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;vrTalk99=lib.MeshBuilder.CreatePlane('office99-talk',{width:1.2,height:.1875,sideOrientation:2},debug.scene);vrTalk99.material=mat;vrTalk99.metadata={officeAction97:()=>{debug.openAudio97();void debug.voices.toggleCandidate();}};vrTalk99.setEnabled(false);}
 function setRate(rate){debug.voices?.setRate(rate);const e=document.getElementById('office97-speed');if(e)e.value=String(rate);}
 function outputOptions142(){try{const quality=parent.__BARGHETO_CITY87__?.vrQuality140;if(quality?.officeOptions142)return quality.officeOptions142(debug.engine.isStencilEnable);}catch{}return debug.quality157.xrOptions(!!debug.engine.isStencilEnable);}
 function refreshOutput142(){const helper=api.helper;if(!helper)return;const options=outputOptions142(),scale=options.canvasOptions.framebufferScaleFactor;if(helper.renderTarget?.edgeScale142===scale)return;const previous=helper.renderTarget;helper.renderTarget=helper.baseExperience.sessionManager.getWebXRRenderTarget(options);helper.renderTarget.edgeScale142=scale;previous?.dispose();}
 async function prepareVR(){try{await api.qualityPromise157;if(!isSecureContext||!navigator.xr||!await navigator.xr.isSessionSupported('immersive-vr')){xrButton.textContent='VR: هدست متصل نیست';xrButton.title='برای VR از هدست و مرورگر سازگار در HTTPS استفاده کنید.';return;}
 lib=await import(cfg.assetBase+'xr-babylon-8.46.2.js');lib.installEngineExtensions97(debug.engine);
 const helper=await lib.WebXRDefaultExperience.CreateAsync(debug.scene,{outputCanvasOptions:outputOptions142(),disableDefaultUI:true,ignoreNativeCameraTransformation:true,disableTeleportation:true,disableNearInteraction:true,disableHandTracking:true,inputOptions:{doNotLoadControllerMeshes:true,disableOnlineControllerRepository:true},pointerSelectionOptions:{enablePointerSelectionOnAllControllers:true}});if(!helper.baseExperience)throw Error('راه‌اندازی VR انجام نشد');api.helper=helper;debug.quality157.setXRHelper(helper);helper.renderTarget.edgeScale142=outputOptions142().canvasOptions.framebufferScaleFactor;try{const detach=parent.__BARGHETO_CITY87__?.vrQuality140?.attachOffice(debug,helper);if(detach)debug.scene.onDisposeObservable.addOnce(detach);}catch{}rig=new lib.TransformNode('office97-xr-origin',debug.scene);
 helper.baseExperience.onInitialXRPoseSetObservable.add(c=>{rig.position.set(debug.pos.x,0,debug.pos.z);rig.rotation.y=debug.yaw+Math.PI;c.parent=rig;c.position.set(0,0,0);c.rotationQuaternion=lib.Quaternion.Identity();if(!shared119){let done=false;const manager=helper.baseExperience.sessionManager,observer=manager.onXRFrameObservable.add(frame=>{if(done)return;const pose=frame.getViewerPose(manager.referenceSpace);if(!pose)return;done=true;rig.position.y=1.74-pose.transform.position.y;manager.onXRFrameObservable.remove(observer);});}});
 helper.baseExperience.onStateChangedObservable.add(state=>{if(state===0)api.xrActive=true;if(state===2)showMenu(false);if(state===3){const xr=helper.baseExperience.camera,f=xr.getForwardRay().direction;debug.look(Math.atan2(f.x,f.z),0);xr.parent=null;api.xrActive=false;cityMap125?.close();endGrab();menu?.setEnabled(false);xrButton.textContent='ورود VR';debug.camera.position.set(debug.pos.x,debug.pos.y+1.72,debug.pos.z);debug.scene.activeCamera=debug.camera;debug.pause97();}});
 helper.baseExperience.sessionManager.onXRSessionInit.add(session=>{releaseVisibility127();visibilitySession127=session;visibilityHandler127=()=>{if(session.visibilityState==='hidden')debug.pause97();else debug.start97();};session.addEventListener('visibilitychange',visibilityHandler127);session.addEventListener('selectstart',unlockAudio127);});buildMenu();createVRTalk99();const {createOfficeMap125}=await import(cfg.assetBase+'vr-map-2.5.165.js');({pollOfficeButtons126:pollOffice126}=await import(cfg.assetBase+'xr-input-2.5.127.js'));cityMap125=createOfficeMap125(debug,lib,()=>api.helper.baseExperience.camera,message,()=>showMenu(false));
 const {createOfficeNavigation127}=await import(cfg.assetBase+'navigation-2.5.127.js');navigation127=createOfficeNavigation127(debug,lib,()=>rig,()=>api.helper.baseExperience.camera,rayFor,()=>cityMap125);xrButton.disabled=false;api.prepared=true;
 }catch(e){api.prepareError=String(e.message||e);console.error('Office VR',e);xrButton.textContent='VR در دسترس نیست';xrButton.title=api.prepareError;}}
 async function enterVR(){if(!api.helper)return;if(api.xrActive&&api.helper.baseExperience.state===2){await api.helper.baseExperience.exitXRAsync();return;}try{debug.quality157.beginXR();refreshOutput142();debug.start97();api.xrActive=true;await api.helper.baseExperience.enterXRAsync('immersive-vr','local-floor',api.helper.renderTarget,{optionalFeatures:['local-floor']});xrButton.textContent='خروج VR';}catch(e){api.xrActive=false;api.enterError=String(e.message||e);console.error('Office VR enter',e);announce('ورود VR انجام نشد: '+api.enterError);}}

 api.connectCity119=adapter=>{api.activateWarm127();debug.network119.connect(adapter);};
 api.enterSharedXR119=async session=>{await api.preparePromise99;if(!api.helper)throw Error('راه‌اندازی VR ساختمان انجام نشد.');refreshOutput142();debug.start97();api.xrActive=true;sharedLeaving119=false;shared119=window.Office119Shared(api.helper,debug.engine);let aligned125=false;await shared119.enter(session);const poseEvents125=api.helper.baseExperience.sessionManager.onXRFrameObservable;const poseObserver125=poseEvents125.add(frame=>{if(sharedLeaving119||aligned125){poseEvents125.remove(poseObserver125);return;}const pose=frame.getViewerPose(api.helper.baseExperience.sessionManager.referenceSpace);if(!pose)return;aligned125=true;poseEvents125.remove(poseObserver125);const p=pose.transform.position,q=pose.transform.orientation,fx=-2*(q.x*q.z+q.w*q.y),fz=-(1-2*(q.x*q.x+q.y*q.y)),angle=debug.yaw-Math.atan2(fx,fz),c=Math.cos(angle),s=Math.sin(angle);rig.rotation.y=angle;rig.position.set(debug.pos.x-p.x*c-p.z*s,1.74-p.y,debug.pos.z+p.x*s-p.z*c);const head=api.helper.baseExperience.camera;head.position.set(p.x,p.y,p.z);head.rotationQuaternion.set(q.x,q.y,q.z,q.w);rig.computeWorldMatrix(true);head.getViewMatrix(true);showMenu(false);});};
 api.releaseSharedXR119=()=>{sharedLeaving119=true;releaseVisibility127();cityMap125?.close();navigation127?.hide();shared119?.release();shared119=null;api.xrActive=false;};
 function rayFor(source){const controller=api.helper.input.controllers.find(c=>c.inputSource===source);if(controller){const ray=new lib.Ray(lib.Vector3.Zero(),lib.Vector3.Forward(),30);controller.getWorldPointerRayToRef(ray);return ray;}return api.helper.baseExperience.camera.getForwardRay(30);}
 function selectXR(event){if(!api.xrActive)return;const ray=rayFor(event.inputSource);if(cityMap125?.opened){cityMap125.selectRay(ray);return;}const hit=debug.scene.pickWithRay(ray,m=>m.isPickable&&m.isEnabled()&&m.isVisible);if(hit?.pickedMesh?.metadata?.officeAction97){hit.pickedMesh.metadata.officeAction97(hit);return;}const r=debug.editor.owner97(hit?.pickedMesh);if(editMode&&cfg.canEdit){debug.editor.selectById(r?.id);return;}if(r?.asset==='door'){debug.exitDoor97?.();return;}if(r?.asset==='standing-fan')debug.toggleFan(r,true);else if(r?.asset==='television')debug.toggleTelevision(true);else navigation127?.select(ray,hit);}
 function startGrab(event){if(!cfg.canEdit||!editMode||!debug.editor.selected)return;const state=debug.editor.beginXR97(),ray=rayFor(event.inputSource),p=debug.editor.selected.node.getAbsolutePosition();if(!state)return;const distance=Math.max(.3,Math.min(8,lib.Vector3.Distance(ray.origin,p)));drag={state,source:event.inputSource,start:ray.origin.add(ray.direction.scale(distance)),distance};}
 function endGrab(){if(drag){debug.editor.endXR97(drag.state);drag=null;}}
 function showMenu(show){if(!menu)return;menu.setEnabled(show);if(!show)return;const c=api.helper.baseExperience.camera,f=c.getForwardRay().direction,p=c.getWorldMatrix().getTranslation();f.y=0;f.normalize();menu.position.copyFrom(p.add(f.scale(1.5)));menu.position.y=p.y-.05;menu.lookAt(p);menu.rotation.y+=Math.PI;}

 let graphPlane155=null,graphTexture155=null,nextGraph155=0;
 function updateGraph155(){
  try{
   const diagnostics=embedded?parent.__BARGHETO_CITY87__?.performanceDiagnostics155:null;
   const source=diagnostics?.isRecording()&&diagnostics.graphCanvas();
   if(!api.xrActive||!source||!lib||!api.helper){graphPlane155?.setEnabled(false);return;}
   if(!graphPlane155){
    graphTexture155=new lib.DynamicTexture('office-admin-chart155',{width:1000,height:360},debug.scene,false);
    const material=new lib.StandardMaterial('office-admin-chart-material155',debug.scene);material.diffuseTexture=graphTexture155;material.emissiveColor=lib.Color3.White();material.disableLighting=true;material.backFaceCulling=false;material.disableDepthWrite=true;
    graphPlane155=lib.MeshBuilder.CreatePlane('office-admin-chart155',{width:.9,height:.324},debug.scene);graphPlane155.material=material;graphPlane155.isPickable=false;graphPlane155.renderingGroupId=3;graphPlane155.alwaysSelectAsActiveMesh=true;graphPlane155.position.set(0,-.48,1.5);
   }
   graphPlane155.parent=api.helper.baseExperience.camera;graphPlane155.setEnabled(true);
   if(performance.now()>=nextGraph155){nextGraph155=performance.now()+250;diagnostics.refreshGraph();const context=graphTexture155.getContext();context.drawImage(source,0,0,1000,360);graphTexture155.update(false);}
  }catch{graphPlane155?.setEnabled(false);}
 }
 function buildMenu(){const {TransformNode,MeshBuilder,StandardMaterial,DynamicTexture,Color3}=lib;menu=new TransformNode('office97-vr-menu',debug.scene);const actions=[['ادامهٔ بازدید',()=>{debug.start97();showMenu(false);}],['تعامل / صحبت',()=>debug.interact()],['سرعت صدا',()=>{const rates=[1,1.3,1.5,2];setRate(rates[(rates.indexOf(debug.voices.rate)+1)%4]);}],['بازگشت به شهر',leave],['خروج VR',()=>api.helper.baseExperience.exitXRAsync()],[()=>debug.network119?.micLabel||'میکروفن',()=>debug.network119?.toggleMicrophone()],['شنیدن صدای کاربران',()=>debug.network119?.resumePlayback()]];
 actions.push(['تنظیمات تصویر',()=>cityMap125?.openSettings()]);
 if(embedded&&parent.__BARGHETO_CITY87__?.performanceRecorder?.allowed)actions.push([()=>{const recorder=parent.__BARGHETO_CITY87__?.performanceRecorder;return recorder?.recording?'ثبت گزارش: '+recorder.remainingSeconds+' ثانیه':'ثبت عملکرد ۶۰ ثانیه';},()=>parent.__BARGHETO_CITY87__?.performanceRecorder?.start()]);
 if(cfg.canEdit)actions.push(['ویرایش: انتخاب با تریگر',()=>{editMode=!editMode;showMenu(false);announce(editMode?'تریگر: انتخاب؛ نگه‌داشتن گریپ: جابه‌جایی':'بازدید فعال');}],['کپی',()=>debug.editor.copy()],['چسباندن',()=>{const ray=api.helper.baseExperience.camera.getForwardRay(3);debug.editor.setTarget(ray.origin.add(ray.direction.scale(2)),null);debug.editor.paste();}],['حذف',()=>debug.editor.remove()],['بازگردانی',()=>debug.editor.undo()],['ذخیرهٔ چیدمان',()=>api.save()]);
 actions.forEach(([label,action],i)=>{const plane=MeshBuilder.CreatePlane('office97-menu-'+i,{width:.68,height:.105,sideOrientation:2},debug.scene);plane.parent=menu;plane.position.set((i%2?-.36:.36),.32-Math.floor(i/2)*.125,0);const tex=new DynamicTexture('office97-label-'+i,{width:768,height:128},debug.scene,false);const c=tex.getContext();c.fillStyle='#172335';c.fillRect(0,0,768,128);c.strokeStyle='#a588ff';c.lineWidth=5;c.strokeRect(2,2,764,124);c.fillStyle='#fff';c.font='bold 38px Tahoma';c.textAlign='center';c.direction='rtl';c.fillText(typeof label==='function'?label():label,384,80);tex.update(true);if(typeof label==='function')menuLabels119.push({label,c,tex,last:label()});const mat=new StandardMaterial('office97-menu-material-'+i,debug.scene);mat.diffuseTexture=tex;mat.emissiveColor=Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;plane.material=mat;plane.metadata={officeAction97:action};});menu.setEnabled(false);}
 api.frame=dt=>{updateGraph155();for(const m of menuLabels119){const text=m.label();if(text===m.last)continue;m.last=text;m.c.fillStyle='#172335';m.c.fillRect(6,6,756,116);m.c.fillStyle='#fff';m.c.fillText(text,384,80,740);m.tex.update(true);}updateUndo118();updateTalk99();if(!api.xrActive||!api.helper||api.helper.baseExperience.state!==2)return;const camera=api.helper.baseExperience.camera,head=camera.getWorldMatrix().getTranslation(),facing=camera.getForwardRay().direction;debug.look(Math.atan2(facing.x,facing.z),Math.asin(Math.max(-1,Math.min(1,facing.y))));let dx=head.x-debug.pos.x,dz=head.z-debug.pos.z;
 for(const c of api.helper.input.controllers){const pad=c.inputSource.gamepad;if(!pad)continue;const a=pad.axes,x=a.length>=4?a[2]:a[0]||0,y=a.length>=4?a[3]:a[1]||0;
 if(!cityMap125?.opened&&c.inputSource.handedness==='left'){const f=camera.getForwardRay().direction;f.y=0;f.normalize();const sx=Math.abs(x)>.18?x:0,sy=Math.abs(y)>.18?-y:0;dx+=(f.x*sy-f.z*sx)*1.8*dt;dz+=(f.z*sy+f.x*sx)*1.8*dt;}else if(!cityMap125?.opened&&c.inputSource.handedness==='right'){if(Math.abs(x)<.3)turnReady=true;if(turnReady&&Math.abs(x)>.65){const before=camera.getWorldMatrix().getTranslation();rig.rotation.y-=Math.sign(x)*Math.PI/6;rig.computeWorldMatrix(true);camera.getViewMatrix(true);const after=camera.getWorldMatrix().getTranslation();rig.position.x+=before.x-after.x;rig.position.z+=before.z-after.z;turnReady=false;}}
 pollOffice126?.(c,buttons,{map:()=>cityMap125?.toggle(),select:inputSource=>selectXR({inputSource}),menu:()=>{cityMap125?.close();showMenu(!menu.isEnabled());}});}
 const currentHead=camera.getWorldMatrix().getTranslation();debug.move97(dx,dz);rig.position.x+=debug.pos.x-currentHead.x;rig.position.z+=debug.pos.z-currentHead.z;debug.pos.y=0;
 rig.computeWorldMatrix(true);camera.getViewMatrix(true);navigation127?.update(api.helper.input.controllers.find(c=>c.inputSource.handedness==='right')||api.helper.input.controllers[0]);
 if(drag){const ray=rayFor(drag.source),p=ray.origin.add(ray.direction.scale(drag.distance));debug.editor.moveXR97(drag.state,p.subtract(drag.start));}};
 addEventListener('pagehide',()=>debug?.voices?.pause());
})();
