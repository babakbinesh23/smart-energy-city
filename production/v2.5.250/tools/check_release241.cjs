const fs=require('fs'),vm=require('vm'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');const root=path.resolve(__dirname,'..'),assets=root+'/game/dist/assets',office=root+'/office',checks=[];
function runHistorical(name,adapt=x=>x){const code=adapt(fs.readFileSync(__dirname+'/'+name,'utf8')),m={exports:{}};new Function('require','__dirname','module','exports',code)(require,__dirname,m,m.exports);checks.push(name);}
runHistorical('check_interactions235.cjs',s=>s.replaceAll('bridge-2.5.235.js','bridge-2.5.241.js').replaceAll('bridge-vr-2.5.235.js','bridge-vr-2.5.241.js').replace("'-vr-2.5.235.js':'-2.5.235.js'","'-vr-2.5.241.js':'-2.5.241.js'"));
runHistorical('check_cooler_vr237.cjs',s=>s.replaceAll("fixture('237')","fixture('241')").replace("vm.runInContext(cue+source+", "vm.runInContext(cue+fs.readFileSync(assets+'/vr-overview-selection-2.5.238.js','utf8').replaceAll('export ','')+source+"));
runHistorical('check_overview238.cjs',s=>s.replace("function overview(version='238')","function overview(version='240')").replace("const cooler=fixture('238')","const cooler=fixture('241')"));
runHistorical('check_map227.cjs',s=>s.replaceAll('city-navigation-2.5.227.js','city-navigation-2.5.241.js'));
// Validate the current PHP script order and every patched office module,
// including the XR-only entry additions and the actual dynamic file URLs.
const php=fs.readFileSync(root+'/office-interior.php','utf8');assert(php.includes("'-vr-2.5.241.js':'-2.5.241.js'"));assert(php.includes("'loader-vr-2.5.241.js'"));assert(php.indexOf('ghost-2.5.224.js')<php.indexOf('mobile-walk-patches-2.5.235.js'));
for(const vr of [false,true]){
 const c={window:{OfficeHost97:{assetBase:'https://local.test/office/'}},location:{href:'https://local.test/'},URL,document:{createElement:()=>({}),head:{append(){}}}};vm.createContext(c);
 for(const n of [vr?'patches-vr-2.5.181.js':'patches-2.5.184.js','interaction-patches-2.5.127.js','water-patches-2.5.235.js','devices-patches-2.5.235.js','ghost-2.5.224.js','mobile-walk-patches-2.5.235.js',...(vr?['model-load-patches-2.5.241.js','entry-2.5.138.js']:[])])vm.runInContext(fs.readFileSync(office+'/'+n,'utf8'),c);
 for(const [name,source]of Object.entries(c.window.OfficePatches97)){const r=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});assert.equal(r.status,0,name+': '+r.stderr);}
}
for(const file of [office+'/bridge-2.5.241.js',office+'/bridge-vr-2.5.241.js',office+'/loader-vr-2.5.241.js']){const text=fs.readFileSync(file,'utf8');for(const m of text.matchAll(/(?:cfg\.assetBase\+|'kit\/[^']+':asset\()'([^']+\.js)'/g)){const p=path.resolve(office,m[1]);assert(fs.existsSync(p),'Missing dynamic office module: '+p);}}
for(const dir of [assets,office])for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('2.5.241.js'))){const r=cp.spawnSync(process.execPath,['--check',dir+'/'+name],{encoding:'utf8'});assert.equal(r.status,0,name+': '+r.stderr);}
const xml=fs.readFileSync(office+'/source-v22.html','utf8');assert.equal(require('crypto').createHash('sha256').update(xml).digest('hex'),'31cb1415ca7ea64614fced5abc7a0cc5308fdb7f5247a7ad082d3a88878d69d8');
const speech=fs.readFileSync(assets+'/expert-controls-2.5.239.js','utf8');assert(speech.includes('if(this.xr)this.prompt.visible=false;'));assert(fs.readFileSync(assets+'/index-2.5.241.js','utf8').includes('./expert-controls-2.5.239.js'));
console.log(JSON.stringify({version:'2.5.241',regressionSuites:checks,currentOfficeWebAndXRPatchSyntax:'pass',dynamicOfficeImports:'pass',allNewModuleSyntax:'pass',originalBuildingPayloadSHA:'pass',factoryVRGreenPanelStillHidden:'pass'},null,2));
