export function createContext82(canvas,isFirefox){
 const base={alpha:false,depth:true,stencil:false,preserveDrawingBuffer:false,failIfMajorPerformanceCaveat:false};
 for(const options of [{...base,antialias:!isFirefox,powerPreference:isFirefox?'default':'high-performance'},{...base,antialias:false,powerPreference:'default'}]){
  try{const gl=canvas.getContext('webgl2',options);if(gl)return gl;}catch(error){console.warn('WebGL2 context attempt failed',error);}
 }
 const error=new Error('WEBGL_UNAVAILABLE: ایجاد WebGL2 در این مرورگر ممکن نشد.');error.code='WEBGL_UNAVAILABLE';throw error;
}
export function installShaderBoundary82(renderer){
 renderer.debug.onShaderError=(gl,program,vertex,fragment)=>{
  const source=gl.getShaderSource(fragment)||'',post=source.includes('uVignette')||source.includes('uPrefilter')||source.includes('tSource')&&source.includes('uRadius');
  const error=new Error((gl.getProgramInfoLog(program)||gl.getShaderInfoLog(fragment)||'WebGL shader compilation failed').slice(0,1400));error.code=post?'POST_SHADER':'SCENE_SHADER';throw error;
 };
}
export function attachFrameBoundary82(game){
 const frame=game.frame;
 game.frame=(...args)=>{if(game.frameFailed82)return;try{return frame(...args);}catch(error){if(game.xrRecovery240?.frameError(error))return;game.frameFailed82=true;console.error('City frame stopped',error);window.barghetoStartup82?.report(error,'FRAME_EXCEPTION');if(!window.barghetoStartup82){game.renderer.webgl.setAnimationLoop(null);game.overlay.showError(error);}}};
 window.barghetoStartup82?.bind(game);window.barghetoStartup82?.watchCanvas(game.renderer.canvas);
}
// First-time visitors register before the cinematic; returning visitors can start the overview.
export function installOverviewEntry82(game,hasPreviousRegistration){
 const overview=game.cinematic;
 if(hasPreviousRegistration())game.overlay.admitted=true;
 // Retain an admission guard for replays or a session that has lost its admission state.
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='بازگشت به نمای شهر';cancel.className='guest-entry';cancel.hidden=true;game.overlay.start.querySelector('.card').appendChild(cancel);
 cancel.addEventListener('click',()=>{game.awaitingOverviewAdmission82=false;game.pendingOverviewEntry82=null;cancel.hidden=true;game.overlay.show('none');game.paused=false;game.manualPause=false;game.time.resetAccumulator();overview.setSuspended(false);});
 overview.beforeEntry=selection=>{
  if(game.overlay.admitted)return true;
  game.pendingOverviewEntry82=selection??null;game.awaitingOverviewAdmission82=true;game.paused=true;game.input.clear();overview.setSuspended(true);game.overlay.show('start');cancel.hidden=false;return false;
 };
 game.overlay.onPlay(()=>{
  if(!game.overlay.admitted)return;
  if(game.awaitingOverviewAdmission82){
   cancel.hidden=true;const selection=game.pendingOverviewEntry82;game.awaitingOverviewAdmission82=false;game.pendingOverviewEntry82=null;game.overlay.show('none');game.paused=false;game.manualPause=false;game.time.resetAccumulator();overview.setSuspended(false);overview.requestEntry(selection);return;
  }
  if(overview.active||game.enteredCity)game.resume();else game.beginCinematic();
 });
}
