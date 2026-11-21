const rate=()=>window.BarghetoExpertRate93;
function cell(c,x,w,label){c.fillStyle='#e5f5f2';c.beginPath();c.roundRect(x,125,w,104,16);c.fill();c.fillStyle='#133b49';c.fillText(label,x+w/2,177,w-18);}
export function installExpertControls93(game){
 const r=rate(),panel=game.expertPanel,speech=panel.expert.speech;
 const tools=document.createElement('div');tools.className='expert-speech-tools93';tools.hidden=true;tools.dir='rtl';
 const pause=document.createElement('button');pause.type='button';tools.append(pause);panel.talk.after(tools);const control=r.mount(pause);
 pause.onclick=()=>{speech.pauseReasons90?.has('manual93')?speech.resume('manual93'):speech.pause('manual93');};
 const render=panel.render;panel.render=function(){render.call(this);tools.hidden=this.talk.hidden||!['playing','paused','loading'].includes(speech.state);pause.textContent=speech.pauseReasons90?.has('manual93')?'ادامهٔ صدا':'مکث صدا';};
 const readerPause=game.billReader90?.element?.querySelector('[data-bill=pause]')??document.querySelector('.bill-reader92 [data-bill=pause]');const readerRate=readerPause?r.mount(readerPause):null;
 // The city guide's VR prompt has pause, speed and stop as three distinct targets.
 const bills=game.expertBills,select=bills.select,updateBills=bills.update;let lastManual=null;
 bills.promptPanel.scale.setScalar(1.7);
 bills.drawPrompt=function(){const c=this.promptCanvas.getContext('2d');if(!c)return;const m=speech.pauseReasons90?.has('manual93');c.clearRect(0,0,1024,240);c.fillStyle='#163b42';c.beginPath();c.roundRect(2,2,1020,236,24);c.fill();c.fillStyle='#f2fff9';c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.font='700 33px Vazirmatn,sans-serif';c.fillText('کارشناس برقتو',512,60);c.font='600 29px Vazirmatn,sans-serif';cell(c,12,325,this.promptSession?m?'ادامه':'مکث':'صحبت');cell(c,349,325,'◴ '+r.label());cell(c,686,325,'پایان');this.promptTexture.needsUpdate=true;};
 bills.select=function(ray){if(this.allowed&&this.xr&&this.prompt.visible){const hit=ray.intersectObject(this.promptPanel)[0];if(hit?.uv){const i=Math.min(2,Math.floor(hit.uv.x*3));if(i===1)r.next();else if(i===2)this.dismiss();else if(['playing','loading','paused'].includes(speech.state)){speech.pauseReasons90?.has('manual93')?speech.resume('manual93'):speech.pause('manual93');}else speech.start();this.hoverUntil=performance.now()+2200;this.drawPrompt();return true;}}return select.call(this,ray);};
 bills.update=function(...args){const result=updateBills.apply(this,args),manual=!!speech.pauseReasons90?.has('manual93');if(manual!==lastManual){lastManual=manual;this.drawPrompt();}return result;};
 const off=r.subscribe(()=>bills.drawPrompt());bills.drawPrompt();
 // The independent office in VR has its own HTMLAudioElement, registered explicitly.
 const guide=game.vrOffice.guide,unregister=r.register(guide.media),guideSelect=guide.select,tryPlay=guide.tryPlay,stop=guide.stop,playTopic=guide.playTopic;
 guide.tryPlay=function(){if(this.manualPause93)return;return tryPlay.call(this);};
 guide.stop=function(){this.manualPause93=false;return stop.call(this);};
 guide.playTopic=function(...args){this.manualPause93=false;return playTopic.apply(this,args);};
 guide.draw=function(){const c=this.canvas.getContext('2d');if(!c)return;c.clearRect(0,0,1024,256);c.fillStyle='#133632';c.fillRect(0,0,1024,256);c.direction='rtl';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f1fff9';c.font='600 32px Vazirmatn,sans-serif';c.fillText(this.status,512,64,980);c.font='600 32px Vazirmatn,sans-serif';cell(c,15,318,this.current?this.manualPause93||this.blocked?'ادامه':'مکث':'پخش');cell(c,353,318,'◴ '+r.label());cell(c,691,318,'قطع صدا');this.texture.needsUpdate=true;};
 guide.select=function(ray){if(this.rayDistance(ray)===null)return false;const h=this.panel.visible?ray.intersectObject(this.panel)[0]:null;if(!h?.uv)return guideSelect.call(this,ray);const i=Math.min(2,Math.floor(h.uv.x*3));if(i===1)r.next();else if(i===2)this.stop();else if(this.current){this.manualPause93=!this.manualPause93;if(this.manualPause93)this.pauseMedia90();else{this.blocked=false;this.tryPlay();}}else this.startIntro();this.draw();return true;};
 const offGuide=r.subscribe(()=>guide.draw());guide.draw();
 const disposePanel=panel.dispose;panel.dispose=function(){control.dispose();readerRate?.dispose();tools.remove();off();offGuide();unregister();return disposePanel.call(this);};
 return{tools,pause,control,readerRate};
}
