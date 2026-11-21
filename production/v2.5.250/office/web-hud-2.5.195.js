import {createGraphicMap116,mapOrder116} from '../game/dist/assets/graphic-map-2.5.177-media223.js';

// Web office controls share the city artwork and existing audio/light handlers.
// This module is loaded only by the non-XR office bridge.
export function installOfficeWebHUD195(debug,api,cfg){
 const doc=document,host=window;
 const city=()=>{try{const game=host.parent!==host?host.parent.__BARGHETO_CITY87__:null;return game?.officeSession?.frame?.contentWindow===host?game:null;}catch{return null;}};
 const make=(tag,attrs={},text)=>{const node=doc.createElement(tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;return node;};
 const oldSettings=doc.getElementById('settings'),gear=doc.getElementById('settingsButton'),dimmer=doc.getElementById('dimmer'),percent=doc.getElementById('percent'),social=doc.getElementById('office119-social'),mic=social?.querySelector('button');
 if(!gear||!dimmer||!percent||!mic)throw Error('کنترل‌های ساختمان آماده نیستند.');
 const hear=social.querySelectorAll('button')[1],oldGearClick=gear.onclick,oldGearHTML=gear.innerHTML;
 const saved=[gear,mic,dimmer,percent,hear].filter(Boolean).map(node=>({node,parent:node.parentNode,next:node.nextSibling}));
 const style=make('style');style.textContent=`
 #settings,#mapPanel,#office119-social{display:none!important}
 .office-web-tools195{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:46;display:flex;gap:8px;direction:ltr;pointer-events:auto}
 .office-web-tools195[hidden],.office-minimap195[hidden],.office-light195[hidden],.office-map195[hidden],.office-hear195[hidden]{display:none!important}
 .office-web-tools195>button{position:static!important;inset:auto!important;width:42px!important;height:42px!important;min-height:42px!important;padding:0!important;display:grid!important;place-items:center;border-radius:12px!important;border:1px solid #ffffff70!important;background:#163b438c!important;backdrop-filter:blur(10px);color:#effff8!important;cursor:pointer;touch-action:manipulation}
 .office-web-tools195 svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
 .office-web-tools195 [data-mic195]{font-size:0!important;line-height:0!important;position:relative!important}
 .office-web-tools195 [data-mic195]::before{content:'';width:23px;height:23px;background:currentColor;mask:center/contain no-repeat url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round'%3E%3Crect x='9' y='2' width='6' height='12' rx='3'/%3E%3Cpath d='M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8'/%3E%3C/svg%3E")}
 .office-web-tools195 [data-mic195]:not([aria-pressed=true])::after{content:'';position:absolute;left:9px;top:20px;width:24px;height:2px;background:currentColor;transform:rotate(45deg);pointer-events:none}
 .office-web-tools195 [data-mic195][aria-pressed=true]{background:#147e69dd!important}
 .office-hear195{position:fixed;right:12px;top:66px;z-index:47;border:1px solid #84b8aa;background:#163b43ed;color:#effff8;font:12px Vazirmatn,Tahoma,sans-serif}
 #office118-undo{top:112px!important;right:12px!important}
 .office-light195{position:fixed;right:max(12px,env(safe-area-inset-right));top:68px;z-index:60;width:min(320px,calc(100vw - 24px));padding:18px;border:1px solid #6eaa9c;border-radius:18px;background:#112932f5;color:#effff8;box-shadow:0 12px 40px #0005;direction:rtl}
 .office-light195 .heading195{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.office-light195 button{background:#203e47;border:1px solid #496c73;color:#effff8}.office-light195 [data-close]{width:36px;height:36px;padding:0;font-size:22px}.office-light195 label{display:flex;justify-content:space-between;font-size:13px}.office-light195 input[type=range]{width:100%;accent-color:#78cfb7;margin:18px 0}.office-light195 .light-actions195{display:flex;gap:8px}.office-light195 .light-actions195 button{flex:1;min-height:42px}
 .office-minimap195{position:fixed;right:max(18px,env(safe-area-inset-right));bottom:max(24px,env(safe-area-inset-bottom));z-index:36;width:150px;aspect-ratio:1;height:auto;padding:0;border:0;border-radius:50%;overflow:hidden;background:#102932;box-shadow:0 6px 24px #0006;cursor:pointer;color:#effff8;touch-action:manipulation}
 .office-minimap195 canvas{width:100%;height:100%;border-radius:50%;display:block}
 .office-map195{position:fixed;inset:0;z-index:80;background:#07151dcc;display:grid;place-items:center;padding:16px;direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;backdrop-filter:blur(6px)}
 .office-map195 section{width:min(1280px,100%);max-height:calc(100dvh - 32px);overflow:auto;border:1px solid #6eaa9c;border-radius:24px;background:#112932;color:#effff8;padding:20px;box-shadow:0 20px 80px #0006}.office-map195 .map-heading195{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.office-map195 h2{font-size:20px;margin:0}.office-map195 button{font:inherit;color:inherit;cursor:pointer}.office-map195 [data-close]{width:42px;height:42px;padding:0;border-radius:50%;border:1px solid #496c73;background:#203e47;font-size:25px}
 .office-map195 .map-body195{display:grid;grid-template-columns:minmax(0,4fr) minmax(180px,1fr);gap:16px;align-items:start}.office-map195 canvas{width:100%;height:auto;background:#0b222d;border-radius:18px;cursor:pointer;touch-action:manipulation}.office-map195 .map-list195{display:grid;gap:8px}.office-map195 [data-destination]{text-align:right;display:flex;align-items:center;gap:10px;min-height:52px;padding:10px;border:1px solid #416b72;border-radius:12px;background:#1a3a43}.office-map195 [data-destination]:hover{background:#285149;border-color:#86e2ba}.office-map195 [data-destination] b{display:grid;place-items:center;width:26px;height:26px;flex:none;border:1px solid #78cfb7;border-radius:50%;font-size:12px}.office-map195 p{font-size:12px;color:#b7d0d2;line-height:1.8}.office-map195 [role=status]{color:#ffd592;min-height:22px}
 .office-web-tools195 :focus-visible,.office-light195 :focus-visible,.office-map195 :focus-visible,.office-minimap195:focus-visible{outline:3px solid #ffc77d;outline-offset:3px}
 @media(pointer:coarse){.office-minimap195{width:64px;right:max(20px,env(safe-area-inset-right));bottom:calc(max(25px,env(safe-area-inset-bottom)) + 76px)}}
 @media(max-width:700px){.office-map195 section{padding:14px;border-radius:18px}.office-map195 .map-body195{grid-template-columns:1fr}.office-map195 .map-list195{grid-template-columns:1fr 1fr}.office-map195 [data-destination]{font-size:11px;min-height:48px;padding:8px}.office-map195 h2{font-size:17px}}
 `;doc.head.append(style);
 const tools=make('div',{class:'office-web-tools195'});mic.setAttribute('data-mic195','');gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 2 3-2 1-3 3-1v-4l-3-1-1-3z"/><circle cx="11" cy="11" r="3"/></svg>';
 gear.setAttribute('aria-label','تنظیمات نور ساختمان');gear.setAttribute('aria-haspopup','dialog');gear.setAttribute('aria-expanded','false');tools.append(mic,gear);
 const light=make('section',{class:'office-light195',role:'dialog','aria-label':'تنظیم نور ساختمان'});light.hidden=true;
 const heading=make('div',{class:'heading195'}),lightClose=make('button',{type:'button','data-close':'','aria-label':'بستن تنظیمات'},'×');heading.append(make('strong',{},'نور ساختمان'),lightClose);
 const label=make('label',{for:'dimmer'});label.append(doc.createTextNode('شدت نور'),percent);
 const actions=make('div',{class:'light-actions195'}),less=make('button',{type:'button','aria-label':'کاهش نور'},'− کاهش نور'),more=make('button',{type:'button','aria-label':'افزایش نور'},'+ افزایش نور');actions.append(less,more);light.append(heading,label,dimmer,actions);
 const mini=make('button',{class:'office-minimap195',type:'button','aria-label':'بازکردن نقشهٔ شهر و انتخاب مقصد','aria-haspopup':'dialog','aria-expanded':'false'}),small=make('canvas',{width:'320',height:'320','aria-hidden':'true'});mini.append(small);
 const map=make('div',{class:'office-map195'});map.hidden=true;
 const section=make('section',{role:'dialog','aria-modal':'true','aria-label':'نقشهٔ شهر'}),mapHeading=make('div',{class:'map-heading195'}),mapClose=make('button',{type:'button','data-close':'','aria-label':'بستن نقشه'},'×');mapHeading.append(make('h2',{},'کجا می‌خواهی بروی؟'),mapClose);
 const body=make('div',{class:'map-body195'}),large=make('canvas',{width:'1536',height:'1024','aria-label':'موقعیت ساختمان و بخش‌های شهر'}),list=make('div',{class:'map-list195'}),status=make('div',{role:'status','aria-live':'polite'});body.append(large,list);section.append(mapHeading,body,make('p',{},'برای رفتن به هر بخش، روی ساختمان یا نام آن بزن.'),status);map.append(section);
 doc.body.append(tools,light,mini,map);if(hear){hear.classList.add('office-hear195');doc.body.append(hear);}
 const fallbackTitles=['نیروگاه شهید جعفری','تأمین برق صنایع','نیروگاه خورشیدی','صرفه‌جویی انرژی','ساختمان برقتو','تجمیع برق سبز'];
 const features=()=>{const game=city();return game?game.city.features.all.filter(f=>f.areas.length).sort((a,b)=>mapOrder116.indexOf(a.id)-mapOrder116.indexOf(b.id)):mapOrder116.map((id,i)=>({id,title:fallbackTitles[i],areas:[{}]}));};
 const mapGame={get player(){return city()?.player??{position:{x:-70,z:-77}}},get camera(){return city()?.camera??{yaw:0}}};
 const graphic=createGraphicMap116(mapGame,features);
 let open=null,wasPlaying=false,dead=false,busy=false,lastDraw=0,lastMessage='';
 const active=()=>!api.xrActive&&!city()?.vr.active;
 function close(resume=true){
  if(!open)return;const focus=open==='light'?gear:mini;open=null;light.hidden=map.hidden=true;gear.setAttribute('aria-expanded','false');mini.setAttribute('aria-expanded','false');
  if(resume&&wasPlaying&&active()){debug.start97();doc.getElementById('world')?.focus();}else if(resume)focus.focus();wasPlaying=false;
 }
 function show(kind){
  if(dead||!active())return;if(open===kind){close();return;}
  if(!open){wasPlaying=debug.playing;debug.pause97();}open=kind;oldSettings.hidden=true;light.hidden=kind!=='light';map.hidden=kind!=='map';gear.setAttribute('aria-expanded',String(kind==='light'));mini.setAttribute('aria-expanded',String(kind==='map'));
  if(kind==='light'){dimmer.focus();return;}
  status.textContent='';list.replaceChildren();for(const [i,f]of features().entries()){const button=make('button',{type:'button','data-destination':f.id});button.append(make('b',{},new Intl.NumberFormat('fa-IR').format(i+1)),doc.createTextNode(f.title));button.onclick=()=>void destination(f.id);list.append(button);}graphic.draw(large);mapClose.focus();
 }
 async function destination(id){
  if(dead||busy||!active()||open!=='map')return false;
  const game=city();if(!game||!features().some(f=>f.id===id)){status.textContent='انتقال به این مقصد در دسترس نیست.';return false;}
  busy=true;status.textContent='در حال رفتن به مقصد…';
  try{
   if(api.saver113?.pending&&!await api.save()){status.textContent='ابتدا تغییرهای چیدمان را ذخیره کن و دوباره امتحان کن.';return false;}
   if(city()!==game||!active()||open!=='map')return false;
   // Use the normal office exit and existing safe city map teleport. Keep
   // pending administrator saves intact before changing scenes.
   close(false);game.officeSession.close();
   game.navigation113.mini.hidden=false;game.navigation113.open();
   return await game.navigation113.teleport(id);
  }catch(error){status.textContent='انتقال انجام نشد؛ دوباره تلاش کن.';console.warn('Office map',error);return false;}finally{busy=false;}
 }
 gear.onclick=()=>show('light');mini.onclick=()=>show('map');lightClose.onclick=mapClose.onclick=()=>close();map.onclick=e=>{if(e.target===map)close();};
 const change=amount=>{dimmer.value=String(Math.max(+dimmer.min,Math.min(+dimmer.max,+dimmer.value+amount)));dimmer.dispatchEvent(new Event('input',{bubbles:true}));};less.onclick=()=>change(-5);more.onclick=()=>change(5);
 large.onclick=e=>{const r=large.getBoundingClientRect();if(!r.width||!r.height)return;const id=graphic.hit(large,(e.clientX-r.left)*large.width/r.width,(e.clientY-r.top)*large.height/r.height);if(id)void destination(id);};
 function key(e){
  if(!active())return;
  if(e.code==='KeyL'&&!e.repeat&&!(e.target instanceof HTMLInputElement)){e.preventDefault();e.stopImmediatePropagation();show('light');}
  else if(open&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}
  else if(open&&e.key==='Tab'){const nodes=[...(open==='light'?light:map).querySelectorAll('button,input')].filter(n=>!n.disabled);if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus();}}
 }
 host.addEventListener('keydown',key,true);
 const tick=()=>{
  if(dead)return;const hidden=!active()||!!debug.editor?.selected||!!city()?.settings.hideHud;
  tools.hidden=mini.hidden=hidden;if(hear&&hidden)hear.hidden=true;if(hidden)close(false);
  const now=performance.now();if(!hidden&&now-lastDraw>200){lastDraw=now;graphic.drawMini(small);if(open==='map')graphic.draw(large);}
  const message=debug.network119?.snapshot?.message;if(message&&message!==lastMessage){lastMessage=message;debug.toast97?.(message);}
 };
 const observer=debug.scene.onBeforeRenderObservable.add(tick);tick();
 const result={tools,light,map,mini,gear,mic,dimmer,show,close,destination,tick,suspend(){close(false);},dispose(){if(dead)return;close(false);dead=true;host.removeEventListener('keydown',key,true);debug.scene.onBeforeRenderObservable.remove(observer);graphic.dispose();gear.onclick=oldGearClick;gear.innerHTML=oldGearHTML;mic.removeAttribute('data-mic195');for(const s of saved)s.parent.insertBefore(s.node,s.next?.parentNode===s.parent?s.next:null);for(const node of[tools,light,mini,map,style])node.remove();if(hear)hear.classList.remove('office-hear195');}};
 debug.scene.onDisposeObservable.addOnce(()=>result.dispose());return result;
}
