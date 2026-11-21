/* Apply the same device behavior to the web/mobile and VR source variants. */
(()=>{'use strict';
 const patches=window.OfficePatches97,base=window.OfficeHost97.assetBase;
 function replace(before,after){const source=patches['game.js'];if(!source?.includes(before))throw Error('Office device integration mismatch: '+before.slice(0,70));patches['game.js']=source.replace(before,after);}
 const url=new URL('devices-2.5.232.js',new URL(base,location.href)).href;
 patches['game.js']='import {stepFan232,installOfficeDevices232} from '+JSON.stringify(url)+';\n'+patches['game.js'];
 replace('on:true,blades:', 'on:true,speed232:1,blades:');
 const oldRotation='if(playing){  for(const f of fans.values())if(f.on&&!f.record.deleted&&f.record.node.isEnabled())for(const n of f.blades){if(n.rotationQuaternion)n.rotationQuaternion.multiplyInPlace(n.rotationQuaternion.constructor.RotationAxis(new Vector3(0,0,1),dt*13.5));else n.rotation.z+=dt*13.5;}}';
 replace(oldRotation,'if(playing){for(const f of fans.values()){if(!activeFan(f))continue;const angle232=stepFan232(f,Math.min(.1,engine.getDeltaTime()/1000));if(angle232>0)for(const n of f.blades){if(n.rotationQuaternion)n.rotationQuaternion.multiplyInPlace(n.rotationQuaternion.constructor.RotationAxis(new Vector3(0,0,1),angle232));else n.rotation.z+=angle232;}}}');
 replace('const gain=playing&&f.on&&activeFan(f)?fade:0;','const gain=playing&&activeFan(f)?fade*(f.speed232??Number(f.on)):0;');
 replace('toggleFan,toggleTelevision,refreshFps:', 'toggleFan,toggleTelevision,toggleLift232,refreshFps:');
 const restore='window.officeDebug.editor.restore97(window.OfficeHost97?.saved?.layout||null);';
 replace(restore,restore+'\n window.officeDebug.devices232=installOfficeDevices232({debug:window.officeDebug,office:window.Office97,toggleLift:toggleLift232,getAudio:()=>audio,getMaster:()=>effects||master});');
 replace('function interact(){',`function toggleLift232(){
  if(!ready||!playing||!window.officeDebug?.liftRoot.isEnabled())return false;
  const lift=liftPosition();if(pos.z<=lift.z-1.35||pos.z>=lift.z+2.5||Math.abs(pos.x-lift.x)>=1.9||Math.abs(pos.y-lift.y)>1.45){toast('برای زدن دکمهٔ آسانسور نزدیک‌تر شو.');return false;}
  if(doorTarget>0&&Math.abs(pos.z-lift.z)<.45&&Math.abs(pos.x-lift.x)<1.15){toast('ابتدا از مسیر در فاصله بگیر.');return false;}
  openAudio();doorTarget=doorTarget?0:1;updateInteractionUI();toast(doorTarget?'در آسانسور باز می‌شود.':'در آسانسور بسته می‌شود.');return true;
 }
 function interact(){`);
 replace("if(target.kind==='lift'){if(doorTarget>0&&Math.abs(pos.z-liftPosition().z)<.45){toast('ابتدا از مسیر در فاصله بگیر.');return;}doorTarget=doorTarget?0:1;updateInteractionUI();toast(doorTarget?'در آسانسور باز می‌شود.':'در آسانسور بسته می‌شود.');return;}","if(target.kind==='lift'){toggleLift232();return;}");
 replace('if(doorGroup){doorGroup.goToFrame(doorGroup.from+doorAmount*2.8*60);}', 'if(doorGroup){doorGroup.goToFrame(doorGroup.from+doorAmount*2.8*60);}window.officeDebug?.devices232?.updateDoor(doorAmount,doorTarget);');
 replace('function pause(){','function pause(){window.officeDebug?.devices232?.stopSound();');
})();
