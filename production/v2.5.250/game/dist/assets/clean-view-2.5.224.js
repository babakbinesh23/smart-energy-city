// Screen-recording presentation only. Capture is left to the user's recorder.
(()=>{'use strict';
 window.BarghetoCleanView224=function({canvas,host=canvas.parentElement,available=()=>true,onEnter=()=>{}}){
  if(window.barghetoCleanView224)return window.barghetoCleanView224;
  canvas.setAttribute('data-clean-surface224','');
  const style=document.createElement('style');style.textContent=`
 .clean-view224{position:fixed;right:18px;top:76px;z-index:90;width:44px;height:44px;border:1px solid #ffffff70;border-radius:12px;background:#163b43df;color:white;font-size:24px;cursor:pointer;touch-action:manipulation}
 .clean-view224[hidden]{display:none!important}
 html[data-clean-view224] body,html[data-clean-view224] body *{visibility:hidden!important;cursor:none!important}
 html[data-clean-view224] [data-clean-surface224],html[data-clean-view224] iframe.office-session-frame{visibility:visible!important;cursor:none!important}
 `;document.head.append(style);
  const button=document.createElement('button');button.type='button';button.className='clean-view224';button.textContent='🎥';button.title='نمای فیلم‌برداری · بازگشت: Esc یا F8 · موبایل: لمس سه‌انگشتی';button.setAttribute('aria-label',button.title);host.append(button);
  let enabled=false;
  const set=(value,propagate=true)=>{
   enabled=!!value;if(enabled)onEnter();document.documentElement.toggleAttribute('data-clean-view224',enabled);button.setAttribute('aria-pressed',String(enabled));
   if(propagate){try{if(parent!==window&&parent.location.origin===location.origin)parent.barghetoCleanView224?.set(enabled,false);}catch{}}
   for(const f of document.querySelectorAll('iframe.office-session-frame'))try{f.contentWindow.barghetoCleanView224?.set(enabled,false);}catch{}
  };
  button.onclick=()=>set(!enabled);
  const key=e=>{if(e.code==='Escape'&&enabled||e.code==='F8'&&!e.repeat&&available()&&!/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)&&!e.target?.isContentEditable){e.preventDefault();e.stopImmediatePropagation();set(e.code==='Escape'?false:!enabled);}};
  const touch=e=>{if(enabled&&e.touches.length>=3){e.preventDefault();e.stopImmediatePropagation();set(false);}};
  addEventListener('keydown',key,true);addEventListener('touchstart',touch,{capture:true,passive:false});
  const sync=()=>{button.hidden=!available();};sync();const timer=setInterval(sync,250);
  const api=window.barghetoCleanView224={set,get enabled(){return enabled;},button,dispose(){set(false);clearInterval(timer);removeEventListener('keydown',key,true);removeEventListener('touchstart',touch,true);button.remove();style.remove();canvas.removeAttribute('data-clean-surface224');delete window.barghetoCleanView224;}};
  try{if(parent!==window&&parent.location.origin===location.origin)set(!!parent.barghetoCleanView224?.enabled,false);}catch{}
  return api;
 };
})();
