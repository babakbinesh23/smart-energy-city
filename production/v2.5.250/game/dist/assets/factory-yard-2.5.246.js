// Revision 212: retain the yard and patrol; move service cables out of traffic.
import {migrateFactoryLayout199 as migratePrevious199} from './factory-yard-2.5.199.js';
export const YARD199=Object.freeze({
 bounds:{minX:-81.8,maxX:-53.8,minZ:-190.8,maxZ:-160.8,height:.18},dx:47.7,dz:14.2,
 manager:{x:-74.3,z:-159.3},expert:{x:-64.3,z:-159.3},entry:{x:-68.3,z:-157.3,heading:Math.PI},
 patrolStart:{x:-66.3,z:-182.8},gate:{minX:-71.3,maxX:-65.3}
});

export function buildFactoryYard199(network,T,factoryMinX,ground,factory){
 const point=p=>[p.x,p.y-ground,p.z],dx=YARD199.dx,dz=YARD199.dz;
 const transformer=network.electrical.placeTransformer(network.group,network.physics,-121+dx,-183+dz,25,'factory');
 network.box(-121+dx,.18,-183+dz,transformer.size.x+.8,.36,transformer.size.z+.8,'concrete');
 network.electrical.placeCabinet(network.group,network.physics,-104+dx,-183+dz);
 network.box(-104+dx,.09,-183+dz,3.8,.18,1.6,'concrete');
 for(const [phase,n] of [-1,0,1].entries()){
  // Preserve the existing grid branches; reroute only the final factory drop.
  const yardSpan=[],exportSpan=[];
  for(let k=0;k<=16;k++){const t=k/16;yardSpan.push([-153+26*t,24.8-2.5*Math.sin(Math.PI*t),-148-5*t+n*2.7]);}
  for(let k=0;k<=18;k++){const t=k/18;exportSpan.push([-153+n*2.7*t,24.8-3.1*Math.sin(Math.PI*t),-148-73*t+n*2.7*(1-t)]);}
  network.wire(yardSpan,'hv',3,.065,phase);network.wire(exportSpan,'hv',3,.065,phase);
  const high=transformer.primary[phase],low=transformer.secondary[phase],riserZ=YARD199.bounds.maxZ-2.5;
  network.box(high.x,4.7,riserZ,.22,9.4,.22,'steel');network.bushing(high.x,9.4,riserZ,3.4);
  network.wire([[-127,24.8,-153+n*2.7],[high.x,13,riserZ],point(high)],'hv',3,.065,phase);
  // Parallel transformer-to-cabinet runs follow the front equipment boundary.
  const lane=YARD199.bounds.maxZ-1.15+n*.22;
  network.wire([point(low),[low.x,.28,lane],[-104+dx+n*.18,.28,lane],[-104+dx+n*.18,.65,-183+dz]],'mv',4,.075,phase);
  // The cabinet-to-building run clears the full forklift envelope overhead.
  // Five control points retain the original wire/part counts for saved edits.
  const port=factory?.powerPorts199?.[phase]??new T.Vector3(-64+n*.22,ground+2,-178.04),height=6+n*.18;
  network.wire([[-103+dx+n*.18,.65,-183+dz],[-103+dx+n*.18,height,-183+dz],
    [port.x,height,-183+dz],[port.x,height,port.z],point(port)],'lv',5,.075,phase);
 }
 addCableSupports212(network,T,ground,factory);
 network.group.userData.factoryYard199={...YARD199.bounds,gate:{...YARD199.gate}};
 return transformer;
}

function addCableSupports212(network,T,ground,factory){
 const z=-183+YARD199.dz,port=factory?.powerPorts199?.[1]??new T.Vector3(-64,ground+2,-178.04);
 const posts=[{x:-103+YARD199.dx,z},{x:port.x,z}],mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:0x7d888d,roughness:.85}),10);
 mesh.name='factory-cable-supports212';mesh.userData.editLocked=true;
 const matrix=new T.Matrix4(),rotation=new T.Quaternion(),position=new T.Vector3(),scale=new T.Vector3();
 for(const [i,p]of posts.entries()){
  matrix.compose(position.set(p.x,ground+2.85,p.z),rotation,scale.set(.14,5.7,.14));mesh.setMatrixAt(i*2,matrix);
  matrix.compose(position.set(p.x,ground+5.73,p.z),rotation,scale.set(.85,.1,.34));mesh.setMatrixAt(i*2+1,matrix);
  network.physics.addStaticBox(position.set(p.x,ground+2.85,p.z).clone(),new T.Vector3(.07,2.85,.07));
  for(let phase=0;phase<3;phase++){
   const n=phase-1,length=Math.max(.04,6+n*.18-.075-5.78),x=i===0?-103+YARD199.dx+n*.18:(factory?.powerPorts199?.[phase]?.x??port.x+n*.22);
   matrix.compose(position.set(x,ground+5.78+length/2,z),rotation,scale.set(.055,length,.055));mesh.setMatrixAt(4+i*3+phase,matrix);
  }
 }
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=mesh.receiveShadow=false;network.group.add(mesh);
 network.group.userData.factoryCableRouting212={minimumOverheadHeight:ground+5.7,frontLane: YARD199.bounds.maxZ-1.15,posts};
}

export function buildFactoryFence199(network,ground=.15){
 const {minX,maxX,minZ,maxZ,height}=YARD199.bounds;
 const side=(x1,z1,x2,z2)=>{
  const spans=Math.ceil(Math.hypot(x2-x1,z2-z1)/3);
  for(let j=0;j<=spans;j++)network.box(x1+(x2-x1)*j/spans,1.1+height-ground,z1+(z2-z1)*j/spans,.08,2.2,.08,'dark',true);
  for(const y of [.65,1.7])network.box((x1+x2)/2,y+height-ground,(z1+z2)/2,Math.max(.06,Math.abs(x2-x1)),.06,Math.max(.06,Math.abs(z2-z1)),'steel',true);
 };
 const left=minX+.15,right=maxX-.15,top=minZ+.15,bottom=maxZ-.15;
 side(left,top,right,top);side(left,top,left,bottom);side(right,top,right,bottom);
 side(left,bottom,YARD199.gate.minX,bottom);side(YARD199.gate.maxX,bottom,right,bottom);
}


function migrateFactoryLayout212(item,revision,initialPosition){
 if(revision>=6||!Array.isArray(item?.pose?.position))return item;
 const target=item.target.kind==='copy'?item.target.template:item.target,source=target?.source??'';
 const part=target?.kind==='part'&&source.includes('/logical-power-network:0/power-');
 const inside=initialPosition&&initialPosition[0]>=YARD199.bounds.minX&&initialPosition[0]<=YARD199.bounds.maxX&&initialPosition[2]>=YARD199.bounds.minZ&&initialPosition[2]<=YARD199.bounds.maxZ;
 // The prior migration classifies component locations in its old coordinate frame.
 const previousInitial=part&&inside?[initialPosition[0]-14.2,initialPosition[1],initialPosition[2]+14.8]:initialPosition;
 let result=migratePrevious199(item,revision,previousInitial),dx=0,dz=0;
 if(/\/(supplied-transformer-factory|supplied-factory-electrical-cabinet|industrial-0-jungheinrich_forklift):0$/.test(source)||part&&inside){dx=14.2;dz=-14.8;}
 else if(/\/factory-manager:0$/.test(source)){dx=9.7;dz=-14.8;}
 else if(/\/supplied-victorian-factory:0\/bargheto-energy-expert:0$/.test(source)){dx=44.7;dz=9.7;}
 if(!dx&&!dz)return result;
 return {...result,pose:{...result.pose,position:[result.pose.position[0]+dx,result.pose.position[1],result.pose.position[2]+dz]}};
}

// Revision 10 moves only the original Chinese factory manager two metres left.
// Saved poses migrate once; the default position and collider already use YARD199.
export function migrateFactoryLayout199(item,revision,initialPosition){
 const result=migrateFactoryLayout212(item,revision,initialPosition);
 if(revision>=10||result?.target?.kind!=='node'||!Array.isArray(result?.pose?.position)||! /\/factory-manager:0$/.test(result.target.source??''))return result;
 const position=[...result.pose.position];position[0]-=2;
 return {...result,pose:{...result.pose,position}};
}
