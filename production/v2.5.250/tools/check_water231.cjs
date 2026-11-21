const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),src=fs.readFileSync(root+'/office/water-cooler-2.5.231.js','utf8');
const scope={};vm.createContext(scope);vm.runInContext(src.replace(/^import .*?;\s*$/gm,'').replace(/export /g,'')+';globalThis.pour=createPourState231;globalThis.project=stereoVertex;',scope);
const s=scope.pour();s.toggle();const tick=seconds=>{let rise=0;for(let i=0;i<Math.round(seconds*60);i++)rise+=s.tick(1/60);return rise;};
tick(4.9);assert(!s.spilled);assert.equal(s.radius,0);tick(.2);assert(s.spilled);assert(s.radius>0);tick(14.8);assert(s.elapsed<20);assert(tick(.2)>0);s.toggle();const elapsed=s.elapsed,radius=s.radius;assert.equal(tick(2),0);assert.equal(s.elapsed,elapsed);assert.equal(s.radius,radius);assert(s.flow<.001);s.reset();assert.equal(s.elapsed,0);assert.equal(s.radius,0);assert.equal(s.flow,0);assert(!s.on&&!s.spilled);
const shader=scope.project('precision highp float;uniform mat4 viewProjection;void main(){vec3 p=vec3(0.);gl_Position=viewProjection*vec4(p,1.);}');assert(shader.includes('gl_ViewID_OVR==0u?viewProjection:viewProjectionR'));assert(shader.includes('gl_Position=waterProject231(p)'));
const integration=[];
for(const name of ['patches-2.5.184','patches-vr-2.5.181']){
 const text=fs.readFileSync(root+'/office/'+name+'.js','utf8'),patches=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
 const context={window:{OfficePatches97:patches,OfficeHost97:{assetBase:'/office/'}},location:{href:'http://localhost/'},URL};vm.createContext(context);
 for(const p of ['interaction-patches-2.5.127.js','water-patches-2.5.231.js'])vm.runInContext(fs.readFileSync(root+'/office/'+p,'utf8'),context);
 const game=patches['game.js'];assert(game.includes("kind==='water231'?target.label"));assert(game.includes('water231?.update(Math.min(.1,engine.getDeltaTime()/1000))'));assert(game.includes('water231.toggle(target.id)'));assert(game.includes('water231?.reset();pos.x='));
 const parsed=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:game,encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);integration.push(name);
}
for(const name of ['bridge-2.5.231.js','bridge-vr-2.5.231.js']){const code=fs.readFileSync(root+'/office/'+name,'utf8');assert(code.includes('async function leave(){debug?.water231?.reset();'));assert(code.includes('api.releaseSharedXR119=()=>{debug?.water231?.reset();'));assert(code.includes("r?.asset==='water-cooler'"));}
console.log(JSON.stringify({version:'2.5.231',spillAfter5Seconds:'pass',riseAfter20Seconds:'pass',closingStopsRise:'pass',reversibleReset:'pass',QuestMultiviewProjection:'pass',patchedEntries:integration,exitHooks:'pass'},null,2));
