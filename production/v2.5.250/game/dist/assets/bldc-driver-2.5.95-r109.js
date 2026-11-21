function boxes95(T,parts,material){
 const positions=[],normals=[],uvs=[],indices=[];let count=0;
 for(const [x,y,z,w,h,d]of parts){const g=new T.BoxGeometry(w,h,d),p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv');for(let i=0;i<p.count;i++){positions.push(p.getX(i)+x,p.getY(i)+y,p.getZ(i)+z);normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(uv.getX(i),uv.getY(i));}for(const i of g.index.array)indices.push(count+i);count+=p.count;g.dispose();}
 const g=new T.BufferGeometry;g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeBoundingSphere();return new T.Mesh(g,material);
}
export function installBLDCDriver95(T,scene){
 const pivot=scene.getObjectByName('DRIVE_MOTOR_SHAFT_AND_PULLEY');if(!pivot)return null;const parent=pivot.parent;
 const obsolete=[];scene.traverse(o=>{if(['BLDC-sealed-controller','BLDC-motor-phase-harness','BLDC-controller-supply-harness'].includes(o.name))obsolete.push(o);});for(const o of obsolete){o.removeFromParent();o.geometry?.dispose();}
 const group=new T.Group;group.name='BLDC_DRIVER95';group.userData={role:'bldc-driver',label:'درایور موتور BLDC',educational:true,phaseOutputs:['U','V','W'],powerInputs:['DC+','DC−'],motorConnected:true};parent.add(group);
 const metal=new T.MeshStandardMaterial({color:0x9daeb3,metalness:.72,roughness:.36}),dark=new T.MeshStandardMaterial({color:0x26343c,metalness:.35,roughness:.5}),socket=new T.MeshStandardMaterial({color:0x142429,roughness:.6});
 const center={x:-.145,y:.875,z:-.20};
 group.add(boxes95(T,[[-.145,.875,-.20,.12,.15,.18]],dark));
 const fins=[];for(let i=0;i<9;i++)fins.push([-.145,.825,-.272+i*.018,.145,.016,.007]);fins.push([-.145,.955,-.20,.15,.009,.21],[-.145,.796,-.20,.15,.009,.21]);group.add(boxes95(T,fins,metal));
 const connectors=[];for(let i=0;i<3;i++)connectors.push([-.14,.851+i*.02,-.105,.024,.015,.014]);connectors.push([-.145,.94,-.258,.025,.025,.018]);group.add(boxes95(T,connectors,socket));
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#e7f2f3';c.fillRect(0,0,512,256);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#164653';c.font='800 65px sans-serif';c.fillText('BLDC',256,67);c.font='700 43px sans-serif';c.fillText('MOTOR DRIVER',256,131);c.fillStyle='#277d6f';c.font='600 32px sans-serif';c.fillText('DC + / −  →  U · V · W',256,208);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;const label=new T.Mesh(new T.PlaneGeometry(.155,.0775),new T.MeshBasicMaterial({map:texture,toneMapped:false}));label.name='BLDC-driver-label95';label.rotation.y=-Math.PI/2;label.position.set(-.206,.896,-.20);group.add(label);
 const led=new T.Mesh(new T.SphereGeometry(.006,8,6),new T.MeshBasicMaterial({color:0x244539,toneMapped:false}));led.name='BLDC-driver-status95';led.position.set(-.211,.854,-.258);group.add(led);
 const cables=[];
 function cable(name,points,color,r=.0035){const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),28,r,5,false),new T.MeshStandardMaterial({color,roughness:.74}));m.name=name;group.add(m);cables.push({name,from:points[0],to:points.at(-1)});}
 cable('BLDC-driver-DC-supply95',[[-.345,.797,.327],[-.35,.965,.30],[-.35,.97,-.25],[-.145,.965,-.25],[-.145,.94,-.258]],0x232b2d,.005);
 for(let i=0;i<3;i++)cable('BLDC-driver-phase-'+['U','V','W'][i]+'95',[[-.14,.851+i*.02,-.105],[-.14+i*.015,.967,-.065],[-.035+i*.01,.97,.125+i*.012],[-.02,.908+i*.008,pivot.position.z-.036]], [0x805c38,0x20282b,0x647781][i]);
 cable('BLDC-driver-earth95',[[-.145,.95,-.26],[-.20,.983,-.28],[-.34,.983,-.30]],0x8d9d32,.0028);
 let last=null;const update=state=>{const on=!!state.powered;if(on!==last){last=on;led.material.color.set(on?0x52e7a8:0x244539);}};update({powered:false});
 const report={center,driverCount:1,phaseOutputs:3,powerInput:'fixed existing junction',cables,formerControllerRemoved:obsolete.some(o=>o.name==='BLDC-sealed-controller')};scene.userData.bldcDriver95=report;return{group,update,report};
}
