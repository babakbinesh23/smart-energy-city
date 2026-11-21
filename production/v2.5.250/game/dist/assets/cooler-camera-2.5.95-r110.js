export const COOLER_END95=134.269375;
// Cue positions are in the supplied recording's time, independent of playbackRate.
export function coolerShot95(t){
 if(!Number.isFinite(t)||t<43.08||t>=COOLER_END95)return null;
 if(t>=117.98)return'pair';if(t>=112.06)return'bldc';if(t>=101.50)return'pair';if(t>=81.34)return'bldc';if(t>=76.81)return'standard';if(t>=50.16)return'bldc';if(t>=47.20)return'standard';return'pair';
}
export const ease95=x=>{x=Math.min(1,Math.max(0,x));return x*x*x*(x*(x*6-15)+10);};
export class CoolerCamera95{
 constructor(game,T){this.game=game;this.T=T;this.saved=null;this.shot=null;this.transition=null;this.returning=false;this.returnAge=0;this.lastTime=null;this.position=new T.Vector3;this.rotation=new T.Quaternion;this.fov=72;this.auto=true;}
 get active(){return !!this.saved;}
 begin(camera){if(this.saved)return;const rig=this.game.player?.rig?.root;this.saved={position:camera.position.clone(),rotation:camera.quaternion.clone(),fov:camera.fov,near:camera.near,rig,rigVisible:rig?.visible};this.position.copy(camera.position);this.rotation.copy(camera.quaternion);this.fov=camera.fov;if(rig)rig.visible=false;this.game.input?.clear();}
 target(shot){
  const T=this.T,units=this.game.city.coolers,unit=units.find(u=>u.variant===shot)??units[0],position=new T.Vector3,look=new T.Vector3;
  if(shot==='pair'){
   const a=units[0].model.getWorldPosition(new T.Vector3),b=units[1].model.getWorldPosition(new T.Vector3),q=units[0].model.getWorldQuaternion(new T.Quaternion);
   const center=a.add(b).multiplyScalar(.5),fit=Math.max(1,.9/(this.game.camera.camera.aspect||1));position.copy(center).add(new T.Vector3(-6*fit,2.8*fit,7*fit).applyQuaternion(q));look.copy(center).add(new T.Vector3(0,.75,0).applyQuaternion(q));
  }else{position.copy(unit.model.localToWorld(new T.Vector3(-1.80*Math.max(1,.48/(this.game.camera.camera.aspect||1)),.56,.055)));look.copy(unit.model.localToWorld(new T.Vector3(-.045,.53,.01)));}
  const rotation=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(position,look,new T.Vector3(0,1,0)));
  const scale=unit.model.getWorldScale(new T.Vector3),front=unit.model.localToWorld(new T.Vector3(-.435,.53,.01)),aspect=this.game.camera.camera.aspect||1;
  const distance=position.distanceTo(front),fit=2*Math.atan(.9*scale.z*1.14/(2*distance*aspect))*180/Math.PI,verticalFit=2*Math.atan(1.056*scale.y*1.12/(2*distance))*180/Math.PI;
  return{position,rotation,fov:shot==='pair'?54:Math.max(46,Math.min(85,Math.max(fit,verticalFit)))};
 }
 change(shot,time){
  const target=this.target(shot);this.transition={from:this.position.clone(),rotation:this.rotation.clone(),fov:this.fov,target,start:time,duration:shot==='pair'?2.1:1.8};this.shot=shot;
 }
 apply(camera){camera.position.copy(this.position);camera.quaternion.copy(this.rotation);if(Math.abs(camera.fov-this.fov)>.001||camera.near!==.06){camera.fov=this.fov;camera.near=.06;camera.updateProjectionMatrix();}camera.updateMatrixWorld(true);}
 update(camera,time,playing,dt=0){
  if(this.returning){this.returnAge+=Math.min(.08,Math.max(0,dt));const p=ease95(this.returnAge/1.25),r=this.returnFrom;this.position.lerpVectors(r.position,this.saved.position,p);this.rotation.slerpQuaternions(r.rotation,this.saved.rotation,p);this.fov=r.fov+(this.saved.fov-r.fov)*p;this.apply(camera);if(p===1)this.release(camera,true);return;}
  const shot=coolerShot95(time);if(!this.auto||!shot)return;
  this.begin(camera);
  // A seek or a repeated recording starts a fresh transition from the visible pose.
  if(shot!==this.shot||this.lastTime!==null&&time<this.lastTime-.05||Math.abs((this.lastAspect??camera.aspect)-camera.aspect)>.01)this.change(shot,time);
  this.lastAspect=camera.aspect;
  this.lastTime=time;const tr=this.transition,p=ease95((time-tr.start)/tr.duration),q=1-p;
  this.position.copy(tr.from).multiplyScalar(q*q*q).addScaledVector(tr.from.clone().add(new this.T.Vector3(0,2.4,0)),3*q*q*p).addScaledVector(tr.target.position.clone().add(new this.T.Vector3(0,2.4,0)),3*q*p*p).addScaledVector(tr.target.position,p*p*p);
  this.rotation.slerpQuaternions(tr.rotation,tr.target.rotation,p);this.fov=tr.fov+(tr.target.fov-tr.fov)*p;this.apply(camera);
 }
 hold(camera){if(this.saved)this.apply(camera);}
 returnToPlayer(camera,immediate=false){if(!this.saved)return;this.auto=false;if(immediate){this.release(camera,true);return;}if(this.returning)return;this.returning=true;this.returnAge=0;this.returnFrom={position:this.position.clone(),rotation:this.rotation.clone(),fov:this.fov};}
 release(camera,applyPose=true){if(!this.saved)return;const s=this.saved;if(applyPose){camera.position.copy(s.position);camera.quaternion.copy(s.rotation);}camera.fov=s.fov;camera.near=s.near;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);if(s.rig)s.rig.visible=s.rigVisible;this.saved=null;this.transition=null;this.shot=null;this.returning=false;this.lastTime=null;this.game.input?.clear();this.game.time?.resetAccumulator();}
 reset(){this.auto=true;this.shot=null;this.lastTime=null;}
}
