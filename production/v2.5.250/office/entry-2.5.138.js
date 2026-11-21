/* Loaded only for a city-xr=1 office. The web/mobile integration stays on 127. */
(()=>{
 const api=window.OfficeVR128={};
 api.ready=async scene=>{const {waitOfficeScene131}=await import(window.OfficeHost97.assetBase+'readiness-2.5.138.js');await waitOfficeScene131(scene,{progress:window.Office99Progress});};
 const patches=window.OfficePatches97;
 function replace(file,from,to){if(!patches[file]?.includes(from))throw Error('Office VR 128 patch mismatch: '+file);patches[file]=patches[file].replace(from,to);}
 replace('game.js','await scene.whenReadyAsync(true);','await window.OfficeVR128.ready(scene);');
 replace('game.js',"document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});", "document.addEventListener('visibilitychange',()=>{if(document.hidden&&!window.Office97?.xrActive)pause();});");
 // A warm XR entry already has a live session: the helper is built after the
 // document has evaluated, rather than delaying its ready handshake.
 // Six nearest ceiling fixtures plus the shared bounce/shadow lights need all
 // eight slots. The old four-slot cap dropped lights in some parts of the room.
 replace('game.js','lightTarget=.45,lightCurrent=.45','lightTarget=.60,lightCurrent=.60');
 replace('game.js','scene.__updateOfficeDim=()=>applyDim(lightCurrent);', "scene.__updateOfficeDim=()=>applyDim(lightCurrent);$('dimmer').value='60';$('percent').textContent='۶۰٪';");
 replace('game.js','audio??=new(window.AudioContext||window.webkitAudioContext)();','audio??=window.Office97.getAudioContext128?.()||new(window.AudioContext||window.webkitAudioContext)();');
 replace('game.js','if(!television.powered)openAudio();television.togglePower();','if(television.powered&&television.needsGesture){openAudio();void television.unlock();updateInteractionUI();return;}if(!television.powered)openAudio();television.togglePower();');
 replace('game.js','scene.onDisposeObservable.add(()=>{voices?.dispose();ericSpeech?.dispose();});', `scene.onDisposeObservable.add(()=>{voices?.dispose();ericSpeech?.dispose();for(const f of fans.values()){for(const key of ['noise','motor'])try{f.sound?.[key]?.stop();}catch{}for(const n of Object.values(f.sound||{}))try{n?.disconnect?.();}catch{}}effects?.disconnect();master?.disconnect();});`);
 replace('department-voices.js',"let bus=null,", "let pointed128=false;let bus=null,");
 replace('department-voices.js','function target(){if(!desired)return 0;', 'function target(){if(!desired)return 0;if(pointed128&&window.Office97?.xrActive)return canSelect129(desired)?1:0;');
 replace('department-voices.js','function stop(){++token;', 'function stop(){pointed128=false;++token;');
 replace('department-voices.js','function resume(){', `async function playPointed128(id){
  if(!canSelect129(id))return false;
  pointed128=true;manual=false;
  if(id===desired&&status==='playing')return true;
  return play(id,id===desired&&status!=='ended'?offset:positions.get(id)||0);
 }
 function resume(){`);
 replace('department-voices.js','function target(){', `function canSelect129(id){return !disposed&&getPlaying()&&has(id)&&distance(id)<=3;}
 function target(){`);
 replace('department-voices.js','function update(dt=.1){if(disposed)return;', `function update(dt=.1){if(disposed)return;
 if(pointed128&&window.Office97?.xrActive&&desired&&!canSelect129(desired)){manual=true;pause('distance');return;}`);
 replace('department-voices.js','toggleGuide,toggleTopic,togglePointed127:', 'canSelect129,playPointed128,toggleGuide,toggleTopic,togglePointed127:');
})();
