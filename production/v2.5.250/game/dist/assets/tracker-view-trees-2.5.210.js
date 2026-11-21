// Select only three foreground crowns along the tracker shot. Keep original
// instance IDs for all surviving trees; the normal scene compactor removes them.
export function pruneTrackerViewTrees210(vegetation,T){
 const aims=[new T.Vector3(27.35,6.3,-150.5),new T.Vector3(41.65,6.3,-150.5),new T.Vector3(34.5,9,-150.5)];
 const cameras=[[9,31,-117],[12,28,-121],[46,20,-126],[80,9,-136],[103,2,-142],[34.5,14,-137.5]].map(p=>new T.Vector3(...p));
 const candidates=[],matrix=new T.Matrix4(),q=new T.Quaternion(),scale=new T.Vector3(),center=new T.Vector3(),size=new T.Vector3(),ray=new T.Ray(),direction=new T.Vector3(),hit=new T.Vector3();
 for(const [species,variants]of vegetation.instances){const shapes=vegetation.variants.get(species);if(!shapes)continue;variants.forEach((points,variant)=>{const geometry=shapes[variant]?.crown;if(!geometry)return;if(!geometry.boundingBox)geometry.computeBoundingBox();points.forEach((point,index)=>{
  if(point.x< -6||point.x>65||point.z< -163||point.z> -102)return;
  matrix.compose(new T.Vector3(point.x,point.y,point.z),q.setFromAxisAngle(new T.Vector3(0,1,0),point.yaw),scale.setScalar(point.scale));const bounds=geometry.boundingBox.clone().applyMatrix4(matrix).expandByScalar(.7);bounds.getCenter(center);bounds.getSize(size);const radius=Math.max(size.x,size.z)/2;
  let hits=0,near=Infinity;for(const eye of cameras)for(const aim of aims){direction.subVectors(aim,eye);const length=direction.length();direction.divideScalar(length);ray.set(eye,direction);if(ray.intersectBox(bounds,hit)&&hit.distanceTo(eye)<length-.5)hits++;const along=new T.Vector3().subVectors(center,eye).dot(direction);if(along>0&&along<length)near=Math.min(near,ray.distanceToPoint(center));}
  if(hits||near<radius+6)candidates.push({point,species,variant,index,hits,score:hits*100+Math.max(0,radius+6-near)});
 });});}
 candidates.sort((a,b)=>b.score-a.score||a.point.x-b.point.x||a.point.z-b.point.z);const chosen=candidates.slice(0,3);
 for(const c of chosen)c.point.trackerViewHidden210=true;
 // Remove the small soil decals under the removed trees as well.
 const wells=vegetation.group.getObjectByName('tree-wells');if(wells?.geometry.index&&chosen.length){const g=wells.geometry,p=g.attributes.position,index=g.index,keep=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();for(let i=0;i<index.count;i+=3){a.fromBufferAttribute(p,index.getX(i));b.fromBufferAttribute(p,index.getX(i+1));c.fromBufferAttribute(p,index.getX(i+2));center.copy(a).add(b).add(c).multiplyScalar(1/3);if(chosen.some(t=>Math.hypot(center.x-t.point.x,center.z-t.point.z)<1.6))continue;keep.push(index.getX(i),index.getX(i+1),index.getX(i+2));}g.setIndex(keep);g.computeBoundingBox();g.computeBoundingSphere();}
 const removed=chosen.map(c=>({species:c.species,variant:c.variant,originalIndex:c.index,x:c.point.x,z:c.point.z,sightlineHits:c.hits}));vegetation.group.userData.trackerViewRemovedTrees210=removed;return removed;
}
export function migrateTrackerLayout210(item,revision){
 if(revision>=9||!item?.pose)return item;const target=item.target.kind==='copy'?item.target.template:item.target;
 const match=target?.kind==='node'?(target.source??'').match(/\/solar-dual-axis-trackers207:0\/sun-tracker-([12]):0$/):null;if(!match)return item;
 const pose={...item.pose};if(Array.isArray(pose.scale))pose.scale=pose.scale.map(v=>v*1.3);
 if(item.target.kind!=='copy'&&Array.isArray(pose.position))pose.position=[pose.position[0]+(match[1]==='1'?-1.65:1.65),pose.position[1],pose.position[2]];
 return {...item,pose};
}
