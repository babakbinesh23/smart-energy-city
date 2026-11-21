// The web pose stays unchanged. The closer stereo view gets a deeper rear mount.
export function installTrackerVRClearance216(game,T){
 const trackers=game.city.sunTrackers207;if(!trackers)return null;
 const rows=trackers.records.map(r=>({r,web:r.tiltNode.position.clone(),bridge:r.root.getObjectByName('tracker-bearing-standoff214')})),geometries=new Map(),box=new T.Box3(),up=new T.Vector3(0,1,0);let immersive=null,disposed=false;
 function sync(value){
  if(disposed||immersive===value)return;immersive=value;
  for(const row of rows){const {r,web,bridge}=row;r.tiltNode.position.copy(web);if(value)r.tiltNode.position.add(new T.Vector3(0,.15,-.14));
   if(bridge){let pair=geometries.get(bridge.geometry);if(!pair){for(const entry of geometries.values())if(entry.vr===bridge.geometry){pair=entry;break;}}
    if(!pair){const start=new T.Vector3().fromArray(r.tiltNode.userData.hinge214.originalBearing),end=web.clone().add(new T.Vector3(0,.15,-.14)),offset=end.clone().sub(start),g=new T.CylinderGeometry(.075,.075,offset.length(),10);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(up,offset.clone().normalize()));g.translate((start.x+end.x)/2,(start.y+end.y)/2,(start.z+end.z)/2);g.computeBoundingSphere();pair={web:bridge.geometry,vr:g};geometries.set(bridge.geometry,pair);}
    bridge.geometry=value?pair.vr:pair.web;
   }
   r.root.updateWorldMatrix(true,true);if(r.collider){box.setFromObject(r.tiltNode);r.collider.setTranslation?.(box.getCenter(new T.Vector3()));r.collider.setHalfExtents?.(box.getSize(new T.Vector3()).multiplyScalar(.5));}
   r.root.userData.immersiveClearance216=value;
  }
 }
 const xr=game.renderer.webgl.xr,render=game.renderer.render,onStart=()=>sync(true),onEnd=()=>sync(false);xr.addEventListener('sessionstart',onStart);xr.addEventListener('sessionend',onEnd);
 game.renderer.render=function(...args){sync(!!game.vr.active||!!xr.isPresenting);return render.apply(this,args);};sync(!!game.vr.active||!!xr.isPresenting);
 const api={sync,get immersive(){return immersive;},dispose(){if(disposed)return;sync(false);disposed=true;xr.removeEventListener('sessionstart',onStart);xr.removeEventListener('sessionend',onEnd);game.renderer.render=render;for(const pair of geometries.values())pair.vr.dispose();geometries.clear();}};
 game.trackerVRClearance216=api;game.disposers.push(()=>api.dispose());return api;
}
