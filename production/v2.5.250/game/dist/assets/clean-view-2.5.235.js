// Screen-recording presentation only. Capture is left to the user's recorder.
(()=>{'use strict';
 window.BarghetoCleanView224=function({canvas,host=canvas.parentElement,available=()=>true,onEnter=()=>{}}){
  if(window.barghetoCleanView224)return window.barghetoCleanView224;
  canvas.setAttribute('data-clean-surface224','');
  const style=document.createElement('style');style.textContent=`
 .clean-view224{position:fixed;right:18px;top:76px;z-index:90;width:44px;height:44px;border:1px solid #ffffff70;border-radius:12px;background:#163b43df;color:white;font-size:24px;cursor:pointer;touch-action:manipulation}
 .clean-view224[hidden]{display:none!important}
 .clean-bars230{position:fixed;inset:0;z-index:2147483600;pointer-events:none;overflow:hidden}
 .clean-bars230[hidden]{display:none!important}
 .clean-bars230 .cinema-bar{box-sizing:border-box;position:absolute;left:0;width:100%;min-height:clamp(62px,11vh,100px);background:#080d12;padding:14px max(24px,4vw);margin:0;border:0;pointer-events:none;transition:transform .7s cubic-bezier(.22,.7,.3,1)}
 .clean-bars230 .cinema-top{top:0;transform:translateY(-101%)}
 .clean-bars230 .cinema-bottom{bottom:0;transform:translateY(101%)}
 html[data-clean-view224] .clean-bars230 .cinema-bar{transform:translateY(0)}
 @media(prefers-reduced-motion:reduce){.clean-bars230 .cinema-bar{transition:none}}
 html[data-clean-view224] #bc-online109{display:none!important;visibility:hidden!important;pointer-events:none!important}
 html[data-clean-view224] body,html[data-clean-view224] body *{visibility:hidden!important;cursor:none!important}
 html[data-clean-view224] [data-clean-surface224],html[data-clean-view224] iframe.office-session-frame,html[data-clean-view224] [data-clean-bars230],html[data-clean-view224] [data-clean-bars230] *{visibility:visible!important;cursor:none!important}
 `;document.head.append(style);
  // Reuse the overview's exact empty cinema-bar geometry and color. The bars
  // live outside the HUD, so hiding interface elements cannot hide the frame.
  const bars=document.createElement('div');bars.className='clean-bars230';bars.setAttribute('data-clean-bars230','');bars.setAttribute('aria-hidden','true');
  bars.innerHTML='<div class="cinema-bar cinema-top"></div><div class="cinema-bar cinema-bottom"></div>';document.body.append(bars);
  const onlineStyles=new Map();
  function syncOnline(){
   for(const panel of document.querySelectorAll('#bc-online109')){
    if(panel.shadowRoot&&!onlineStyles.has(panel)){
     const sheet=document.createElement('style');sheet.textContent=':host([data-clean-view224]){display:none!important;visibility:hidden!important;pointer-events:none!important}';
     panel.shadowRoot.append(sheet);onlineStyles.set(panel,sheet);
    }
    panel.toggleAttribute('data-clean-view224',enabled);
   }
  }
  const onlineObserver=new MutationObserver(()=>{if(enabled)syncOnline();});onlineObserver.observe(document.body,{childList:true});
  const button=document.createElement('button');button.type='button';button.className='clean-view224';button.textContent='';button.title='نمای فیلم‌برداری · بازگشت: Esc یا F8 · موبایل: لمس سه‌انگشتی';button.setAttribute('aria-label',button.title);// Camera icon removed: this internal state control is not mounted.
  let enabled=false;
  const set=(value,propagate=true)=>{
   enabled=!!value;if(enabled)onEnter();document.documentElement.toggleAttribute('data-clean-view224',enabled);button.setAttribute('aria-pressed',String(enabled));syncOnline();
   if(propagate){try{if(parent!==window&&parent.location.origin===location.origin)parent.barghetoCleanView224?.set(enabled,false);}catch{}}
   for(const f of document.querySelectorAll('iframe.office-session-frame'))try{f.contentWindow.barghetoCleanView224?.set(enabled,false);}catch{}
  };
  button.onclick=()=>set(!enabled);
  const key=e=>{if(e.code==='Escape'&&enabled||e.code==='F8'&&!e.repeat&&available()&&!/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)&&!e.target?.isContentEditable){e.preventDefault();e.stopImmediatePropagation();set(e.code==='Escape'?false:!enabled);}};
  const touch=e=>{if(enabled&&e.touches.length>=3){e.preventDefault();e.stopImmediatePropagation();set(false);}};
  addEventListener('keydown',key,true);addEventListener('touchstart',touch,{capture:true,passive:false});
  const sync=()=>{button.hidden=!available();
   // The outer city document owns the frame when the office runs in its iframe.
   let outer=false;try{outer=parent!==window&&parent.location.origin===location.origin&&!!parent.barghetoCleanView224;}catch{}
   bars.hidden=outer;
  };sync();const timer=setInterval(sync,250);
  const api=window.barghetoCleanView224={set,get enabled(){return enabled;},button,bars,dispose(){set(false);onlineObserver.disconnect();for(const sheet of onlineStyles.values())sheet.remove();onlineStyles.clear();bars.remove();clearInterval(timer);removeEventListener('keydown',key,true);removeEventListener('touchstart',touch,true);button.remove();style.remove();canvas.removeAttribute('data-clean-surface224');delete window.barghetoCleanView224;}};
  try{if(parent!==window&&parent.location.origin===location.origin)set(!!parent.barghetoCleanView224?.enabled,false);}catch{}
  return api;
 };
})();
