// Commit a VR destination before dismissing the overview. A failed placement
// must leave a usable map instead of throwing out of the XR render callback.
export function commitVRArrival186(vr,game,spawn,yaw,onSuccess,onFailure){
 const finite=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]));
 const saved={position:vr.rig.position.clone(),rotation:vr.rig.rotation.y,anchor:vr.anchor.clone(),feet:vr.feet.clone(),player:game.player.position.clone(),heading:game.player.controller.yaw};
 try{
  if(!finite(spawn)||!Number.isFinite(yaw))throw Error('Invalid VR destination');
  vr.place(spawn,yaw);vr.syncView();
  if(!finite(vr.view.position))throw Error('Invalid tracked arrival');
  if(vr.introducing)vr.endIntroduction();
  vr.blocked=false;vr.panel.visible=false;game.player.rig.root.visible=false;
  onSuccess();return true;
 }catch(error){
  game.player.teleport(saved.player,saved.heading);
  vr.rig.position.copy(saved.position);vr.rig.rotation.set(0,saved.rotation,0);
  vr.anchor.copy(saved.anchor);vr.feet.copy(saved.feet);vr.syncView();
  vr.pending=null;vr.fade=0;vr.curtain.visible=false;vr.curtain.material.opacity=0;
  vr.onIntroSelectionCancelled?.();onFailure(error);return false;
 }
}
