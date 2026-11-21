/* Adopt the city's live session. Neither adoption nor release calls session.end(). */
export function createSharedXR119(helper,engine){
 const manager=helper.baseExperience.sessionManager;let borrowed=null,endListener=null,closed=false,loops=[];
 function cleanup(resumeWeb=false){
  const session=borrowed;closed=true;if(!session)return;borrowed=null;
  session.removeEventListener('end',endListener);manager.inXRSession=false;
  session.removeEventListener('inputsourceschange',helper.input._onInputSourcesChange);
  // Before adoption completes, _frameHandler can still be a window-RAF ID.
  // Never pass it to XRSession.cancelAnimationFrame (it can cancel the city's
  // unrelated XR callback). Once the custom XR requester owns it, cancel it
  // exactly once and prevent stopRenderLoop from cancelling in the wrong domain.
  if(engine.customAnimationFrameRequester&&engine._frameHandler){try{session.cancelAnimationFrame(engine._frameHandler);}catch{}engine._frameHandler=0;}
  engine.stopRenderLoop();engine.customAnimationFrameRequester=null;engine.framebufferDimensionsObject=null;
  manager.onXRSessionEnded.notifyObservers(null);
  manager._baseLayerRTTProvider=null;manager._baseLayerWrapper=null;manager.session=null;
  engine.restoreDefaultFramebuffer();if(resumeWeb&&!engine.isDisposed){for(const loop of loops)engine.runRenderLoop(loop);}
 }
 return {
  get session(){return borrowed;},get ended(){return closed;},
  async enter(session){
   if(borrowed)throw Error('ساختمان از قبل در VR است.');if(!session||session.visibilityState==='hidden')throw Error('نشست VR شهر در دسترس نیست.');
   const original=manager.initializeSessionAsync,update=manager.updateRenderState;closed=false;loops=[...engine._activeRenderLoops];manager.updateRenderState=function(state){if(closed)throw Error('ورود به ساختمان لغو شد.');return update.call(this,state);};
   manager.initializeSessionAsync=async(mode)=>{if(closed)throw Error('ورود به ساختمان لغو شد.');borrowed=session;manager.session=session;manager._sessionMode=mode;manager.inXRSession=true;endListener=()=>cleanup(true);session.addEventListener('end',endListener,{once:true});manager.onXRSessionInit.notifyObservers(session);return session;};
   try{if(session.renderState.layers?.length)session.updateRenderState({layers:[]});await helper.baseExperience.enterXRAsync('immersive-vr','local-floor',helper.renderTarget,{optionalFeatures:['local-floor']});
    // A borrowed session has already emitted inputsourceschange in the city.
    // Seed Babylon's controller registry; it only subscribes to future events.
    helper.input._addAndRemoveControllers([...session.inputSources],[]);
    return true;}
   catch(error){cleanup(false);throw error;}
   finally{manager.initializeSessionAsync=original;manager.updateRenderState=update;}
  },
  release(){cleanup(false);}
 };
}
