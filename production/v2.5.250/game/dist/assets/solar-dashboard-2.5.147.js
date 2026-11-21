// Small, deterministic presentation variation for this educational dashboard.
// The authoritative server state, SOC, histories and stored energy are untouched.
export function sampleBess146(base,time,state={}){
 if(!base)return base;const nonnegative=v=>Math.max(0,Number(v)||0),powered=state.powered!==false;
 const pv=powered?nonnegative(base.pv)*(1+.012*Math.sin(time*.53)+.006*Math.sin(time*1.17+.7)):0;
 const demand=Math.min(2,nonnegative(base.demand)*(powered?1+.035*Math.sin(time*.71+1.2)+.015*Math.sin(time*1.31):1));
 const bus=pv*.96,solarToLoad=Math.min(bus,demand),spare=Math.max(0,bus-demand),deficit=Math.max(0,demand-bus);
 const stored=nonnegative(base.stored),reserve=nonnegative(base.reserve),capacity=Number.isFinite(state.capacity)?state.capacity:stored+1;
 const charge=powered?Math.min(2,spare*.95,Math.max(0,capacity-stored)*3600):0;
 const discharge=powered?Math.min(2,deficit/.95,Math.max(0,stored-reserve)*3600):0;
 const loadServed=solarToLoad+discharge*.95,unserved=Math.max(0,demand-loadServed),gridExport=Math.max(0,spare-charge/.95);
 const batteryLosses=charge*(1/.95-1)+discharge*.05,voltage=Math.max(300,Math.min(500,nonnegative(base.voltage)+(charge-discharge-(nonnegative(base.charge)-nonnegative(base.discharge)))*.6));
 const values=(base.trackerPower||[]).map(nonnegative),sum=values.reduce((a,b)=>a+b,0),trackerPower=values.map(v=>sum?v/sum*pv:0);
 return {...base,pv,demand,trackerPower,solarToLoad,charge,discharge,loadServed,unserved,gridExport,batteryLosses,losses:pv-bus+batteryLosses,voltage,current:voltage?(charge-discharge)*1000/voltage:0};
}
const routes=[[[1038,780],[1038,797],[1206,797],[1206,818]],[[1206,780],[1206,818]],[[1376,780],[1376,797],[1206,797],[1206,818]]];
export function routePoint146(points,phase){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);let distance=((phase%1)+1)%1*total;
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]||i===lengths.length-1){const f=lengths[i]?distance/lengths[i]:0;return[points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f];}distance-=lengths[i];}return points[0];
}
export function drawBessFlow146(c,snapshot,time,reducedMotion=false){
 c.clearRect(0,0,550,140);if(!snapshot)return;
 const dot=(path,phase,color)=>{const p=routePoint146(path,phase);c.beginPath();c.fillStyle=color;c.arc(p[0]-954,p[1]-770,3.5,0,Math.PI*2);c.fill();};
 if(reducedMotion)return;
 routes.forEach((path,i)=>{if((snapshot.trackerPower?.[i]||0)>.001)for(const offset of [0,.5])dot(path,time/2.5+i*.14+offset,'#1b9661');});
 if(snapshot.loadServed>.001)for(const offset of [0,.5])dot([[1302,856],[1359,856]],time/1.8+offset,'#1676a0');
}
export function installSolarDashboard146(game,T){
 const bess=game.city?.solarBess;if(!bess||bess.live146)return;
 const update=bess.update,configure=bess.configureModal,dispose=bess.dispose;
 const canvas=document.createElement('canvas');canvas.width=550;canvas.height=140;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;
 const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,side:T.DoubleSide});
 const overlay=new T.Mesh(new T.PlaneGeometry(2.35*550/1536,(4.7/3)*140/1024),material);overlay.name='bess-xr-live-flow146';overlay.renderOrder=2501;overlay.visible=false;
 overlay.position.set((954+275-768)*2.35/1536,(512-770-70)*(4.7/3)/1024,.002);bess.panel.add(overlay);
 let lastValues=-Infinity,lastFlow=-Infinity;
 const reduced=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
 bess.configureModal=function(modal){
  const shell=modal.querySelector('.bess-shell');if(this.immersive&&shell&&!shell.querySelector('[data-bess-simulation146]')){const label=document.createElement('div');label.className='live';label.setAttribute('data-bess-simulation146','');label.textContent='SIMULATED · LIVE';label.style.cssText='left:620px;top:25px;width:220px;height:24px;font-size:15px;color:#537268';shell.append(label);}
  const label=shell?.querySelector('[data-bess-simulation146]');if(label){label.hidden=!this.immersive;label.style.display=this.immersive?'flex':'none';}
  lastValues=lastFlow=-Infinity;return configure.call(this,modal);
 };
 bess.update=function(...args){
  const now=performance.now();if(this.immersive&&this.isOpen&&now-lastValues>=200){this.runtime.render();lastValues=now;}
  const result=update.apply(this,args);overlay.visible=!!this.panel.visible;
  if(overlay.visible&&now-lastFlow>=1000/24){lastFlow=now;drawBessFlow146(canvas.getContext('2d'),this.runtime.displayTelemetry146(),Date.now()/1000,reduced?.matches);texture.needsUpdate=true;}
  return result;
 };
 bess.dispose=function(){overlay.removeFromParent();overlay.geometry.dispose();material.dispose();texture.dispose();this.update=update;this.configureModal=configure;this.dispose=dispose;delete this.live146;return dispose.call(this);};
 bess.live146={overlay,canvas};return bess.live146;
}
