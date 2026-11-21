export const YARD199=Object.freeze({
 bounds:{minX:-96,maxX:-68,minZ:-176,maxZ:-146,height:.18},dx:33.5,dz:29,
 manager:{x:-82,z:-144.5},entry:{x:-82,z:-142.5,heading:Math.PI},
 patrolStart:{x:-80.5,z:-168},gate:{minX:-85.5,maxX:-79.5}
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
  const high=transformer.primary[phase],low=transformer.secondary[phase],riserZ=-148.5;
  network.box(high.x,4.7,riserZ,.22,9.4,.22,'steel');network.bushing(high.x,9.4,riserZ,3.4);
  network.wire([[-127,24.8,-153+n*2.7],[high.x,13,riserZ],point(high)],'hv',3,.065,phase);
  network.wire([point(low),[low.x,.28,-187+dz+n*.22],[-104+dx+n*.18,.28,-187+dz+n*.22],[-104+dx+n*.18,.65,-183+dz]],'mv',4,.075,phase);
  const port=factory?.powerPorts199?.[phase]??new T.Vector3(-64+n*.22,ground+2,-178.04),z=port.z+1.2;
  network.wire([[-103+dx+n*.18,.65,-183+dz],[-66.4,.25,-183+dz+n*.22],
    [port.x,.25,z],[port.x,port.y-ground,z],point(port)],'lv',5,.075,phase);
 }
 network.group.userData.factoryYard199={...YARD199.bounds,gate:{...YARD199.gate}};
 return transformer;
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

export function migrateFactoryLayout199(item,revision,initialPosition){
 if(revision>=5||!Array.isArray(item?.pose?.position))return item;
 const target=item.target.kind==='copy'?item.target.template:item.target,source=target?.source??'';
 let dx=0,dy=0,dz=0;
 if(/\/(supplied-transformer-factory|supplied-factory-electrical-cabinet|factory-manager|industrial-0-jungheinrich_forklift):0$/.test(source)){
  dx=YARD199.dx;dz=YARD199.dz;
 }else if(/\/supplied-victorian-factory:0\/bargheto-energy-expert:0$/.test(source)){
  // The model root moved ten metres north; keep the saved child in world space.
  dz=10;
 }else if(target?.kind==='part'&&source.includes('/logical-power-network:0/power-')&&initialPosition){
  if(initialPosition[0]>=YARD199.bounds.minX&&initialPosition[0]<=YARD199.bounds.maxX&&initialPosition[2]>=YARD199.bounds.minZ&&initialPosition[2]<=YARD199.bounds.maxZ){
   dx=YARD199.dx;dz=YARD199.dz;
   if(Math.abs(initialPosition[2]+148.5)<.1)dz=23.5; // New HV risers sit inside the fence.
   const edge=Math.min(Math.abs(initialPosition[0]+95.85),Math.abs(initialPosition[0]+68.15),Math.abs(initialPosition[2]+175.85),Math.abs(initialPosition[2]+146.15));
   if(edge<.06&&initialPosition[1]<3)dy=-.15; // Posts now stand directly on the asphalt.
  }
 }
 if(!dx&&!dz)return item;
 return {...item,pose:{...item.pose,position:[item.pose.position[0]+dx,item.pose.position[1]+dy,item.pose.position[2]+dz]}};
}
