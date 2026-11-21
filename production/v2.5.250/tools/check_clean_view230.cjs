const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {chromium}=require(runtime?path.join(runtime,'playwright'):'playwright');
const assets=path.resolve(__dirname,'../game/dist/assets');
const executablePath=process.env.BARGHETO_TEST_CHROMIUM;
(async()=>{
 const browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const checks=[];
 try{
  for(const [width,height,onlineVersion,reducedMotion] of [[1920,1080,'117','no-preference'],[390,844,'228','no-preference'],[844,390,'228','reduce']]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion});
   await page.setContent('<!doctype html><html><head></head><body><div id="app"><canvas id="world" style="width:100%;height:100%"></canvas><div id="hud">HUD</div><div class="city-cinematic visible" id="reference"><div class="cinema-bar cinema-top"></div><div class="cinema-bar cinema-bottom"></div></div></div></body></html>');
   await page.addStyleTag({content:fs.readFileSync(assets+'/index-24cbce3b73.css','utf8')});
   await page.evaluate(()=>{window.callbacks=[];const nativeInterval=window.setInterval;window.setInterval=(fn,delay)=>{callbacks.push(fn);return nativeInterval(fn,delay);};});
   await page.addScriptTag({content:fs.readFileSync(assets+'/clean-view-2.5.230.js','utf8')});
   const online=fs.readFileSync(assets+`/online-admin-2.5.${onlineVersion}.js`,'utf8').replace('export function installOnlineAdmin109','window.installOnlineAdmin109 = function installOnlineAdmin109');
   await page.addScriptTag({content:online});
   await page.evaluate(()=>{
    window.mp={id:'self',isAdmin:true,joined:true,immersive:false,disposed:false,requests:0,async request(){this.requests++;return {count:1,players:[{id:'self',name:'مدیر',role:'admin',room:'city'}],bans:[]};}};
    window.panel=installOnlineAdmin109(mp);window.clean=BarghetoCleanView224({canvas:document.getElementById('world')});
   });
   await page.waitForFunction(()=>!panel.host.hidden);
   await page.locator('.clean-view224').click();
   await page.waitForFunction(()=>Math.abs(clean.bars.querySelector('.cinema-top').getBoundingClientRect().top)<0.5);
   const actual=await page.evaluate(()=>{
    const measure=node=>{const r=node.getBoundingClientRect(),c=getComputedStyle(node);return {height:r.height,cssHeight:c.height,top:r.top,bottom:r.bottom,width:r.width,background:c.backgroundColor,transition:c.transitionDuration,ease:c.transitionTimingFunction,visibility:c.visibility};};
    return {top:measure(clean.bars.querySelector('.cinema-top')),bottom:measure(clean.bars.querySelector('.cinema-bottom')),referenceTop:measure(document.querySelector('#reference .cinema-top')),referenceBottom:measure(document.querySelector('#reference .cinema-bottom')),online:getComputedStyle(panel.host).display,canvas:getComputedStyle(document.getElementById('world')).visibility,hud:getComputedStyle(document.getElementById('hud')).visibility};
   });
   assert.equal(actual.top.cssHeight,actual.referenceTop.cssHeight);assert.equal(actual.bottom.cssHeight,actual.referenceBottom.cssHeight);assert(Math.abs(actual.top.height-actual.referenceTop.height)<0.01);assert(Math.abs(actual.bottom.height-actual.referenceBottom.height)<0.01);assert.equal(actual.top.background,actual.referenceTop.background);assert.equal(actual.bottom.background,actual.referenceBottom.background);assert.equal(actual.top.transition,actual.referenceTop.transition);assert.equal(actual.top.ease,actual.referenceTop.ease);
   assert.equal(actual.top.width,width);assert(Math.abs(actual.bottom.bottom-height)<0.5);assert.equal(actual.online,'none');assert.equal(actual.canvas,'visible');assert.equal(actual.hud,'hidden');assert.equal(actual.top.visibility,'visible');
   await page.evaluate(async()=>{callbacks.forEach(fn=>fn());await panel.refresh();});assert.equal(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');
   await page.evaluate(()=>{panel.dispose();window.panel=installOnlineAdmin109(mp);});
   await page.waitForFunction(()=>!panel.host.hidden);
   assert.equal(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');
   // Optional capture a local QA image; never part of the release or Library.
   if(process.env.BARGHETO_TEST_SCREENSHOT&&width===1920)await page.screenshot({path:process.env.BARGHETO_TEST_SCREENSHOT});
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>clean.bars.querySelector('.cinema-top').getBoundingClientRect().bottom<0.5);
   assert.notEqual(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('hud')).visibility),'visible');
   await page.keyboard.press('F8');await page.waitForFunction(()=>Math.abs(clean.bars.querySelector('.cinema-top').getBoundingClientRect().top)<0.5);
   await page.keyboard.press('F8');assert.equal(await page.evaluate(()=>clean.enabled),false);
   await page.evaluate(()=>{panel.dispose();clean.dispose();});assert.equal(await page.locator('[data-clean-bars230]').count(),0);
   checks.push({viewport:`${width}x${height}`,onlineVersion,reducedMotion,barHeight:actual.top.height,barColor:actual.top.background,referenceMatch:'exact',onlineAndHudHidden:'pass',lateOnlinePanelHidden:'pass',timerCannotRevealPanel:'pass',escapeAndF8:'pass',cleanup:'pass'});
   await page.close();
  }
  // An embedded office uses the outer city's frame rather than adding a second one.
  const outer=await browser.newPage({viewport:{width:1000,height:700}});
  await outer.setContent('<!doctype html><html><head></head><body><canvas id="world"></canvas><iframe class="office-session-frame" srcdoc="<!doctype html><html><head></head><body><canvas id=world></canvas></body></html>"></iframe></body></html>');
  const capture=fs.readFileSync(assets+'/clean-view-2.5.230.js','utf8');
  await outer.addScriptTag({content:capture});await outer.evaluate(()=>window.clean=BarghetoCleanView224({canvas:document.getElementById('world')}));
  const child=outer.frames().find(f=>f!==outer.mainFrame());assert(child);
  await child.addScriptTag({content:capture});await child.evaluate(()=>window.clean=BarghetoCleanView224({canvas:document.getElementById('world')}));
  await child.evaluate(()=>clean.set(true));
  assert.equal(await outer.evaluate(()=>clean.enabled),true);assert.equal(await child.evaluate(()=>clean.enabled),true);assert.equal(await child.evaluate(()=>clean.bars.hidden),true);assert.equal(await outer.evaluate(()=>clean.bars.hidden),false);
  await child.evaluate(()=>clean.set(false));assert.equal(await outer.evaluate(()=>clean.enabled),false);
  checks.push({officeIframe:'pass',parentStatePropagation:'pass',singleOuterCinematicFrame:'pass'});await outer.close();
  console.log(JSON.stringify({version:'2.5.230',runtime:'Real Chromium; actual overview CSS and capture module',browser:browser.version(),checks},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
