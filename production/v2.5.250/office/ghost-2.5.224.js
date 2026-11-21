// Extend the integration source; preserve the supplied office payload.
(()=>{
 const patches=window.OfficePatches97;let source=patches['game.js'];
 const replace=(a,b)=>{if(!source.includes(a))throw Error('Office ghost patch mismatch: '+a);source=source.replace(a,b);};
 replace('let scene,viewer,camera,engine,ready=false,playing=false,locked=false,dragging=false;', 'let scene,viewer,camera,engine,ready=false,playing=false,locked=false,dragging=false;let ghost222=false,ghostReturn222=null,ghostLift222=0;');
 replace('function blocks(x,z){',`
 function setGhost222(value){
  const on=!!value;if(on&&(!window.OfficeHost97?.canEdit||window.Office97?.xrActive))return false;
  if(on===ghost222)return true;
  if(on)ghostReturn222={x:pos.x,y:pos.y,z:pos.z,yaw,pitch};
  else if(ghostReturn222){Object.assign(pos,{x:ghostReturn222.x,y:ghostReturn222.y,z:ghostReturn222.z});yaw=ghostReturn222.yaw;pitch=ghostReturn222.pitch;ghostReturn222=null;}
  ghost222=on;ghostLift222=0;vertical=0;vel.x=vel.z=0;grounded=!on;keys.clear();resetJoystick();
  document.documentElement.toggleAttribute('data-office-ghost222',on);window.Office97?.webHUD195?.close(false);
  return true;
 }
 function mountGhost222(){
  if(!window.OfficeHost97?.canEdit)return;
  const style=document.createElement('style');style.textContent=\`html[data-office-ghost222] .office-minimap195,html[data-office-ghost222] .office-map195,html[data-office-ghost222] #mapPanel,html[data-office-ghost222] #office119-social{display:none!important}.office-ghost222{position:fixed;bottom:20px;left:18px;z-index:70;direction:rtl;color:white;font:13px Vazirmatn,Tahoma}.office-ghost222 button{font:inherit;min-height:42px;padding:8px 12px;color:white;background:#163b43ed;border:1px solid #84b8aa;border-radius:10px;touch-action:none}.office-ghost222[hidden],.office-ghost222 [hidden]{display:none!important}\`;document.head.append(style);
  const tools=document.createElement('div');tools.className='office-ghost222';const button=document.createElement('button'),verticalTools=document.createElement('span');button.type='button';button.title='G · فاصله: بالا · Shift: پایین';tools.append(button,verticalTools);
  button.onclick=()=>{setGhost222(!ghost222);if(ready&&!playing)start();canvas.focus();};
  for(const [text,value]of [['▲ بالا',1],['▼ پایین',-1]]){const b=document.createElement('button');b.type='button';b.textContent=text;b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);ghostLift222=value;};const release=()=>{ghostLift222=0;};b.onpointerup=b.onpointercancel=b.onlostpointercapture=release;verticalTools.append(b);}
  document.body.append(tools);let last=null;
  const observer=scene.onBeforeRenderObservable.add(()=>{tools.hidden=!!window.Office97?.xrActive;if(tools.hidden&&ghost222)setGhost222(false);if(last!==ghost222){last=ghost222;button.textContent=ghost222?'👻 خاموش‌کردن حالت روح':'👻 حالت روح / پرواز';button.setAttribute('aria-pressed',String(ghost222));verticalTools.hidden=!ghost222;}});
  const blur=()=>{ghostLift222=0;};addEventListener('blur',blur);
  scene.onDisposeObservable.addOnce(()=>{removeEventListener('blur',blur);scene.onBeforeRenderObservable.remove(observer);style.remove();tools.remove();document.documentElement.removeAttribute('data-office-ghost222');});
 }
 function blocks(x,z){if(ghost222)return false;`);
 replace('function move(dx,dz){', 'function move(dx,dz){if(ghost222){pos.x+=dx;pos.z+=dz;return;}');
 replace('function reset(){', 'function reset(){if(ghost222)setGhost222(false);');
 replace('window.officeDebug={scene,', 'window.officeDebug={get ghost222(){return ghost222;},setGhost222,scene,');
 replace('window.Office97?.mount(window.officeDebug);', 'mountGhost222();window.Office97?.mount(window.officeDebug);');
 replace("const running=keys.has('ShiftLeft')||keys.has('ShiftRight')||!!touchInput.sprint;", "const running=!ghost222&&(keys.has('ShiftLeft')||keys.has('ShiftRight')||!!touchInput.sprint);");
 replace('if(!grounded){vertical-=',"if(ghost222){pos.y+=((keys.has('Space')?1:0)-(keys.has('ShiftLeft')||keys.has('ShiftRight')?1:0)+ghostLift222)*3*dt;}\n  if(!ghost222&&!grounded){vertical-=");
 replace('if(grounded&&dist>', 'if(!ghost222&&grounded&&dist>');
 replace("if(e.code==='Space'&&!e.repeat&&grounded)","if(e.code==='Space'&&!e.repeat&&grounded&&!ghost222)");
 replace("if(e.code==='KeyM'&&!e.repeat){", "if(e.code==='KeyG'&&!e.repeat&&!e.ctrlKey&&!e.metaKey){e.preventDefault();setGhost222(!ghost222);return;}if(e.code==='KeyM'&&!e.repeat){if(ghost222)return;");
 patches['game.js']=source;
})();
