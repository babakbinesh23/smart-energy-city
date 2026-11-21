// Non-immersive controls. No WebXR controller, menu or session is changed here.
export function installWebUI182(game,readProfile){
 const overlay=game.overlay,start=overlay.start,fields=start.querySelector('.visitor-fields');
 const intro=start.querySelector('.visitor-intro'),privacy=start.querySelector('.visitor-privacy');
 const old={hidden:fields.hidden,intro:intro.textContent,privacy:privacy.textContent};
 const name=start.querySelector('[name=visitorName]');
 if(!name.value)name.value=readProfile()?.name||'';
 function entry(){
  const normal=overlay.mode!=='vr';
  fields.hidden=normal?false:old.hidden;
  intro.textContent=normal?'برای ورود، نام و شماره موبایل خود را وارد کنید.':old.intro;
  privacy.textContent=normal?'نام و موبایل شما برای ثبت ورود استفاده می‌شود.':old.privacy;
 }
 const show=overlay.show;
 overlay.show=function(screen,...args){const result=show.call(this,screen,...args);if(screen==='start')entry();return result;};
 start.querySelector('.experience-choice').addEventListener('change',entry);
 entry();
 const host=game.renderer.canvas.parentElement,style=document.createElement('style');
 style.textContent=`
 .city-web-tools182{position:absolute;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:46;pointer-events:auto;display:flex;gap:8px}
 .city-web-tools182[hidden]{display:none!important}
 .city-web-tools182>button{width:42px;height:42px;display:grid;place-items:center;border-radius:12px;border:1px solid #ffffff70;background:#163b438c;backdrop-filter:blur(10px);color:#effff8;cursor:pointer;touch-action:manipulation}
 .city-web-tools182 svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
 .city-web-tools182>button[aria-pressed=true]{background:#147e69dd}
 @media (pointer:coarse){
 [data-city-mobile121] button.city-minimap113,.city-minimap113{width:64px;height:64px;right:max(20px,env(safe-area-inset-right));bottom:calc(max(25px,env(safe-area-inset-bottom)) + 76px)}
 }
 `;document.head.append(style);
 const tools=document.createElement('div');tools.className='city-web-tools182';tools.hidden=true;
 const gear=document.createElement('button');gear.type='button';gear.setAttribute('aria-label','تنظیمات تصویر');gear.title='تنظیمات';
 gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 2 3-2 1-3 3-1v-4l-3-1-1-3z"/><circle cx="11" cy="11" r="3"/></svg>';
 gear.onclick=()=>{if(!game.vr.active)game.pause();};
 // Keep the real multiplayer mic in the existing row; use its original event
 // handler and permission flow, rather than starting a second audio stream.
 const mic=game.multiplayer.mic,oldParent=mic.parentElement,oldNext=mic.nextSibling;
 tools.append(mic,gear);host.append(tools);
 const frame=game.frame;
 game.frame=function(...args){
  const result=frame.apply(this,args);
  tools.hidden=!game.enteredCity||game.cinematic.active||game.vr.active||game.officeSession.active||game.settings.hideHud;
  return result;
 };
 game.disposers.push(()=>{game.frame=frame;overlay.show=show;start.querySelector('.experience-choice').removeEventListener('change',entry);oldParent.insertBefore(mic,oldNext);tools.remove();style.remove();});
 return {tools,gear,entry};
}
