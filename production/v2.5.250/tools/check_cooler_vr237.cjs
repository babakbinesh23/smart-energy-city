const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const assets=path.resolve(__dirname,'../game/dist/assets');
class Vector3{
 constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}set(x,y,z){Object.assign(this,{x,y,z});return this;}copy(v){return this.set(v.x,v.y,v.z);}clone(){return new Vector3(this.x,this.y,this.z);}setY(y){this.y=y;return this;}add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
 applyAxisAngle(axis,a){assert.equal(axis.y,1);const {x,z}=this,c=Math.cos(a),s=Math.sin(a);this.x=c*x+s*z;this.z=-s*x+c*z;return this;}
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
 vm.createContext(ctx);const source=fs.readFileSync(assets+`/vr-experience-2.5.${version}.js`,'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');const cue=fs.readFileSync(assets+'/cooler-camera-2.5.95-r110.js','utf8').split('export class CoolerCamera95')[0].replaceAll('export ','');vm.runInContext(cue+source+';this.install=installVR125;',ctx);ctx.install(game,T,{safeFeet:()=>true});
 const frame={position:vr.localHead.clone(),orientation:quat(.2)};
 // A conversation is selected after the XR session has initialized.
 story.active=false;vr.update(1/72,frame);story.active=true;speech.media={id:2};
 return{game,vr,story,speech,records,frame,originalFeet,originYaw,step(dt=1/72){vr.update(dt,frame);story.update(vr.view,vr.feet,true,true,dt);}};
}
function runTimeline(f){for(let i=0;i<90*72;i++){f.speech.currentTime=i/72;f.frame.orientation=quat(Math.sin(i/200)*1.1);f.frame.position.x=.12+.08*Math.sin(i/150);f.step();}}
const stuck=fixture('236');runTimeline(stuck);assert.equal(stuck.records.placements.length,1,'Reproduce stopped camera sequence in 236');
const old=fixture('192');runTimeline(old);assert.equal(old.records.placements.length,8);assert(new Set(old.records.placements.map(p=>p.yaw.toFixed(5))).size>3,'Reproduce forced head recentering at cue changes');
const fixed=fixture('237');runTimeline(fixed);
const expected=['pair','standard','bldc','standard','bldc','pair','bldc','pair'];
assert.deepEqual(fixed.records.plans,expected,'Every narrated shot selects its own intended cooler');assert.equal(fixed.records.placements.length,8,'All eight original views run');
assert.equal(new Set(fixed.records.placements.map(p=>p.feet.x+','+p.feet.z)).size,3,'Pair and both individual destinations are used');
const yaw=fixed.records.placements[0].yaw;assert(fixed.records.placements.every(p=>p.yaw===yaw),'Head turns at cue boundaries must never reset the rig heading');
assert(fixed.records.placements.every(p=>p.fade<=.12&&p.fade>0),'Each scene move commits inside the native fade');
const cueTimes=[0,2.48,5.44,32.09,36.62,56.78,67.34,73.26];fixed.records.placements.forEach((p,i)=>assert(p.time>=cueTimes[i]&&p.time<cueTimes[i]+.3,'Scene cue stays synchronized with narration'));
fixed.records.placements.forEach((p,i)=>assert(Math.abs(p.offset-(expected[i]==='pair'?3.04:.24))<1e-12,'Eye height is replaced, never accumulated'));
assert.equal(fixed.records.speechCalls.length,0,'Camera sequence never changes narration playback');assert.equal(fixed.speech.currentTime,(90*72-1)/72);assert(fixed.records.updates.every(e=>e.feet.x===8&&e.feet.y===12&&e.feet.z===8),'Expert remains audible at all destinations');
const position=fixed.vr.rig.position.clone();for(const h of [-1.2,-.6,0,.7,1.25]){fixed.frame.orientation=quat(h);fixed.step();assert.equal(fixed.vr.rig.rotation.y,yaw);assert(Math.abs(fixed.vr.view.yaw-(yaw+h))<1e-12);assert.deepEqual(fixed.vr.rig.position,position);assert.deepEqual(fixed.vr.localRotation,quat(h));}
const eye=fixed.vr.view.position.clone();fixed.frame.position.x+=.12;fixed.step();assert(Math.hypot(fixed.vr.view.position.x-eye.x,fixed.vr.view.position.z-eye.z)>.119);
const before=fixed.records.placements.length;fixed.speech.currentTime=3;for(let i=0;i<30;i++)fixed.step();assert.equal(fixed.records.placements.length,before+1,'Seeking back restores the relevant shot once');for(let i=0;i<100;i++)fixed.step();assert.equal(fixed.records.placements.length,before+1,'A held audio cue never repeats placement');
fixed.speech.media={id:3};for(let i=0;i<30;i++)fixed.step();assert.equal(fixed.records.placements.length,before+2,'Restart/new media resumes the shot sequence');assert.equal(fixed.vr.rig.rotation.y,yaw);
fixed.story.active=false;for(let i=0;i<30;i++)fixed.step();assert(Math.abs(fixed.vr.eyeOffset-.04)<1e-12);assert.deepEqual(fixed.vr.anchor,fixed.originalFeet);assert.equal(fixed.vr.rig.rotation.y,fixed.originYaw);
// Preserve a deliberate controller turn and the current physical head direction
// when the next shot commits, including head movement during the fade.
const turned=fixture('237');for(let i=0;i<30;i++)turned.step();turned.vr.rig.rotation.y+=Math.PI/6;const manualYaw=turned.vr.rig.rotation.y;turned.speech.currentTime=3;turned.step();turned.frame.orientation=quat(1.2);for(let i=0;i<30;i++)turned.step();assert.equal(turned.vr.rig.rotation.y,manualYaw);assert(Math.abs(turned.vr.view.yaw-(manualYaw+1.2))<1e-12);
const paused=fixture('237');paused.step();paused.speech.playing=false;for(let i=0;i<25;i++)paused.step();assert.equal(paused.records.placements.length,0);paused.speech.playing=true;for(let i=0;i<35;i++)paused.step();assert.equal(paused.records.placements.length,1);
// If a seek crosses a cue while the fade is pending, discard the obsolete shot.
const seek=fixture('237');seek.step();seek.speech.currentTime=6;for(let i=0;i<50;i++)seek.step();assert.equal(seek.records.placements.length,1);assert.equal(seek.records.placements[0].feet.x,4);
for(const kind of ['cancel','end','exit','menu']){const f=fixture('237');f.step();if(kind==='cancel')f.game.vrTours125.cancel(false);if(kind==='end')f.story.active=false;if(kind==='exit')f.vr.active=false;if(kind==='menu')f.story.menuOpen=true;for(let i=0;i<25;i++)f.step();assert.equal(f.records.placements.length,0,kind+' must invalidate a pending view');}
console.log(JSON.stringify({version:'2.5.237',runtime:'Production installer with simulated tracked XR frames and audio cues',stoppedSequence236Reproduced:true,allEightShotsRestored:expected,distinctDestinations:3,stableHeadingAcrossCueChanges:'pass',freeHeadRotationAndLeaning:'pass',manualTurnPreserved:'pass',nativeFadeCommit:'pass',audioCueTimingAndDistanceContinuity:'pass',pauseResumeAndSeek:'pass',staleAndCancelledPlacementRejected:'pass',originalPoseAndEyeHeightRestored:'pass',physicalQuestTest:false},null,2));
