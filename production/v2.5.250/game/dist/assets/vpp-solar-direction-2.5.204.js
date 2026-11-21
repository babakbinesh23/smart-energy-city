import {roofPlan87} from './scene-updates-2.5.102-r109.js';

// Ground arrays use world yaw zero (+Z downslope); keep the rooftop tilt/size.
export const VPP_SOLAR_YAW204=0;
export function roofPlan204(home,aspect){
 const cx=(home.rect.minX+home.rect.maxX)/2,cz=(home.rect.minZ+home.rect.maxZ)/2;
 const plan=roofPlan87(home,aspect,{x:cx,z:cz+1});
 return {...plan,yaw:VPP_SOLAR_YAW204,facing:'solar-field',orientationRevision:204};
}

// Repacking changes instance indices. Rebase old rooftop instance poses onto
// the new roof-safe slots, keeping deletion and size edits. Copies retain their
// custom positions and adopt the same heading. Other scene edits are untouched.
export function migrateVppLayout204(item,revision,initial){
 if(revision>=7)return item;
 const target=item?.target?.kind==='copy'?item.target.template:item?.target;
 if(target?.kind!=='instance'||!target.source?.includes('/roof-solar-home-'))return item;
 if(!initial)return null;
 return {...item,pose:{...item.pose,
  position:item.target.kind==='copy'?item.pose.position:[...initial.position],
  quaternion:[...initial.quaternion]}};
}
