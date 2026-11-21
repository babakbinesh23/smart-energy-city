const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../admin/media-upload-2.5.225.js'),'utf8');
function harness(mode='ok',storage=new Map(),server={sessions:new Map(),next:1,ops:[],dropped:false}){
 const element=()=>({listeners:{},hidden:false,disabled:false,textContent:'',style:{},addEventListener(name,fn){this.listeners[name]=fn;}});
 const elements={};for(const id of ['form','config','progress','message','pause','reset','refresh'])elements[id]=element();
 const input=element(),submit=element();input.files=[];elements.form.querySelector=s=>s==='[type=file]'?input:submit;
 elements.config.textContent=JSON.stringify({url:'/admin-ajax.php',nonce:'nonce',user:1,catalog:'catalog',maxSize:150*1024*1024});
 let lastXHR;
 class XHR {
  constructor(){this.upload={};lastXHR=this;}
  open(method,url){assert.equal(method,'POST');assert.equal(url,'/admin-ajax.php');}
  send(data){this.data=data;setImmediate(()=>{if(this.aborted)return;const op=data.get('op');server.ops.push(op);const id=data.get('id');let state=server.sessions.get(id),answer;
   if(op==='init'){const next=String(server.next++);state={id:next,offset:0,phase:'upload',index:0,total:3,chunkSize:256*1024};server.sessions.set(next,state);answer={...state};}
   else if(op==='status'){assert(state);answer={...state};}
   else if(op==='chunk'){
    const size=data.get('chunk').size;assert(size<=256*1024);const offset=Number(data.get('offset'));
    if(mode==='413'){this.status=413;this.responseText='<html>too large</html>';this.onload();return;}
    if(offset===state.offset)state.offset+=size;else assert(offset+size<=state.offset,'retry duplicated bytes');
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
 const config={console,Blob,Uint8Array,Intl,FormData,XMLHttpRequest:XHR,JSON,Math,Number,Error,Promise,setTimeout:(fn)=>setTimeout(fn,0),window:{addEventListener(){}},location:{reload(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},document:{getElementById(id){const part=id.match(/bargheto-media-(\w+?)(?:225|-form225|-config225)?$/);if(id==='bargheto-media-form225')return elements.form;if(id==='bargheto-media-config225')return elements.config;return elements[id.replace('bargheto-media-','').replace('225','')];}}};
 vm.runInNewContext(source,config);
 const file=new Blob([new Uint8Array(1100000)]);file.name='media.zip';file.lastModified=123;input.files=[file];
 return {elements,input,submit,storage,server,run:()=>elements.form.listeners.submit({preventDefault(){}})};
}
(async()=>{
 const checks=[];
 for(const mode of ['ok','lost']){const h=harness(mode);await h.run();assert.equal(h.storage.size,0);assert.equal(h.elements.progress.value,100);assert.equal(h.elements.refresh.hidden,false);assert.equal(h.input.disabled,false);assert.equal(h.server.ops.filter(x=>x==='step').length,4);checks.push(mode==='lost'?'Lost chunk response retries without duplicate bytes':'Upload and per-file install finish with visible success');}
 const paused=harness('pause');await paused.run();assert.equal(paused.storage.size,1);assert.equal(paused.input.disabled,false);assert.equal(paused.elements.reset.hidden,false);
 const continued=harness('ok',paused.storage,paused.server);await continued.run();assert.equal(continued.server.ops.filter(x=>x==='init').length,1);assert(continued.server.ops.includes('status'));assert.equal(continued.storage.size,0);checks.push('Pause and page reload resume from server offset');
 const error=harness('413');await error.run();assert(error.elements.message.textContent.includes('413'));assert.equal(error.elements.refresh.hidden,true);assert.equal(error.input.disabled,false);checks.push('HTTP 413 is explained and controls remain usable');
 console.log(JSON.stringify({checks:checks.map(name=>({name,result:'pass'}))},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
