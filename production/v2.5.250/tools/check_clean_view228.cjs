const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {chromium}=require(runtime?path.join(runtime,'playwright'):'playwright');
const assets=path.resolve(__dirname,'../game/dist/assets');
const executablePath=process.env.BARGHETO_TEST_CHROMIUM;
(async()=>{
 const browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const results=[];
 try{
  for(const version of ['117','228']){
   const page=await browser.newPage({viewport:{width:1000,height:700}});
   await page.setContent('<!doctype html><html><head></head><body style="margin:0"><canvas id="world" width="1000" height="700" style="background:#27564a"></canvas><div id="hud">HUD</div></body></html>');
   await page.evaluate(()=>{window.callbacks=[];window.setInterval=fn=>{callbacks.push(fn);return callbacks.length;};window.clearInterval=()=>{};});
   await page.addScriptTag({content:fs.readFileSync(assets+'/clean-view-2.5.224.js','utf8')});
   const source=fs.readFileSync(assets+`/online-admin-2.5.${version}.js`,'utf8').replace('export function installOnlineAdmin109','window.installOnlineAdmin109 = function installOnlineAdmin109');
   await page.addScriptTag({content:source});
   await page.evaluate(()=>{
    window.mp={id:'self',isAdmin:true,joined:true,immersive:false,disposed:false,requests:0,async request(){this.requests++;return {count:2,players:[{id:'self',name:'مدیر',role:'admin',room:'city'},{id:'guest',name:'بازدیدکننده',role:'guest',room:'city'}],bans:[]};}};
    window.panel=installOnlineAdmin109(mp);
    window.clean=BarghetoCleanView224({canvas:document.getElementById('world')});
   });
   await page.waitForFunction(()=>!panel.host.hidden&&panel.shadow.querySelector('.count').textContent!=='…');
   await page.evaluate(()=>panel.trigger.click());
   assert.equal(await page.evaluate(()=>panel.drawer.hidden),false);
   // Use the real camera button, then inspect the browser's computed shadow-host style.
   await page.locator('.clean-view224').click();
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
   const during=await page.evaluate(()=>({display:getComputedStyle(panel.host).display,visibility:getComputedStyle(panel.host).visibility,canvas:getComputedStyle(document.getElementById('world')).visibility,hud:getComputedStyle(document.getElementById('hud')).visibility,drawer:panel.drawer.hidden,joined:mp.joined}));
   if(version==='117'){
    assert.notEqual(during.display,'none');assert.equal(during.visibility,'visible');results.push({name:'Original Shadow DOM visibility leak reproduced in Chromium',result:'pass'});await page.close();continue;
   }
   assert.equal(during.display,'none');assert.equal(during.canvas,'visible');assert.equal(during.hud,'hidden');assert.equal(during.drawer,true);assert.equal(during.joined,true);
   const previous=await page.evaluate(()=>mp.requests);
   await page.evaluate(async()=>{callbacks.forEach(fn=>fn());await Promise.resolve();await Promise.resolve();});
   assert.equal(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');assert(await page.evaluate(()=>mp.requests)>previous);
   results.push({name:'Camera hides counter and open drawer; timer cannot reveal them; networking continues',result:'pass'});
   await page.keyboard.press('Escape');
   assert.notEqual(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');assert.equal(await page.evaluate(()=>panel.drawer.hidden),true);
   results.push({name:'Escape restores visible counter and normal drawer state',result:'pass'});
   await page.evaluate(()=>panel.trigger.click());
   assert.equal(await page.evaluate(()=>panel.drawer.hidden),false);
   await page.keyboard.press('F8');assert.equal(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');
   await page.keyboard.press('F8');assert.notEqual(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');assert.equal(await page.evaluate(()=>panel.drawer.hidden),false);
   // A panel created after entering capture must start hidden too.
   await page.evaluate(()=>{clean.set(true);panel.dispose();window.panel=installOnlineAdmin109(mp);});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
   assert.equal(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');
   await page.evaluate(()=>clean.set(false));
   assert.notEqual(await page.evaluate(()=>getComputedStyle(panel.host).display),'none');assert.equal(await page.evaluate(()=>panel.drawer.hidden),true);
   results.push({name:'F8 toggles; dynamically created panel stays hidden and restores its collapsed state',result:'pass'});
   await page.evaluate(()=>{panel.dispose();clean.dispose();});await page.close();
  }
  console.log(JSON.stringify({version:'2.5.228',runtime:'Real Chromium computed CSS and DOM',browser:browser.version(),checks:results},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
