// Ghost mode changes presentation only; online networking and audio remain connected.
export function installGhostCity222(game){
 const style=document.createElement('style');style.textContent=`
 html[data-ghost222] .city-minimap113,html[data-ghost222] .city-map113,
 html[data-ghost222] [data-ghost-online222]{display:none!important}`;document.head.append(style);
 game.multiplayer.element.setAttribute('data-ghost-online222','');
 let last=null;const sync=()=>{const enabled=!!game.player.controller.flying;if(enabled===last)return;last=enabled;document.documentElement.toggleAttribute('data-ghost222',enabled);if(enabled)game.navigation113?.close(false);};
 const toggle=game.toggleFlight,frame=game.frame;
 game.toggleFlight=function(...args){const result=toggle.apply(this,args);sync();return result;};
 game.frame=function(...args){sync();return frame.apply(this,args);};sync();
 game.disposers.push(()=>{game.toggleFlight=toggle;game.frame=frame;style.remove();game.multiplayer.element.removeAttribute('data-ghost-online222');document.documentElement.removeAttribute('data-ghost222');});
}

// Reuse the plant's complete prefab: panel, column, bearing and both axes.
// Each source submesh has one instance draw per roof, rather than one per module.
export function harmonizeSolar222(city,T){
 const trackers=city.sunTrackers207,source=trackers?.records?.[0],owner=city.homeSolar;
 if(!source||!owner?.roofs.length)return null;
 const sourceMeshes=[];source.root.traverse(mesh=>{if(mesh.isMesh&&!mesh.isInstancedMesh)sourceMeshes.push(mesh);});
 if(!sourceMeshes.length)return null;
 const identity=new T.Quaternion(),matrix=new T.Matrix4(),placement=new T.Matrix4(),inverse=new T.Matrix4(),position=new T.Vector3(),scaling=new T.Vector3(),instances=[],colliders=[];
 for(const c of owner.colliders222??[])city.physics.world.removeCollider(c,true);
 owner.colliders222=[];
 for(const roof of owner.roofs){
  const group=owner.group.children.find(g=>g.userData.attachBuildingId===roof.id),old=group?.children.find(m=>m.isInstancedMesh&&m.name.startsWith('supplied-solar-panels'));
  if(!old)continue;
  const width=Math.min(roof.plan.panelWidth,roof.plan.panelDepth)*.88,relative=width/11.7,rawScale=source.root.scale.x*relative,placements=[];
  for(let i=0;i<old.count;i++){
   old.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix);position.y-=owner.group.userData.mountClearance??.9;
   placement.compose(position,identity,scaling.setScalar(rawScale));placements.push(placement.clone());
   const height=15*relative;const collider=city.physics.addStaticBox(new T.Vector3(position.x,position.y+height/2,position.z),new T.Vector3(width*.52,height/2,width*.52));if(collider)colliders.push(collider);
  }
  for(const mesh of group.children)mesh.visible=false;
  for(const mesh of sourceMeshes){
   const batch=new T.InstancedMesh(mesh.geometry,mesh.material,placements.length);batch.name='plant-style-roof-tracker222-'+roof.id+'-'+mesh.name;
   batch.castShadow=batch.receiveShadow=false;batch.userData={editLocked:true,dynamic:true,noStaticBatch:true,plantTracker222:true};
   batch.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(batch);instances.push({source:mesh,batch,placements});
  }
  group.userData.solarMount87={...group.userData.solarMount87,source:'sun-tracker-2.5.208.glb',sharedPlantMechanism:true,footprintWidth:width};
 }
 if(!instances.length)return null;
 let lastYaw=NaN,lastTilt=NaN,disposed=false;
 function sync(force=false){
  if(disposed||!force&&Math.abs(lastYaw-source.yaw)<.0001&&Math.abs(lastTilt-source.tilt)<.0001)return;
  lastYaw=source.yaw;lastTilt=source.tilt;source.root.updateWorldMatrix(true,true);inverse.copy(source.root.matrixWorld).invert();
  for(const {source:mesh,batch,placements}of instances){matrix.multiplyMatrices(inverse,mesh.matrixWorld);for(let i=0;i<placements.length;i++)batch.setMatrixAt(i,placement.multiplyMatrices(placements[i],matrix));batch.instanceMatrix.needsUpdate=true;batch.computeBoundingBox();batch.computeBoundingSphere();}
 }
 const update=trackers.update;trackers.update=function(...args){const result=update.apply(this,args);sync();return result;};
 sync(true);owner.group.userData={...owner.group.userData,panelSource:'sun-tracker-2.5.208.glb',sharedPlantMechanism:true,instancedParts:instances.length};
 const dispose=owner.dispose;owner.dispose=function(...args){if(!disposed){disposed=true;trackers.update=update;for(const {batch}of instances){batch.removeFromParent();batch.dispose();}for(const c of colliders)city.physics.world.removeCollider(c,true);}return dispose.apply(this,args);};
 const api={sync,instances,moduleCount:owner.group.userData.moduleCount,source:'sun-tracker-2.5.208.glb'};city.solarStyle222=api;return api;
}
