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
 vm.createContext(ctx);const source=fs.readFileSync(assets+`/vr-experience-2.5.${version}.js`,'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');const cue=fs.readFileSync(assets+'/cooler-camera-2.5.95-r110.js','utf8').split('export class CoolerCamera95')[0].replaceAll('export ','');vm.runInContext(cue+fs.readFileSync(assets+'/vr-overview-selection-2.5.238.js','utf8').replaceAll('export ','')+source+';this.install=installVR125;',ctx);ctx.install(game,T,{safeFeet:()=>true});
 const frame={position:vr.localHead.clone(),orientation:quat(.2)};
 // A conversation is selected after the XR session has initialized.
 story.active=false;vr.update(1/72,frame);story.active=true;speech.media={id:2};
 return{game,vr,story,speech,records,frame,originalFeet,originYaw,step(dt=1/72){vr.update(dt,frame);story.update(vr.view,vr.feet,true,true,dt);}};
}
function runTimeline(f){for(let i=0;i<90*72;i++){f.speech.currentTime=i/72;f.frame.orientation=quat(Math.sin(i/200)*1.1);f.frame.position.x=.12+.08*Math.sin(i/150);f.step();}}
const f=fixture('248');const original=f.vr.rig.rotation.y;runTimeline(f);assert.equal(f.records.placements.length,0);assert.equal(f.records.queues,0);assert.equal(f.vr.rig.rotation.y,original);assert.equal(f.records.speechCalls.length,0);assert.equal(f.vr.eyeOffset,.04);for(const angle of [-1.2,0,1.1]){f.frame.orientation=quat(angle);f.step();assert(Math.abs(f.vr.view.yaw-(original+angle))<1e-12)}
console.log(JSON.stringify({version:'2.5.248',entire90SecondTimelineWithoutTourPlacements:true,noQueuedCameraMoves:true,headRotationAndEyeHeightPreserved:true,narrationNotInterruptedByVRInstaller:true,physicalQuestTest:false},null,2));
