// No resolution, animation-rate or visual-quality settings are changed.
export function dashboardCache149(owner,shell){
 if(owner.dashboardCache149?.shell===shell)return owner.dashboardCache149;
 owner.dashboardCache149?.dispose();
 let styles=new WeakMap,measurements=new Map,background=null,imageKey='';
 const invalidate=()=>{styles=new WeakMap;measurements.clear();};
 // Computed declarations are live. Invalidation also handles replaced elements,
 // stylesheet changes, viewport changes and late font availability.
 const observer=typeof MutationObserver==='function'?new MutationObserver(invalidate):null;
 observer?.observe(shell,{subtree:true,attributes:true,attributeFilter:['style','class','hidden']});
 const headObserver=typeof MutationObserver==='function'?new MutationObserver(invalidate):null;
 if(document.head)headObserver?.observe(document.head,{subtree:true,childList:true,characterData:true,attributes:true});
 globalThis.addEventListener?.('resize',invalidate);document.fonts?.addEventListener?.('loadingdone',invalidate);
 const api={shell,style(element){let style=styles.get(element);if(!style){style=getComputedStyle(element);styles.set(element,style);}return style;},
 measure(context,text){const key=context.font+'|'+context.direction+'|'+text;let width=measurements.get(key);if(width===undefined){width=context.measureText(text).width;if(measurements.size>2048)measurements.clear();measurements.set(key,width);}return width;},
 background(context){const im=owner.image,key=im.src+'|'+im.complete+'|'+im.naturalWidth;
  if(!background||key!==imageKey){background=document.createElement('canvas');background.width=1536;background.height=1024;const c=background.getContext('2d');c.fillStyle='#fafbf9';c.fillRect(0,0,1536,1024);if(im.complete&&im.naturalWidth)c.drawImage(im,0,0,1536,1024);imageKey=key;}
  context.drawImage(background,0,0);
 },dispose(){observer?.disconnect();headObserver?.disconnect();globalThis.removeEventListener?.('resize',invalidate);document.fonts?.removeEventListener?.('loadingdone',invalidate);background=null;measurements.clear();}};
 owner.dashboardCache149=api;return api;
}
