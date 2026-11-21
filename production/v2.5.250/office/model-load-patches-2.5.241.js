// Only the immersive office boot is changed. The immutable supplied payload,
// normal office entry and saved administrator layout stay intact.
(()=>{'use strict';
 const patches=window.OfficePatches97,before="async function loadContainer(id){const c=await OfficeLoadContainer(new Uint8Array(await (await BarghetoOfficeCache99.fetchMedia(new URL(DATA.models[id],window.OfficeHost97.mediaBase))).arrayBuffer()),scene,{pluginExtension:'.glb',name:id+'.glb'});for(const m of c.materials)if(m.maxSimultaneousLights!==undefined)m.maxSimultaneousLights=8;return c;}";
 if(!patches['game.js']?.includes(before))throw Error('Office VR model-loading integration mismatch');
 const url=new URL('model-loader-2.5.241.js',new URL(window.OfficeHost97.assetBase,location.href)).href;
 patches['game.js']='import {loadOfficeModel241} from '+JSON.stringify(url)+';\n'+patches['game.js'].replace(before,"async function loadContainer(id){return loadOfficeModel241({id,url:new URL(DATA.models[id],window.OfficeHost97.mediaBase).href,scene,loadContainer:OfficeLoadContainer,progress:window.Office99Progress});}");
})();
