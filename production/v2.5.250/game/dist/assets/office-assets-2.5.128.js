// VR preloads bytes, not a second WebGL scene on the Quest GPU.
export function installOfficeAssets128(game){
 let payload=null,loaded=null,ready=false,audio=null;
 const gesture=game.vr.onUserGesture;
 game.vr.onUserGesture=function(...args){gesture?.apply(this,args);try{audio??=new(window.AudioContext||window.webkitAudioContext)();void audio.resume().catch(()=>{});}catch{}};
 game.disposers.push(()=>{game.vr.onUserGesture=gesture;if(audio)setTimeout(()=>{void audio.close().catch(()=>{});},0);});
 const cfg=()=>window.barghetoOffice;
 async function getPayload(){
  if(payload)return payload;
  payload=(async()=>{const c=cfg(),bytes=await BarghetoOfficeCache99.getSource(c),html=new TextDecoder().decode(bytes),match=/<script id="payload"[^>]*>([\s\S]*?)<\/script>/.exec(html);if(!match)throw Error('Office payload missing');
   const raw=Uint8Array.from(atob(match[1].trim()),c=>c.charCodeAt(0));return JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  })().catch(error=>{payload=null;throw error;});return payload;
 }
 function prefetch(){
  if(loaded)return loaded;
  loaded=(async()=>{const data=await getPayload(),urls=Object.values(data.models).map(v=>new URL(v,cfg().mediaBase).href);let index=0;
   const worker=async()=>{while(index<urls.length){const r=await BarghetoOfficeCache99.fetchMedia(urls[index++]);await r.arrayBuffer();}};
   await Promise.all([worker(),worker()]);ready=true;return true;
  })().catch(error=>{loaded=null;console.warn('Office VR preload',error);return false;});return loaded;
 }
 return game.officeAssets128={getPayload,prefetch,getAudio:()=>audio,get ready(){return ready;}};
}
