const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const path=require('path');const root=path.resolve(__dirname,'..'),assets=root+'/game/dist/assets';
const load=(name,extra={})=>{let s=fs.readFileSync(assets+'/'+name,'utf8').replace(/^import .*?;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify('file://'+assets+'/'+name));const exports=[];s=s.replace(/export (async function|function|class|const) (\w+)/g,(_,kind,name)=>{exports.push(name);return kind+' '+name});const ctx={console,URL,URLSearchParams,window:{},...extra};vm.createContext(ctx);vm.runInContext(s+'\nObject.assign(globalThis,{'+exports.join(',')+'});',ctx);return ctx;};
const report={version:'2.5.241',checks:[]};const pass=(name,run)=>{run();report.checks.push({name,result:'pass'});};
const buttons=['low','medium','high','ultra'].map(id=>({dataset:{quality:id},classList:{toggle(){}},setAttribute(){}}));
const doc={createElement:()=>({style:{},remove(){}})};
const quality=load('quality-2.5.241.js',{document:doc});
pass('VR preset controls expose only disabled High',()=>{const root={dataset:{},querySelectorAll:()=>buttons};quality.syncQualityRow165(root,'high',true);assert(buttons.every(b=>b.disabled));assert.deepEqual(buttons.filter(b=>!b.hidden).map(b=>b.dataset.quality),['high']);quality.syncQualityRow165(root,'medium',false);assert(buttons.every(b=>!b.disabled&&!b.hidden));});
pass('City quality setter coerces every VR request to High',()=>{
 let applied;const game={settings:{quality:'medium'},setQuality(v){applied=v;this.settings.quality=v},performanceContext:()=>({}),overlay:{mode:'vr',element:{dataset:{},querySelector:()=>null,querySelectorAll:()=>buttons},setQuality(){}},scene:{traverse(){}},disposers:[]};quality.installQuality157(game);for(const level of ['low','medium','high','ultra']){game.setQuality(level);assert.equal(applied,'high');}game.overlay.mode='normal';game.setQuality('low');assert.equal(applied,'low');
});
pass('Auto policy never upgrades or rolls back active VR',()=>{
 const auto=load('auto-quality-2.5.241.js',{document:{hidden:false},localStorage:{getItem:()=>null,removeItem(){}}});let changes=[];
 const game={settings:{quality:'medium'},setQuality(v){this.settings.quality=v;changes.push(v)},performanceContext:()=>({}),overlay:{mode:'vr',start:{querySelector:()=>null}},vr:{active:true,start:async()=>{}},officeSession:{active:false},renderer:{observeFrame(){},webgl:{xr:{isPresenting:true,getSession:()=>({}),addEventListener(){},removeEventListener(){}}}},disposers:[]};
 const api=auto.installAutoQuality160(game,quality.QUALITY157);api.tick(1/72,'city-vr',true,false,72);assert.equal(game.settings.quality,'high');for(let i=0;i<4000;i++)api.tick(i%2?1/120:1/20,'city-vr',true,false,72);assert.equal(game.settings.quality,'high');assert.deepEqual(changes,['high']);
 let selected='low';const standalone=auto.installOfficeAuto160({scene:{onBeforeRenderObservable:{add(){},remove(){}},onDisposeObservable:{addOnce(){}}}},{parent:{},performance:{now:()=>0}},v=>selected=v,()=>selected,()=>null);standalone.beginXR();assert.equal(selected,'high');
});

const resume=require('fs').readFileSync(assets+'/xr-resume-2.5.241.js','utf8');assert(!resume.includes("game.setQuality(levels[index-1])"));console.log(JSON.stringify({...report,recoveryDoesNotDowngradeVR:'pass'},null,2));
