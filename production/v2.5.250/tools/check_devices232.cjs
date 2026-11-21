const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process'),os=require('os');
const root=path.resolve(__dirname,'..'),office=path.join(root,'office');
const source=fs.readFileSync(path.join(office,'devices-2.5.232.js'),'utf8');
const helpers={};vm.runInNewContext(source.replace(/^import[^\n]+\n/,'').replace(/export /g,'')+'\nthis.stepFan232=stepFan232;this.createOpenEdge232=createOpenEdge232;',helpers);
const {stepFan232,createOpenEdge232}=helpers;
function sample(on,seconds,hz=60,speed=on?0:1){const f={on,speed232:speed};let angle=0;for(let i=0;i<Math.round(seconds*hz);i++)angle+=stepFan232(f,1/hz);return {speed:f.speed232,angle};}
const off=sample(false,.1);assert(off.speed>0&&off.speed<1);assert(off.angle>0);assert.equal(sample(false,5).speed,0);
assert(sample(true,.1).speed>0&&sample(true,.1).speed<1);assert.equal(sample(true,4).speed,1);
assert(Math.abs(sample(false,1,30).angle-sample(false,1,90).angle)<1e-10);
assert(Math.abs(sample(true,1,30).angle-sample(true,1,90).angle)<1e-10);
const f={on:false,speed232:1};stepFan232(f,.2);const before=f.speed232;f.on=true;stepFan232(f,1/60);assert(f.speed232>before&&f.speed232<1);
const edge=createOpenEdge232();assert(!edge(0,0));assert(!edge(.6,1));assert(edge(1,1));for(let i=0;i<100;i++)assert(!edge(1,1));assert(!edge(.5,0));assert(edge(1,1));
const entries=[];for(const base of ['patches-2.5.184','patches-vr-2.5.181']){
 const c={window:{OfficeHost97:{assetBase:'https://office.test/office/'}},location:{href:'https://office.test/'},URL};vm.createContext(c);
 for(const name of [base,'interaction-patches-2.5.127','water-patches-2.5.231','devices-patches-2.5.232'])vm.runInContext(fs.readFileSync(path.join(office,name+'.js'),'utf8'),c);
 const game=c.window.OfficePatches97['game.js'];const temp=path.join(os.tmpdir(),base+'-232.mjs');fs.writeFileSync(temp,game);cp.execFileSync(process.execPath,['--check',temp]);fs.unlinkSync(temp);
 assert(game.includes('speed232:1'));assert(game.includes('stepFan232(f,'));assert(game.includes('water231?.update'));assert(game.includes('devices232?.updateDoor(doorAmount,doorTarget)'));
 const toggle=game.slice(game.indexOf('function toggleLift232(){'),game.indexOf('\n function interact(){',game.indexOf('function toggleLift232(){')));
 let audioCalls=0;const fixture={ready:true,playing:true,window:{officeDebug:{liftRoot:{isEnabled:()=>true}}},pos:{x:1.3,y:0,z:17},liftPosition:()=>({x:0,y:0,z:17.65}),toast:()=>{},openAudio:()=>audioCalls++,updateInteractionUI:()=>{},doorTarget:0};vm.createContext(fixture);vm.runInContext(toggle,fixture);
 assert(fixture.toggleLift232());assert.equal(fixture.doorTarget,1);assert(fixture.toggleLift232());assert.equal(fixture.doorTarget,0);
 fixture.pos.z=2;assert.equal(fixture.toggleLift232(),false);assert.equal(fixture.doorTarget,0);
 fixture.pos.x=0;fixture.pos.z=17.7;fixture.doorTarget=1;assert.equal(fixture.toggleLift232(),false);assert.equal(fixture.doorTarget,1);
 fixture.pos.z=17;fixture.playing=false;assert.equal(fixture.toggleLift232(),false);assert.equal(audioCalls,2);
 entries.push(base);
}
console.log(JSON.stringify({version:'2.5.232',fanAcceleration:'pass',fanCoasting:'pass',frameRateIndependentAngle:'pass',rapidReverse:'pass',singleChimePerFullOpen:'pass',reopenChime:'pass',patchedEntries:entries,liftDistanceAndDoorwayGuard:'pass',waterIntegrationRetained:'pass'},null,2));
