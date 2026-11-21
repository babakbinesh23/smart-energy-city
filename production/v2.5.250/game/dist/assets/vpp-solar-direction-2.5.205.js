import {roofPlan87} from './scene-updates-2.5.102-r109.js';

export const VPP_SOLAR_YAW205=0;
export function roofPlan205(home,aspect,factory={x:-67,z:-188}){
 // Keep every original row, slot center and gap. Change only panel heading.
 const plan=roofPlan87(home,aspect,factory);
 const slots=plan.slots.map(slot=>({...slot,
  minX:slot.x-plan.panelWidth/2,maxX:slot.x+plan.panelWidth/2,
  minZ:slot.z-plan.panelDepth/2,maxZ:slot.z+plan.panelDepth/2}));
 return {...plan,slots,yaw:VPP_SOLAR_YAW205,facing:'solar-field',orientationRevision:205};
}

export function migrateVppLayout205(item,revision,initial){
 if(revision>=8)return item;
 const target=item?.target?.kind==='copy'?item.target.template:item?.target;
 if(target?.kind!=='instance'||!target.source?.includes('/roof-solar-home-'))return item;
 if(!initial)return null;
 // Revision 7 used the repacked grid. Earlier layouts already use the restored
 // arrangement, so retain their saved positions. Copies keep custom positions.
 return {...item,pose:{...item.pose,
  position:revision===7&&item.target.kind!=='copy'?[...initial.position]:item.pose.position,
  quaternion:[...initial.quaternion]}};
}
