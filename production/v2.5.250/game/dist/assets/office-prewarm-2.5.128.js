import {OfficeSession99} from './office-link-2.5.128.js';
// A paused, muted iframe keeps parsed models and shaders ready for the doorway.
// Only one warm scene exists. It is adopted, rather than rebuilt, on entry.
export function installOfficeWarm127(game){
 const office=game.officeSession,open=office.open,dispose=office.dispose;
 let warm=null,container=null,retryAt=0,expiry=0,dead=false;
 const clear=()=>{clearTimeout(expiry);warm?.dispose();warm=null;container?.remove();container=null;};
 game.prewarmOffice127=()=>{
  if(game.vr.active){clear();void game.officeAssets128?.prefetch();return;}
  const cfg=window.barghetoOffice;if(dead||warm||office.active||performance.now()<retryAt||!cfg?.url)return;
  container=document.createElement('div');container.setAttribute('aria-hidden','true');container.inert=true;
  container.style.cssText='position:fixed;left:-10000px;top:0;width:640px;height:480px;visibility:hidden;pointer-events:none';office.parent.append(container);
  const job=warm=new OfficeSession99(container,office.seed,null),url=new URL(cfg.url,location.href);url.searchParams.set('city-prewarm','1');if(game.vr.active)url.searchParams.set('city-xr','1');
  job.onMessage=e=>{if(e.origin!==job.origin||e.source!==job.frame?.contentWindow||e.data?.protocol!==1||e.data?.token!==job.token)return;
   if(e.data.type==='bargheto-office-ready'){job.ready=true;clearTimeout(job.timeout);clearTimeout(expiry);job.loading?.remove();job.loading=null;}
   else if(e.data.type==='bargheto-office-error'){retryAt=performance.now()+30000;clear();}
  };
  if(!job.open(url)){retryAt=performance.now()+30000;clear();return;}
  expiry=setTimeout(()=>{if(!job.ready){retryAt=performance.now()+30000;clear();}},120000);
 };
 office.open=function(url){
  if(game.vr.active){clear();return open.call(this,url);}
  if(this.active)return false;if(!warm)return open.call(this,url);
  const expected=new URL(window.barghetoOffice.url,location.href),actual=new URL(url,location.href);
  if(expected.href!==actual.href)return open.call(this,url);
  const job=warm,ready=job.ready;warm=null;clearTimeout(expiry);clearTimeout(job.timeout);window.removeEventListener('message',job.receive);
  for(const key of ['frame','panel','token','origin','target','loading']){this[key]=job[key];job[key]=null;}
  this.ready=false;this.onSuspend?.();this.parent.append(this.panel);container?.remove();container=null;
  if(ready)this.onMessage({origin:this.origin,source:this.frame.contentWindow,data:{protocol:1,token:this.token,type:'bargheto-office-ready'}});else this.armTimeout();return true;
 };
 office.dispose=function(){dead=true;clear();return dispose.call(this);};
 game.disposers.push(()=>{dead=true;clear();});
 return {get ready(){return !!warm?.ready;},get warming(){return !!warm;}};
}
