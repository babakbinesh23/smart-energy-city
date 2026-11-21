/* Shared by the city and the independent office. Only registered expert voices
   receive this rate; ambient sound, workers and cooler audio are untouched. */
(function(){
 if(window.BarghetoExpertRate93)return;
 const values=[1,1.3,1.5,2],key='bargheto-expert-rate93',media=new Set,listeners=new Set;
 let rate=1;try{const n=Number(localStorage.getItem(key));if(values.includes(n))rate=n;}catch{}
 const label=()=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(rate)+'×';
 function apply(m){try{m.defaultPlaybackRate=rate;m.playbackRate=rate;m.preservesPitch=true;if('mozPreservesPitch'in m)m.mozPreservesPitch=true;if('webkitPreservesPitch'in m)m.webkitPreservesPitch=true;}catch{}}
 function set(n,save=true){if(!values.includes(n))return;rate=n;if(save)try{localStorage.setItem(key,String(n));}catch{}for(const m of media)apply(m);for(const fn of listeners)fn(rate);}
 function register(m){if(!m||media.has(m))return()=>{};media.add(m);const ready=()=>apply(m);m.addEventListener('loadedmetadata',ready);m.addEventListener('play',ready);apply(m);return()=>{media.delete(m);m.removeEventListener('loadedmetadata',ready);m.removeEventListener('play',ready);};}
 function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
 function mount(after){
  const host=document.createElement('span');host.className='expert-rate93';host.dir='rtl';
  const button=document.createElement('button');button.type='button';button.className='expert-rate-button93';button.setAttribute('aria-haspopup','true');button.setAttribute('aria-expanded','false');button.title='سرعت صحبت کارشناس';
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17a9 9 0 1 1 16 0M12 13l4-5"/><circle cx="12" cy="14" r="2"/></svg><bdi></bdi>';
  const menu=document.createElement('span');menu.className='expert-rate-menu93';menu.hidden=true;menu.setAttribute('role','group');menu.setAttribute('aria-label','سرعت صحبت کارشناس');
  for(const value of values){const b=document.createElement('button');b.type='button';b.dataset.rate=String(value);b.textContent=new Intl.NumberFormat('fa-IR').format(value)+'×';b.onclick=()=>{set(value);close();button.focus();};menu.append(b);}
  const render=()=>{button.querySelector('bdi').textContent=label();button.setAttribute('aria-label','سرعت صحبت کارشناس: '+label());for(const b of menu.children)b.setAttribute('aria-pressed',String(Number(b.dataset.rate)===rate));};
  const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false');};
  button.onclick=()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));};
  host.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();close();button.focus();}};
  const outside=e=>{if(!host.contains(e.target))close();};document.addEventListener('pointerdown',outside);
  host.append(button,menu);after.after(host);const off=subscribe(render);render();
  return{element:host,dispose(){off();document.removeEventListener('pointerdown',outside);host.remove();}};
 }
 const style=document.createElement('style');style.textContent=`
 .expert-rate93{position:relative;display:inline-flex;vertical-align:middle;pointer-events:auto;font:600 13px/1.4 Vazirmatn,sans-serif}
 .expert-rate93 button{cursor:pointer;min-height:40px;border:1px solid #87adba;border-radius:10px;background:#f1f9fc;color:#123b4c;padding:7px 10px;font:inherit}
 .expert-rate93 .expert-rate-button93{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
 .expert-rate-button93 svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
 .expert-rate-menu93{position:absolute;bottom:calc(100% + 8px);right:0;display:flex;gap:5px;padding:7px;border-radius:13px;background:#edf7fc;box-shadow:0 4px 20px #102e4b40;z-index:10000;white-space:nowrap}
 .expert-rate-menu93[hidden]{display:none!important}.expert-rate-menu93 button[aria-pressed=true]{background:#087d70;color:white;border-color:#087d70}
 .expert-rate93 button:focus-visible{outline:3px solid #ffb552;outline-offset:2px}
 .expert-speech-tools93{position:absolute;right:max(74px,env(safe-area-inset-right));bottom:104px;z-index:37;display:flex;gap:6px;align-items:center;pointer-events:auto}
 .expert-speech-tools93[hidden]{display:none!important}.expert-speech-tools93>button{min-height:40px;border:1px solid #95c3c9;border-radius:10px;background:#edf7fc;color:#123b4c;padding:7px 11px;cursor:pointer;font:600 13px Vazirmatn,sans-serif}
 .bill-reader-tools90 .expert-rate-menu93{top:calc(100% + 5px);bottom:auto}
 `;document.head.append(style);
 window.BarghetoExpertRate93={values,get value(){return rate},label,set,next(){set(values[(values.indexOf(rate)+1)%values.length]);},register,subscribe,mount};
 window.addEventListener('storage',e=>{if(e.key===key)set(Number(e.newValue),false);});
})();
