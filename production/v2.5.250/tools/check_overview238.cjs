const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const assets=path.resolve(__dirname,'../game/dist/assets');
class Vector3{
 constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}set(x,y,z){Object.assign(this,{x,y,z});return this;}copy(v){return this.set(v.x,v.y,v.z);}clone(){return new Vector3(this.x,this.y,this.z);}setY(y){this.y=y;return this;}add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
 distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}applyAxisAngle(axis,a){assert.equal(axis.y,1);const {x,z}=this,c=Math.cos(a),s=Math.sin(a);this.x=c*x+s*z;this.z=-s*x+c*z;return this;}
 applyQuaternion(q){const{x,y,z}=this,ix=q.w*x+q.y*z-q.z*y,iy=q.w*y+q.z*x-q.x*z,iz=q.w*z+q.x*y-q.y*x,iw=-q.x*x-q.y*y-q.z*z;return this.set(ix*q.w+iw*-q.x+iy*-q.z-iz*-q.y,iy*q.w+iw*-q.y+iz*-q.x-ix*-q.z,iz*q.w+iw*-q.z+ix*-q.y-iy*-q.x);}
}
const quat=yaw=>({x:0,y:Math.sin(yaw/2),z:0,w:Math.cos(yaw/2)});
class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.position=new Vector3;this.quaternion={copy(){return this}};this.visible=true;this.name='';}updateMatrixWorld(){}removeFromParent(){}}
class Disposable{constructor(v){Object.assign(this,v)}dispose(){}}
const T={Vector3,CanvasTexture:Disposable,PlaneGeometry:Disposable,MeshBasicMaterial:Disposable,Mesh,DoubleSide:2,SRGBColorSpace:'srgb'};
function fixture(version){
 const records={placements:[],queues:0,plans:[],speechCalls:[],updates:[]},originalFeet=new Vector3(8,12,8),originYaw=.3;
 const speech={currentTime:0,playing:true,media:{id:1}};
 const story={active:true,topic:'cooler',menuOpen:false,speech,controls:{visible:false},root:{hidden:false,querySelectorAll:()=>[]},tools:{hidden:false,querySelectorAll:()=>[]},update(camera,feet,enabled,immersive,dt){records.updates.push({feet:feet.clone(),enabled,immersive});},end(){this.active=false;}};
 for(const action of ['pause','resume','stop','start'])speech[action]=()=>records.speechCalls.push(action);
 const vr={active:true,session:{id:1},hands:[],view:{position:new Vector3,quaternion:quat(originYaw)},rig:{position:new Vector3,rotation:{y:originYaw}},feet:originalFeet.clone(),anchor:originalFeet.clone(),localHead:new Vector3(.12,1.7,-.08),localRotation:quat(.2),eyeOffset:.04,panel:{visible:false},pending:null,fade:0,
  syncView(){this.view.position.copy(this.localHead).applyAxisAngle(new Vector3(0,1,0),this.rig.rotation.y).add(this.rig.position);this.feet.set(this.view.position.x,this.anchor.y,this.view.position.z);this.view.yaw=this.rig.rotation.y+2*Math.atan2(this.localRotation.y,this.localRotation.w);},
  place(feet,yaw){records.placements.push({feet:feet.clone(),yaw,offset:this.eyeOffset,time:speech.currentTime,headYaw:2*Math.atan2(this.localRotation.y,this.localRotation.w),fade:this.fade});const horizontal=this.localHead.clone().setY(0).applyAxisAngle(new Vector3(0,1,0),yaw);this.rig.rotation.y=yaw;this.rig.position.copy(feet).sub(horizontal);this.rig.position.y+=this.eyeOffset;this.anchor.copy(feet);this.feet.copy(feet);},
  queue(fn){if(!this.pending&&this.fade<=0){records.queues++;this.pending=fn;this.fade=.24;}},
  update(dt,frame){if(frame){this.localHead.copy(frame.position);Object.assign(this.localRotation,frame.orientation);}this.syncView();this.fade=Math.max(0,this.fade-Math.min(.05,dt));if(this.pending&&this.fade<=.12){const fn=this.pending;this.pending=null;fn();this.syncView();}},requestTeleport(){},navigationBlocked:()=>false,handRay(){},teleportLanding(){},onEnd(){}
 };
 const expert={visible:true,userData:{},getWorldPosition:v=>v.copy(originalFeet)},game={vr,city:{cooler:{roofY:12},coolers:[{variant:'standard'},{variant:'bldc'}],coolerExpert87:{group:expert}},coolerStory93:story,scene:{add(){}},disposers:[],physics:{},player:{},renderer:{}};
 vr.place(originalFeet,originYaw);records.placements.length=0;
 const ctx={T,document:{createElement:()=>({getContext:()=>({})})},installSolarDashboard146(){},installVRSettings140(){},installVRScale137(){},installBButton190(){},planCoolerView141(units,shot){records.plans.push(shot);return{feet:shot==='pair'?new Vector3(2,12,4):shot==='standard'?new Vector3(-2,12,3):new Vector3(4,12,-3),target:new Vector3(0,13,0),lift:shot==='pair'?2.8:0};}};
 vm.createContext(ctx);const source=fs.readFileSync(assets+`/vr-experience-2.5.${version}.js`,'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');const cue=fs.readFileSync(assets+'/cooler-camera-2.5.95-r110.js','utf8').split('export class CoolerCamera95')[0].replaceAll('export ','');vm.runInContext(cue+fs.readFileSync(assets+'/vr-overview-selection-2.5.238.js','utf8').replaceAll('export ','')+source+';this.install=installVR125;',ctx);ctx.install(game,T,{safeFeet:()=>true});
 const frame={position:vr.localHead.clone(),orientation:quat(.2)};
 // A conversation is selected after the XR session has initialized.
 story.active=false;vr.update(1/72,frame);story.active=true;speech.media={id:2};
 return{game,vr,story,speech,records,frame,originalFeet,originYaw,step(dt=1/72){vr.update(dt,frame);story.update(vr.view,vr.feet,true,true,dt);}};
}
function overview(version='238'){
 const f=fixture(version),{vr,game}=f,log={picks:0,hover:[],destinations:[],commits:0,mapPicks:0,mapSelects:0};
 vr.rig.rotation.set=function(x,y,z){this.y=y};vr.eyeOffset=.04;vr.marker={visible:false};vr.smallTitle={visible:false};vr.curtain={position:new Vector3,visible:false,material:{opacity:0}};vr.revealAge125=5;vr.origin=new Vector3(0,100,0);vr.direction=new Vector3(0,-1,0);vr.raycaster={ray:{},far:4000};
 let pointed={feature:{id:'solar',areas:[{}]},point:new Vector3(0,0,0)};
 vr.intro={active:true,selectable:true,yaw:.5,orbitSpeed:.02,position:new Vector3(0,100,0),update(dt){this.selection=false;this.yaw+=dt*this.orbitSpeed;},pick(){log.picks++;return pointed;},hover(id){log.hover.push(id);this.selection=true;},start(){this.active=this.selectable=true;}};
 Object.defineProperty(vr,'introducing',{get:()=>vr.intro?.active});vr.handRay=()=>{};vr.notifyIntro=()=>{};vr.onRaycast=()=>{log.mapPicks++;return 2};vr.onSelectRay=()=>{log.mapSelects++;return true};
 vr.onIntroSelection=()=>{};vr.endIntroduction=()=>{log.commits++;vr.intro.active=vr.intro.selectable=false;};
 const right={source:{handedness:'right',gamepad:{buttons:Array.from({length:6},()=>({pressed:false})),axes:[0,.4,0,0]}},group:{visible:true},needsRelease:true,buttons:[],selectHandled:false,cursor:{visible:false,position:new Vector3,scale:{setScalar(){}}},line:{visible:false,scale:{z:1},material:{color:{set(){}}}}};vr.hands=[right];
 const destinations={solar:new Vector3(10,0,10),efficiency:new Vector3(-5,12,-3)};
 game.player.position=new Vector3;game.player.controller={yaw:0};game.player.rig={root:{visible:true}};game.player.teleport=()=>{};
 game.city.features={get:id=>({id,areas:[{}]})};vr.resolveDestination126=selection=>({feet:destinations[selection.feature.id],heading:0});
 const text=fs.readFileSync(assets+'/city-vr-map-2.5.192.js','utf8'),a=text.indexOf('function teleport(id){'),b=text.indexOf('function teleportPoint(',a);
 const arrival=fs.readFileSync(assets+'/vr-arrival-2.5.186.js','utf8').replace('export ','');
 const c={game,vr,T,safeSpawn(){throw Error('Expected safe VR resolver')},beforeTeleport:id=>log.destinations.push(id),close(){},arrivalFailed186:e=>{throw e},paint(){},console};vm.createContext(c);vm.runInContext(arrival+text.slice(a,b)+';this.teleport=teleport;',c);
 game.navigation113={vrMap:{teleport:c.teleport,close(){}}};
 return{...f,log,right,pointTo(id){pointed=id?{feature:{id,areas:[{}]},point:new Vector3(0,0,0)}:null;},aim(){vr.updateIntroduction(1/72)},press(index,on){right.source.gamepad.buttons[index].pressed=on},commit(){for(let i=0;i<25;i++)vr.update(1/72,f.frame);}};
}
const old=overview('237');for(let i=0;i<10;i++)old.aim();assert.equal(old.log.picks,0);assert.equal(old.right.cursor.visible,false);assert(old.right.needsRelease,'Reproduce overview aim disabled by stick drift');
const f=overview();for(let i=0;i<10;i++)f.aim();assert.equal(f.log.picks,10);assert(f.right.cursor.visible);assert(f.vr.intro.selection);assert.equal(f.right.needsRelease,false);assert.equal(f.log.destinations.length,0);
f.press(4,true);f.aim();assert.deepEqual(f.log.destinations,['solar']);assert(f.vr.pending);for(let i=0;i<8;i++)f.aim();assert.equal(f.log.destinations.length,1,'Held A activates once');f.commit();assert.equal(f.log.commits,1);assert(!f.vr.intro.active);assert.deepEqual(f.vr.anchor,new Vector3(10,0,10));
const held=overview();held.press(4,true);for(let i=0;i<5;i++)held.aim();assert(held.right.cursor.visible);assert(held.right.needsRelease);assert.equal(held.log.destinations.length,0);held.press(4,false);held.aim();held.press(4,true);held.aim();assert.equal(held.log.destinations.length,1,'A must release before activating after handoff');
const trigger=overview();trigger.aim();trigger.press(0,true);trigger.pointTo('efficiency');trigger.aim();assert.deepEqual(trigger.log.destinations,['efficiency']);trigger.commit();assert.deepEqual(trigger.vr.anchor,new Vector3(-5,12,-3));
const miss=overview();miss.pointTo(null);miss.aim();assert(!miss.right.cursor.visible);miss.press(4,true);miss.aim();assert.equal(miss.log.destinations.length,0);
const map=overview();map.vr.mapOpen125=true;map.aim();map.press(4,true);map.aim();assert.equal(map.log.picks,0);assert.equal(map.log.mapSelects,1);assert.equal(map.log.destinations.length,0);
const left=overview();left.right.source.handedness='left';left.aim();left.press(4,true);left.aim();assert.equal(left.log.destinations.length,0);left.press(0,true);left.aim();assert.equal(left.log.destinations.length,1,'Left trigger keeps working');
// Execute the real long-B return path and select while B remains physically held.
const back=overview();back.game.officeSession={active:false};back.game.input={clear(){}};back.game.time={resetAccumulator(){}};back.game.coolerStory93.active=false;back.vr.visible=true;back.vr.introReturnFeet=new Vector3;back.vr.camera={updateProjectionMatrix(){}};back.vr.enableIntro=()=>{};back.vr.cancelInput=()=>{for(const h of back.vr.hands){h.needsRelease=true;h.buttons=[];}back.vr.pending=null;back.vr.fade=0;};back.vr.intro.active=back.vr.intro.selectable=false;
let clock=0;const bc={performance:{now:()=>clock}};vm.createContext(bc);vm.runInContext(fs.readFileSync(assets+'/vr-b-button-2.5.191.js','utf8').replaceAll('export ','')+';this.install=installBButton190;',bc);bc.install(back.game);
back.game.vrB190.poll(back.right.source);back.press(5,true);back.game.vrB190.poll(back.right.source);clock=2001;back.game.vrB190.poll(back.right.source);assert(back.vr.intro.active);assert(back.right.cursor.visible);back.pointTo('solar');back.press(4,true);back.aim();assert.deepEqual(back.log.destinations,['solar']);back.commit();assert.equal(back.log.commits,1);
// The independent cooler sequence remains fully active with the new installer.
const cooler=fixture('238');for(let i=0;i<90*72;i++){cooler.speech.currentTime=i/72;cooler.frame.orientation=quat(Math.sin(i/200));cooler.step();}assert.equal(cooler.records.placements.length,8);assert(cooler.records.placements.every(p=>p.yaw===cooler.records.placements[0].yaw));assert.equal(cooler.records.speechCalls.length,0);
const source=fs.readFileSync(assets+'/vr-experience-2.5.238.js','utf8');assert(source.indexOf('installOverviewSelection238(game,T)')<source.indexOf('installVRSettings140(game,T)'),'Settings wrappers must still wrap the overview');
console.log(JSON.stringify({version:'2.5.238',oldStickDriftHoverBlockReproduced:true,hoverIndependentOfInputArming:'pass',AAndTriggerSelectVisibleTarget:'pass',actualMapTeleportAndArrival:'pass',heldSelectRequiresRelease:'pass',longBReturnWhileBStillHeld:'pass',leftTriggerAndNoHit:'pass',expandedMapSelection:'pass',coolerEightShotsAndFreeHeadPreserved:'pass',settingsWrapperOrder:'pass',physicalQuestTest:false},null,2));
