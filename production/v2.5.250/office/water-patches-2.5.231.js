/* Extend both office entry paths without changing the supplied payload or saved layout. */
(()=>{'use strict';
 const patches=window.OfficePatches97,base=window.OfficeHost97.assetBase;
 function replace(file,before,after){if(!patches[file]?.includes(before))throw Error('Office water integration mismatch: '+file);patches[file]=patches[file].replace(before,after);}
 const moduleURL=new URL('water-cooler-2.5.231.js',new URL(base,location.href)).href;
 patches['game.js']='import {installOfficeWater231} from '+JSON.stringify(moduleURL)+';\n'+patches['game.js'];
 const restore='window.officeDebug.editor.restore97(window.OfficeHost97?.saved?.layout||null);';
 replace('game.js',restore,restore+"\n window.officeDebug.water231=installOfficeWater231({debug:window.officeDebug,office:window.Office97,room:layout,getAudio:()=>audio,getMaster:()=>effects||master,unlockAudio:openAudio});");
 replace('game.js','window.Office97?.frame(dt);','window.Office97?.frame(dt);window.officeDebug?.water231?.update(Math.min(.1,engine.getDeltaTime()/1000));');
 replace('game.js','const targets=[];','const targets=[];const water231=window.officeDebug?.water231?.candidate();if(water231)targets.push(water231);');
 replace('game.js',"$('interactText').textContent=target.kind===", "$('interactText').textContent=target.kind==='water231'?target.label:target.kind===");
 replace('game.js',"if(target.kind==='door'){exitDoor();return;}","if(target.kind==='water231'){window.officeDebug.water231.toggle(target.id);return;}if(target.kind==='door'){exitDoor();return;}");
 replace('game.js','function reset(){pos.x=','function reset(){window.officeDebug?.water231?.reset();pos.x=');
})();
