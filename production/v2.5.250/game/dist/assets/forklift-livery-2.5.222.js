import {brandText222} from './brand-text-2.5.222.js';
import {FORKLIFT_FENDERS219} from './forklift-paint-surfaces-2.5.219.js';
const SPECS219={
 jungheinrich_forklift:{paint:'jungheinrich_forklift',body:[-1.78,-.15,.12,1.08,.42],badge:{x:.643,z:-.98,width:1.04,bottom:.16,top:.56},mast:{x:.317,z:.197,width:.285,bottom:.70,top:2.32}},
 forklift:{paint:'forklift',body:[-1.72,.35,.19,1.24,.61],badge:{x:.782,z:-.56,width:.88,bottom:.24,top:.61},mast:{x:.603,z:.84,width:.275,bottom:.83,top:2.49}}
};
export const FORKLIFT_ART219=Object.freeze([
 {name:'gold',photo:(window.barghetoMediaURL223||((url)=>url))(new URL('./forklift-reference-gold-2.5.219.png',import.meta.url).href),width:1448,height:1086,body:[[248,660],[625,710],[674,913],[278,860]],badge:[[320,705],[615,705],[615,824],[320,824]],erase:[316,620,699,829],mast:[[854,230],[934,230],[934,759],[854,759]],navy:[890,270]},
 {name:'white',photo:(window.barghetoMediaURL223||((url)=>url))(new URL('./forklift-reference-white-2.5.219.png',import.meta.url).href),width:1536,height:1024,body:[[264,595],[683,621],[738,901],[267,774]],badge:[[370,624],[673,624],[673,748],[370,748]],erase:[365,678,620,755],mast:[[914,208],[996,208],[996,747],[914,747]],navy:[950,230]}
]);
const textures219=new Map();
export function loadForkliftTexture219(T,url){
 if(!textures219.has(url))textures219.set(url,new T.TextureLoader().loadAsync(url).then(texture=>{if(url.includes('forklift-reference-'))texture=brandText222(T,texture,url.includes('gold')?[{x:359,y:790,w:112,h:19,font:17,spacing:.6},{x:864,y:472,w:65,h:12,font:10,spacing:.2,color:'#ffffff'}]:[{x:411,y:718,w:126,h:19,font:16,spacing:2},{x:919,y:403,w:72,h:13,font:10,spacing:1,color:'#ffffff'}]);texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.name=url.split('/').at(-1);texture.addEventListener('dispose',()=>textures219.delete(url));return texture;}).catch(error=>{textures219.delete(url);throw error;}));
 return textures219.get(url);
}
function clip219(points,measure){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=measure(a),db=measure(b);if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(a.clone().lerp(b,da/(da-db)));}return out;}
export function createForkliftArtwork219(T,root,kind,variant,texture){
 const existing=root.getObjectByName('bargheto-forklift-artwork219');if(existing)return existing;
 const spec=SPECS219[kind],art=FORKLIFT_ART219[variant],positions=[],normals=[],uv=[],regions=[],z0=spec.body[0],z1=spec.body[1],y0=spec.body[2],y1=spec.body[3];
 root.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert();let bodyTriangles=0,mastTriangles=0;
 const sample=(u,v,corners)=>{
  const x=(1-v)*((1-u)*corners[0][0]+u*corners[1][0])+v*((1-u)*corners[3][0]+u*corners[2][0]);
  const y=(1-v)*((1-u)*corners[0][1]+u*corners[1][1])+v*((1-u)*corners[3][1]+u*corners[2][1]);return [x/art.width,y/art.height];
 };
 root.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.name.startsWith('body_')||mesh.name==='body_m1mat')return;
  const g=mesh.geometry,p=g.attributes.position,index=g.index,matrix=inverse.clone().multiply(mesh.matrixWorld),fenders=new Set(FORKLIFT_FENDERS219[kind]?.[mesh.name]??[]);
  for(let i=0;i<(index?.count??p.count);i+=3){
   const triangle=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(matrix));
   const normal=triangle[1].clone().sub(triangle[0]).cross(triangle[2].clone().sub(triangle[0])).normalize(),side=Math.sign(triangle.reduce((s,p)=>s+p.x,0));
   // The reference retains gold mudguards in both color schemes.
   if(fenders.has(i/3))for(const point of triangle){positions.push(...point.clone().addScaledVector(normal,.007).toArray());normals.push(...normal.toArray());uv.push(848/art.width,(variant===0?747:710)/art.height);regions.push(3);}
   if(Math.abs(normal.x)<.6||normal.x*side<=0)continue;
   let polygon=triangle;
   for(const plane of [p=>p.z-z0,p=>z1-p.z,p=>p.y-y0,p=>y1-p.y,p=>side*p.x-spec.body[4]]){polygon=clip219(polygon,plane);if(polygon.length<3)break;}
   for(let j=1;j<polygon.length-1;j++){
    for(const point of [polygon[0],polygon[j],polygon[j+1]]){
     positions.push(...point.clone().addScaledVector(normal,.004).toArray());normals.push(...normal.toArray());
     let u=(point.z-z0)/(z1-z0);if(side>0)u=1-u;uv.push(...sample(u,1-(point.y-y0)/(y1-y0),art.body));regions.push(0);
    }bodyTriangles++;
   }
  }
 });
 // Real thin guards on the outside of each mast keep the complete artwork
 // above the carriage and clear of chains, bars, wheels and the driver.
 for(const [part,region,corners]of [[spec.mast,1,art.mast],[spec.badge,2,art.badge]])for(const side of [-1,1]){
  const mast={...part},imageWidth=corners[1][0]-corners[0][0],imageHeight=corners[3][1]-corners[0][1];
  if(region===1)mast.width=(mast.top-mast.bottom)*imageWidth/imageHeight;else mast.top=mast.bottom+mast.width*imageHeight/imageWidth;
  const g=new T.BoxGeometry(region===1?.012:.006,mast.top-mast.bottom,mast.width).toNonIndexed();g.translate(side*mast.x,(mast.top+mast.bottom)/2,mast.z);
  const p=g.attributes.position,n=g.attributes.normal;
  for(let i=0;i<p.count;i++){
   const point=new T.Vector3().fromBufferAttribute(p,i),normal=new T.Vector3().fromBufferAttribute(n,i);positions.push(...point.toArray());normals.push(...normal.toArray());regions.push(region);
   if(normal.x*side>.9){let u=(point.z-(mast.z-mast.width/2))/mast.width;if(side>0)u=1-u;uv.push(...sample(u,1-(point.y-mast.bottom)/(mast.top-mast.bottom),corners));}
   else if(region===1)uv.push(art.navy[0]/art.width,art.navy[1]/art.height);else uv.push(art.badge[0][0]/art.width,art.badge[0][1]/art.height);
  }if(region===1)mastTriangles+=p.count/3;g.dispose();
 }
 if(!bodyTriangles)throw Error('Forklift side skin projection did not reach the body');
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setAttribute('aForkliftRegion219',new T.Float32BufferAttribute(regions,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=new T.MeshStandardMaterial({name:'Bargheto forklift artwork '+art.name,map:texture,color:0xffffff,metalness:.15,roughness:.43,side:T.FrontSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 material.userData.forkliftLivery219=variant;material.onBeforeCompile=forkliftLiveryShader219;material.customProgramCacheKey=()=> 'forklift-livery219-'+variant;
 const mesh=new T.Mesh(geometry,material);mesh.name='bargheto-forklift-artwork219';mesh.castShadow=mesh.receiveShadow=false;mesh.userData={editLocked:true,forkliftArtwork219:true,variant:art.name,bodyTriangles,mastTriangles,badgeTriangles:24,source:'supplied-photograph',bothSidesReadable:true};root.add(mesh);return mesh;
}
export function forkliftLiveryShader219(shader){
 const art=FORKLIFT_ART219[this.userData.forkliftLivery219],b=art.erase,values=[b[0]/art.width,b[1]/art.width,b[2]/art.height,b[3]/art.height].map(v=>v.toFixed(9));
 shader.vertexShader='attribute float aForkliftRegion219;varying float vForkliftRegion219;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvForkliftRegion219=aForkliftRegion219;');
 shader.fragmentShader='varying float vForkliftRegion219;\n'+shader.fragmentShader;
 // Remove the large badge from the curved background layer. A single complete
 // copy is placed below the body seam, on a fitted solid identification plate.
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 #ifdef USE_MAP
 if(vForkliftRegion219<.5 && vMapUv.x>${values[0]} && vMapUv.x<${values[1]} && vMapUv.y>${values[2]} && vMapUv.y<${values[3]}){
  vec4 upper=texture2D(map,vec2(vMapUv.x,${values[2]}));vec4 lower=texture2D(map,vec2(vMapUv.x,${values[3]}));
  diffuseColor.rgb=mix(upper.rgb,lower.rgb,smoothstep(${values[2]},${values[3]},vMapUv.y));
 }
 #endif`);
}
export async function prepareForkliftLiveries219(T,source,kind){
 if(source.getObjectByName('body_m0mat'))kind='jungheinrich_forklift';else if(source.getObjectByName('body_Scene_-_Root'))kind='forklift';
 if(!SPECS219[kind])throw Error('Unknown forklift model');
 const textures=await Promise.all(FORKLIFT_ART219.map(async art=>({photo:await loadForkliftTexture219(T,art.photo),paint:await loadForkliftTexture219(T,(window.barghetoMediaURL223||((url)=>url))(new URL('./forklift-'+kind+'-'+art.name+'-2.5.219.png',import.meta.url).href))})));
 return textures.map((maps,variant)=>{
  const root=source.clone(true),materials=new Map();root.traverse(mesh=>{if(!mesh.isMesh)return;const paint=m=>{if(!materials.has(m)){const material=m.clone();material.map=maps.paint;material.color.setHex(0xffffff);material.metalness=.18;material.roughness=.42;materials.set(m,material);}return materials.get(m);};mesh.material=Array.isArray(mesh.material)?mesh.material.map(paint):paint(mesh.material);});
  createForkliftArtwork219(T,root,kind,variant,maps.photo);root.userData.forkliftLivery219={variant:FORKLIFT_ART219[variant].name,model:kind,sourcePhoto:variant+1};return root;
 });
}
export const forkliftVariant219=id=>id%2;
