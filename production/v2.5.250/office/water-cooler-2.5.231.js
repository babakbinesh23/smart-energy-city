import 'kit/ray-DccRG74w.js';
import {m as Mesh,l as VertexData,V as Vector3,M as Matrix} from 'kit/index-3iDVoJzw.js';
import {ShaderMaterial} from 'kit/shaderMaterial-ur6GpZrh.js';
import {R as RawTexture} from 'kit/rawTexture-C-I2TQcg.js';

// Calibrated from the cold (blue) tap vertices of the supplied WaterCooler GLB.
// Coordinates include its nested Sketchfab axis correction and source offset;
// the editable cooler root supplies translation, quaternion and scale at runtime.
export const COLD_TAP231=Object.freeze([-.453634,7.068509,-1.3754445]);
export const COLD_BUTTON231=Object.freeze([-.453634,7.563883,-1.3754445]);
const TRAY231=Object.freeze([-.453634,5.36,-1.3754445]);
const LIP231=Object.freeze([-.453634,5.49,-1.625]);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function createPourState231(){
 return {on:false,elapsed:0,radius:0,flow:0,spilled:false,
  toggle(){this.on=!this.on;if(this.on)this.elapsed=0;return this.on;},
  tick(dt){dt=clamp(dt,0,.1);const before=this.elapsed;if(this.on)this.elapsed+=dt;this.flow+=(Number(this.on)-this.flow)*(1-Math.exp(-dt*22));if(this.flow<.001)this.flow=0;
   if(this.on&&this.elapsed>5){this.spilled=true;this.radius=Math.max(this.radius,.12+.62*Math.sqrt(this.elapsed-5)+Math.max(0,this.elapsed-20)*.22);}
   return this.on?Math.max(0,this.elapsed-20)-Math.max(0,before-20):0;},
  reset(){this.on=false;this.elapsed=this.radius=this.flow=0;this.spilled=false;}};
}
const COMMON=`precision highp float;
varying vec3 vWorld; varying vec3 vNormal; varying vec2 vUV;
uniform vec3 uEye; uniform float uTime; uniform samplerCube uEnvironment; uniform float uHasEnvironment; uniform float uLight;
vec3 reflected(vec3 n,vec3 p){
 vec3 ray=reflect(normalize(p-uEye),n);
 // Box-projected cached room environment: no reflection cameras or screen copies.
 vec3 safe=sign(ray)*max(abs(ray),vec3(.0001));
 vec3 farBox=mix(vec3(-7.5,0.,0.),vec3(7.5,3.2,20.),step(vec3(0.),safe));
 vec3 distances=(farBox-p)/safe;float reach=max(0.,min(distances.x,min(distances.y,distances.z)));
 vec3 direction=p+ray*reach-vec3(0.,1.6,10.);
 vec3 env=textureCube(uEnvironment,direction).rgb;
 vec3 fallback=mix(vec3(.13,.20,.22),vec3(.72,.77,.74),clamp(ray.y*.6+.4,0.,1.));
 return mix(fallback,env,uHasEnvironment)*(.22+.78*uLight);
}
vec3 waterShade(vec3 n,vec3 p,float foam){
 vec3 view=normalize(uEye-p);float fresnel=.0204+.9796*pow(1.-max(0.,dot(n,view)),5.);
 vec3 env=reflected(n,p);vec3 color=mix(vec3(.055,.17,.19),env,.25+fresnel*.75);
 vec3 lamp=normalize(vec3(0.,3.05,clamp(p.z,1.,19.))-p);
 float spec=pow(max(0.,dot(n,normalize(lamp+view))),150.)*.75*uLight;
 return color+vec3(.95,.98,1.)*(spec+foam*.24);
}`;
const SURFACE_VERTEX=`precision highp float;
attribute vec3 position;attribute vec2 uv;uniform mat4 worldViewProjection;uniform mat4 world;
uniform float uTime;uniform float uLevel;uniform float uKind;uniform vec4 uSpillA;uniform vec4 uSpillB;
varying vec3 vWorld;varying vec3 vNormal;varying vec2 vUV;
void main(){vec3 p=position;
 if(uKind<.5){vec2 worldXZ=(world*vec4(p,1.)).xz;float a=1.-smoothstep(uSpillA.z*.5,max(.01,uSpillA.z),distance(worldXZ,uSpillA.xy));float b=1.-smoothstep(uSpillB.z*.5,max(.01,uSpillB.z),distance(worldXZ,uSpillB.xy));p.y+=uLevel*max(a,b);}
 p.y+=(sin(p.x*9.+uTime*2.1)*sin(p.z*7.-uTime*1.7))*.0015;
 vWorld=(world*vec4(p,1.)).xyz;vNormal=vec3(0.,1.,0.);vUV=uv;gl_Position=worldViewProjection*vec4(p,1.);}`;
const SURFACE_FRAGMENT=COMMON+`
uniform float uKind;uniform float uLevel;uniform vec4 uSpillA;uniform vec4 uSpillB;uniform vec2 uRunning;
float maskAt(vec4 s){return (1.-smoothstep(max(0.,s.z-.18),s.z+.04,distance(vWorld.xz,s.xy)))*s.w;}
void main(){float wet=uKind>.5?1.:max(maskAt(uSpillA),maskAt(uSpillB));if(wet<.015)discard;
 vec2 p=vWorld.xz;vec2 slope=vec2(sin(p.x*13.+uTime*2.6)*.012+sin(p.y*24.-uTime*3.)*.004,cos(p.y*15.-uTime*2.1)*.012+sin(p.x*19.+uTime*2.4)*.004);
 float foam=0.;
 for(int i=0;i<2;i++){vec4 s=i==0?uSpillA:uSpillB;vec2 delta=p-s.xy;float d=length(delta);float pulse=sin(d*46.-uTime*14.)*exp(-d*3.8)*s.w*(uKind>.5?1.:(i==0?uRunning.x:uRunning.y));
 slope+=delta/max(d,.02)*pulse*.045;foam+=pow(max(0.,pulse),12.)*.22;}
 vec3 n=normalize(vec3(-slope.x,1.,-slope.y));vec3 view=normalize(uEye-vWorld);float f=pow(1.-max(0.,dot(n,view)),4.);
 float caustic=pow(max(0.,sin(p.x*17.+sin(p.y*11.-uTime)) * sin(p.y*18.-sin(p.x*9.+uTime*.8))),16.)*.10;
 vec3 color=waterShade(n,vWorld,foam)+vec3(.3,.52,.56)*caustic;float alpha=wet*(.23+min(.17,uLevel*.5)+f*.48);
 // A narrow glistening meniscus makes the spreading front read as a wet film.
 float edge=(1.-abs(wet*2.-1.));color+=vec3(.16,.22,.23)*pow(edge,12.)*.18;
 gl_FragColor=vec4(color,clamp(alpha,0.,.82));}`;
const FLOW_VERTEX=`precision highp float;
attribute vec3 position;attribute vec2 uv;uniform mat4 viewProjection;
uniform vec3 uNozzle;uniform vec3 uLip;uniform vec3 uOut;uniform float uTray;uniform float uFloor;uniform float uTime;uniform float uFlow;uniform float uOverflow;
varying vec3 vWorld;varying vec3 vNormal;varying vec2 vUV;varying float vOn;
void main(){float branch=position.z;bool overflow=branch>.5;vec3 origin=overflow?uLip:uNozzle;origin.x+=(branch>1.5?.018:0.);
 float bottom=overflow?uFloor:uTray;float length=max(.005,origin.y-bottom);float velocity=overflow?.12:.35;
 float duration=(sqrt(velocity*velocity+19.62*length)-velocity)/9.81;float age=position.y*duration;float drop=velocity*age+4.905*age*age;
 float radius=(overflow?.0038:.0041)*sqrt(velocity/max(.01,velocity+9.81*age));
 float angle=position.x*6.2831853;float wobble=sin(age*48.+uTime*18.+branch)*.0008*position.y;
 vec3 p=origin+vec3(cos(angle)*radius+wobble,-drop,sin(angle)*radius);
 if(overflow)p+=uOut*.012*position.y;
 vWorld=p;vNormal=vec3(cos(angle),.015,sin(angle));vUV=uv;vOn=overflow?uOverflow:uFlow;gl_Position=viewProjection*vec4(p,1.);}`;
const FLOW_FRAGMENT=COMMON+`
varying float vOn;
void main(){if(vOn<.01)discard;vec3 n=normalize(vNormal);float ribbons=.5+.5*sin(vUV.y*105.-uTime*32.+sin(vUV.x*19.)*1.5);
 float glint=pow(max(0.,dot(n,normalize(uEye-vWorld))),9.);float rim=pow(1.-abs(dot(n,normalize(uEye-vWorld))),3.);vec3 color=waterShade(n,vWorld,0.)+vec3(.65,.75,.78)*rim+vec3(.24,.28,.30)*glint;
 gl_FragColor=vec4(color,(.32+.23*ribbons+.22*glint)*vOn);}`;
const DROP_VERTEX=`precision highp float;
attribute vec3 position;attribute vec2 uv;uniform mat4 viewProjection;uniform vec3 uImpact;uniform vec3 uRight;uniform vec3 uUp;uniform float uTime;uniform float uOn;
varying vec3 vWorld;varying vec3 vNormal;varying vec2 vUV;varying float vOn;
void main(){float id=position.x;float phase=fract(uTime*2.8+id*.61803);float age=phase*.30;float angle=id*2.39996;
 float speed=.22+fract(id*.427)*.43;vec3 p=uImpact+vec3(cos(angle)*speed*age,(.6+fract(id*.77)*.45)*age-4.905*age*age,sin(angle)*speed*age);
 float radius=.0012+fract(id*.33)*.0018;p+=(uRight*(uv.x-.5)+uUp*(uv.y-.5)*1.5)*radius*2.;
 vWorld=p;vNormal=normalize(uRight+uUp);vUV=uv;vOn=uOn*step(0.,p.y-uImpact.y);gl_Position=viewProjection*vec4(p,1.);}`;
const DROP_FRAGMENT=COMMON+`
varying float vOn;
void main(){float d=length((vUV-.5)*2.);if(d>1.||vOn<.01)discard;float edge=1.-smoothstep(.35,1.,d);vec3 color=mix(vec3(.55,.70,.73),vec3(.95,.99,1.),pow(max(0.,1.-length(vUV-vec2(.35,.68))*2.),4.));gl_FragColor=vec4(color,edge*.6*vOn);}`;
const BUTTON_VERTEX=`precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 worldViewProjection;uniform mat4 world;varying vec2 vUV;void main(){vUV=uv;gl_Position=worldViewProjection*vec4(position,1.);}`;
const BUTTON_FRAGMENT=`precision highp float;varying vec2 vUV;uniform sampler2D uLabel;void main(){gl_FragColor=texture2D(uLabel,vUV);}`;
function geometry(name,scene,positions,indices,uvs){const m=new Mesh(name,scene),v=new VertexData();v.positions=positions;v.indices=indices;v.uvs=uvs;v.applyToMesh(m,false);m.isPickable=false;m.receiveShadows=false;m.alwaysSelectAsActiveMesh=true;return m;}
function grid(name,scene,w,d,nx,nz){const p=[],uv=[],idx=[];for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++){p.push((x/nx-.5)*w,0,(z/nz-.5)*d);uv.push(x/nx,z/nz);}for(let z=0;z<nz;z++)for(let x=0;x<nx;x++){const a=z*(nx+1)+x,b=a+1,c=a+nx+1;idx.push(a,c,b,b,c,c+1);}return geometry(name,scene,p,idx,uv);}
// ShaderMaterial provides both matrices when WebXR multiview is active.
// Select the correct eye explicitly; custom shaders must not reuse one eye's
// worldViewProjection for both Quest views.
function stereoVertex(source){
 const project=`
#ifdef MULTIVIEW
#extension GL_OVR_multiview2 : require
layout(num_views=2) in;
#endif
precision highp float;
uniform mat4 viewProjection;
#ifdef MULTIVIEW
uniform mat4 viewProjectionR;
#endif
vec4 waterProject231(vec3 p){
#ifdef MULTIVIEW
 return (gl_ViewID_OVR==0u?viewProjection:viewProjectionR)*vec4(p,1.);
#else
 return viewProjection*vec4(p,1.);
#endif
}
`;
 return project+source.replace('precision highp float;','').replace('uniform mat4 viewProjection;','')
  .replace('gl_Position=viewProjection*vec4(p,1.);','gl_Position=waterProject231(p);')
  .replace('gl_Position=worldViewProjection*vec4(p,1.);','gl_Position=waterProject231(vWorld);')
  .replace('gl_Position=worldViewProjection*vec4(position,1.);','gl_Position=waterProject231((world*vec4(position,1.)).xyz);');
}
function shader(name,scene,vertex,fragment,attributes,uniforms,samplers=[]){const m=new ShaderMaterial(name,scene,{vertexSource:stereoVertex(vertex),fragmentSource:fragment},{attributes,uniforms:[...new Set(['world','worldViewProjection','viewProjection',...uniforms])],samplers,needAlphaBlending:true});m.backFaceCulling=false;m.disableDepthWrite=true;m.alphaMode=2;m.alpha=.8;return m;}
function flowMesh(scene){const p=[],uv=[],indices=[],sides=8,segments=18;for(let branch=0;branch<3;branch++){const base=p.length/3;for(let j=0;j<=segments;j++)for(let i=0;i<=sides;i++){p.push(i/sides,j/segments,branch);uv.push(i/sides,j/segments);}for(let j=0;j<segments;j++)for(let i=0;i<sides;i++){const a=base+j*(sides+1)+i,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}}return geometry('water231-gravity-streams',scene,p,indices,uv);}
function dropsMesh(scene,count){const p=[],uv=[],indices=[];for(let i=0;i<count;i++){const base=p.length/3;for(const q of [[0,0],[1,0],[1,1],[0,1]]){p.push(i,0,0);uv.push(...q);}indices.push(base,base+1,base+2,base,base+2,base+3);}return geometry('water231-splash-drops',scene,p,indices,uv);}
const BASIC_UNIFORMS=['uEye','uTime','uHasEnvironment','uLight'];
export function installOfficeWater231({debug,office,room,getAudio=()=>null,getMaster=()=>null,unlockAudio=()=>{}}){
 if(debug.water231)return debug.water231;
 const scene=debug.scene,canvas=scene.getEngine().getRenderingCanvas(),records=debug.editor.records;
 const devices=[...records.values()].filter(r=>r.asset==='water-cooler');
 let disposed=false,time=0,level=0,noise=null,lastScan=-1,nearest=null;
 const ownMeshes=[],materials=[],textures=[],scratch=new Vector3(),eye=new Vector3(),right=new Vector3(),up=new Vector3();
 const common=(mat)=>{mat.setVector3('uEye',eye);mat.setFloat('uTime',time);mat.setFloat('uLight',clamp(debug.light??.5,.08,1));mat.setFloat('uHasEnvironment',scene.environmentTexture?1:0);if(scene.environmentTexture)mat.setTexture('uEnvironment',scene.environmentTexture);};
 const surfaceMaterial=(name)=>{const m=shader(name,scene,SURFACE_VERTEX,SURFACE_FRAGMENT,['position','uv'],[...BASIC_UNIFORMS,'uLevel','uKind','uSpillA','uSpillB','uRunning'],['uEnvironment']);materials.push(m);m.onBindObservable.add(()=>common(m));return m;};
 const floor=grid('water231-room-surface',scene,(room?.width||15)-.14,(room?.length||20)-.18,20,28);floor.position.set(0,.006,(room?.length||20)/2);floor.alphaIndex=1;floor.setEnabled(false);ownMeshes.push(floor);
 const floorMat=surfaceMaterial('water231-reflective-floor');floor.material=floorMat;floorMat.setFloat('uKind',0);floorMat.setFloat('uLevel',0);floorMat.setVector4?.('uSpillA',{x:0,y:0,z:0,w:0});
 const items=devices.map((record,index)=>{
  const state=createPourState231(),item={record,state,nozzle:new Vector3(),button:new Vector3(),tray:new Vector3(),lip:new Vector3(),out:new Vector3(),impact:new Vector3(),basinSpill:{x:0,y:0,z:.1,w:0},sound:null};
  item.flow=flowMesh(scene);item.flow.alphaIndex=3;item.flow.setEnabled(false);ownMeshes.push(item.flow);
  item.flowMat=shader('water231-flow-'+index,scene,FLOW_VERTEX,FLOW_FRAGMENT,['position','uv'],[...BASIC_UNIFORMS,'uNozzle','uLip','uOut','uTray','uFloor','uFlow','uOverflow'],['uEnvironment']);materials.push(item.flowMat);item.flow.material=item.flowMat;item.flowMat.onBindObservable.add(()=>common(item.flowMat));
  item.basin=grid('water231-tray-'+index,scene,.19,.055,1,1);item.basin.alphaIndex=2;item.basin.setEnabled(false);ownMeshes.push(item.basin);item.basinMat=surfaceMaterial('water231-basin-'+index);item.basin.material=item.basinMat;item.basinMat.setFloat('uKind',1);item.basinMat.setFloat('uLevel',0);
  item.drops=dropsMesh(scene,28);item.drops.alphaIndex=4;item.drops.setEnabled(false);ownMeshes.push(item.drops);item.dropMat=shader('water231-drops-'+index,scene,DROP_VERTEX,DROP_FRAGMENT,['position','uv'],[...BASIC_UNIFORMS,'uImpact','uRight','uUp','uOn'],['uEnvironment']);materials.push(item.dropMat);item.drops.material=item.dropMat;item.dropMat.onBindObservable.add(()=>common(item.dropMat));
  const label=document.createElement('canvas');label.width=512;label.height=128;item.label=label;item.texture=RawTexture.CreateRGBATexture(new Uint8Array(512*128*4),512,128,scene,false,false,2);textures.push(item.texture);
  item.prompt=geometry('water231-cold-button-'+index,scene,[-.28,-.07,0,.28,-.07,0,.28,.07,0,-.28,.07,0],[0,1,2,0,2,3],[0,1,1,1,1,0,0,0]);item.prompt.billboardMode=Mesh.BILLBOARDMODE_ALL;item.prompt.isPickable=true;item.prompt.alphaIndex=5;item.prompt.setEnabled(false);ownMeshes.push(item.prompt);
  item.promptMat=shader('water231-label-'+index,scene,BUTTON_VERTEX,BUTTON_FRAGMENT,['position','uv'],[],['uLabel']);item.promptMat.setTexture('uLabel',item.texture);materials.push(item.promptMat);item.prompt.material=item.promptMat;item.prompt.metadata={water231:true,officeAction97:()=>toggle(record.id)};
  updateLabel(item);return item;
 });
 const spillA={x:0,y:0,z:0,w:0},spillB={x:0,y:0,z:0,w:0},running={x:0,y:0},zeroSpill={x:0,y:0,z:0,w:0};
 function updateLabel(item){const c=item.label.getContext('2d');c.clearRect(0,0,512,128);c.fillStyle='#102e3be8';c.beginPath();if(c.roundRect)c.roundRect(4,4,504,120,24);else c.rect(4,4,504,120);c.fill();c.strokeStyle=item.state.on?'#9eeed8':'#7bcce9';c.lineWidth=3;c.stroke();c.fillStyle='#e9fcff';c.textAlign='center';c.direction='rtl';c.font='bold 33px Tahoma';c.fillText(item.state.on?'بستن آب سرد':'فشار دادن دکمهٔ آب سرد',256,77,480);item.texture.update(new Uint8Array(c.getImageData(0,0,512,128).data.buffer));}
 function locate(item){const node=item.record.node;if(item.record.deleted||!node.isEnabled())return false;node.computeWorldMatrix(true);const matrix=node.getWorldMatrix();Vector3.TransformCoordinatesFromFloatsToRef(...COLD_TAP231,matrix,item.nozzle);Vector3.TransformCoordinatesFromFloatsToRef(...COLD_BUTTON231,matrix,item.button);Vector3.TransformCoordinatesFromFloatsToRef(...TRAY231,matrix,item.tray);Vector3.TransformCoordinatesFromFloatsToRef(...LIP231,matrix,item.lip);scratch.set(0,0,-1);Vector3.TransformNormalToRef(scratch,matrix,item.out);item.out.normalize();return true;}
 function listener(){const camera=office.xrActive?office.helper?.baseExperience.camera:debug.camera;if(camera){camera.getViewMatrix(true);camera.getWorldMatrix().getTranslationToRef(eye);}else eye.set(debug.pos.x,debug.pos.y+1.72,debug.pos.z);const m=camera?.getViewMatrix?.().m;if(m){right.set(m[0],m[4],m[8]);up.set(m[1],m[5],m[9]);}else{right.set(1,0,0);up.set(0,1,0);}}
 function inReach(item){return debug.playing&&!office.entering131&&!item.record.deleted&&item.record.node.isEnabled()&&Vector3.Distance(eye,item.button)<=2.3&&!canvas.__editorDragging&&!canvas.__editorPlacing&&!debug.editor.selected;}
 function fitPrompt(item){
  item.prompt.scaling.setAll(1);if(office.xrActive)return;
  const camera=debug.camera;if(!camera)return;
  Vector3.TransformCoordinatesToRef(item.prompt.position,camera.getViewMatrix(),scratch);
  const depth=Math.abs(scratch.z),projection=camera.getProjectionMatrix().m;
  if(depth<.01)return;
  const scale=Math.min(1,1.5*depth/(.56*projection[0]));item.prompt.scaling.setAll(scale);
  const maxX=Math.max(0,.94*depth/projection[0]-.28*scale),maxY=Math.max(0,.94*depth/projection[5]-.07*scale);
  scratch.x=clamp(scratch.x,-maxX,maxX);scratch.y=clamp(scratch.y,-maxY,maxY);
  Vector3.TransformCoordinatesToRef(scratch,camera.getWorldMatrix(),item.prompt.position);
 }
 function stopSound(item){const s=item.sound;if(!s)return;for(const n of s.sources){try{n.stop();}catch{}n.disconnect();}for(const n of s.nodes)try{n.disconnect();}catch{}item.sound=null;}
 function startSound(item){if(item.sound)return;const ctx=getAudio(),master=getMaster();if(!ctx||!master)return;try{
  if(!noise){noise=ctx.createBuffer(1,Math.floor(ctx.sampleRate*1.3),ctx.sampleRate);const a=noise.getChannelData(0);let low=0;for(let i=0;i<a.length;i++){low=.72*low+.28*(Math.random()*2-1);a[i]=low*.9;}}
  const source=ctx.createBufferSource(),band=ctx.createBiquadFilter(),gain=ctx.createGain(),panner=ctx.createPanner(),bubble=ctx.createOscillator(),bubbleGain=ctx.createGain();source.buffer=noise;source.loop=true;band.type='lowpass';band.frequency.value=1900;band.Q.value=.6;gain.gain.value=0;bubble.type='sine';bubble.frequency.value=420;bubbleGain.gain.value=.009;
  panner.panningModel='equalpower';panner.distanceModel='inverse';panner.refDistance=.6;panner.rolloffFactor=1.25;panner.maxDistance=8;source.connect(band);band.connect(gain);bubble.connect(bubbleGain);bubbleGain.connect(gain);gain.connect(panner);panner.connect(master);source.start();bubble.start();item.sound={sources:[source,bubble],nodes:[band,gain,panner,bubbleGain],gain,panner,band,bubble};
 }catch(e){console.warn('Water sound unavailable',e);stopSound(item);}}
 function updateSound(item,active,overflow){if(!active){stopSound(item);return;}startSound(item);const s=item.sound,ctx=getAudio();if(!s||!ctx)return;const p=overflow?item.lip:item.nozzle;s.panner.setPosition(p.x,p.y,p.z);const distance=Vector3.Distance(eye,p),fade=clamp((8-distance)/3);s.gain.gain.setTargetAtTime(fade*(overflow?.45:.32),ctx.currentTime,.035);s.band.frequency.setTargetAtTime(overflow?2300:1400,ctx.currentTime,.06);s.bubble.frequency.setTargetAtTime(390+Math.sin(time*9.3)*115+Math.sin(time*17.)*65,ctx.currentTime,.025);}
 function toggle(id){if(disposed)return false;listener();const item=items.find(i=>i.record.id===id);if(!item||!inReach(item))return false;unlockAudio();item.state.toggle();updateLabel(item);if(!item.state.on)stopSound(item);debug.toast97?.(item.state.on?'آب سرد باز شد.':'آب سرد بسته شد.');return true;}
 function candidate(){if(disposed||!nearest||!inReach(nearest))return null;return {kind:'water231',id:nearest.record.id,distance:Vector3.Distance(eye,nearest.button),label:nearest.state.on?'بستن آب سرد':'فشار دادن دکمهٔ آب سرد'};}
 function activateHit(record,hit){if(disposed)return false;const item=items.find(i=>i.record.id===record.id);if(!item||!hit?.pickedPoint)return false;locate(item);if(Vector3.Distance(hit.pickedPoint,item.button)>.042)return false;return toggle(record.id);}
 function click(event){if(office.xrActive||event.button!==0||performance.now()<(canvas.__ignoreEditorClickUntil||0)||!debug.playing)return;const r=canvas.getBoundingClientRect(),hit=scene.pick(event.clientX-r.left,event.clientY-r.top,m=>m.isEnabled()&&m.isVisible&&m.visibility>0&&m.isPickable!==false);if(hit?.pickedMesh?.metadata?.water231){hit.pickedMesh.metadata.officeAction97();return;}const owner=debug.editor.owner97(hit?.pickedMesh);if(owner?.asset==='water-cooler')activateHit(owner,hit);}
 canvas.addEventListener('click',click);
 function update(dt){if(disposed)return;listener();const playing=debug.playing&&!document.hidden;dt=playing?clamp(dt,0,.1):0;if(playing)time+=dt;
  if(time-lastScan>.1||lastScan<0){lastScan=time;nearest=null;let best=2.31;for(const item of items){if(!locate(item)){item.state.reset();stopSound(item);continue;}const d=Vector3.Distance(eye,item.button);if(d<best){nearest=item;best=d;}}}
  let rise=0;for(const item of items)rise+=item.state.tick(dt);level=Math.min(.35,level+rise*.006);
  let wet=false;
  for(const item of items){const valid=!item.record.deleted&&item.record.node.isEnabled(),state=item.state,overflow=valid&&state.spilled&&state.flow>.002&&state.elapsed>5;
   const near=Vector3.Distance(eye,item.nozzle)<8.5,show=valid&&near&&state.flow>.002;item.flow.setEnabled(show);item.basin.setEnabled(valid&&near&&(state.elapsed>0||state.spilled));item.drops.setEnabled(show);
   item.prompt.setEnabled(item===nearest&&inReach(item)&&!document.documentElement.hasAttribute('data-clean-view224'));item.prompt.position.copyFrom(item.button);item.prompt.position.x+=item.out.x*.35;item.prompt.position.z+=item.out.z*.35;item.prompt.position.y+=.15;
   if(item.prompt.isEnabled())fitPrompt(item);
   item.flowMat.setVector3('uNozzle',item.nozzle);item.flowMat.setVector3('uLip',item.lip);item.flowMat.setVector3('uOut',item.out);item.flowMat.setFloat('uTray',item.tray.y+.006);item.flowMat.setFloat('uFloor',level+.009);item.flowMat.setFloat('uFlow',state.flow);item.flowMat.setFloat('uOverflow',overflow?state.flow:0);
   item.basin.position.set(item.tray.x,item.tray.y+.002+Math.min(.009,state.elapsed*.0018),item.tray.z);if(item.record.node.absoluteRotationQuaternion){if(!item.basin.rotationQuaternion)item.basin.rotationQuaternion=item.record.node.absoluteRotationQuaternion.clone();else item.basin.rotationQuaternion.copyFrom(item.record.node.absoluteRotationQuaternion);}
   item.impact.copyFrom(overflow?item.lip:item.nozzle);if(overflow){item.impact.x+=item.out.x*.012;item.impact.z+=item.out.z*.012;}item.impact.y=overflow?level+.012:item.tray.y+.01;
   item.dropMat.setVector3('uImpact',item.impact);item.dropMat.setVector3('uRight',right);item.dropMat.setVector3('uUp',up);item.dropMat.setFloat('uOn',state.flow);
   item.basinSpill.x=item.nozzle.x;item.basinSpill.y=item.nozzle.z;item.basinSpill.w=state.flow;item.basinMat.setVector4('uSpillA',item.basinSpill);item.basinMat.setVector4('uSpillB',zeroSpill);item.basinMat.setVector2('uRunning',running);
   updateSound(item,playing&&show,overflow);if(valid&&state.radius>0)wet=true;
  }
  for(let i=0;i<2;i++){const item=items[i],s=i?spillB:spillA;s.x=item?item.lip.x+item.out.x*.012:0;s.y=item?item.lip.z+item.out.z*.012:0;s.z=item?.state.radius||0;s.w=item?.state.spilled?1:0;}
  running.x=items[0]?.state.elapsed>5?items[0].state.flow:0;running.y=items[1]?.state.elapsed>5?items[1].state.flow:0;floorMat.setVector2('uRunning',running);floorMat.setVector4('uSpillA',spillA);floorMat.setVector4('uSpillB',spillB);
  floorMat.setFloat('uLevel',level);floor.setEnabled(wet);
 }
 function reset(){if(disposed)return;level=0;time=0;lastScan=-1;nearest=null;for(const item of items){item.state.reset();stopSound(item);item.flow.setEnabled(false);item.basin.setEnabled(false);item.drops.setEnabled(false);item.prompt.setEnabled(false);updateLabel(item);}floor.setEnabled(false);}
 function pagehide(){reset();}addEventListener('pagehide',pagehide);
 const api={toggle,candidate,activateHit,update,reset,get state(){return {level,devices:items.map(i=>({id:i.record.id,on:i.state.on,elapsed:i.state.elapsed,radius:i.state.radius,spilled:i.state.spilled,nozzle:i.nozzle.asArray(),sound:!!i.sound})),drawCallsBudget:1+items.length*4};},dispose(){if(disposed)return;reset();disposed=true;canvas.removeEventListener('click',click);removeEventListener('pagehide',pagehide);for(const m of ownMeshes)m.dispose();for(const m of materials)m.dispose(false,false);for(const t of textures)t.dispose();noise=null;}};
 debug.water231=api;scene.onDisposeObservable.addOnce(()=>api.dispose());update(0);return api;
}
