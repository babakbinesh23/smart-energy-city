const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../admin/media-upload-2.5.229.js'),'utf8');
function harness(mode='ok',storage=new Map(),server={sessions:new Map(),next:1,ops:[],dropped:false,sizes:[],accepted:[]},fileSize=1100000){
 const element=()=>({listeners:{},hidden:false,disabled:false,textContent:'',style:{},addEventListener(name,fn){this.listeners[name]=fn;}});
 const elements={};for(const id of ['form','config','progress','message','pause','reset','refresh'])elements[id]=element();
 const input=element(),submit=element();input.files=[];elements.form.querySelector=s=>s==='[type=file]'?input:submit;
 elements.config.textContent=JSON.stringify({url:'/admin-ajax.php',nonce:'nonce',user:1,catalog:'catalog',maxSize:150*1024*1024});
 elements.message.history=[];let lastMessage='';Object.defineProperty(elements.message,'textContent',{get:()=>lastMessage,set(value){lastMessage=value;elements.message.history.push(value);}});
 let lastXHR,clock=0;
 class XHR {
  constructor(){this.upload={};lastXHR=this;}
  open(method,url){assert.equal(method,'POST');assert.equal(url,'/admin-ajax.php');}
  send(data){this.data=data;setImmediate(()=>{if(this.aborted)return;clock+=100;const op=data.get('op');server.ops.push(op);const id=data.get('id');let state=server.sessions.get(id),answer;
   if(op==='init'){const next=String(server.next++);state={id:next,offset:0,phase:mode==='ready'?'done':'upload',alreadyReady:mode==='ready',index:0,total:3,chunkSize:mode==='small'?256*1024:8*1024*1024};server.sessions.set(next,state);answer={...state};}
   else if(op==='status'){assert(state);answer={...state};}
   else if(op==='chunk'){
    const size=data.get('chunk').size;assert(size<=state.chunkSize);server.sizes.push(size);const offset=Number(data.get('offset'));
    if(mode==='413'||mode==='proxy'&&size>512*1024){this.status=413;this.responseText='<html>too large</html>';this.onload();return;}
    if(offset===state.offset){state.offset+=size;server.accepted.push(size);}else assert(offset+size<=state.offset,'retry duplicated bytes');
    if(mode==='lost'&&!server.dropped){server.dropped=true;this.onerror();return;}
    if(mode==='pause'&&!server.dropped){server.dropped=true;elements.pause.listeners.click();return;}
    this.upload.onprogress?.({lengthComputable:true,loaded:size,total:size});answer={offset:state.offset};
   }else if(op==='prepare'){state.phase='install';answer={...state};}
   else if(op==='step'){if(state.index<state.total){state.index++;answer={index:state.index,total:state.total,done:false};}else{state.phase='done';answer={index:state.index,total:state.total,done:true};}}
   else if(op==='ack'||op==='cancel'){server.sessions.delete(id);answer={removed:true};}
   else throw Error(op);
   this.status=200;this.responseText=JSON.stringify({success:true,data:answer});this.onload();
  });}
  abort(){this.aborted=true;this.onabort();}
 }
 const config={console,Blob,Uint8Array,Intl,FormData,XMLHttpRequest:XHR,performance:{now:()=>clock},JSON,Math,Number,Error,Promise,setTimeout:(fn)=>setTimeout(fn,0),window:{addEventListener(){}},location:{reload(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{getElementById(id){const part=id.match(/bargheto-media-(\w+?)(?:225|-form225|-config225)?$/);if(id==='bargheto-media-form225')return elements.form;if(id==='bargheto-media-config225')return elements.config;return elements[id.replace('bargheto-media-','').replace('225','')];}}};
 vm.runInNewContext(source,config);
 const file=new Blob([new Uint8Array(fileSize)]);file.name='media.zip';file.lastModified=123;input.files=[file];
 return {elements,input,submit,storage,server,run:()=>elements.form.listeners.submit({preventDefault(){}})};
}
(async()=>{
 const checks=[];const ready=harness('ready');await ready.run();assert(!ready.server.ops.includes('chunk'));assert(ready.elements.message.textContent.includes('نیازی به آپلود دوباره'));checks.push('Healthy already-installed media skip the entire upload');
 for(const mode of ['ok','lost']){const h=harness(mode);await h.run();assert.equal(h.storage.size,0);assert.equal(h.elements.progress.value,100);assert.equal(h.elements.refresh.hidden,false);assert.equal(h.input.disabled,false);assert.equal(h.server.ops.filter(x=>x==='step').length,4);checks.push(mode==='lost'?'Lost chunk response retries without duplicate bytes':'Upload and per-file install finish with visible success');}
 const paused=harness('pause');await paused.run();assert.equal(paused.storage.size,1);assert.equal(paused.input.disabled,false);assert.equal(paused.elements.reset.hidden,false);
 const continued=harness('ok',paused.storage,paused.server);await continued.run();assert.equal(continued.server.ops.filter(x=>x==='init').length,1);assert(continued.server.ops.includes('status'));assert.equal(continued.storage.size,0);checks.push('Pause and page reload resume from server offset');
 const bulk=harness('ok',new Map(),undefined,85015639);await bulk.run();assert.equal(bulk.server.accepted.length,12);assert.equal(Math.max(...bulk.server.accepted),8*1048576);assert.equal(bulk.server.accepted.reduce((a,b)=>a+b,0),85015639);assert(bulk.elements.message.history.some(text=>text.includes('سرعت مؤثر:')));assert(!bulk.elements.message.history.some(text=>/NaN|Infinity/.test(text)));checks.push('85 MB adaptive transfer uses 12 requests rather than 325 fixed 256 KiB requests');
 const limited=harness('small');await limited.run();assert(limited.server.accepted.every(n=>n<=256*1024));checks.push('Small server limits stay respected');
 const proxy=harness('proxy');await proxy.run();assert.equal(proxy.storage.size,0);assert(proxy.server.accepted.every(n=>n<=512*1024));assert.equal(proxy.server.sizes.filter(n=>n>512*1024).length,2);checks.push('Proxy HTTP 413 reduces chunk ceiling automatically and finishes without restarting');
 const error=harness('413');await error.run();assert(error.elements.message.textContent.includes('413'));assert.equal(error.elements.refresh.hidden,true);assert.equal(error.input.disabled,false);checks.push('HTTP 413 is explained and controls remain usable');
 console.log(JSON.stringify({checks:checks.map(name=>({name,result:'pass'}))},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
