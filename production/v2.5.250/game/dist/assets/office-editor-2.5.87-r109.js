import {THREE as T} from './three-editor-2.5.87-r109-media223.js';
import {createSharedEditorClass87} from './shared-editor-2.5.87-r109.js';
// Adapt Babylon object identities and persistence to the exact city editor class.
export async function mountOfficeEditor87(options,host=window){
 const {adapter:A,persistence:P}=options,canvas=A.canvas,document=host.document,B=host.BABYLON;
 if(!options.isAdmin||!host.BabylonOfficeConfig?.editor?.authenticated)throw Error('دسترسی ادمین تأیید نشده است.');
 if(host.__CITY_OFFICE_EDITOR87__)return host.__CITY_OFFICE_EDITOR87__;
 const world=new T.Group(),entries=new Map(),geometry=new T.BoxGeometry(),material=new T.MeshBasicMaterial();
 const vector=p=>new T.Vector3(p.x,p.y,p.z);
 const matrix=node=>new T.Matrix4().fromArray(node?.getWorldMatrix?.().asArray()??new T.Matrix4().elements);
 function refresh(entry){
  const row=A.state(entry.record),root=entry.root;
  entry.parent.matrix.copy(matrix(entry.record.object.parent));entry.parent.matrixAutoUpdate=false;
  root.position.fromArray(row.position);root.quaternion.setFromEuler(new T.Euler(...row.rotation,'YXZ'));root.scale.fromArray(row.scale);root.visible=row.visible;
  root.userData.editorDeleted=!row.visible;root.updateWorldMatrix(true,true);
  const min=new T.Vector3(Infinity,Infinity,Infinity),max=new T.Vector3(-Infinity,-Infinity,-Infinity);
  const meshes=entry.record.item.meshes??[entry.record.item.mesh??entry.record.object];
  for(const mesh of meshes){if(!mesh?.getBoundingInfo)continue;mesh.computeWorldMatrix(true);const bounds=mesh.getBoundingInfo().boundingBox;min.min(vector(bounds.minimumWorld));max.max(vector(bounds.maximumWorld));}
  if(Number.isFinite(min.x)){
   // Keep geometry in the object's local frame for accurate world selection bounds.
   const inv=root.matrixWorld.clone().invert(),points=[];
   for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z])points.push(new T.Vector3(x,y,z).applyMatrix4(inv));
   entry.mesh.geometry.setFromPoints(points);entry.mesh.geometry.computeBoundingBox();entry.mesh.geometry.computeBoundingSphere();
  }
 }
 function register(record){
  if(!record||A.protectedObject(record))return null;
  let entry=entries.get(record.id);if(entry)return entry;
  const parent=new T.Group(),root=new T.Group(),mesh=new T.Mesh(new T.BufferGeometry(),material);parent.add(root);root.add(mesh);world.add(parent);
  root.name=record.item.holder.name||record.id;
  entry={record,root,parent,mesh,target:{kind:'node',source:record.id},label:root.name};entries.set(record.id,entry);refresh(entry);entry.initial={target:entry.target,pose:snapshot(entry).pose};return entry;
 }
 function snapshot(entry){return {target:entry.target,pose:{position:entry.root.position.toArray(),quaternion:entry.root.quaternion.toArray(),scale:entry.root.scale.toArray(),placed:!!entry.root.userData.editorPlaced,deleted:!!entry.root.userData.editorDeleted}};}
 async function revive(entry,state){
  if(!entry.record.object.isDisposed?.())return;
  const owner=host.__BABYLON_OFFICE__?.editor,item=entry.record.item;
  if(!owner)throw Error('دسترسی به چیدمان ساختمان قطع شده است.');
  const rotation=new T.Euler().setFromQuaternion(new T.Quaternion().fromArray(state.pose.quaternion),'YXZ'),p=state.pose.position;
  const row={id:item.id,sourceKind:item.sourceKind,sourceId:item.sourceId,modelId:item.modelId,position:{x:p[0],y:p[1],z:p[2]},rotationX:rotation.x,rotationY:rotation.y,rotationZ:rotation.z,scale:state.pose.scale?.[0]??1,hidden:!!state.pose.deleted,color:item.editorColor||'',material:item.editorMaterial||'',locked:!!item.editorLocked};
  const restored=item.copy?owner.addCopy(row,false):item.modelId?await owner.add(row,false):null;
  if(!restored)throw Error('بازگردانی این جسم انجام نشد.');
  entry.record.item=restored;entry.record.object=restored.holder;A.refresh();
 }
 function sync(entry){
  const row=A.state(entry.record),rotation=new T.Euler().setFromQuaternion(entry.root.quaternion,'YXZ');
  const next={...row,position:entry.root.position.toArray(),rotation:[rotation.x,rotation.y,rotation.z],scale:entry.root.scale.toArray(),visible:!entry.root.userData.editorDeleted};
  if(A.apply(entry.record,next)===false){refresh(entry);throw Error('این جسم قفل است یا قابل ویرایش نیست.');}refresh(entry);
 }
 const registry={world,entries,pick:hit=>hit.entry,isLocked:()=>false,isDeleted:entry=>!!entry.root.userData.editorDeleted,
  snapshot,size:entry=>entry.root.scale.x,resize(entry,size){entry.root.scale.setScalar(Math.max(.1,Math.min(6,size)));},sync,
  async apply(state){const entry=entries.get(state.target.source);if(!entry)return null;await revive(entry,state);entry.root.position.fromArray(state.pose.position);entry.root.quaternion.fromArray(state.pose.quaternion);entry.root.scale.fromArray(state.pose.scale??[1,1,1]);entry.root.userData.editorDeleted=!!state.pose.deleted;sync(entry);return entry;},
  setDeleted(entry,deleted){entry.root.userData.editorDeleted=deleted;sync(entry);},reset(entry){this.apply(entry.initial);},
  async duplicate(entry){const record=await A.duplicate(entry.record);return register(record);},
  dispose(){for(const entry of entries.values())entry.mesh.geometry.dispose();geometry.dispose();material.dispose();entries.clear();}
 };
 const Store=class {canSave=true;endpoint=true;async load(){await P.load();return 'ویرایشگر مشترک شهر و ساختمان آماده است؛ تغییرها فقط با «ذخیره» ثبت می‌شوند.';}async save(){await P.save();}async refreshAccess(){return this.load();}};
 const Editor=createSharedEditorClass87(T,Store,host),camera=new T.PerspectiveCamera(),editor=new Editor(registry,camera,canvas,document.getElementById('babylon-office-app')??document.body,0);
 function at(event){
  const nativeCamera=A.camera??A.scene?.activeCamera??host.__BABYLON_OFFICE__?.scene.activeCamera;
  const scene=nativeCamera?.getScene?.()??host.__BABYLON_OFFICE__?.scene;
  if(!scene)return;
  const rect=canvas.getBoundingClientRect(),engine=scene.getEngine(),ray=scene.createPickingRay((event.clientX-rect.left)*engine.getRenderWidth()/rect.width,(event.clientY-rect.top)*engine.getRenderHeight()/rect.height,B.Matrix.Identity(),nativeCamera);
  editor.ray.ray.set(vector(ray.origin),vector(ray.direction));camera.position.copy(vector(nativeCamera.globalPosition??nativeCamera.position));
  camera.quaternion.setFromUnitVectors(new T.Vector3(0,0,-1),vector(nativeCamera.getForwardRay().direction));
 }
 editor.at=at;
 editor.hit=event=>{at(event);const hit=A.pick(event.clientX,event.clientY);if(!hit)return null;const entry=register(hit.record);if(!entry||hit.record.item.editorLocked)return null;refresh(entry);return {entry,object:entry.root,point:vector(hit.point)};};
 // Babylon renders its own outline; no second WebGL context is created.
 const update=editor.update.bind(editor);editor.update=(dt=0)=>{update(dt);const selected=editor.active?[...editor.selection]:[];A.select(selected.length===1?selected[0].record:selected.length?{item:{meshes:selected.flatMap(entry=>entry.record.item.meshes??[entry.record.item.mesh??entry.record.object])}}:null);};
 editor.onToggle=active=>{if(active){document.exitPointerLock?.();const office=host.__BABYLON_OFFICE__;office?.player.keys?.clear();if(office?.playerCamera){office.playerCamera.dragging=false;office.playerCamera.activePointer=null;}}};
 editor.onPan=()=>{A.onCameraEdge?.(editor.dragClientX,editor.dragClientY,{canvas});};
 const finish=editor.finish.bind(editor);editor.finish=()=>{finish();A.finishMove?.();};
 const toggle=event=>{if(event.code==='F4'&&!event.target?.closest?.('input,textarea,select,[contenteditable]')){event.preventDefault();event.stopImmediatePropagation();editor.setActive(!editor.active);}};
 host.addEventListener('keydown',toggle,true);
 // Stop movement/camera handlers while editing; editor listeners were registered first.
 const block=event=>{if(!editor.active||event.target?.closest?.('.world-editor'))return;const pointer=['pointerdown','pointermove','pointerup','wheel'].includes(event.type);if(pointer||['KeyW','KeyA','KeyS','KeyD','Space','KeyE','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();}};
 const bindings=[[canvas,'pointerdown'],[canvas,'wheel'],[host,'pointermove'],[host,'pointerup'],[host,'keydown'],[host,'keyup']];
 for(const [target,name]of bindings)target.addEventListener(name,block,{capture:true,passive:false});
 let disposed=false;
 const dispose=editor.dispose.bind(editor);editor.dispose=()=>{if(disposed)return;disposed=true;host.removeEventListener('keydown',toggle,true);for(const [target,name]of bindings)target.removeEventListener(name,block,true);dispose();A.dispose();delete host.__CITY_OFFICE_EDITOR87__;};
 const nativeDispose=A.dispose;A.dispose=()=>{nativeDispose();};
 host.addEventListener('pagehide',()=>editor.dispose(),{once:true});
 // A short frame observer updates multi-selection drags; it is removed with the scene.
 let observer=null,clock=performance.now();
 const bind=()=>{const scene=host.__BABYLON_OFFICE__?.scene;if(scene&&!observer){observer=scene.onBeforeRenderObservable.add(()=>{const now=performance.now();if(editor.active)editor.update(Math.min(.05,(now-clock)/1000));clock=now;});scene.onDisposeObservable.addOnce(()=>editor.dispose());}};
 const timer=host.setInterval(()=>{bind();if(observer)host.clearInterval(timer);},100);
 host.addEventListener('pagehide',()=>host.clearInterval(timer),{once:true});
 await editor.load();editor.setAvailable(true);host.__CITY_OFFICE_EDITOR87__=editor;return editor;
}
