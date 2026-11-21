const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),office=root+'/office/',assets=root+'/game/dist/assets/';
const read=(base,name)=>fs.readFileSync(base+name,'utf8');
const style=()=>({textContent:''});
const results={version:'2.5.235',officeEntries:[]};
for(const base of ['patches-2.5.184.js','patches-vr-2.5.181.js']){
 const c={window:{OfficeHost97:{assetBase:'https://office.test/office/'}},location:{href:'https://office.test/'},URL,document:{createElement:style,head:{append(){}}}};vm.createContext(c);
 for(const name of [base,'interaction-patches-2.5.127.js','water-patches-2.5.235.js','devices-patches-2.5.235.js','ghost-2.5.224.js','mobile-walk-patches-2.5.235.js'])vm.runInContext(read(office,name),c);
 for(const [name,source]of Object.entries(c.window.OfficePatches97)){
  const r=cp.spawnSync(process.execPath,['--input-type=module','--check'],{input:source,encoding:'utf8'});assert.equal(r.status,0,name+': '+r.stderr);
 }
 const game=c.window.OfficePatches97['game.js'];assert(game.includes('water-cooler-2.5.235.js'));assert(game.includes('devices-2.5.235.js'));assert(game.includes('stepFan232(f,'));assert(game.includes('devices232?.updateDoor(doorAmount,doorTarget)'));
 const a=game.indexOf('function toggleLift232('),b=game.indexOf('\n function interact(){',a),toggle=game.slice(a,b);
 let unlocks=0;const f={ready:true,playing:true,window:{Office97:{xrActive:false},officeDebug:{liftRoot:{isEnabled:()=>true}}},pos:{x:0,y:0,z:2},liftPosition:()=>({x:0,y:0,z:17.65}),toast(){},openAudio(){unlocks++},updateInteractionUI(){},doorTarget:0};vm.createContext(f);vm.runInContext(toggle,f);
 assert.equal(f.toggleLift232(true),false,'Remote flag alone cannot bypass web proximity');f.window.Office97.xrActive=true;
 assert.equal(f.toggleLift232(true),true,'Distant pointed XR lift opens');assert.equal(f.doorTarget,1);assert.equal(f.toggleLift232(true),true);assert.equal(f.doorTarget,0);
 f.pos.z=17.7;f.doorTarget=1;assert.equal(f.toggleLift232(true),false,'Door cannot close through occupant');f.playing=false;assert.equal(f.toggleLift232(true),false);assert.equal(unlocks,2);
 const start=game.indexOf('const mobileWalk235='),end=game.indexOf('\n',start),declaration=game.slice(start,end)+'\nthis.running235=running;';
 function running({mobile=false,xr=false,sprint=true,shift=false,ghost=false}={}){const f={navigator:{maxTouchPoints:mobile?1:0},officeTouchLayout169:{matches:mobile},window:{Office97:{xrActive:xr}},touchInput:{sprint},keys:new Set(shift?['ShiftLeft']:[]),ghost222:ghost};vm.runInNewContext(declaration,f);return f.running235;}
 assert(!running({mobile:true}));assert(running({shift:true}));assert(!running({sprint:false}));assert(!running({ghost:true}));assert(running({xr:true,mobile:true}));
 // Mobile speed is exactly the desktop 2.15 baseline at full joystick travel.
 const speed=game.match(/const speed=([^,]+),targetx=/)[1];assert.equal(vm.runInNewContext(speed,{running:false,touchInput:{sprint:true}}),2.15);assert.equal(vm.runInNewContext(speed,{running:true,touchInput:{sprint:false}}),4.25);
 results.officeEntries.push({base,allPatchedModulesSyntax:'pass',remoteLiftAndDoorwayGuard:'pass',mobileWalkingAndDesktopSprint:'pass'});
}
// Exercise the actual pointer dispatcher for both independent office bridges.
for(const name of ['bridge-2.5.235.js','bridge-vr-2.5.235.js']){
 const s=read(office,name),fn=s.slice(s.indexOf('function selectXR(event){'),s.indexOf('function startGrab(event){'));
 const record={asset:'standing-fan',node:{}},liftRoot={},mesh={parent:null};let calls=[];
 const f={api:{xrActive:true},leaving129:false,cityMap125:null,rayFor:()=>({length:30}),editMode:false,cfg:{canEdit:false},debug:{liftRoot,scene:{pickWithRay:()=>({pickedMesh:mesh,pickedPoint:{x:0,y:1,z:18},distance:18})},editor:{owner97:()=>record},toggleFan:(r,near)=>calls.push(['fan',near]),toggleLift232:remote=>calls.push(['lift',remote]),water231:{activateHit:()=>calls.push(['water'])}},navigation127:{select:()=>calls.push(['nav'])}};vm.createContext(f);vm.runInContext(fn,f);
 f.selectXR({inputSource:{}});assert.deepEqual(calls.pop(),['fan',false]);record.asset='water-cooler';f.selectXR({inputSource:{}});assert.deepEqual(calls.pop(),['water']);record.asset='lift';mesh.parent=liftRoot;f.selectXR({inputSource:{}});assert.deepEqual(calls.pop(),['lift',true]);
 mesh.metadata={officeAction97:()=>calls.push(['button'])};f.selectXR({inputSource:{}});assert.deepEqual(calls.pop(),['button']);
}
results.bothXRPointerDispatchers='pass';
// Test actual water guards independently of rendering/shaders.
const water=read(office,'water-cooler-2.5.235.js');
const inReach=water.slice(water.indexOf('function inReach('),water.indexOf('function fitPrompt('));
const activate=water.slice(water.indexOf('function activateHit('),water.indexOf('function click('));
let flag;const item={record:{id:'water',deleted:false,node:{isEnabled:()=>true}},button:{x:0,y:1,z:18}};
const wf={debug:{playing:true,editor:{selected:null}},office:{xrActive:true},canvas:{},Vector3:{Distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)},eye:{x:0,y:1,z:0},disposed:false,items:[item],locate:()=>true,toggle:(id,remote)=>{flag=remote;return true}};vm.createContext(wf);vm.runInContext(inReach+activate,wf);
 assert(!wf.inReach(item));assert(wf.inReach(item,true));assert(wf.activateHit(item.record,{pickedPoint:{x:1,y:1,z:18}}));assert.equal(flag,true);
 wf.office.xrActive=false;assert(!wf.inReach(item,true));assert(!wf.activateHit(item.record,{pickedPoint:{x:1,y:1,z:18}}));wf.office.xrActive=true;item.record.deleted=true;assert(!wf.inReach(item,true));item.record.deleted=false;wf.office.entering131=true;assert(!wf.inReach(item,true));
results.waterBodyPointingAndVRDistanceOnly='pass';
// A and trigger use rising edges; a held A never repeats a device action.
let count=0;const ip={};vm.runInNewContext(read(office,'xr-input-2.5.190.js').replace('export ', '')+';this.poll=pollOfficeButtons126;',ip);const states=new Map(),pad={buttons:Array.from({length:6},()=>({pressed:false}))},controller={inputSource:{handedness:'right',gamepad:pad}},actions={select(){count++},map(){}};
ip.poll(controller,states,actions);pad.buttons[4].pressed=true;ip.poll(controller,states,actions);ip.poll(controller,states,actions);assert.equal(count,1);pad.buttons[4].pressed=false;ip.poll(controller,states,actions);pad.buttons[4].pressed=true;ip.poll(controller,states,actions);assert.equal(count,2);results.AButtonRisingEdges='pass';
// The positive mobile guard leaves desktop, touch laptops with a fine pointer,
// headset browsers and active XR at their original volume/camera distance.
const mobileScope=read(assets,'mobile-scope-2.5.235.js').replace('export ', '')+';this.mobile=isMobile235;';
function mobile({touch=1,coarse=true,ua='Android Chrome',xr=false}={}){const c={navigator:{maxTouchPoints:touch,userAgent:ua},matchMedia:()=>({matches:coarse})};vm.runInNewContext(mobileScope,c);return c.mobile({vr:{active:xr}});}
assert(mobile());assert(!mobile({touch:0}));assert(!mobile({coarse:false}));assert(!mobile({ua:'OculusBrowser Quest'}));assert(!mobile({xr:true}));
const tracker=read(assets,'sun-tracker-controls-2.5.235.js'),audio=read(assets,'tracker-drive-audio-2.5.235.js');assert(tracker.includes('distance*(isMobile235(game)?.7:1)'));assert(audio.includes('(mobile235?4.8:web?1.6:.48)'));
const gain=audio.match(/setTargetAtTime\(\((mobile235\?4\.8:web\?1\.6:\.48)\)/)[1];assert.equal(vm.runInNewContext(gain,{mobile235:true,web:true}),4.8);assert.equal(vm.runInNewContext(gain,{mobile235:false,web:true}),1.6);assert.equal(vm.runInNewContext(gain,{mobile235:false,web:false}),.48);
const gainRatio=4.8/1.6;assert(Math.abs(gainRatio-3)<1e-12);results.mobileScopeAndTripleMotorGain='pass';results.mobileTrackerDistanceFactor=.7;
const php=read(root+'/','office-interior.php');assert(php.includes("'-vr-2.5.235.js':'-2.5.235.js'"));assert(php.indexOf('ghost-2.5.224.js')<php.indexOf('mobile-walk-patches-2.5.235.js'));assert(php.includes('clean-view-2.5.235.js'));
const clean=read(assets,'clean-view-2.5.235.js');assert(!clean.includes('host.append(button)'));assert(!clean.includes('🎥'));assert(clean.includes("e.code==='F8'"));results.noCameraIconMount='pass';
console.log(JSON.stringify(results,null,2));
