// Local, administrator-only diagnostics. No network requests or quality changes.
const now=()=>performance.now();
const round=n=>Number.isFinite(n)?Math.round(n*1000)/1000:null;
const asset=url=>typeof url==='string'?url.split(/[?#]/)[0].split(/[\\/]/).at(-1).slice(0,120):'';
const stats=values=>{
 const a=values.filter(Number.isFinite).sort((a,b)=>a-b);
 if(!a.length)return{count:0,mean:null,p50:null,p95:null,p99:null,max:null};
 const percentile=p=>round(a[Math.max(0,Math.ceil(a.length*p)-1)]);
 return{count:a.length,mean:round(a.reduce((s,v)=>s+v,0)/a.length),p50:percentile(.5),p95:percentile(.95),p99:percentile(.99),max:round(a.at(-1))};
};
export function state155(game){
 const session=game.renderer.webgl.xr?.getSession?.()??game.vr?.session;
 const office=game.performanceDiagnostics155?.officeState?.()??null;
 return{scope:game.officeSession?.active?'office':'city',officeReady:!!game.officeSession?.ready,
  running:!!game.running,paused:!!game.paused,hidden:document.hidden,billOpen:!!game.billReader90?.visible,
  vr:!!game.vr?.active,xrVisibility:session?.visibilityState??null,xrRate:session?.frameRate??null,
  width:game.renderer.canvas.width,height:game.renderer.canvas.height,pixelRatio:game.renderer.pixelRatio,
  quality:game.renderer.qualityPreset??null,postProcessing:!game.renderer.direct82&&!game.vr?.active,office};
}
export function holdReason155(state){
 if(state.hidden)return'hidden-tab';
 if(state.xrVisibility==='hidden')return'xr-hidden';
 if(!state.running)return'city-stopped';
 if(state.scope==='office')return !state.officeReady?'office-loading':state.office?.paused?'office-paused':'office-renderer';
 if(state.billOpen&&!state.vr)return'bill-reader';
 if(state.paused)return'paused';
 return null;
}
const emptyPasses=()=>({shadow:{cpuMs:0,calls:0,triangles:0},post:{cpuMs:0,calls:0,triangles:0},world:{cpuMs:0,calls:0,triangles:0}});
export class DiagnosticCapture155{
 constructor(game,recorder){this.game=game;this.recorder=recorder;this.capture=null;this.history=[];this.lastFrame=new Map();this.pending=[];this.nextBucket=0;this.observers=[];this.live=false;this.pass=emptyPasses();this.overheadMs=0;this.lastHeartbeat=now();this.lastState=null;this.spanStart=0;}
 get allowed(){return this.recorder.allowed;}
 get enabled(){return this.allowed&&(this.live||this.recorder.recording);}
 start(){
  this.stopObservers();this.lastFrame.clear();this.pending=[];this.nextBucket=0;this.history=[];
  this.capture={started:this.recorder.started,frames:[],events:[],heartbeats:[],longAnimationFrames:[],resources:[],holds:[],omitted:{frames:0,events:0,heartbeats:0,longAnimationFrames:0,resources:0,holds:0},support:{},officeSeen:false};
  this.lastHeartbeat=now();this.lastState=null;this.spanStart=this.capture.started;
  this.observeWindow(window,'city',0);this.heartbeat();
 }
 bounded(key,value,limit){const c=this.capture;if(!c)return;if(c[key].length<limit)c[key].push(value);else c.omitted[key]++;}
 event(type,detail={}){if(this.recorder.recording&&this.capture)this.bounded('events',{atMs:round(Math.min(60000,now()-this.capture.started)),type,...detail},500);}
 observeWindow(win,scope,offset){
  const c=this.capture;if(!c)return;
  const PO=win.PerformanceObserver,types=PO?.supportedEntryTypes??[];
  c.support[scope]={longAnimationFrame:types.includes('long-animation-frame'),resource:types.includes('resource')};
  for(const type of ['long-animation-frame','resource']){
   if(!types.includes(type))continue;
   try{const consume=entries=>{if(this.capture!==c)return;for(const e of entries){const at=e.startTime+offset-c.started;if(at>=60000||at+e.duration<=0)continue;
    if(type==='resource')this.bounded('resources',{scope,atMs:round(at),startedBeforeCapture:at<0,asset:asset(e.name),initiator:e.initiatorType,durationMs:round(e.duration),transferBytes:e.transferSize??null,decodedBytes:e.decodedBodySize??null,responseStatus:e.responseStatus??null},500);
    else this.bounded('longAnimationFrames',{scope,atMs:round(at),startedBeforeCapture:at<0,durationMs:round(e.duration),blockingDurationMs:round(e.blockingDuration),renderStartMs:e.renderStart?round(e.renderStart+offset-c.started):null,styleAndLayoutMs:e.styleAndLayoutStart?round(e.startTime+e.duration-e.styleAndLayoutStart):null,scripts:[...(e.scripts??[])].sort((a,b)=>b.duration-a.duration).slice(0,8).map(s=>({asset:asset(s.sourceURL),function:String(s.sourceFunctionName??'').slice(0,120),durationMs:round(s.duration),forcedLayoutMs:round(s.forcedStyleAndLayoutDuration),pauseMs:round(s.pauseDuration),sourceCharPosition:s.sourceCharPosition??null}))},200);
   }};const observer=new PO(list=>consume(list.getEntries()));observer.observe({type,buffered:false});this.observers.push({observer,consume,win});}catch{c.support[scope][type==='resource'?'resource':'longAnimationFrame']=false;}
  }
 }
 stopObservers(win){const keep=[];for(const entry of this.observers){if(win&&entry.win!==win){keep.push(entry);continue;}try{entry.consume(entry.observer.takeRecords());}catch{}finally{entry.observer.disconnect();}}this.observers=keep;}
 heartbeat(){
  const t=now();if(!this.enabled){this.lastHeartbeat=t;return;}
  this.flushBucket(t);
  const s=state155(this.game),signature=JSON.stringify(s),c=this.capture;
  if(this.recorder.recording&&c){
   if(signature!==this.lastState){
    if(this.lastState)this.bounded('holds',{fromMs:round(Math.min(60000,this.spanStart-c.started)),toMs:round(Math.min(60000,t-c.started)),state:JSON.parse(this.lastState),reason:holdReason155(JSON.parse(this.lastState)),boundary:'heartbeat-observed'},300);
    if(this.lastState){const old=JSON.parse(this.lastState);if(old.scope!==s.scope||holdReason155(old)!==holdReason155(s)){this.lastFrame.clear();this.pending=[];}}
    this.event('state-change',{state:s});this.spanStart=t;this.lastState=signature;
   }
   const delay=Math.max(0,t-this.lastHeartbeat-250);
   this.bounded('heartbeats',{atMs:round(Math.min(60000,t-c.started)),timerDelayMs:round(delay),state:s,heapUsedBytes:performance.memory?.usedJSHeapSize??null},400);
  }
  this.lastHeartbeat=t;
  const last=this.lastFrame.get(s.scope),hold=holdReason155(s);
  if(!last||t-last>500){this.history.push({at:t,interval:null,cpu:null,gpu:null,max:null,scope:s.scope,reason:hold??'no-frame-observed',budget:1000/(s.xrRate||60)});if(this.history.length>600)this.history.shift();}
 }
 frame(scope,start,cpu,metrics={},state=state155(this.game)){
  if(!this.enabled)return;
  const previous=this.lastFrame.get(scope);this.lastFrame.set(scope,start);
  const interval=previous==null?null:start-previous,reason=holdReason155(state);
  // The preceding interval is not proof of CPU work in this frame.
  const sample={at:start,interval:round(interval),cpu:round(cpu),scope,reason,budget:1000/(state.xrRate||60),...metrics};
  if(this.recorder.recording&&this.capture&&start-this.capture.started<60000){const row={...sample,atMs:round(start-this.capture.started)};delete row.at;this.bounded('frames',row,24000);}
  if(this.pending.length&&this.pending[0].scope!==scope)this.pending=[];
  this.pending.push(sample);
  this.flushBucket(start);
 }
 flushBucket(t){
  if(this.pending.length&&t>=this.nextBucket){
   const samples=this.pending,sample=samples.at(-1);this.pending=[];this.nextBucket=t+200;
   const intervals=samples.map(s=>s.interval).filter(Number.isFinite);
   this.history.push({...sample,interval:stats(intervals).mean,max:stats(intervals).max,cpu:stats(samples.map(s=>s.cpu)).mean,peakCpu:stats(samples.map(s=>s.cpu)).max});
   if(this.history.length>600)this.history.shift();
  }
 }
 finish(report){
  this.stopObservers();const c=this.capture;if(!c)return report;
  const end=Math.min(60000,Math.max(0,now()-c.started));
  if(this.lastState)this.bounded('holds',{fromMs:round(Math.min(60000,this.spanStart-c.started)),toMs:round(end),state:JSON.parse(this.lastState),reason:holdReason155(JSON.parse(this.lastState)),boundary:'heartbeat-observed'},300);
  const active=c.frames.filter(f=>!f.reason||f.reason==='office-renderer'),intervals=active.map(f=>f.interval).filter(Number.isFinite);
  report.schema='bargheto.performance.v2';
  report.diagnostics={version:155,columnsNote:'Frame times use performance.now; atMs is relative to capture start. Samples are CPU wall-clock submission, not displayed FPS or input-to-photon latency.',support:c.support,
   activeSummary:{intervalMs:stats(intervals),cpuMs:stats(active.map(f=>f.cpu)),overBudgetWith25PercentTolerance:active.filter(f=>f.interval>f.budget*1.25).length,over50ms:intervals.filter(v=>v>50).length,over100ms:intervals.filter(v=>v>100).length},
   byScope:Object.fromEntries(['city','office'].map(scope=>{const frames=c.frames.filter(f=>f.scope===scope),interval=stats(frames.map(f=>f.interval));return[scope,{frames:frames.length,observedCallbackFps:interval.mean>0?round(1000/interval.mean):null,intervalMs:interval,cpuMs:stats(frames.map(f=>f.cpu))}]})),
   renderPasses:Object.fromEntries(['world','shadow','post'].map(pass=>{const samples=c.frames.filter(f=>f.scope==='city'&&f.passes).map(f=>f.passes[pass]);return[pass,{cpuMs:stats(samples.map(p=>p.cpuMs)),drawCalls:stats(samples.map(p=>p.calls)),triangles:stats(samples.map(p=>p.triangles))}]})),
   eventLoopTimerDelayMs:stats(c.heartbeats.map(h=>h.timerDelayMs)),
   frameDetails:c.frames,slowFrames:c.frames.filter(f=>f.interval>f.budget*1.25).sort((a,b)=>b.interval-a.interval).slice(0,80),stateSpans:c.holds,events:c.events,heartbeats:c.heartbeats,
   longAnimationFrames:c.longAnimationFrames.sort((a,b)=>a.atMs-b.atMs),resourcesDuringCapture:c.resources.sort((a,b)=>a.atMs-b.atMs),omitted:c.omitted,measuredDiagnosticBackgroundCpuMs:round(this.overheadMs),
   notes:['State spans are observed boundaries, not precise proof of a freeze cause. A delayed heartbeat cannot reconstruct state changes during a blocked main thread.',
    'City recorder fields remain city-only. diagnostic frameDetails also measures the office engine when attached. Office GPU execution and per-pass triangles are unavailable.',
    'Office drawCalls counts engine drawElementsType/drawArraysType submissions, not a GPU counter. Engine and driver internals can combine or skip submissions.',
    'A visible in-headset diagnostic chart adds an overlay mesh/texture; its rendering is included in observed draw totals.',
    'CPU and GPU run concurrently; do not add their durations. GPU null means unsupported, pending, stale, or not sampled. Office intervals and loading gaps are separate from city intervals.',
    'World CPU includes scene traversal plus render submission minus nested shadow CPU. Post CPU includes only post scene submissions; final compositing outside render() may not be covered.',
    'Resources contain basenames only. Zero transferred bytes can mean cache or restricted timing. JS heap is optional Chromium data, not total device RAM or VRAM.',
    'Budget uses the reported XR frame rate, otherwise a 60 Hz reference, not a detected display refresh rate. Slow-frame counts allow 25 percent timing tolerance.',
    'Chart samples are 200ms buckets with maximum frame interval preserved. measuredDiagnosticBackgroundCpuMs measures sampled chart/heartbeat and post-frame work, not all observer/render-hook overhead. The profiler itself adds overhead; compare captures made with the same profiler settings.']};
  this.capture=null;return report;
 }
 dispose(){this.stopObservers();this.capture=null;this.history=[];this.pending=[];this.lastFrame.clear();}
}

export function installDiagnostics155(game,T){
 const recorder=game.performanceRecorder,control=game.performanceControl;
 if(!recorder||game.performanceDiagnostics155)return;
 const d=new DiagnosticCapture155(game,recorder),restores=[],officeBindings=new Map();let disposed=false,open=false,frozen=false,lastReport=null,vrMesh=null,vrTexture=null;
 const wrap=(object,key,build)=>{const original=object?.[key];if(typeof original!=='function')return;const replacement=build(original);object[key]=replacement;restores.push(()=>{if(object[key]===replacement)object[key]=original;});};
 const safe=fn=>{try{return fn();}catch(error){console.warn('Local performance diagnostics',error?.message??'unavailable');}};
 const active=()=>!disposed&&d.enabled;
 const toggle=document.createElement('button');toggle.type='button';toggle.textContent='نمودار عملکرد';toggle.hidden=true;control.element.append(toggle);
 const officeToggle=document.createElement('button');officeToggle.type='button';officeToggle.className='bc-diag155-office-entry';officeToggle.textContent='نمودار عملکرد';officeToggle.hidden=true;officeToggle.dir='rtl';document.body.append(officeToggle);
 const style=document.createElement('style');style.textContent=`.bc-diag155[hidden],.bc-diag155 [hidden]{display:none!important}.bc-diag155{position:fixed;z-index:2147483000;left:12px;bottom:12px;width:min(540px,calc(100vw - 24px));box-sizing:border-box;background:#0b1925f5;color:#edf5fa;border:1px solid #7594a6;border-radius:12px;padding:12px;font:13px/1.8 Tahoma,sans-serif;box-shadow:0 4px 24px #0006;pointer-events:auto}.bc-diag155.expanded{inset:16px;width:auto;overflow:auto}.bc-diag155 header,.bc-diag155 nav{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.bc-diag155 header strong{flex:1}.bc-diag155 button{background:#254e61;color:white;border:1px solid #8ab0c0;border-radius:7px;padding:6px 10px;font:inherit;cursor:pointer;touch-action:manipulation}.bc-diag155 button:focus-visible{outline:2px solid #fff;outline-offset:2px}.bc-diag155 button:disabled{opacity:.5;cursor:default}.bc-diag155 canvas{width:100%;height:200px;display:block;margin:8px 0;background:#08131d}.bc-diag155.expanded canvas{height:45vh;min-height:200px}.bc-diag155 p{margin:5px 0}.bc-diag155 .metrics{color:#9be5e4;font-variant-numeric:tabular-nums}.bc-diag155 .legend{font-size:12px}.bc-diag155 .legend span{margin-inline-end:10px}.bc-diag155 .hint{color:#b8c8d5;font-size:11px}@media(max-width:600px){.bc-diag155{bottom:6px;left:6px;width:calc(100vw - 12px);padding:8px}.bc-diag155 canvas{height:150px}.bc-diag155.expanded{inset:6px}.bc-diag155 button{padding:5px 7px;font-size:12px}}`;
 document.head.append(style);
 style.textContent+=' .bc-diag155-office-entry{position:fixed;z-index:2147482999;top:max(12px,env(safe-area-inset-top));right:12px;background:#254e61;color:white;border:1px solid #8ab0c0;border-radius:8px;padding:9px;font:13px Tahoma;cursor:pointer;pointer-events:auto}.bc-diag155-office-entry[hidden]{display:none!important}';
 const panel=document.createElement('section');panel.className='bc-diag155';panel.dir='rtl';panel.hidden=true;panel.setAttribute('aria-label','نمودار زندهٔ عملکرد ادمین');
 const header=document.createElement('header'),title=document.createElement('strong');title.textContent='نمودار زندهٔ عملکرد';header.append(title);panel.append(header);
 const button=(parent,label,action)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);parent.append(b);return b;};
 const expand=button(header,'تمام‌صفحه',()=>{panel.classList.toggle('expanded');expand.textContent=panel.classList.contains('expanded')?'کوچک‌کردن':'تمام‌صفحه';});
 button(header,'بستن',()=>setOpen(false));
 const metrics=document.createElement('p');metrics.className='metrics';metrics.setAttribute('role','status');metrics.setAttribute('aria-live','off');panel.append(metrics);
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=360;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','زمان فریم، بیشینهٔ مکث و CPU بر حسب میلی‌ثانیه');panel.append(canvas);
 const legend=document.createElement('p');legend.className='legend';legend.innerHTML='<span style="color:#63c9ff">● زمان فریم</span><span style="color:#ff7589">● بیشینهٔ مکث</span><span style="color:#ffc46a">● CPU</span><span style="color:#88e0a0">● GPU نمونه‌ای</span>';panel.append(legend);
 const nav=document.createElement('nav');panel.append(nav);
 const captureButton=button(nav,'شروع گزارش ۶۰ ثانیه',()=>{if(d.allowed)recorder.start();});
 const pauseButton=button(nav,'مکث نمودار',()=>{if(!frozen)safe(draw);frozen=!frozen;pauseButton.textContent=frozen?'ادامهٔ نمودار':'مکث نمودار';if(!frozen)safe(draw);});
 button(nav,'ثبت نشانهٔ لگ',()=>{d.event('admin-lag-marker');});
 const download=button(nav,'دانلود گزارش',()=>{if(d.allowed&&lastReport)control.download.click();});download.disabled=true;
 const hint=document.createElement('p');hint.className='hint';hint.textContent='۱۲۰ ثانیهٔ اخیر · زمان کمتر بهتر است · خط‌چین: بودجهٔ فریم · ناحیهٔ خاکستری: توقف یا نبود داده. GPU هنگام ثبت گزارش و در مرورگر سازگار اندازه‌گیری می‌شود. گزارش فقط روی دستگاه شما دانلود می‌شود.';panel.append(hint);document.body.append(panel);
 // Prevent game controls from consuming pointer/key events on this panel.
 for(const type of ['pointerdown','pointerup','click','keydown','keyup','wheel'])panel.addEventListener(type,e=>e.stopPropagation());
 function setOpen(value){const wasOpen=open;open=!!value&&d.allowed;if(open&&!wasOpen&&!recorder.recording){d.lastFrame.clear();d.pending=[];d.lastHeartbeat=now();}d.live=open;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(!open){frozen=false;pauseButton.textContent='مکث نمودار';removeVR();}else safe(draw);}
 toggle.addEventListener('click',()=>setOpen(!open));
 officeToggle.addEventListener('click',e=>{e.stopPropagation();setOpen(!open);});
 const ctx=canvas.getContext('2d');
 function gpuSample(){if(frozen||game.officeSession?.active)return null;const samples=recorder.gpu?.samples;const sample=samples?.at(-1);return sample&&recorder.recording&&now()-recorder.started-sample.atMs<1200?sample:null;}
 function draw(){
  if(!ctx||frozen)return;const history=d.history,t=now(),left=t-120000,w=canvas.width,h=canvas.height;
  const visible=(history??[]).filter(s=>s.at>=left),peak=Math.max(50,...visible.map(s=>s.max??0));const ceiling=Math.min(500,Math.ceil(peak/25)*25);
  const x=t=>48+(t-left)/120000*(w-60),y=v=>h-32-Math.min(v,ceiling)/ceiling*(h-55);
  ctx.fillStyle='#08131d';ctx.fillRect(0,0,w,h);ctx.font='16px Tahoma';ctx.textAlign='right';
  ctx.textAlign='left';for(const [text,color,x]of [['Frame','#63c9ff',65],['Peak','#ff7589',215],['CPU','#ffc46a',365],['GPU (sampled)','#88e0a0',515]]){ctx.fillStyle=color;ctx.fillText(text,x,16);}ctx.textAlign='right';
  for(const v of [0,16.67,33.33,ceiling]){ctx.strokeStyle='#31434f';ctx.beginPath();ctx.moveTo(48,y(v));ctx.lineTo(w-12,y(v));ctx.stroke();ctx.fillStyle='#a9bdcb';ctx.fillText(String(round(v)),43,y(v)+5);}
  const budget=visible.at(-1)?.budget??16.67;ctx.setLineDash([8,7]);ctx.strokeStyle='#d2dfb7';ctx.beginPath();ctx.moveTo(48,y(budget));ctx.lineTo(w-12,y(budget));ctx.stroke();ctx.setLineDash([]);
  for(const s of visible)if(s.interval==null){ctx.fillStyle='#77879650';ctx.fillRect(x(s.at),20,3,h-52);}
  for(const [key,color]of [['interval','#63c9ff'],['max','#ff7589'],['cpu','#ffc46a']]){
   ctx.strokeStyle=color;ctx.beginPath();let previous=null;for(const s of visible){const v=s[key];if(!Number.isFinite(v)){previous=null;continue;}if(previous&&s.at-previous.at<700&&s.scope===previous.scope)ctx.lineTo(x(s.at),y(v));else ctx.moveTo(x(s.at),y(v));previous=s;}ctx.stroke();
  }
  const gpu=gpuSample();if(recorder.recording&&!frozen){ctx.fillStyle='#88e0a0';for(const s of recorder.gpu?.samples??[]){const at=recorder.started+s.atMs;if(at<left||at>t)continue;ctx.beginPath();ctx.arc(x(at),y(s.gpuMs),3,0,Math.PI*2);ctx.fill();}}
  for(const event of d.capture?.events??[]){if(!['admin-lag-marker','office-entry-start','office-exit','webgl-context-lost'].includes(event.type))continue;const at=d.capture.started+event.atMs;if(at<left||at>t)continue;ctx.strokeStyle='#f8e488';ctx.beginPath();ctx.moveTo(x(at),20);ctx.lineTo(x(at),h-32);ctx.stroke();}
  const latest=visible.at(-1),label=s=>s==='office'?'دفتر':'شهر';
  const reasons={'office-loading':'بارگذاری دفتر','office-renderer':'انتقال به دفتر','office-paused':'توقف دفتر','hidden-tab':'تب پنهان','xr-hidden':'هدست پنهان','city-stopped':'حلقهٔ شهر متوقف','bill-reader':'نمایش قبض',paused:'توقف بازی','no-frame-observed':'فریمی دریافت نشد'};
  metrics.textContent=latest?`${label(latest.scope)} | فریم ${latest.interval??'—'} ms | مکث ${latest.max??'—'} ms | CPU ${latest.cpu??'—'} ms | GPU ${gpu?.gpuMs??'—'} ms${latest.interval==null?' | '+(reasons[latest.reason]??'بدون داده'):''}${peak>500?' | قلهٔ بالاتر از ۵۰۰ms؛ مقدار دقیق در گزارش':''}`:'منتظر اولین فریم…';
  ctx.fillStyle='#a9bdcb';ctx.textAlign='left';ctx.fillText('−120s',48,h-7);ctx.textAlign='right';ctx.fillText('0s · ms',w-12,h-7);
  captureButton.disabled=recorder.recording;captureButton.textContent=recorder.recording?`ثبت گزارش: ${recorder.remainingSeconds} ثانیه`:'شروع گزارش ۶۰ ثانیه';
  canvas.setAttribute('aria-label',metrics.textContent);if(vrTexture)vrTexture.needsUpdate=true;
 }
 function removeVR(){if(!vrMesh)return;game.scene.remove(vrMesh);vrMesh.geometry.dispose();vrMesh.material.dispose();vrTexture.dispose();vrMesh=vrTexture=null;}
 function updateVR(){
  if(!game.vr?.active||!recorder.recording||!open||game.vr.insideOffice){removeVR();return;}
  if(!T?.CanvasTexture||!T?.PlaneGeometry)return;
  if(!vrMesh){vrTexture=new T.CanvasTexture(canvas);vrMesh=new T.Mesh(new T.PlaneGeometry(.9,.324),new T.MeshBasicMaterial({map:vrTexture,depthTest:false,depthWrite:false,toneMapped:false}));vrMesh.name='admin-performance-chart155';vrMesh.renderOrder=10000;vrMesh.frustumCulled=false;game.scene.add(vrMesh);}
  const view=game.vr.view;view.getWorldPosition(vrMesh.position);view.getWorldQuaternion(vrMesh.quaternion);vrMesh.position.add(new T.Vector3(0,-.48,-1.5).applyQuaternion(vrMesh.quaternion));
 }
 wrap(recorder,'start',original=>function(...args){const started=original.apply(this,args);if(started){safe(()=>{lastReport=null;download.disabled=true;d.overheadMs=0;d.start();for(const binding of officeBindings.values())d.observeWindow(binding.win,'office',binding.offset);setOpen(true);});}return started;});
 wrap(recorder,'cancel',original=>function(...args){const result=original.apply(this,args);safe(()=>{d.stopObservers();d.capture=null;removeVR();});return result;});
 const complete=recorder.onComplete,completion=function(report){safe(()=>d.finish(report));lastReport=report;download.disabled=false;return complete.call(this,report);};recorder.onComplete=completion;restores.push(()=>{if(recorder.onComplete===completion)recorder.onComplete=complete;});
 const renderer=game.renderer.webgl;
 wrap(renderer.shadowMap,'render',original=>function(...args){if(!active())return original.apply(this,args);const start=now(),before={...renderer.info.render};try{return original.apply(this,args);}finally{const r=renderer.info.render,p=d.pass.shadow;p.cpuMs+=now()-start;p.calls+=r.calls-before.calls;p.triangles+=r.triangles-before.triangles;}});
 wrap(renderer,'render',original=>function(scene,...args){if(!active())return original.call(this,scene,...args);const start=now(),before={...renderer.info.render},shadow={...d.pass.shadow};try{return original.call(this,scene,...args);}finally{const r=renderer.info.render,isWorld=scene===game.scene,p=d.pass[isWorld?'world':'post'];p.cpuMs+=Math.max(0,now()-start-(d.pass.shadow.cpuMs-shadow.cpuMs));p.calls+=Math.max(0,r.calls-before.calls-(d.pass.shadow.calls-shadow.calls));p.triangles+=Math.max(0,r.triangles-before.triangles-(d.pass.shadow.triangles-shadow.triangles));}});
 let interruptedReason=null;
 wrap(game,'frame',original=>function(...args){if(!active())return original.apply(this,args);const start=now();d.pass=emptyPasses();const frames=recorder.frameCount;let completed=false;try{const value=original.apply(this,args);completed=true;return value;}finally{safe(()=>{const after=now(),state=state155(game);if(recorder.inFrame&&recorder.recording)recorder.inFrame=false;
   // Only count frames which actually reached city rendering; intentional early returns become state events.
   if(completed&&game.running&&state.scope==='city'&&(!state.billOpen||state.vr)){interruptedReason=null;const passes=Object.fromEntries(Object.entries(d.pass).map(([key,p])=>[key,{...p,cpuMs:round(p.cpuMs)}]));d.frame('city',start,after-start,{passes,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles},state);}
   else if(recorder.recording&&interruptedReason!==(holdReason155(state)??'exception')){interruptedReason=holdReason155(state)??'exception';d.event('city-frame-interrupted',{scope:state.scope,reason:interruptedReason,cpuMs:round(after-start),recorderFrameCompleted:recorder.frameCount>frames});d.heartbeat();}
   updateVR();d.overheadMs+=now()-after;
  });}});
 for(const key of ['suspendForOffice','resumeFromOffice'])wrap(game,key,original=>function(...args){d.event(key==='suspendForOffice'?'office-entry-start':'office-exit');d.lastFrame.clear();d.pending=[];const result=original.apply(this,args);d.heartbeat();return result;});
 const contextLost=()=>d.event('webgl-context-lost'),contextRestored=()=>d.event('webgl-context-restored'),visibility=()=>{d.event('visibility',{hidden:document.hidden});d.heartbeat();},runtimeError=e=>d.event('runtime-error',{asset:asset(e.filename),line:e.lineno??null,column:e.colno??null}),rejection=()=>d.event('unhandled-promise-rejection');
 renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',contextRestored);document.addEventListener('visibilitychange',visibility);
 window.addEventListener('error',runtimeError);window.addEventListener('unhandledrejection',rejection);
 function attachOffice(debug,win){
  if(disposed||officeBindings.has(debug.engine))return;
  const engine=debug.engine,scene=debug.scene,offset=win.performance.timeOrigin-performance.timeOrigin;let began=0,frameActive=false,calls=0;
  const begin=engine.onBeginFrameObservable.add(()=>{frameActive=active();if(frameActive){began=now();calls=0;}});
  const end=engine.onEndFrameObservable.add(()=>{if(!frameActive||!active())return;safe(()=>{const state=state155(game);if(state.scope!=='office')return;if(d.capture)d.capture.officeSeen=true;d.frame('office',began,now()-began,{drawCalls:calls,triangles:null,passes:null},state);});});
  const methods=[];
  for(const name of ['drawElementsType','drawArraysType']){const original=engine[name];if(typeof original!=='function')continue;const wrapped=function(...args){if(frameActive&&active())calls++;return original.apply(this,args);};engine[name]=wrapped;methods.push(()=>{if(engine[name]===wrapped)engine[name]=original;});}
  const binding={win,offset,debug,dispose(){engine.onBeginFrameObservable.remove(begin);engine.onEndFrameObservable.remove(end);for(const restore of methods)restore();d.stopObservers(win);officeBindings.delete(engine);}};officeBindings.set(engine,binding);scene.onDisposeObservable.addOnce(()=>binding.dispose());
  if(recorder.recording)d.observeWindow(win,'office',offset);
 }
 const timer=setInterval(()=>safe(()=>{
  const allowed=d.allowed;toggle.hidden=!allowed;
  officeToggle.hidden=!allowed||!game.officeSession?.active;
  if(!allowed){setOpen(false);if(recorder.recording)recorder.cancel();lastReport=null;download.disabled=true;return;}
  if(active()){const start=now();d.heartbeat();if(open&&!frozen)draw();captureButton.disabled=recorder.recording;captureButton.textContent=recorder.recording?`ثبت گزارش: ${recorder.remainingSeconds} ثانیه`:'شروع گزارش ۶۰ ثانیه';d.overheadMs+=now()-start;}
 }),250);
 const api=game.performanceDiagnostics155={attachOffice,open:()=>setOpen(true),close:()=>setOpen(false),capture:d,isRecording:()=>d.allowed&&recorder.recording,graphCanvas:()=>d.allowed&&open?canvas:null,refreshGraph:()=>{if(d.allowed&&open)safe(draw);},officeState(){for(const {debug,win}of officeBindings.values()){if(game.officeSession?.frame?.contentWindow!==win)continue;return{paused:debug.playing===false,width:debug.engine.getRenderWidth?.()??null,height:debug.engine.getRenderHeight?.()??null,activeMeshes:debug.scene.getActiveMeshes?.().length??null};}return null;},dispose(){if(disposed)return;disposed=true;clearInterval(timer);d.dispose();removeVR();for(const binding of [...officeBindings.values()])binding.dispose();for(const restore of restores.reverse())restore();renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('error',runtimeError);window.removeEventListener('unhandledrejection',rejection);panel.remove();toggle.remove();officeToggle.remove();style.remove();delete game.performanceDiagnostics155;}};
 game.disposers.push(()=>api.dispose());return api;
}
