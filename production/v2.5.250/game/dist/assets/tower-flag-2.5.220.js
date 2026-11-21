export const FLAG220=Object.freeze({width:10.5,height:6,columns:24,rows:12,hoist:6.15,yaw:-.25,logoResolution:512,poleOffset:1.1,belowTip:3});
export const FLAG_LOGO220=(window.barghetoMediaURL223||((url)=>url))(new URL('./tower-flag-logo-2.5.220.png',import.meta.url).href);
const flags220=new WeakMap(),PERIOD220=40*Math.PI;

// Identical wave on both faces. Only the shader moves vertices; no cloth solver,
// geometry uploads, extra animation loops, lights or shadow passes are needed.
export const FLAG_WAVE220=`
uniform float uFlagTime220;
void flagFrame220(vec3 p,out vec3 point,out vec3 surfaceNormal){
 float u=clamp(p.x/10.5,0.0,1.0);
 float v=(6.15-p.y)/6.0;
 float envelope=u*u*(3.0-2.0*u);
 float derivative=6.0*u*(1.0-u);
 float phase1=u*7.5-uFlagTime220*2.15+v*.9;
 float phase2=u*16.5-uFlagTime220*3.6-v*1.7;
 float wave=.40*sin(phase1)+.12*sin(phase2);
 point=p;
 point.z+=envelope*wave;
 point.y+=-.20*u*u+.045*envelope*sin(phase1+.65);
 float dzdx=(derivative*wave+envelope*(3.0*cos(phase1)+1.98*cos(phase2)))/10.5;
 float dzdy=envelope*(-.36*cos(phase1)+.204*cos(phase2))/6.0;
 float dydx=(-.40*u+.045*(derivative*sin(phase1+.65)+envelope*7.5*cos(phase1+.65)))/10.5;
 float dydy=1.0-.045*envelope*.9/6.0*cos(phase1+.65);
 surfaceNormal=normalize(vec3(dydx*dzdy-dzdx*dydy,-dzdy,dydy));
}
`;

export function flagPoint220(x,y,z,time){
 const u=Math.max(0,Math.min(1,x/FLAG220.width)),v=(FLAG220.hoist-y)/FLAG220.height,e=u*u*(3-2*u),p1=u*7.5-time*2.15+v*.9,p2=u*16.5-time*3.6-v*1.7;
 return [x,y-.2*u*u+.045*e*Math.sin(p1+.65),z+e*(.4*Math.sin(p1)+.12*Math.sin(p2))];
}

export function flagShader220(shader,uniforms){
 Object.assign(shader.uniforms,uniforms);
 shader.vertexShader=FLAG_WAVE220+'\nvarying float vFlagSide220;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
 vec3 flagPoint220;vec3 flagNormal220;
 flagFrame220(position,flagPoint220,flagNormal220);
 objectNormal=flagNormal220*sign(normal.z);
 vFlagSide220=sign(normal.z);`);
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=flagPoint220;');
 shader.fragmentShader='varying float vFlagSide220;uniform vec3 uFlagNavy220;uniform vec3 uFlagGold220;uniform vec3 uFlagWhite220;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
 #ifdef USE_MAP
  vec2 flagUV220=vMapUv;
  float aa220=max(fwidth(flagUV220.x),fwidth(flagUV220.y));
  vec3 flagInk220=uFlagWhite220;
  flagInk220=mix(flagInk220,uFlagGold220,1.0-smoothstep(.170,.170+aa220,flagUV220.x));
  flagInk220=mix(flagInk220,uFlagNavy220,1.0-smoothstep(.140,.140+aa220,flagUV220.x));
  float sweep220=.04+.07*flagUV220.x*flagUV220.x;
  flagInk220=mix(flagInk220,uFlagNavy220,1.0-smoothstep(sweep220-.014,sweep220+.014,flagUV220.y));
  float seam220=1.0-smoothstep(.008,.008+aa220,abs(flagUV220.y-sweep220));
  flagInk220=mix(flagInk220,uFlagGold220,seam220);
  float hem220=1.0-smoothstep(.016,.016+aa220,min(flagUV220.y,1.0-flagUV220.y));
  flagInk220=mix(flagInk220,uFlagNavy220,hem220);
  // 4.62m square logo area preserves the original artwork's proportions.
  vec2 logoUV220=(flagUV220-vec2(.38,.175))/vec2(.44,.77);
  if(vFlagSide220<0.0)logoUV220.x=1.0-logoUV220.x;
  if(logoUV220.x>=0.0&&logoUV220.x<=1.0&&logoUV220.y>=0.0&&logoUV220.y<=1.0){
   vec4 logo220=texture2D(map,logoUV220);
   flagInk220=mix(flagInk220,logo220.rgb,logo220.a);
  }
  diffuseColor.rgb*=flagInk220;
 #endif
 `);
}

export function createFlagGeometry220(T){
 const {width,height,columns,rows,hoist}=FLAG220,p=[],n=[],uv=[],index=[];
 for(const side of [1,-1]){
  const base=p.length/3;
  for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++){
   const u=col/columns,v=row/rows;p.push(u*width,hoist-v*height,side*.008);n.push(0,0,side);uv.push(u,1-v);
  }
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
   const a=base+row*(columns+1)+col,b=a+columns+1;
   if(side>0)index.push(a,b,a+1,a+1,b,b+1);else index.push(a,a+1,b,a+1,b+1,b);
  }
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(index);
 g.computeBoundingBox();g.boundingBox.min.y-=.26;g.boundingBox.max.y+=.05;g.boundingBox.min.z-=.54;g.boundingBox.max.z+=.54;g.boundingSphere=g.boundingBox.getBoundingSphere(new T.Sphere());return g;
}

function poleGeometry220(T){
 const parts=[],pole=new T.CylinderGeometry(.045,.065,8.35,6,1);pole.translate(0,2.325,0);parts.push(pole);
 for(const y of [.15,FLAG220.hoist]){const ring=new T.TorusGeometry(.09,.012,3,8);ring.rotateX(Math.PI/2);ring.translate(0,y,0);parts.push(ring);}
 const cap=new T.SphereGeometry(.075,6,4);cap.translate(0,6.56,0);parts.push(cap);
 for(const y of [-1.35,5.9]){const arm=new T.CylinderGeometry(.028,.028,FLAG220.poleOffset,6,1);arm.rotateZ(-Math.PI/2);arm.translate(-FLAG220.poleOffset/2,y,0);parts.push(arm);}
 const a=new T.Vector3(-FLAG220.poleOffset,4.9,0),b=new T.Vector3(0,5.9,0),brace=new T.CylinderGeometry(.023,.023,a.distanceTo(b),6,1);brace.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize()));brace.translate(...a.add(b).multiplyScalar(.5).toArray());parts.push(brace);
 const p=[],n=[];
 for(const source of parts){const g=source.index?source.toNonIndexed():source;p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);if(g!==source)g.dispose();source.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.computeBoundingBox();g.computeBoundingSphere();return g;
}

function mastBounds220(T,mast){
 mast.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(mast.matrixWorld).invert(),bounds=new T.Box3();
 mast.traverse(o=>{if(o.isMesh&&o.geometry){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)));}});
 if(bounds.isEmpty())throw Error('Radio mast has no geometry');return bounds;
}

export function createTowerFlag220(T,mast,texture,{getTime=()=>0,patch=()=>{}}={}){
 if(flags220.has(mast))return flags220.get(mast);
 const box=mastBounds220(T,mast),group=new T.Group(),scale=mast.getWorldScale(new T.Vector3());
 // Keep the cloth just below the lightning tip, in the reference camera's view.
 // The side bracket clears the antenna panels while following saved mast edits.
 group.name='bargheto-tower-flag220';group.position.set(0,box.max.y-(FLAG220.hoist+FLAG220.belowTip)/Math.abs(scale.y),0);group.scale.set(1/Math.abs(scale.x),1/Math.abs(scale.y),1/Math.abs(scale.z));
 const worldYaw=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),FLAG220.yaw);group.quaternion.copy(mast.getWorldQuaternion(new T.Quaternion()).invert().multiply(worldYaw));
 const uniforms={uFlagTime220:{value:0},uFlagNavy220:{value:new T.Color(0x15175f)},uFlagGold220:{value:new T.Color(0xf5a138)},uFlagWhite220:{value:new T.Color(0xf7f9fc)}};
 const material=new T.MeshStandardMaterial({name:'Bargheto lightweight waving flag',map:texture,color:0xffffff,roughness:.9,metalness:0,envMapIntensity:.35,side:T.FrontSide});
 material.onBeforeCompile=shader=>{patch(shader);flagShader220(shader,uniforms);};material.customProgramCacheKey=()=> 'bargheto-tower-flag220';
 const updateTime=()=>{const t=Number(getTime());uniforms.uFlagTime220.value=Number.isFinite(t)?Math.max(0,t)%PERIOD220:0;};material.onBeforeRender=updateTime;
 const geometry=createFlagGeometry220(T),cloth=new T.Mesh(geometry,material);cloth.name='bargheto-flag-cloth220';cloth.position.x=FLAG220.poleOffset+.12;
 const poleMaterial=new T.MeshStandardMaterial({name:'Bargheto flag pole',color:0xb9c3ca,metalness:.7,roughness:.45});poleMaterial.onBeforeCompile=patch;poleMaterial.customProgramCacheKey=()=> 'bargheto-flag-pole220';
 const hardware=new T.Mesh(poleGeometry220(T),poleMaterial);hardware.name='bargheto-flag-mount220';hardware.position.x=FLAG220.poleOffset;
 for(const mesh of [cloth,hardware]){mesh.castShadow=mesh.receiveShadow=false;mesh.userData={editLocked:true,dynamic:true,noStaticBatch:true,flag220:true};group.add(mesh);}
 group.userData={editLocked:true,animated:true,width:FLAG220.width,height:FLAG220.height,clothTriangles:geometry.index.count/3,hardwareTriangles:hardware.geometry.attributes.position.count/3,additionalDrawCalls:2,vertexShaderAnimation:true,noClothPhysics:true,noAddedLights:true,noShadowPasses:true};
 mast.add(group);group.updateWorldMatrix(true,true);let disposed=false;
 const controller={group,cloth,hardware,uniforms,updateTime,dispose(){if(disposed)return;disposed=true;group.removeFromParent();geometry.dispose();material.dispose();hardware.geometry.dispose();poleMaterial.dispose();texture.dispose();flags220.delete(mast);}};
 flags220.set(mast,controller);updateTime();return controller;
}

export async function installTowerFlag220(game,T){
 if(game.towerFlag220)return game.towerFlag220;
 // The reference is the tall HQ mast. The separate 10m solar-room mast stays as is.
 const city=game.city,mast=city.headquarters?.group.getObjectByName('bargheto-rooftop-radio-mast')??city.group.getObjectByName('bargheto-rooftop-radio-mast');
 if(!mast)return null;
 const texture=await new T.TextureLoader().loadAsync(FLAG_LOGO220);texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;texture.anisotropy=4;texture.name='Bargheto flag logo 512';
 const flag=createTowerFlag220(T,mast,texture,{getTime:()=>game.visualTime,patch:city.atmosphere?.patch??(()=>{})});game.towerFlag220=flag;
 const dispose=city.dispose;city.dispose=function(...args){flag.dispose();return dispose.apply(this,args);};return flag;
}
