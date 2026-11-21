const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'game/dist/assets');
const version=fs.readFileSync(path.join(root,'bargheto-city.php'),'utf8').match(/^ \* Version: ([0-9.]+)$/m)[1];
const origin='https://www.bodara.ir',prefix=origin+'/wp-content/plugins/bargheto-city/game/dist/assets/';
const catalog=JSON.parse(fs.readFileSync(root+'/server-media-manifest.json'));
const urls=Object.fromEntries(Object.entries(catalog).map(([name,s])=>[path.basename(name),origin+'/wp-content/uploads/bargheto-city/assets/'+name+'?sha='+s.sha256.slice(0,16)]));
const logo='bargheto-logo-xleaNlBS.svg';
const resolver=fs.readFileSync(assets+'/media-urls-2.5.223.js','utf8');
function context(mapping=urls){const window={barghetoCityServerMedia109:mapping},ctx={window,URL,location:{href:origin+'/barghetocity/',origin}};vm.createContext(ctx);vm.runInContext(resolver,ctx);return ctx;}
// Reproduce the exact old expression from the failed boot, rather than merely checking the filename exists.
const old='new URL(new URL(`'+logo+'`,import.meta.url).href,``+import.meta.url).href';
const oldURL=vm.runInContext(old.replaceAll('import.meta.url',JSON.stringify(prefix+'index-2.5.225.js')),context());
assert.equal(oldURL,prefix+logo);assert.notEqual(oldURL,urls[logo]);
const main=fs.readFileSync(assets+`/index-${version}.js`,'utf8');
const logoDefinition=main.match(/BT=(.*?),VT=class/);assert(logoDefinition,'Actual logo definition not found');
const expression=logoDefinition[1].replaceAll('import.meta.url',JSON.stringify(prefix+`index-${version}.js`));
assert.equal(vm.runInContext(expression,context()),urls[logo]);
// Direct server mapping must work even if the optional helper has not loaded.
assert.equal(vm.runInNewContext(expression,{window:{barghetoCityServerMedia109:urls},URL}),urls[logo]);
// Standalone complete builds retain a working local asset URL when no map is supplied.
assert.equal(vm.runInContext(expression,context({})),prefix+logo);
// Missing requested SVG at the old path would fail; the corrected request uses the durable media URL.
let requested;
const ctx=context();ctx.fetch=async url=>{requested=url;return {ok:url===urls[logo],status:url===urls[logo]?200:404};};
(async()=>{
 const response=await vm.runInContext('fetch('+expression+')',ctx);assert(response.ok);assert.equal(requested,urls[logo]);
 const graph=[],pending=[assets+`/index-${version}.js`],seen=new Set();
 const imports=/(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?['"](\.[^'"]+)['"]/g;
 const literal=/new URL\((?:`|"|')([^`"']+\.(?:svg|png|webp|jpg|glb|mp3|mp4))(?:`|"|')/g;
 const unmapped=[];let inspected=0;
 while(pending.length){
  const file=path.resolve(pending.pop());if(seen.has(file))continue;seen.add(file);const source=fs.readFileSync(file,'utf8');graph.push(file);
  for(const match of source.matchAll(imports))pending.push(path.resolve(path.dirname(file),match[1]));
  for(const match of source.matchAll(literal)){
   inspected++;const around=source.slice(Math.max(0,match.index-240),match.index);
   if(!around.includes('barghetoMediaURL223')&&!around.includes('barghetoCityServerMedia109'))unmapped.push({module:path.basename(file),name:match[1]});
  }
 }
 assert.deepEqual(unmapped,[],'A literal media URL bypasses the server map');
 const helper=context();for(const name of Object.keys(urls))assert.equal(helper.window.barghetoMediaURL223(prefix+name),urls[name]);
 assert.equal(helper.window.barghetoMediaURL223(prefix+'quality-2.5.222.js'),prefix+'quality-2.5.222.js');
 assert.equal(helper.window.barghetoMediaURL223(origin+'/pictures/city-map-2.5.123.webp'),origin+'/pictures/city-map-2.5.123.webp');
 const result={version,oldLogo404Reproduced:true,actualLogoDefinitionUsesServerURL:true,logoRequest:'pass',standaloneLocalFallback:'pass',directMapWithoutHelper:'pass',reachableModules:seen.size,mediaLiteralsInspected:inspected,unmappedMediaLiterals:unmapped.length,catalogURLs:Object.keys(urls).length,nonMediaURLs:'preserved'};
 console.log(JSON.stringify(result,null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
