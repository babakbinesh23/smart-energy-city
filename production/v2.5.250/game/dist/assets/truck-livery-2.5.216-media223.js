// Samples the supplied reference pixels directly, preserving its lettering/art.
export const TRUCK_LIVERY_URL216=(window.barghetoCityServerMedia109?.["truck-livery-reference-2.5.216.png"]||(window.barghetoMediaURL223||((url)=>url))(new URL('./truck-livery-reference-2.5.216.png',import.meta.url).href));
let texturePromise216;
export async function loadTruckLivery216(T){
 if(!texturePromise216)texturePromise216=new T.TextureLoader().loadAsync(TRUCK_LIVERY_URL216).then(texture=>{texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=2;texture.name='Bargheto supplied truck livery 216';texture.addEventListener('dispose',()=>texturePromise216=null);return texture;}).catch(error=>{texturePromise216=null;throw error;});
 return texturePromise216;
}
export function truckLiveryShader216(shader){
 shader.vertexShader='attribute float aTruckInk216;varying float vTruckInk216;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTruckInk216=aTruckInk216;');
 shader.fragmentShader='varying float vTruckInk216;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vTruckInk216>.5)diffuseColor.a*=smoothstep(.055,.13,max(diffuseColor.r,diffuseColor.g));');
}
function clip216(points,measure){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=measure(a),db=measure(b);if(da>=0)out.push(a);if((da>=0)!==(db>=0))out.push(a.clone().lerp(b,da/(da-db)));}return out;}
export function createTruckLivery216(root,T,texture){
 if(root.getObjectByName('bargheto-truck-livery216'))return root.getObjectByName('bargheto-truck-livery216');
 const cargo=root.getObjectByName('body_bodycolour'),cab=root.getObjectByName('body_head_paint');if(!cargo?.isMesh||!cab?.isMesh)throw Error('Truck paint surfaces not found');
 root.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),positions=[],normals=[],uv=[],ink=[];
 const cargoBox=new T.Box3().setFromBufferAttribute(cargo.geometry.attributes.position),z0=cargoBox.min.z+.035,z1=cargoBox.max.z-.055,y0=1.15,y1=cargoBox.max.y-.035;
 const image={width:1448,height:1086};
 const artwork=(u,v,corners)=>{const x=(1-v)*((1-u)*corners[0][0]+u*corners[1][0])+v*((1-u)*corners[3][0]+u*corners[2][0]),y=(1-v)*((1-u)*corners[0][1]+u*corners[1][1])+v*((1-u)*corners[3][1]+u*corners[2][1]);return [x/image.width,1-y/image.height];};
 const region=(mesh,planes,toUV,key)=>{
  const g=mesh.geometry,p=g.attributes.position,index=g.index,matrix=inverse.clone().multiply(mesh.matrixWorld),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let triangles=0;
  for(let i=0;i<(index?.count??p.count);i+=3){a.fromBufferAttribute(p,index?index.getX(i):i).applyMatrix4(matrix);b.fromBufferAttribute(p,index?index.getX(i+1):i+1).applyMatrix4(matrix);c.fromBufferAttribute(p,index?index.getX(i+2):i+2).applyMatrix4(matrix);
   const normal=b.clone().sub(a).cross(c.clone().sub(a)).normalize(),side=Math.sign((a.x+b.x+c.x)/3);if(Math.abs(normal.x)<.65||Math.abs((a.x+b.x+c.x)/3)<.78)continue;if(normal.x*side<0)normal.negate();
   let polygon=[a.clone(),b.clone(),c.clone()];for(const plane of planes){polygon=clip216(polygon,plane);if(polygon.length<3)break;}if(polygon.length<3)continue;
   for(let k=1;k<polygon.length-1;k++){for(const point of [polygon[0],polygon[k],polygon[k+1]]){const decal=point.clone().addScaledVector(normal,.005);positions.push(...decal.toArray());normals.push(...normal.toArray());uv.push(...toUV(point,side));ink.push(key);}triangles++;}
  }return triangles;
 };
 const bounds=(zMin,zMax,yMin,yMax)=>[p=>p.z-zMin,p=>zMax-p.z,p=>p.y-yMin,p=>yMax-p.y];
 const cargoTriangles=region(cargo,bounds(z0,z1,y0,y1),(p,side)=>{let u=(p.z-z0)/(z1-z0);if(side>0)u=1-u;return artwork(u,(p.y-y0)/(y1-y0),[[79,649],[1052,641],[1052,362],[79,365]]);},0);
 // The lower orange sweep is painted only on actual blue cab metal, not glass.
 const stripeCenter=z=>1.38-.28*(z-3.35),stripeWidth=.12;
 const stripeTriangles=region(cab,[...bounds(3.35,5.75,.35,1.6),p=>p.y-stripeCenter(p.z)+stripeWidth/2,p=>stripeCenter(p.z)+stripeWidth/2-p.y],p=>artwork((p.z-3.35)/2.4,(p.y-stripeCenter(p.z))/stripeWidth+.5,[[1092,615],[1348,706],[1338,687],[1092,596]]),1);
 // Keep the supplied cab badge upright on both sides of the sleeper/door area.
 const logoTriangles=region(cab,bounds(3.64,4.26,1.45,2.30),(p,side)=>{let u=(p.z-3.64)/.62;if(side>0)u=1-u;return artwork(u,(p.y-1.45)/.85,[[1225,627],[1288,627],[1278,551],[1227,550]]);},1);
 if(!cargoTriangles||!logoTriangles)throw Error('Truck reference projection did not reach body');
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setAttribute('aTruckInk216',new T.Float32BufferAttribute(ink,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=new T.MeshStandardMaterial({map:texture,color:0xffffff,roughness:.6,metalness:.05,side:T.DoubleSide,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});material.forceSinglePass=true;material.userData.truckLivery216=true;material.onBeforeCompile=truckLiveryShader216;material.customProgramCacheKey=()=> 'bargheto-truck-livery216';
 const decal=new T.Mesh(geometry,material);decal.name='bargheto-truck-livery216';decal.renderOrder=2;decal.castShadow=decal.receiveShadow=false;decal.userData={editLocked:true,source:'supplied-reference-image',cargoTriangles,stripeTriangles,logoTriangles};
 for(const mesh of [cargo,cab]){mesh.material=mesh.material.clone();mesh.material.color.setHex(mesh===cargo?0xeceff2:0x061746);mesh.material.metalness=mesh===cargo ? .08 : .45;mesh.material.roughness=mesh===cargo ? .58 : .38;}
 root.add(decal);root.userData.livery216={source:'supplied-reference-image',bothSidesReadable:true};return decal;
}
export async function applyTruckLivery216(root,T){const texture=await loadTruckLivery216(T);return createTruckLivery216(root,T,texture);}
