// All destinations are tested against the same collision function as web walking.
export function createOfficeNavigation127(debug,B,getRig,getCamera,getRay,getMap){
 const marker=B.MeshBuilder.CreateSphere('office127-landing',{diameter:.32,segments:12},debug.scene);
 marker.scaling.y=.08;marker.isPickable=false;marker.setEnabled(false);
 const material=new B.StandardMaterial('office127-landing',debug.scene);material.emissiveColor=new B.Color3(.3,1,.6);material.disableLighting=true;marker.material=material;
 function pick(ray){return debug.scene.pickWithRay(ray,m=>m.isPickable!==false&&m.isEnabled()&&m.isVisible&&m.visibility>0&&m!==marker);}
 function landing(ray,hit){
  const p=hit?.pickedPoint;if(!p||hit.distance>8||Math.abs(p.y)>.12||ray.direction.y>=-.08||debug.blocks97(p.x,p.z))return null;
  const normal=hit.getNormal?.(true);if(normal&&normal.y<.85)return null;
  return p;
 }
 function place(p){const camera=getCamera(),rig=getRig(),head=camera.getWorldMatrix().getTranslation();debug.teleport(p.x,p.z,0);rig.position.x+=p.x-head.x;rig.position.z+=p.z-head.z;rig.computeWorldMatrix(true);camera.getViewMatrix(true);}
 function topic(hit){
  const p=hit?.pickedPoint;if(!p||hit.distance>6)return null;
  const record=debug.editor.owner97(hit.pickedMesh);if(record?.asset==='coach')return 'eric';
  if(record&&['door','standing-fan','television'].includes(record.asset))return null;
  // Department room/sign hits choose the pointed section, not the nearest voice.
  if(p.y<.25||Math.abs(p.x)<3.5)return null;
  const sections=window.OFFICE_DATA.layout.departments.filter(d=>debug.voices.availableIds.includes(d.id));
  return sections.map(d=>({id:d.id,d:Math.hypot(p.x-d.center[0],p.z-d.center[2])})).sort((a,b)=>a.d-b.d).find(d=>d.d<=3)?.id??null;
 }
 function select(ray,hit=pick(ray)){
  const id=topic(hit);if(id){debug.openAudio97();void debug.voices.togglePointed127(id);return true;}
  const p=landing(ray,hit);if(!p)return false;place(p);return true;
 }
 function update(controller){
  marker.setEnabled(false);if(!controller)return;const ray=getRay(controller.inputSource),map=getMap();
  if(map?.opened){map.hoverRay127(ray);return;}
  const hit=pick(ray),p=landing(ray,hit);if(p){marker.position.set(p.x,.025,p.z);marker.setEnabled(true);}
 }
 debug.scene.onDisposeObservable.addOnce(()=>{marker.dispose();material.dispose();});
 return {select,update,landing,place,topic,hide:()=>marker.setEnabled(false)};
}
