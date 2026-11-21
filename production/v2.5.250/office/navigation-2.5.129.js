// VR-only targeting. No editor material or saved transform is modified.
export function createOfficeNavigation127(debug,B,getRig,getCamera,getRay,getMap){
 const marker=B.MeshBuilder.CreateSphere('office128-landing',{diameter:.32,segments:12},debug.scene);marker.scaling.y=.08;marker.isPickable=false;marker.setEnabled(false);
 const material=new B.StandardMaterial('office128-landing',debug.scene);material.emissiveColor=new B.Color3(.3,1,.6);material.disableLighting=true;marker.material=material;
 const outline=B.MeshBuilder.CreateBox('office128-target',{size:1},debug.scene),gold=new B.StandardMaterial('office128-target',debug.scene);
 gold.emissiveColor=new B.Color3(1,.82,.2);gold.disableLighting=true;gold.wireframe=true;gold.backFaceCulling=false;outline.material=gold;outline.isPickable=false;outline.renderingGroupId=3;outline.setEnabled(false);
 let hovered=null;
 function pick(ray){return debug.scene.pickWithRay(ray,m=>m.isPickable!==false&&m.isEnabled()&&m.isVisible&&m.visibility>0&&m!==marker&&m!==outline);}
 function landing(ray,hit){const p=hit?.pickedPoint;if(!p||hit.distance>8||Math.abs(p.y)>.12||ray.direction.y>=-.08||debug.blocks97(p.x,p.z))return null;const normal=hit.getNormal?.(true);return normal&&normal.y<.85?null:p;}
 function place(p){const camera=getCamera(),rig=getRig(),head=camera.getWorldMatrix().getTranslation();debug.teleport(p.x,p.z,0);rig.position.x+=p.x-head.x;rig.position.z+=p.z-head.z;rig.computeWorldMatrix(true);camera.getViewMatrix(true);}
 const sections=()=>window.OFFICE_DATA.layout.departments;
 const aliases=[['department-0',/خورشیدی|solar/],['department-1',/مشترکین|customer/],['department-2',/منابع انسانی|human.?resources/],['department-3',/فروش برق|electricity.?sales/],['department-4',/مارکتینگ|marketing/],['department-5',/صرفه.?جویی|energy.?saving|efficiency/]];
 const accepted=(id,node,hit)=>debug.voices.availableIds.includes(id)&&debug.voices.canSelect129(id)?{id,node,hit}:null;
 function resolve(hit){
  const p=hit?.pickedPoint;if(!p||hit.distance>8)return null;
  const record=debug.editor.owner97(hit.pickedMesh);
  if(record?.asset==='coach')return accepted('eric',record.node||debug.ericRoot,hit);
  // A department-prefixed furniture ID is not a narration target.
  if(record)return null;
  const chain=[];for(let n=hit.pickedMesh;n;n=n.parent){if(n===debug.ericRoot)return accepted('eric',debug.ericRoot,hit);chain.push(n);}
  const title=chain.find(n=>n.metadata?.officeVoiceLabel129||/تابلو|برچسب|sign|label|title|text(?:\b|[ _-]?\d)|متن/i.test(n.name||'')||sections().some(d=>String(n.name||'').trim()===d.name));
  if(!title||p.y<1.05)return null;
  const bounds=hit.pickedMesh?.getBoundingInfo?.()?.boundingBox;
  if(bounds){const a=bounds.minimumWorld,b=bounds.maximumWorld;if(b.y-a.y>1.6||Math.max(b.x-a.x,b.z-a.z)>4)return null;}
  for(const n of chain){
   const id=n.metadata?.departmentId||n.name?.match(/department-[0-5](?!\d)/)?.[0];if(sections().some(d=>d.id===id))return accepted(id,hit.pickedMesh,hit);
   const named=aliases.find(([id,re])=>re.test(String(n.name||'').toLowerCase())&&sections().some(d=>d.id===id));if(named)return accepted(named[0],hit.pickedMesh,hit);
  }
  // Unnamed sign geometry may use its side/row; ordinary walls/props never do.
  if(Math.abs(p.x)<3.1)return null;
  const section=sections().filter(d=>Math.sign(d.center[0])===Math.sign(p.x)).map(d=>({d,distance:Math.hypot(p.x-d.center[0],p.z-d.center[2])})).sort((a,b)=>a.distance-b.distance)[0];
  return section?.distance<=3.8?accepted(section.d.id,hit.pickedMesh,hit):null;
 }
 function show(target,ray){
  outline.rotationQuaternion=null;outline.rotation.set(0,0,0);
  const node=target.node;node?.computeWorldMatrix?.(true);const bounds=target.id==='eric'?node?.getHierarchyBoundingVectors?.(true):node?.getBoundingInfo?.()?.boundingBox;
  const min=bounds?.min||bounds?.minimumWorld,max=bounds?.max||bounds?.maximumWorld;
  if(min&&max&&(target.id==='eric'||max.y-min.y<1.6&&Math.max(max.x-min.x,max.z-min.z)<4)){
   outline.position.set((min.x+max.x)/2,(min.y+max.y)/2,(min.z+max.z)/2);outline.scaling.set(Math.max(.04,max.x-min.x+.05),Math.max(.04,max.y-min.y+.05),Math.max(.04,max.z-min.z+.05));
  }else{const p=target.hit.pickedPoint;outline.position.set(p.x-ray.direction.x*.025,p.y-ray.direction.y*.025,p.z-ray.direction.z*.025);outline.scaling.set(1.5,.42,.025);outline.lookAt(ray.origin);}
  outline.setEnabled(true);
 }
 function select(ray,hit=pick(ray)){
  const target=resolve(hit);if(target){debug.openAudio97();void debug.voices.playPointed128(target.id);return true;}
  const p=landing(ray,hit);if(!p)return false;place(p);return true;
 }
 function hide(){marker.setEnabled(false);outline.setEnabled(false);hovered=null;}
 function update(controller){hide();if(!controller)return;const ray=getRay(controller.inputSource),map=getMap();if(map?.opened){map.hoverRay127(ray);return;}
  const hit=pick(ray),target=resolve(hit);if(target){hovered=target.id;show(target,ray);return;}
  const p=landing(ray,hit);if(p){marker.position.set(p.x,.025,p.z);marker.setEnabled(true);}
 }
 debug.scene.onDisposeObservable.addOnce(()=>{marker.dispose();outline.dispose();material.dispose();gold.dispose();});
 return{select,update,landing,place,resolve,topic:hit=>resolve(hit)?.id??null,hide,get hovered(){return hovered;}};
}
