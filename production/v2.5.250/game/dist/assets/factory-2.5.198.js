// Placement is measured against the existing service apron, NPCs and road.
// Keep the editor root name/anchor stable so saved unrelated objects still resolve.
export const FACTORY198 = Object.freeze({x:-67,z:-188,yaw:Math.PI-Math.PI/18,scale:2.25,
  maxWidth:62,maxDepth:41,maxHeight:46,
  apron:{minX:-129.5,maxX:-101.5,minZ:-205,maxZ:-175},
  expert:{x:-109,z:-169},manager:{x:-115.5,z:-173.5}});

export function placeFactory198(T, source, ground=.15) {
  source.updateMatrixWorld(true);
  const raw = new T.Box3().setFromObject(source,true);
  const size = raw.getSize(new T.Vector3()), center = raw.getCenter(new T.Vector3());
  if (![size.x,size.y,size.z].every(v=>Number.isFinite(v)&&v>0)) throw Error('Invalid replacement factory bounds');
  const scale = Math.min(FACTORY198.scale,FACTORY198.maxWidth/size.x,FACTORY198.maxDepth/size.z,FACTORY198.maxHeight/size.y);
  source.scale.multiplyScalar(scale);
  source.position.set(-center.x*scale,-raw.min.y*scale,-center.z*scale);
  const turn = new T.Group();turn.name='factory-half-turn';turn.rotation.y=FACTORY198.yaw;turn.add(source);
  const group = new T.Group();group.name='supplied-victorian-factory';
  group.position.set(FACTORY198.x,ground,FACTORY198.z);group.add(turn);group.updateMatrixWorld(true);
  return {group,bounds:new T.Box3().setFromObject(group,true),raw,center,scale};
}

export function buildFactory198(owner,T,{gltf,physics,features,ground=.15,worldGroup,patch,smoke}) {
  const placed=placeFactory198(T,gltf.scene,ground);
  // Reuse the owner's root object, which the editor and city already hold.
  owner.group.name=placed.group.name;owner.group.position.copy(placed.group.position);
  owner.group.add(...placed.group.children.slice());owner.group.updateMatrixWorld(true);
  owner.bounds.copy(placed.bounds);owner.factoryColliders197=[];owner.factoryPhysics197=physics;
  const materials=new Set();let meshes=0,triangles=0;
  gltf.scene.traverse(mesh=>{
    if(!mesh.isMesh)return;meshes++;mesh.castShadow=true;mesh.receiveShadow=true;
    for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
      if(materials.has(material))continue;materials.add(material);patch(material);
    }
    // Exact static surfaces retain silo gaps and do not fill the whole factory box.
    const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    geometry.computeBoundingBox();const center=geometry.boundingBox.getCenter(new T.Vector3());
    geometry.translate(-center.x,-center.y,-center.z);
    const position=geometry.getAttribute('position');const vertices=new Float32Array(position.count*3);
    for(let i=0;i<position.count;i++)vertices.set([position.getX(i),position.getY(i),position.getZ(i)],i*3);
    const indices=geometry.index?Uint32Array.from(geometry.index.array):Uint32Array.from({length:position.count},(_,i)=>i);
    triangles+=indices.length/3;
    const desc=physics.rapier.ColliderDesc.trimesh(vertices,indices).setTranslation(center.x,center.y,center.z)
      .setCollisionGroups(worldGroup).setFriction(.8);
    owner.factoryColliders197.push(physics.world.createCollider(desc));geometry.dispose();
  });
  owner.mixer=new T.AnimationMixer(gltf.scene);
  for(const clip of gltf.animations)owner.mixer.clipAction(clip).play();
  // The three mouth centers measured from this supplied GLB, in its upright frame.
  owner.chimneyEmitters=[-7.938477516,-11.301533699,-14.664589882].map(x=>{
    const tip=new T.Vector3((x-placed.center.x)*placed.scale,
      (19.60975647-placed.raw.min.y)*placed.scale+.12,(-6.416333199-placed.center.z)*placed.scale)
      .applyAxisAngle(new T.Vector3(0,1,0),FACTORY198.yaw);
    return {x:tip.x,y:tip.y,z:tip.z,count:76,openingRadius:.68*placed.scale,rise:24,
      size:1.45,growth:12,density:1.06,speed:.086,driftX:7.5,driftZ:2.6};
  });
  owner.smoke=smoke(owner.chimneyEmitters);owner.smoke.mesh.name='factory-black-chimney-smoke';owner.group.add(owner.smoke.mesh);
  const f=owner.bounds.min,p=owner.bounds.max,industry=features.get('industry');
  features.register({...industry,title:'کارخانه صنعتی',subtitle:'کارخانه با پست برق اختصاصی',
    entry:{x:-115.5,z:-169.5,heading:Math.PI},
    areas:[{minX:f.x,maxX:p.x,minY:ground,maxY:p.y,minZ:f.z,maxZ:p.z},
      {minX:-130,maxX:-101.5,minY:ground,maxY:12,minZ:-205,maxZ:-159}],
    focusArea:{minX:-130,maxX:p.x+3,minY:ground,maxY:p.y+3,minZ:Math.min(-208,f.z-2),maxZ:-155},
    fields:[{label:'تغذیه',value:'خط سه‌فاز ۱۳۲ کیلوولت'},
      {label:'پست اختصاصی',value:'۱۳۲ به ۲۰ کیلوولت'},
      {label:'تجهیزات محوطه',value:'یک پست و یک جعبه برق'},
      {label:'بار سناریوی آموزشی',value:'۱۸ مگاوات'}],
    note:'ولتاژها و بارها برای نمایش آموزشی مسیر برق انتخاب شده‌اند.'});
  owner.group.userData={bounds:[...f.toArray(),...p.toArray()],source:'generic-factory-2.5.197.glb',
    replacementRevision:197,rotationDegrees:170,scale:placed.scale,animations:gltf.animations.length,
    placeholderRemoved:true,foundationHeight:0,staticSourceMeshes:meshes,triangles,
    editColliders:owner.factoryColliders197.map(c=>c.handle),
    apronClearance:f.x-FACTORY198.apron.maxX};
  return owner;
}

export function disposeFactory198(owner){
  owner.smoke?.dispose();owner.mixer?.stopAllAction();
  for(const collider of owner.factoryColliders197??[])owner.factoryPhysics197.world.removeCollider(collider,true);
  owner.factoryColliders197=[];
  const geometries=new Set(),materials=new Set(),textures=new Set();
  owner.group.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);
    for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
  for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();
}
