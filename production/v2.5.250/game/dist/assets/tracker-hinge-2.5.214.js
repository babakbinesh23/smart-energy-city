import {repairTrackerHinge212} from './tracker-hinge-2.5.212.js';
// Keep the bearing connection, with enough rear clearance for the fixed column.
// This correction is local to the supplied tracker; root transforms remain intact.
export function repairTrackerHinge214(T,model){
 const base=repairTrackerHinge212(T,model),tilt=model.getObjectByName('Bargheto_Panel_Tilt_X_Animated_8');
 if(tilt.userData.hinge214)return tilt.userData.hinge214;
 const yaw=tilt.parent,support=model.getObjectByName('Object_8'),before=tilt.position.clone(),offset=new T.Vector3(0,0,-.18);
 // Move the complete tilting assembly, including its original mount, as one unit.
 tilt.position.add(offset);
 const geometry=new T.CylinderGeometry(.075,.075,offset.length(),10);
 geometry.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),offset.clone().normalize()));
 geometry.translate(before.x+offset.x/2,before.y+offset.y/2,before.z+offset.z/2);
 const bridge=new T.Mesh(geometry,Array.isArray(support.material)?support.material[0]:support.material);
 bridge.name='tracker-bearing-standoff214';bridge.userData.editLocked=true;bridge.castShadow=bridge.receiveShadow=false;yaw.add(bridge);
 const result={...base,hinge:tilt.position.toArray(),originalBearing:before.toArray(),standoff:.18,additionalTriangles:geometry.index.count/3};
 tilt.userData.hinge214=result;model.updateMatrixWorld(true);return result;
}
